package routes

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/h2non/bimg"
	"github.com/keif/image-optimizer/services"
)

// Security configuration
const (
	maxImageSize = 10 << 20        // 10 MB
	fetchTimeout = 10 * time.Second // 10 seconds
)

// isProduction checks if we're running in production mode
func isProduction() bool {
	env := os.Getenv("GO_ENV")
	return env == "production" || env == "prod"
}

// errorResponse creates an error response, optionally including details in development
func errorResponse(c *fiber.Ctx, status int, message string, err error) error {
	response := fiber.Map{
		"error": message,
	}

	// Only include error details in development mode
	if !isProduction() && err != nil {
		response["details"] = err.Error()
	}

	return c.Status(status).JSON(response)
}

// allowedDomains is a whitelist of domains allowed for URL-based image fetching
// Can be configured via ALLOWED_DOMAINS env var (comma-separated list)
// Default includes common image hosting/CDN services
// Note: localhost/private IPs are blocked by SSRF protection regardless of whitelist
var allowedDomains = []string{
	"cloudinary.com",   // Cloudinary CDN
	"imgur.com",        // Imgur image hosting
	"unsplash.com",     // Unsplash stock photos
	"pexels.com",       // Pexels stock photos
}

// InitializeConfig loads configuration from environment variables
func InitializeConfig() {
	// Load allowed domains from environment if set
	// Check if the env var is explicitly set (even if empty)
	domainsEnv, isSet := os.LookupEnv("ALLOWED_DOMAINS")
	if isSet {
		if domainsEnv == "" {
			// Empty string means allow all domains (no whitelist)
			allowedDomains = []string{}
		} else {
			// Parse comma-separated list
			domains := strings.Split(domainsEnv, ",")
			allowedDomains = make([]string, 0, len(domains))
			for _, domain := range domains {
				domain = strings.TrimSpace(domain)
				if domain != "" {
					allowedDomains = append(allowedDomains, domain)
				}
			}
		}
	}
}

// isPrivateIP checks if an IP address is private, loopback, or a cloud metadata endpoint
func isPrivateIP(host string) bool {
	// Allow private IPs in test mode (for unit tests with localhost test servers)
	if os.Getenv("ALLOW_PRIVATE_IPS") == "true" {
		return false
	}

	// Try to parse as IP
	ip := net.ParseIP(host)
	if ip == nil {
		// Not a direct IP, try to resolve the hostname
		ips, err := net.LookupIP(host)
		if err != nil || len(ips) == 0 {
			// If we can't resolve, be conservative and block it
			return true
		}
		ip = ips[0]
	}

	// Check for loopback (127.0.0.0/8, ::1)
	if ip.IsLoopback() {
		return true
	}

	// Check for private IP ranges (RFC 1918)
	if ip.IsPrivate() {
		return true
	}

	// Check for link-local (169.254.0.0/16)
	if ip.IsLinkLocalUnicast() {
		return true
	}

	// Block cloud metadata endpoints (AWS, GCP, Azure, etc.)
	ipStr := ip.String()
	cloudMetadata := []string{
		"169.254.169.254", // AWS, Azure, GCP, OpenStack
		"fd00:ec2::254",   // AWS IPv6
	}
	for _, metadata := range cloudMetadata {
		if ipStr == metadata {
			return true
		}
	}

	return false
}

// isAllowedDomain checks whether the host is on the whitelist
// If allowedDomains is empty, all domains are allowed
func isAllowedDomain(u *url.URL) bool {
	if len(allowedDomains) == 0 {
		return true // Allow all domains if whitelist is empty
	}

	hostname := u.Hostname()

	// Check for private/internal IPs (SSRF protection)
	if isPrivateIP(hostname) {
		return false
	}

	for _, domain := range allowedDomains {
		if hostname == domain || strings.HasSuffix(hostname, "."+domain) {
			return true
		}
	}
	return false
}

// RegisterOptimizeRoutes registers the image optimization routes
func RegisterOptimizeRoutes(app *fiber.App) {
	// Initialize configuration from environment
	InitializeConfig()

	app.Post("/optimize", handleOptimize)
	app.Post("/batch-optimize", handleBatchOptimize)
}

// handleOptimize handles POST /optimize requests
// @Summary Optimize an image
// @Description Optimize an image file or URL with custom quality, dimensions, and format
// @Tags optimization
// @Accept multipart/form-data
// @Produce json,image/jpeg,image/png,image/webp,image/gif,image/avif
// @Param quality query int false "Quality level (1-100)" default(80) minimum(1) maximum(100)
// @Param width query int false "Target width in pixels (0 = no resize)" default(0) minimum(0)
// @Param height query int false "Target height in pixels (0 = no resize)" default(0) minimum(0)
// @Param format query string false "Target format" Enums(jpeg,png,webp,gif,avif)
// @Param returnImage query bool false "Return optimized image file instead of JSON metadata" default(false)
// @Param losslessMode query bool false "Enable lossless mode (perfect quality preservation)" default(false)
// @Param interpolator query string false "Resizing interpolation algorithm" Enums(nearest,bilinear,bicubic,nohalo,vsqbs,lanczos2,lanczos3)
// @Param image formData file false "Image file to optimize (multipart upload)"
// @Param url formData string false "Image URL to fetch and optimize (alternative to file upload)"
// @Success 200 {object} services.OptimizeResult "JSON metadata response (when returnImage=false)"
// @Success 200 {file} binary "Optimized image file (when returnImage=true)"
// @Failure 400 {object} map[string]string "Invalid parameters or file"
// @Failure 403 {object} map[string]string "URL domain not allowed"
// @Failure 413 {object} map[string]string "File too large (max 10MB)"
// @Failure 500 {object} map[string]string "Image processing error"
// @Router /optimize [post]
func handleOptimize(c *fiber.Ctx) error {
	// Parse returnImage parameter
	returnImage := c.QueryBool("returnImage", false)

	// Parse optimization options from query parameters
	options := services.OptimizeOptions{
		Quality: 80, // Default quality
	}

	// Parse quality
	if qualityStr := c.Query("quality"); qualityStr != "" {
		quality, err := strconv.Atoi(qualityStr)
		if err != nil || quality < 1 || quality > 100 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid quality parameter. Must be between 1 and 100.",
			})
		}
		options.Quality = quality
	}

	// Parse width
	if widthStr := c.Query("width"); widthStr != "" {
		width, err := strconv.Atoi(widthStr)
		if err != nil || width < 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid width parameter. Must be a positive integer.",
			})
		}
		options.Width = width
	}

	// Parse height
	if heightStr := c.Query("height"); heightStr != "" {
		height, err := strconv.Atoi(heightStr)
		if err != nil || height < 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid height parameter. Must be a positive integer.",
			})
		}
		options.Height = height
	}

	// Parse format
	if formatStr := c.Query("format"); formatStr != "" {
		formatStr = strings.ToLower(formatStr)
		switch formatStr {
		case "jpeg", "jpg":
			options.Format = bimg.JPEG
		case "png":
			options.Format = bimg.PNG
		case "webp":
			options.Format = bimg.WEBP
		case "gif":
			options.Format = bimg.GIF
		case "avif":
			options.Format = bimg.AVIF
		default:
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid format parameter. Supported formats: jpeg, png, webp, gif, avif",
			})
		}
	}

	// Parse forceSRGB
	options.ForceSRGB = c.QueryBool("forceSRGB", false)

	// Parse lossless mode
	options.LosslessMode = c.QueryBool("losslessMode", false)

	// Parse interpolator
	if interpolator := c.Query("interpolator"); interpolator != "" {
		validInterpolators := map[string]bool{
			"nearest":  true,
			"bilinear": true,
			"bicubic":  true,
			"nohalo":   true,
			"vsqbs":    true,
			"lanczos2": true,
			"lanczos3": true,
		}
		if !validInterpolators[interpolator] {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid interpolator. Supported: nearest, bilinear, bicubic, nohalo, vsqbs, lanczos2, lanczos3",
			})
		}
		options.Interpolator = interpolator
	}

	// Parse advanced JPEG options
	options.Progressive = c.QueryBool("progressive", false)
	options.OptimizeCoding = c.QueryBool("optimizeCoding", false)
	if subsampleStr := c.Query("subsample"); subsampleStr != "" {
		subsample, err := strconv.Atoi(subsampleStr)
		if err != nil || subsample < 0 || subsample > 3 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid subsample parameter. Must be between 0 and 3.",
			})
		}
		options.Subsample = subsample
	}
	if smoothStr := c.Query("smooth"); smoothStr != "" {
		smooth, err := strconv.Atoi(smoothStr)
		if err != nil || smooth < 0 || smooth > 100 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid smooth parameter. Must be between 0 and 100.",
			})
		}
		options.Smooth = smooth
	}

	// Parse advanced PNG options
	if compressionStr := c.Query("compression"); compressionStr != "" {
		compression, err := strconv.Atoi(compressionStr)
		if err != nil || compression < 0 || compression > 9 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid compression parameter. Must be between 0 and 9.",
			})
		}
		options.Compression = compression
	}
	options.Interlace = c.QueryBool("interlace", false)
	options.Palette = c.QueryBool("palette", false)

	// Parse advanced WebP options
	options.Lossless = c.QueryBool("lossless", false)
	if effortStr := c.Query("effort"); effortStr != "" {
		effort, err := strconv.Atoi(effortStr)
		if err != nil || effort < 0 || effort > 6 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid effort parameter. Must be between 0 and 6.",
			})
		}
		options.Effort = effort
	}
	if webpMethodStr := c.Query("webpMethod"); webpMethodStr != "" {
		webpMethod, err := strconv.Atoi(webpMethodStr)
		if err != nil || webpMethod < 0 || webpMethod > 6 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid webpMethod parameter. Must be between 0 and 6.",
			})
		}
		options.WebpMethod = webpMethod
	}

	// Parse advanced PNG optimization with OxiPNG
	if oxipngLevelStr := c.Query("oxipngLevel"); oxipngLevelStr != "" {
		oxipngLevel, err := strconv.Atoi(oxipngLevelStr)
		if err != nil || oxipngLevel < 0 || oxipngLevel > 6 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid oxipngLevel parameter. Must be between 0 and 6.",
			})
		}
		options.OxipngLevel = oxipngLevel
	}

	// Get image data - prefer uploaded file, fall back to URL fetch
	var imgData []byte
	var err error

	file, err := c.FormFile("image")
	if err == nil && file != nil {
		// Handle uploaded file
		// Validate file type
		contentType := file.Header.Get("Content-Type")
		validTypes := map[string]bool{
			"image/jpeg": true,
			"image/jpg":  true,
			"image/png":  true,
			"image/webp": true,
			"image/gif":  true,
			"image/avif": true,
		}

		if !validTypes[contentType] {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid file type. Supported types: jpeg, jpg, png, webp, gif, avif",
			})
		}

		// Read file contents
		f, err := file.Open()
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to open uploaded file.",
			})
		}
		defer f.Close()

		imgData, err = io.ReadAll(io.LimitReader(f, maxImageSize))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to read uploaded file.",
			})
		}

		// Check if we hit the size limit
		if len(imgData) >= int(maxImageSize) {
			return c.Status(fiber.StatusRequestEntityTooLarge).JSON(fiber.Map{
				"error": "Uploaded file exceeds maximum size of 10MB.",
			})
		}
	} else {
		// Try URL-based fetching
		imgURL := c.FormValue("url")
		if imgURL == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Must provide either 'image' file or 'url' parameter.",
			})
		}

		// Parse and validate URL
		parsed, err := url.Parse(imgURL)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid URL format.",
			})
		}

		// Check domain whitelist
		if !isAllowedDomain(parsed) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "URL domain not allowed. Please contact administrator to whitelist the domain.",
			})
		}

		// Fetch image from URL with timeout
		ctx, cancel := context.WithTimeout(context.Background(), fetchTimeout)
		defer cancel()

		req, err := http.NewRequestWithContext(ctx, "GET", imgURL, nil)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to create request for URL.",
			})
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to fetch image from URL. Check that the URL is accessible.",
			})
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to fetch image from URL. Server returned status: " + resp.Status,
			})
		}

		imgData, err = io.ReadAll(io.LimitReader(resp.Body, maxImageSize))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to read image data from URL.",
			})
		}

		// Check if we hit the size limit
		if len(imgData) >= int(maxImageSize) {
			return c.Status(fiber.StatusRequestEntityTooLarge).JSON(fiber.Map{
				"error": "Image from URL exceeds maximum size of 10MB.",
			})
		}
	}

	// Process the image
	result, err := services.OptimizeImage(imgData, options)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "Failed to process image", err)
	}

	// Return either the image file or JSON metadata
	if returnImage {
		// Determine content type from format
		contentType := "image/webp" // default
		formatName := "webp"
		if options.Format != 0 {
			switch options.Format {
			case bimg.JPEG:
				contentType = "image/jpeg"
				formatName = "jpeg"
			case bimg.PNG:
				contentType = "image/png"
				formatName = "png"
			case bimg.GIF:
				contentType = "image/gif"
				formatName = "gif"
			case bimg.WEBP:
				contentType = "image/webp"
				formatName = "webp"
			case bimg.AVIF:
				contentType = "image/avif"
				formatName = "avif"
			}
		} else {
			// Use the result format if no specific format was requested
			formatName = result.Format
			contentType = "image/" + formatName
		}

		c.Type(contentType)
		c.Set("Content-Disposition", "inline; filename=\"optimized."+formatName+"\"")
		return c.Send(result.OptimizedImage)
	}

	// Return JSON metadata
	return c.JSON(result)
}

// BatchImageResult represents the result of optimizing a single image in a batch
type BatchImageResult struct {
	Filename      string `json:"filename"`
	Success       bool   `json:"success"`
	Error         string `json:"error,omitempty"`
	OriginalSize  int64  `json:"originalSize,omitempty"`
	OptimizedSize int64  `json:"optimizedSize,omitempty"`
	Format        string `json:"format,omitempty"`
	Width         int    `json:"width,omitempty"`
	Height        int    `json:"height,omitempty"`
	Savings       string `json:"savings,omitempty"`
}

// BatchOptimizeResponse represents the complete batch optimization response
type BatchOptimizeResponse struct {
	Results []BatchImageResult `json:"results"`
	Summary struct {
		Total             int    `json:"total"`
		Successful        int    `json:"successful"`
		Failed            int    `json:"failed"`
		TotalOriginalSize int64  `json:"totalOriginalSize"`
		TotalOptimizedSize int64  `json:"totalOptimizedSize"`
		TotalSavings      string `json:"totalSavings"`
		ProcessingTime    string `json:"processingTime"`
	} `json:"summary"`
}

// processSingleImage processes a single image file and returns the result
// This is extracted for use in parallel batch processing
func processSingleImage(file *multipart.FileHeader, options services.OptimizeOptions) BatchImageResult {
	result := BatchImageResult{
		Filename: file.Filename,
	}

	// Validate file type
	contentType := file.Header.Get("Content-Type")
	validTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/webp": true,
		"image/gif":  true,
		"image/avif": true,
	}

	if !validTypes[contentType] {
		result.Success = false
		result.Error = "Invalid file type. Supported types: jpeg, jpg, png, webp, gif, avif"
		return result
	}

	// Read file contents
	f, err := file.Open()
	if err != nil {
		result.Success = false
		result.Error = "Failed to open file"
		return result
	}

	imgData, err := io.ReadAll(io.LimitReader(f, maxImageSize))
	f.Close()

	if err != nil {
		result.Success = false
		result.Error = "Failed to read file"
		return result
	}

	// Check size limit
	if len(imgData) >= int(maxImageSize) {
		result.Success = false
		result.Error = "File exceeds maximum size of 10MB"
		return result
	}

	// Process the image
	optimizeResult, err := services.OptimizeImage(imgData, options)
	if err != nil {
		result.Success = false
		result.Error = "Failed to process image: " + err.Error()
		return result
	}

	// Success - populate result
	result.Success = true
	result.OriginalSize = optimizeResult.OriginalSize
	result.OptimizedSize = optimizeResult.OptimizedSize
	result.Format = optimizeResult.Format
	result.Width = optimizeResult.Width
	result.Height = optimizeResult.Height
	result.Savings = optimizeResult.Savings

	return result
}

// handleBatchOptimize handles POST /batch-optimize requests
// @Summary Optimize multiple images in a single request
// @Description Optimize multiple image files with the same quality, dimensions, and format settings
// @Tags optimization
// @Accept multipart/form-data
// @Produce json
// @Param quality query int false "Quality level (1-100)" default(80) minimum(1) maximum(100)
// @Param width query int false "Target width in pixels (0 = no resize)" default(0) minimum(0)
// @Param height query int false "Target height in pixels (0 = no resize)" default(0) minimum(0)
// @Param format query string false "Target format" Enums(jpeg,png,webp,gif,avif)
// @Param images formData file true "Image files to optimize (multiple files)"
// @Success 200 {object} BatchOptimizeResponse "Batch optimization results"
// @Failure 400 {object} map[string]string "Invalid parameters or no files provided"
// @Failure 500 {object} map[string]string "Batch processing error"
// @Router /batch-optimize [post]
func handleBatchOptimize(c *fiber.Ctx) error {
	startTime := time.Now()

	// Parse optimization options from query parameters (same as single optimize)
	options := services.OptimizeOptions{
		Quality: 80, // Default quality
	}

	// Parse quality
	if qualityStr := c.Query("quality"); qualityStr != "" {
		quality, err := strconv.Atoi(qualityStr)
		if err != nil || quality < 1 || quality > 100 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid quality parameter. Must be between 1 and 100.",
			})
		}
		options.Quality = quality
	}

	// Parse width
	if widthStr := c.Query("width"); widthStr != "" {
		width, err := strconv.Atoi(widthStr)
		if err != nil || width < 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid width parameter. Must be a positive integer.",
			})
		}
		options.Width = width
	}

	// Parse height
	if heightStr := c.Query("height"); heightStr != "" {
		height, err := strconv.Atoi(heightStr)
		if err != nil || height < 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid height parameter. Must be a positive integer.",
			})
		}
		options.Height = height
	}

	// Parse format
	if formatStr := c.Query("format"); formatStr != "" {
		formatStr = strings.ToLower(formatStr)
		switch formatStr {
		case "jpeg", "jpg":
			options.Format = bimg.JPEG
		case "png":
			options.Format = bimg.PNG
		case "webp":
			options.Format = bimg.WEBP
		case "gif":
			options.Format = bimg.GIF
		case "avif":
			options.Format = bimg.AVIF
		default:
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid format parameter. Supported formats: jpeg, png, webp, gif, avif",
			})
		}
	}

	// Parse advanced options (same as single optimize)
	options.ForceSRGB = c.QueryBool("forceSRGB", false)
	options.Progressive = c.QueryBool("progressive", false)
	options.OptimizeCoding = c.QueryBool("optimizeCoding", false)

	if subsampleStr := c.Query("subsample"); subsampleStr != "" {
		subsample, err := strconv.Atoi(subsampleStr)
		if err != nil || subsample < 0 || subsample > 3 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid subsample parameter. Must be between 0 and 3.",
			})
		}
		options.Subsample = subsample
	}

	if smoothStr := c.Query("smooth"); smoothStr != "" {
		smooth, err := strconv.Atoi(smoothStr)
		if err != nil || smooth < 0 || smooth > 100 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid smooth parameter. Must be between 0 and 100.",
			})
		}
		options.Smooth = smooth
	}

	if compressionStr := c.Query("compression"); compressionStr != "" {
		compression, err := strconv.Atoi(compressionStr)
		if err != nil || compression < 0 || compression > 9 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid compression parameter. Must be between 0 and 9.",
			})
		}
		options.Compression = compression
	}

	options.Interlace = c.QueryBool("interlace", false)
	options.Palette = c.QueryBool("palette", false)
	options.Lossless = c.QueryBool("lossless", false)

	if effortStr := c.Query("effort"); effortStr != "" {
		effort, err := strconv.Atoi(effortStr)
		if err != nil || effort < 0 || effort > 6 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid effort parameter. Must be between 0 and 6.",
			})
		}
		options.Effort = effort
	}

	if webpMethodStr := c.Query("webpMethod"); webpMethodStr != "" {
		webpMethod, err := strconv.Atoi(webpMethodStr)
		if err != nil || webpMethod < 0 || webpMethod > 6 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid webpMethod parameter. Must be between 0 and 6.",
			})
		}
		options.WebpMethod = webpMethod
	}

	if oxipngLevelStr := c.Query("oxipngLevel"); oxipngLevelStr != "" {
		oxipngLevel, err := strconv.Atoi(oxipngLevelStr)
		if err != nil || oxipngLevel < 0 || oxipngLevel > 6 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid oxipngLevel parameter. Must be between 0 and 6.",
			})
		}
		options.OxipngLevel = oxipngLevel
	}

	// Get multipart form
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse multipart form.",
		})
	}

	// Get all uploaded files
	files := form.File["images"]
	if len(files) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No images provided. Use 'images' field name for file uploads.",
		})
	}

	// Initialize response
	response := BatchOptimizeResponse{
		Results: make([]BatchImageResult, len(files)),
	}

	var totalOriginalSize int64
	var totalOptimizedSize int64

	// Parallel processing with worker pool
	// Use 4 workers for optimal CPU utilization without overwhelming the system
	numWorkers := 4
	if len(files) < numWorkers {
		numWorkers = len(files)
	}

	type job struct {
		index int
		file  *multipart.FileHeader
	}

	jobs := make(chan job, len(files))
	results := make(chan struct {
		index  int
		result BatchImageResult
	}, len(files))

	// Start workers
	for w := 0; w < numWorkers; w++ {
		go func() {
			for j := range jobs {
				result := processSingleImage(j.file, options)
				results <- struct {
					index  int
					result BatchImageResult
				}{j.index, result}
			}
		}()
	}

	// Send jobs
	for i, file := range files {
		jobs <- job{index: i, file: file}
	}
	close(jobs)

	// Collect results
	for i := 0; i < len(files); i++ {
		r := <-results
		response.Results[r.index] = r.result

		if r.result.Success {
			totalOriginalSize += r.result.OriginalSize
			totalOptimizedSize += r.result.OptimizedSize
			response.Summary.Successful++
		} else {
			response.Summary.Failed++
		}
	}
	close(results)

	// Calculate summary statistics
	response.Summary.Total = len(files)
	response.Summary.TotalOriginalSize = totalOriginalSize
	response.Summary.TotalOptimizedSize = totalOptimizedSize

	if totalOriginalSize > 0 {
		totalSavingsPercent := float64(totalOriginalSize-totalOptimizedSize) / float64(totalOriginalSize) * 100
		response.Summary.TotalSavings = fmt.Sprintf("%.2f%%", totalSavingsPercent)
	} else {
		response.Summary.TotalSavings = "0.00%"
	}

	response.Summary.ProcessingTime = fmt.Sprintf("%dms", time.Since(startTime).Milliseconds())

	return c.JSON(response)
}

package routes

import (
	"context"
	"io"
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

// allowedDomains is a whitelist of domains allowed for URL-based image fetching
// Can be configured via ALLOWED_DOMAINS env var (comma-separated list)
// Default includes common image hosting/CDN services
var allowedDomains = []string{
	"cloudinary.com",   // Cloudinary CDN
	"imgur.com",        // Imgur image hosting
	"unsplash.com",     // Unsplash stock photos
	"pexels.com",       // Pexels stock photos
	"localhost",        // Local development
	"127.0.0.1",        // Local development
}

// InitializeConfig loads configuration from environment variables
func InitializeConfig() {
	// Load allowed domains from environment if set
	if domainsEnv := os.Getenv("ALLOWED_DOMAINS"); domainsEnv != "" {
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

// isAllowedDomain checks whether the host is on the whitelist
// If allowedDomains is empty, all domains are allowed
func isAllowedDomain(u *url.URL) bool {
	if len(allowedDomains) == 0 {
		return true // Allow all domains if whitelist is empty
	}

	hostname := u.Hostname()
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to process image",
			"details": err.Error(),
		})
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

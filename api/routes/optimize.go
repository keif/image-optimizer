package routes

import (
	"context"
	"io"
	"net/http"
	"net/url"
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
// An empty list means all domains are allowed (use with caution in production)
var allowedDomains = []string{
	// Add your allowed domains here, e.g.:
	// "example.com",
	// "cdn.yoursite.com",
	// "images.unsplash.com",
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
	app.Post("/optimize", handleOptimize)
}

// handleOptimize handles POST /optimize requests
// Query parameters:
//   - quality: 1-100 (default: 80)
//   - width: target width in pixels (default: 0 = no resize)
//   - height: target height in pixels (default: 0 = no resize)
//   - format: target format - jpeg, png, webp, gif (default: original format)
//   - returnImage: true/false - return the optimized image file instead of JSON metadata (default: false)
// Form parameters:
//   - image: uploaded image file (multipart/form-data)
//   - url: image URL to fetch and optimize (alternative to file upload)
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
		default:
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid format parameter. Supported formats: jpeg, png, webp, gif",
			})
		}
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
		}

		if !validTypes[contentType] {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid file type. Supported types: jpeg, jpg, png, webp, gif",
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

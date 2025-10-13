package routes

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/h2non/bimg"
	"github.com/keif/image-optimizer/services"
)

// RegisterOptimizeRoutes registers the image optimization routes
func RegisterOptimizeRoutes(app *fiber.App) {
	app.Post("/optimize", handleOptimize)
}

// handleOptimize handles POST /optimize requests
// Query parameters:
//   - quality: 1-100 (default: 80)
//   - width: target width in pixels (default: 0 = no resize)
//   - height: target height in pixels (default: 0 = no resize)
//   - format: target format - jpeg, png, webp (default: original format)
func handleOptimize(c *fiber.Ctx) error {
	// Get uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No image file provided. Please upload an image using the 'image' field.",
		})
	}

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

	// Process the image
	result, err := services.OptimizeImage(file, options)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to process image",
			"details": err.Error(),
		})
	}

	// Return optimization results
	return c.JSON(result)
}

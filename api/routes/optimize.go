package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/services"
)

// RegisterOptimizeRoutes registers the image optimization routes
func RegisterOptimizeRoutes(app *fiber.App) {
	app.Post("/optimize", handleOptimize)
}

// handleOptimize handles POST /optimize requests
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

	// Process the image
	result, err := services.OptimizeImage(file)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process image",
		})
	}

	// Return optimization results
	return c.JSON(result)
}

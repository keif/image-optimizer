package routes

import (
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/db"
)

// isProductionEnv checks if we're running in production mode
func isProductionEnv() bool {
	env := os.Getenv("GO_ENV")
	return env == "production" || env == "prod"
}

// apiErrorResponse creates an error response, optionally including details in development
func apiErrorResponse(c *fiber.Ctx, status int, message string, err error) error {
	response := fiber.Map{
		"error": message,
	}

	// Only include error details in development mode
	if !isProductionEnv() && err != nil {
		response["details"] = err.Error()
	}

	return c.Status(status).JSON(response)
}

// RegisterAPIKeyRoutes registers the API key management routes
func RegisterAPIKeyRoutes(app *fiber.App) {
	api := app.Group("/api/keys")

	api.Post("/", createAPIKey)
	api.Get("/", listAPIKeys)
	api.Delete("/:id", revokeAPIKey)
}

// createAPIKey creates a new API key
// @Summary Create a new API key
// @Description Create a new API key with a given name
// @Tags api-keys
// @Accept json
// @Produce json
// @Param body body object{name=string} true "API key name"
// @Success 201 {object} db.APIKey
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/keys [post]
// @Security ApiKeyAuth
func createAPIKey(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		Name string `json:"name"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	// Create API key
	apiKey, err := db.CreateAPIKey(req.Name)
	if err != nil {
		return apiErrorResponse(c, fiber.StatusInternalServerError, "Failed to create API key", err)
	}

	return c.Status(fiber.StatusCreated).JSON(apiKey)
}

// listAPIKeys retrieves all API keys
// @Summary List all API keys
// @Description Get a list of all API keys (excluding actual key values for security)
// @Tags api-keys
// @Produce json
// @Success 200 {array} db.APIKey
// @Failure 500 {object} map[string]string
// @Router /api/keys [get]
// @Security ApiKeyAuth
func listAPIKeys(c *fiber.Ctx) error {
	keys, err := db.ListAPIKeys()
	if err != nil {
		return apiErrorResponse(c, fiber.StatusInternalServerError, "Failed to retrieve API keys", err)
	}

	return c.JSON(keys)
}

// revokeAPIKey revokes an API key by ID
// @Summary Revoke an API key
// @Description Revoke an API key by its ID
// @Tags api-keys
// @Produce json
// @Param id path int true "API Key ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/keys/{id} [delete]
// @Security ApiKeyAuth
func revokeAPIKey(c *fiber.Ctx) error {
	// Parse ID from URL parameter
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid API key ID",
		})
	}

	// Revoke API key
	if err := db.RevokeAPIKey(id); err != nil {
		if err.Error() == "API key not found or already revoked" {
			return apiErrorResponse(c, fiber.StatusNotFound, "API key not found or already revoked", nil)
		}
		return apiErrorResponse(c, fiber.StatusInternalServerError, "Failed to revoke API key", err)
	}

	return c.JSON(fiber.Map{
		"message": "API key revoked successfully",
	})
}

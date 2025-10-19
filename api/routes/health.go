package routes

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

// HealthResponse represents the health check response structure
type HealthResponse struct {
	Status    string `json:"status" example:"ok"`
	Version   string `json:"version" example:"v1.3.2"`
	Commit    string `json:"commit" example:"c1a2b3c"`
	Timestamp string `json:"timestamp" example:"2025-10-19T19:42:00Z"`
}

// HealthHandler handles the /health endpoint
// This endpoint is safe for uptime monitoring and exposes no sensitive information
//
// @Summary Health check
// @Description Check API health status with version information
// @Tags health
// @Produce json
// @Success 200 {object} HealthResponse
// @Router /health [get]
func HealthHandler(version, commit string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		response := HealthResponse{
			Status:    "ok",
			Version:   version,
			Commit:    commit,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}

		return c.Status(fiber.StatusOK).JSON(response)
	}
}

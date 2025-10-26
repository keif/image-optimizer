package routes

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/db"
)

// SetupAdminRoutes configures all admin-related routes
func SetupAdminRoutes(app *fiber.App) {
	admin := app.Group("/admin")

	// Cleanup endpoint - delete old metrics data
	admin.Post("/cleanup-metrics", handleCleanupMetrics)
}

// @Summary Cleanup old metrics data
// @Description Delete metrics data older than the specified retention period
// @Tags admin
// @Accept json
// @Produce json
// @Param days query int false "Retention period in days (default: 30)" default(30) minimum(1) maximum(365)
// @Success 200 {object} map[string]interface{} "Cleanup successful"
// @Failure 400 {object} map[string]string "Invalid parameters"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /admin/cleanup-metrics [post]
func handleCleanupMetrics(c *fiber.Ctx) error {
	// Parse retention days parameter
	retentionDays := 30 // Default to 30 days (matches privacy policy)
	if daysStr := c.Query("days"); daysStr != "" {
		parsedDays, err := strconv.Atoi(daysStr)
		if err != nil || parsedDays < 1 || parsedDays > 365 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid days parameter. Must be between 1 and 365.",
			})
		}
		retentionDays = parsedDays
	}

	// Perform cleanup
	if err := db.CleanupOldMetrics(retentionDays); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to cleanup old metrics",
		})
	}

	return c.JSON(fiber.Map{
		"success":        true,
		"retention_days": retentionDays,
		"message":        "Successfully deleted metrics older than " + strconv.Itoa(retentionDays) + " days",
	})
}

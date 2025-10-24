package routes

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/db"
)

// SetupMetricsRoutes configures all metrics-related routes
func SetupMetricsRoutes(app *fiber.App) {
	metrics := app.Group("/metrics")

	// Summary endpoint - overall aggregated metrics
	metrics.Get("/summary", handleMetricsSummary)

	// Formats endpoint - format conversion statistics
	metrics.Get("/formats", handleMetricsFormats)

	// Timeline endpoint - time-series data
	metrics.Get("/timeline", handleMetricsTimeline)
}

// @Summary Get metrics summary
// @Description Get aggregated metrics for a specified time range
// @Tags metrics
// @Accept json
// @Produce json
// @Param days query int false "Number of days to look back (default: 30)" default(30) minimum(1) maximum(365)
// @Success 200 {object} db.MetricsSummary
// @Failure 400 {object} map[string]string "Invalid parameters"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /metrics/summary [get]
func handleMetricsSummary(c *fiber.Ctx) error {
	// Parse days parameter
	days := 30 // Default to 30 days
	if daysStr := c.Query("days"); daysStr != "" {
		parsedDays, err := strconv.Atoi(daysStr)
		if err != nil || parsedDays < 1 || parsedDays > 365 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid days parameter. Must be between 1 and 365.",
			})
		}
		days = parsedDays
	}

	// Calculate time range
	endTime := time.Now()
	startTime := endTime.AddDate(0, 0, -days)

	// Get metrics summary
	summary, err := db.GetMetricsSummary(startTime, endTime)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve metrics summary",
		})
	}

	return c.JSON(fiber.Map{
		"time_range": fiber.Map{
			"start_time": startTime.Format(time.RFC3339),
			"end_time":   endTime.Format(time.RFC3339),
			"days":       days,
		},
		"metrics": summary,
	})
}

// @Summary Get format conversion statistics
// @Description Get detailed statistics about format conversions
// @Tags metrics
// @Accept json
// @Produce json
// @Param days query int false "Number of days to look back (default: 30)" default(30) minimum(1) maximum(365)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string "Invalid parameters"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /metrics/formats [get]
func handleMetricsFormats(c *fiber.Ctx) error {
	// Parse days parameter
	days := 30 // Default to 30 days
	if daysStr := c.Query("days"); daysStr != "" {
		parsedDays, err := strconv.Atoi(daysStr)
		if err != nil || parsedDays < 1 || parsedDays > 365 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid days parameter. Must be between 1 and 365.",
			})
		}
		days = parsedDays
	}

	// Calculate time range
	endTime := time.Now()
	startTime := endTime.AddDate(0, 0, -days)

	// Get format conversions
	conversions, err := db.GetFormatConversions(startTime, endTime)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve format conversion statistics",
		})
	}

	return c.JSON(fiber.Map{
		"time_range": fiber.Map{
			"start_time": startTime.Format(time.RFC3339),
			"end_time":   endTime.Format(time.RFC3339),
			"days":       days,
		},
		"conversions": conversions,
	})
}

// @Summary Get time-series metrics
// @Description Get time-series data for charting and trend analysis
// @Tags metrics
// @Accept json
// @Produce json
// @Param days query int false "Number of days to look back (default: 7)" default(7) minimum(1) maximum(365)
// @Param interval query string false "Time interval: 'hour' or 'day' (default: 'hour')" default(hour) Enums(hour,day)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string "Invalid parameters"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /metrics/timeline [get]
func handleMetricsTimeline(c *fiber.Ctx) error {
	// Parse days parameter
	days := 7 // Default to 7 days for timeline
	if daysStr := c.Query("days"); daysStr != "" {
		parsedDays, err := strconv.Atoi(daysStr)
		if err != nil || parsedDays < 1 || parsedDays > 365 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid days parameter. Must be between 1 and 365.",
			})
		}
		days = parsedDays
	}

	// Parse interval parameter
	interval := "hour" // Default to hourly
	if intervalParam := c.Query("interval"); intervalParam != "" {
		if intervalParam != "hour" && intervalParam != "day" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid interval parameter. Must be 'hour' or 'day'.",
			})
		}
		interval = intervalParam
	}

	// Calculate time range
	endTime := time.Now()
	startTime := endTime.AddDate(0, 0, -days)

	// Get time-series data
	dataPoints, err := db.GetTimeSeriesData(startTime, endTime, interval)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve time-series data",
		})
	}

	return c.JSON(fiber.Map{
		"time_range": fiber.Map{
			"start_time": startTime.Format(time.RFC3339),
			"end_time":   endTime.Format(time.RFC3339),
			"days":       days,
		},
		"interval": interval,
		"data":     dataPoints,
	})
}

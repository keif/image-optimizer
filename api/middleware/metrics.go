package middleware

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/db"
)

// MetricsConfig holds metrics collection configuration
type MetricsConfig struct {
	Enabled bool // Whether metrics collection is enabled
}

// GetMetricsConfig loads metrics configuration from environment variables
func GetMetricsConfig() MetricsConfig {
	config := MetricsConfig{
		Enabled: true, // Default: enabled
	}

	if enabledStr := os.Getenv("METRICS_ENABLED"); enabledStr != "" {
		if enabled, err := strconv.ParseBool(enabledStr); err == nil {
			config.Enabled = enabled
		}
	}

	return config
}

// Context keys for storing metrics data
const (
	MetricsStartTimeKey  = "metrics_start_time"
	MetricsEndpointKey   = "metrics_endpoint"
	MetricsSuccessKey    = "metrics_success"
	MetricsAPIKeyIDKey   = "metrics_api_key_id" // #nosec G101 - This is a context key name, not credentials
)

// NewMetricsCollector creates middleware that collects metrics for each request
func NewMetricsCollector() fiber.Handler {
	config := GetMetricsConfig()

	// If metrics collection is disabled, return a no-op middleware
	if !config.Enabled {
		return func(c *fiber.Ctx) error {
			return c.Next()
		}
	}

	return func(c *fiber.Ctx) error {
		// Record start time
		startTime := time.Now()
		c.Locals(MetricsStartTimeKey, startTime)

		// Determine endpoint type
		path := c.Path()
		endpoint := "other"
		if path == "/optimize" {
			endpoint = "optimize"
		} else if path == "/batch-optimize" {
			endpoint = "batch-optimize"
		} else if path == "/pack-sprites" {
			endpoint = "pack-sprites"
		}
		c.Locals(MetricsEndpointKey, endpoint)

		// Process request
		err := c.Next()

		// Only record metrics for optimization endpoints
		if endpoint == "other" {
			return err
		}

		// Record end time and calculate processing time
		processingTime := time.Since(startTime).Milliseconds()

		// Determine success based on status code
		success := c.Response().StatusCode() >= 200 && c.Response().StatusCode() < 400
		c.Locals(MetricsSuccessKey, success)

		// Get API key ID if available
		var apiKeyID *int
		if keyID := c.Locals("api_key_id"); keyID != nil {
			if id, ok := keyID.(int); ok {
				apiKeyID = &id
			}
		}

		// Record metric asynchronously to avoid blocking the response
		go func() {
			event := db.MetricEvent{
				Endpoint:         endpoint,
				Success:          success,
				ProcessingTimeMs: processingTime,
				APIKeyID:         apiKeyID,
				Timestamp:        startTime,
			}

			// Try to record the metric, but don't fail if it errors
			if recordErr := db.RecordMetric(event); recordErr != nil {
				log.Printf("[METRICS] Failed to record metric: %v", recordErr)
			}
		}()

		return err
	}
}

// RecordOptimizationMetric is a helper function that can be called from handlers
// to record detailed optimization metrics (formats, sizes, etc.)
func RecordOptimizationMetric(c *fiber.Ctx, inputFormat, outputFormat string, bytesOriginal, bytesOptimized int64) {
	config := GetMetricsConfig()
	if !config.Enabled {
		return
	}

	// Get stored metrics data from context
	startTimeVal := c.Locals(MetricsStartTimeKey)
	endpointVal := c.Locals(MetricsEndpointKey)
	successVal := c.Locals(MetricsSuccessKey)

	if startTimeVal == nil || endpointVal == nil {
		// Metrics not initialized, skip
		return
	}

	startTime, ok1 := startTimeVal.(time.Time)
	endpoint, ok2 := endpointVal.(string)
	if !ok1 || !ok2 {
		return
	}

	// Get success status (defaults to true if not set yet)
	success := true
	if successVal != nil {
		if s, ok := successVal.(bool); ok {
			success = s
		}
	}

	processingTime := time.Since(startTime).Milliseconds()

	// Get API key ID if available
	var apiKeyID *int
	if keyID := c.Locals("api_key_id"); keyID != nil {
		if id, ok := keyID.(int); ok {
			apiKeyID = &id
		}
	}

	// Record metric asynchronously
	go func() {
		event := db.MetricEvent{
			Endpoint:         endpoint,
			Success:          success,
			InputFormat:      inputFormat,
			OutputFormat:     outputFormat,
			BytesOriginal:    bytesOriginal,
			BytesOptimized:   bytesOptimized,
			ProcessingTimeMs: processingTime,
			APIKeyID:         apiKeyID,
			Timestamp:        startTime,
		}

		if recordErr := db.RecordMetric(event); recordErr != nil {
			log.Printf("[METRICS] Failed to record optimization metric: %v", recordErr)
		}
	}()
}

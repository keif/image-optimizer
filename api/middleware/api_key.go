package middleware

import (
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/db"
)

// APIKeyConfig holds API key authentication configuration
type APIKeyConfig struct {
	Enabled       bool     // Whether API key authentication is enabled
	BypassPaths   []string // Paths that bypass API key authentication
}

// GetAPIKeyConfig loads API key config from environment variables
func GetAPIKeyConfig() APIKeyConfig {
	config := APIKeyConfig{
		Enabled: true, // Default: enabled
		BypassPaths: []string{
			"/health",
			"/swagger",
			"/api/keys", // Allow API key creation without auth (bootstrap)
			"/optimize",  // Allow public image optimization via web UI
		},
	}

	// Load from environment
	if enabledStr := os.Getenv("API_KEY_AUTH_ENABLED"); enabledStr != "" {
		if enabled, err := strconv.ParseBool(enabledStr); err == nil {
			config.Enabled = enabled
		}
	}

	return config
}

// RequireAPIKey is a middleware that validates API keys
func RequireAPIKey() fiber.Handler {
	config := GetAPIKeyConfig()

	return func(c *fiber.Ctx) error {
		// If API key auth is disabled, allow all requests
		if !config.Enabled {
			return c.Next()
		}

		// Check if path is in bypass list
		path := c.Path()
		for _, bypassPath := range config.BypassPaths {
			if strings.HasPrefix(path, bypassPath) {
				return c.Next()
			}
		}

		// Extract API key from Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing API key. Please provide an API key in the Authorization header.",
			})
		}

		// Parse Bearer token format: "Bearer sk_..."
		var apiKey string
		if strings.HasPrefix(authHeader, "Bearer ") {
			apiKey = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			// Also support direct key format without "Bearer" prefix
			apiKey = authHeader
		}

		// Validate API key
		if !db.ValidateAPIKey(apiKey) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or revoked API key.",
			})
		}

		// API key is valid, continue to next handler
		return c.Next()
	}
}

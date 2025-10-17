package middleware

import (
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/db"
)

// BypassRule defines a path and optional HTTP method that bypasses authentication
type BypassRule struct {
	Path   string // Path prefix to match
	Method string // HTTP method to match (empty = all methods)
}

// APIKeyConfig holds API key authentication configuration
type APIKeyConfig struct {
	Enabled      bool          // Whether API key authentication is enabled
	BypassRules  []BypassRule  // Rules that bypass API key authentication
}

// GetAPIKeyConfig loads API key config from environment variables
func GetAPIKeyConfig() APIKeyConfig {
	config := APIKeyConfig{
		Enabled: true, // Default: enabled
		BypassRules: []BypassRule{
			{Path: "/health", Method: ""},           // Allow all methods
			{Path: "/swagger", Method: ""},          // Allow all methods
			{Path: "/api/keys", Method: "POST"},     // Only allow POST for bootstrap (create keys)
			{Path: "/optimize", Method: ""},         // Allow public image optimization via web UI
			{Path: "/batch-optimize", Method: ""},   // Allow public batch optimization via web UI
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

		// Check if path and method match a bypass rule
		path := c.Path()
		method := c.Method()
		for _, rule := range config.BypassRules {
			// Check if path matches
			if strings.HasPrefix(path, rule.Path) {
				// If rule has no method specified, or method matches, bypass auth
				if rule.Method == "" || rule.Method == method {
					return c.Next()
				}
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

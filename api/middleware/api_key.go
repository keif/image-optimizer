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
	// Base bypass rules (always allowed)
	baseBypassRules := []BypassRule{
		{Path: "/health", Method: ""},       // Health check endpoint
		{Path: "/swagger", Method: ""},      // API documentation
		{Path: "/api/keys", Method: "POST"}, // Bootstrap: create first API key
	}

	config := APIKeyConfig{
		Enabled:     true, // Default: API key authentication enabled (secure by default)
		BypassRules: baseBypassRules,
	}

	// Check if public optimization is enabled (for public web UI access)
	// Default: false (secure by default - requires API keys for optimization)
	// Set to true for public instances like sosquishy.io with rate limiting
	publicOptEnabled := false
	if publicOptStr := os.Getenv("PUBLIC_OPTIMIZATION_ENABLED"); publicOptStr != "" {
		if enabled, err := strconv.ParseBool(publicOptStr); err == nil {
			publicOptEnabled = enabled
		}
	}

	// Add optimization endpoints to bypass rules if public access is enabled
	if publicOptEnabled {
		config.BypassRules = append(config.BypassRules,
			BypassRule{Path: "/optimize", Method: ""},       // Public image optimization
			BypassRule{Path: "/batch-optimize", Method: ""}, // Public batch optimization
			BypassRule{Path: "/pack-sprites", Method: ""},   // Public spritesheet packing
		)
	}

	// Check if API key authentication is enabled
	// Default: true (enabled), can be disabled for local development
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

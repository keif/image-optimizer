package middleware

import (
	"log"
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
	Enabled         bool          // Whether API key authentication is enabled
	BypassRules     []BypassRule  // Rules that bypass API key authentication
	TrustedOrigins  []string      // Origins/domains that can access without API keys
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
			BypassRule{Path: "/optimize", Method: ""},            // Public image optimization
			BypassRule{Path: "/batch-optimize", Method: ""},      // Public batch optimization
			BypassRule{Path: "/pack-sprites", Method: ""},        // Public spritesheet packing
			BypassRule{Path: "/optimize-spritesheet", Method: ""}, // Public spritesheet optimization
		)
	}

	// Check if API key authentication is enabled
	// Default: true (enabled), can be disabled for local development
	if enabledStr := os.Getenv("API_KEY_AUTH_ENABLED"); enabledStr != "" {
		if enabled, err := strconv.ParseBool(enabledStr); err == nil {
			config.Enabled = enabled
		}
	}

	// Load trusted origins from environment
	// Format: comma-separated list of origins (e.g., "https://sosquishy.io,https://www.sosquishy.io")
	// Requests from these origins can access the API without API keys
	if trustedOriginsStr := os.Getenv("TRUSTED_ORIGINS"); trustedOriginsStr != "" {
		origins := strings.Split(trustedOriginsStr, ",")
		for _, origin := range origins {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				config.TrustedOrigins = append(config.TrustedOrigins, origin)
			}
		}
	}

	return config
}

// matchesOrigin checks if the request Origin header matches a trusted origin
func matchesOrigin(origin, trusted string) bool {
	if origin == "" || trusted == "" {
		return false
	}

	// Exact match
	if origin == trusted {
		return true
	}

	// Handle subdomain wildcards (e.g., trusted="https://*.sosquishy.io")
	if strings.Contains(trusted, "*") {
		// Convert wildcard pattern to regex-like matching
		// "https://*.sosquishy.io" should match "https://www.sosquishy.io", "https://api.sosquishy.io", etc.
		pattern := strings.ReplaceAll(trusted, ".", "\\.")
		pattern = strings.ReplaceAll(pattern, "*", ".*")
		// Simple contains check for basic wildcard support
		baseDomain := strings.TrimPrefix(trusted, "https://*.")
		baseDomain = strings.TrimPrefix(baseDomain, "http://*.")
		if strings.HasSuffix(origin, baseDomain) {
			return true
		}
	}

	return false
}

// matchesReferer checks if the request Referer header matches a trusted origin
func matchesReferer(referer, trusted string) bool {
	if referer == "" || trusted == "" {
		return false
	}

	// Referer is a full URL, extract the origin
	if strings.HasPrefix(referer, "http://") || strings.HasPrefix(referer, "https://") {
		// Find the end of the origin (scheme + host)
		schemeEnd := strings.Index(referer, "://")
		if schemeEnd == -1 {
			return false
		}

		remainder := referer[schemeEnd+3:]
		pathStart := strings.Index(remainder, "/")

		var refererOrigin string
		if pathStart == -1 {
			// No path, entire remainder is the host
			refererOrigin = referer
		} else {
			// Extract scheme + host only
			refererOrigin = referer[:schemeEnd+3+pathStart]
		}

		return matchesOrigin(refererOrigin, trusted)
	}

	return false
}

// isTrustedOrigin checks if the request comes from a trusted origin
func isTrustedOrigin(c *fiber.Ctx, trustedOrigins []string) bool {
	if len(trustedOrigins) == 0 {
		return false
	}

	origin := c.Get("Origin")
	referer := c.Get("Referer")

	for _, trusted := range trustedOrigins {
		if matchesOrigin(origin, trusted) || matchesReferer(referer, trusted) {
			return true
		}
	}

	return false
}

// RequireAPIKey is a middleware that validates API keys
func RequireAPIKey() fiber.Handler {
	config := GetAPIKeyConfig()

	return func(c *fiber.Ctx) error {
		// If API key auth is disabled, allow all requests
		if !config.Enabled {
			return c.Next()
		}

		// Check if request comes from a trusted origin (bypass API key requirement)
		if isTrustedOrigin(c, config.TrustedOrigins) {
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
			// SECURITY EVENT: Missing API key
			log.Printf("[SECURITY] Missing API key - IP: %s, Path: %s, Method: %s, Origin: %s",
				c.IP(), c.Path(), c.Method(), c.Get("Origin"))
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
			// SECURITY EVENT: Invalid or revoked API key
			// Log partial key for debugging (first 8 chars only)
			keyPrefix := apiKey
			if len(keyPrefix) > 8 {
				keyPrefix = keyPrefix[:8] + "..."
			}
			log.Printf("[SECURITY] Invalid or revoked API key - IP: %s, Key: %s, Path: %s, Method: %s, Origin: %s",
				c.IP(), keyPrefix, c.Path(), c.Method(), c.Get("Origin"))
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or revoked API key.",
			})
		}

		// API key is valid, continue to next handler
		return c.Next()
	}
}

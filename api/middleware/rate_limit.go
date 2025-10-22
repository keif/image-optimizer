package middleware

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	Max        int           // Maximum number of requests
	Expiration time.Duration // Time window for rate limiting
	Enabled    bool          // Whether rate limiting is enabled
}

// GetRateLimitConfig loads rate limit configuration from environment variables
func GetRateLimitConfig() RateLimitConfig {
	config := RateLimitConfig{
		Max:        100,              // Default: 100 requests
		Expiration: 1 * time.Minute,  // Default: per minute
		Enabled:    true,             // Default: enabled
	}

	// Load from environment
	if maxStr := os.Getenv("RATE_LIMIT_MAX"); maxStr != "" {
		if max, err := strconv.Atoi(maxStr); err == nil && max > 0 {
			config.Max = max
		}
	}

	if expStr := os.Getenv("RATE_LIMIT_WINDOW"); expStr != "" {
		if exp, err := time.ParseDuration(expStr); err == nil {
			config.Expiration = exp
		}
	}

	if enabledStr := os.Getenv("RATE_LIMIT_ENABLED"); enabledStr != "" {
		if enabled, err := strconv.ParseBool(enabledStr); err == nil {
			config.Enabled = enabled
		}
	}

	return config
}

// NewRateLimiter creates a new rate limiter middleware
func NewRateLimiter() fiber.Handler {
	config := GetRateLimitConfig()

	// If rate limiting is disabled, return a no-op middleware
	if !config.Enabled {
		return func(c *fiber.Ctx) error {
			return c.Next()
		}
	}

	return limiter.New(limiter.Config{
		Max:        config.Max,
		Expiration: config.Expiration,
		KeyGenerator: func(c *fiber.Ctx) string {
			// Use IP address as the key
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			// SECURITY EVENT: Rate limit exceeded
			log.Printf("[SECURITY] Rate limit exceeded - IP: %s, Path: %s, Method: %s, Limit: %d/%v",
				c.IP(), c.Path(), c.Method(), config.Max, config.Expiration)
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Rate limit exceeded. Please try again later.",
			})
		},
		SkipFailedRequests:     false,
		SkipSuccessfulRequests: false,
		LimiterMiddleware:      limiter.SlidingWindow{},
	})
}

package routes

import (
	"io"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/db"
	"github.com/keif/image-optimizer/middleware"
)

// setupCORSTestApp creates a test Fiber app with CORS middleware configured
func setupCORSTestApp() *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	// Set up CORS with test origins
	allowedOrigins := "https://sosquishy.io,https://www.sosquishy.io,http://localhost:3000"

	// Custom CORS middleware (same as in main.go)
	app.Use(func(c *fiber.Ctx) error {
		origin := c.Get("Origin")

		if origin != "" && strings.Contains(allowedOrigins, origin) {
			c.Set("Access-Control-Allow-Origin", origin)
			c.Set("Access-Control-Allow-Credentials", "true")
			c.Set("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization")
			c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		}

		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusNoContent)
		}

		return c.Next()
	})

	// Add routes that simulate real endpoints
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Post("/optimize", func(c *fiber.Ctx) error {
		// Simulate a 400 error (missing image)
		contentType := c.Get("Content-Type")
		if !strings.Contains(contentType, "multipart/form-data") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Must provide multipart/form-data",
			})
		}
		return c.JSON(fiber.Map{"success": true})
	})

	app.Post("/fail", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Simulated error",
		})
	})

	return app
}

func TestCORS_SuccessResponse(t *testing.T) {
	app := setupCORSTestApp()

	req := httptest.NewRequest("GET", "/health", nil)
	req.Header.Set("Origin", "https://sosquishy.io")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Verify CORS headers are present
	if resp.Header.Get("Access-Control-Allow-Origin") != "https://sosquishy.io" {
		t.Errorf("Expected CORS header 'Access-Control-Allow-Origin: https://sosquishy.io', got '%s'",
			resp.Header.Get("Access-Control-Allow-Origin"))
	}

	if resp.Header.Get("Access-Control-Allow-Credentials") != "true" {
		t.Errorf("Expected CORS header 'Access-Control-Allow-Credentials: true', got '%s'",
			resp.Header.Get("Access-Control-Allow-Credentials"))
	}
}

func TestCORS_ErrorResponse400(t *testing.T) {
	app := setupCORSTestApp()

	// Simulate a 400 error (missing multipart data)
	req := httptest.NewRequest("POST", "/optimize", nil)
	req.Header.Set("Origin", "https://sosquishy.io")
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Verify status code is 400
	if resp.StatusCode != fiber.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}

	// CRITICAL: Verify CORS headers are present even on error responses
	corsHeader := resp.Header.Get("Access-Control-Allow-Origin")
	if corsHeader != "https://sosquishy.io" {
		t.Errorf("CORS HEADER MISSING ON 400 ERROR! Expected 'https://sosquishy.io', got '%s'", corsHeader)
		t.Error("This is the bug that caused the production issue!")
	}

	if resp.Header.Get("Access-Control-Allow-Credentials") != "true" {
		t.Error("CORS credentials header missing on error response")
	}
}

func TestCORS_ErrorResponse500(t *testing.T) {
	app := setupCORSTestApp()

	req := httptest.NewRequest("POST", "/fail", nil)
	req.Header.Set("Origin", "https://sosquishy.io")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Verify status code is 500
	if resp.StatusCode != fiber.StatusInternalServerError {
		t.Errorf("Expected status 500, got %d", resp.StatusCode)
	}

	// Verify CORS headers are present on 500 errors
	if resp.Header.Get("Access-Control-Allow-Origin") != "https://sosquishy.io" {
		t.Error("CORS headers missing on 500 error response")
	}
}

func TestCORS_PreflightRequest(t *testing.T) {
	app := setupCORSTestApp()

	// Preflight OPTIONS request
	req := httptest.NewRequest("OPTIONS", "/optimize", nil)
	req.Header.Set("Origin", "https://sosquishy.io")
	req.Header.Set("Access-Control-Request-Method", "POST")
	req.Header.Set("Access-Control-Request-Headers", "Content-Type")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Verify preflight response
	if resp.StatusCode != fiber.StatusNoContent {
		t.Errorf("Expected status 204 for preflight, got %d", resp.StatusCode)
	}

	if resp.Header.Get("Access-Control-Allow-Origin") != "https://sosquishy.io" {
		t.Error("CORS headers missing on preflight request")
	}

	if resp.Header.Get("Access-Control-Allow-Methods") == "" {
		t.Error("Access-Control-Allow-Methods header missing on preflight")
	}

	if resp.Header.Get("Access-Control-Allow-Headers") == "" {
		t.Error("Access-Control-Allow-Headers header missing on preflight")
	}
}

func TestCORS_DisallowedOrigin(t *testing.T) {
	app := setupCORSTestApp()

	req := httptest.NewRequest("GET", "/health", nil)
	req.Header.Set("Origin", "https://evil.com")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Verify CORS headers are NOT present for disallowed origin
	if resp.Header.Get("Access-Control-Allow-Origin") != "" {
		t.Errorf("CORS headers should NOT be present for disallowed origin, got '%s'",
			resp.Header.Get("Access-Control-Allow-Origin"))
	}
}

func TestCORS_MultipleAllowedOrigins(t *testing.T) {
	app := setupCORSTestApp()

	origins := []string{
		"https://sosquishy.io",
		"https://www.sosquishy.io",
		"http://localhost:3000",
	}

	for _, origin := range origins {
		t.Run(origin, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/health", nil)
			req.Header.Set("Origin", origin)

			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Failed to make request: %v", err)
			}
			defer resp.Body.Close()

			if resp.Header.Get("Access-Control-Allow-Origin") != origin {
				t.Errorf("Expected CORS header for origin %s, got '%s'",
					origin, resp.Header.Get("Access-Control-Allow-Origin"))
			}
		})
	}
}

func TestCORS_NoOriginHeader(t *testing.T) {
	app := setupCORSTestApp()

	// Request without Origin header (not a CORS request)
	req := httptest.NewRequest("GET", "/health", nil)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Should succeed but no CORS headers
	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if resp.Header.Get("Access-Control-Allow-Origin") != "" {
		t.Error("CORS headers should not be present when no Origin header is sent")
	}
}

func TestCORS_WithMiddlewareStack(t *testing.T) {
	// Test CORS with rate limiting and API key middleware
	app := fiber.New()

	// Set up environment for testing
	os.Setenv("API_KEY_AUTH_ENABLED", "true")
	os.Setenv("PUBLIC_OPTIMIZATION_ENABLED", "false")
	os.Setenv("TRUSTED_ORIGINS", "https://sosquishy.io")
	defer func() {
		os.Unsetenv("API_KEY_AUTH_ENABLED")
		os.Unsetenv("PUBLIC_OPTIMIZATION_ENABLED")
		os.Unsetenv("TRUSTED_ORIGINS")
	}()

	// Initialize database for API key tests
	os.Setenv("DB_PATH", ":memory:")
	if err := db.Initialize(); err != nil {
		t.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	allowedOrigins := "https://sosquishy.io"

	// CORS middleware (MUST be first)
	app.Use(func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		if origin != "" && strings.Contains(allowedOrigins, origin) {
			c.Set("Access-Control-Allow-Origin", origin)
			c.Set("Access-Control-Allow-Credentials", "true")
			c.Set("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization")
			c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		}
		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusNoContent)
		}
		return c.Next()
	})

	// Add API key middleware
	app.Use(middleware.RequireAPIKey())

	// Add a protected endpoint
	app.Post("/optimize", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"success": true})
	})

	// Test request from trusted origin (should work without API key)
	req := httptest.NewRequest("POST", "/optimize", strings.NewReader("test"))
	req.Header.Set("Origin", "https://sosquishy.io")
	req.Header.Set("Content-Type", "multipart/form-data")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Should have CORS headers even if request succeeds/fails
	corsHeader := resp.Header.Get("Access-Control-Allow-Origin")
	if corsHeader != "https://sosquishy.io" {
		t.Errorf("CORS header missing in middleware stack! Got '%s'", corsHeader)
	}
}

func TestCORS_RealWorldScenario(t *testing.T) {
	// Simulate the exact production scenario
	app := setupCORSTestApp()

	// Frontend sends a request with missing image data (causes 400)
	req := httptest.NewRequest("POST", "/optimize?quality=80", nil)
	req.Header.Set("Origin", "https://sosquishy.io")
	req.Header.Set("Content-Type", "application/json") // Wrong content type

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	t.Logf("Response Status: %d", resp.StatusCode)
	t.Logf("Response Body: %s", string(body))
	t.Logf("CORS Header: %s", resp.Header.Get("Access-Control-Allow-Origin"))

	// This is the critical test - CORS headers MUST be present on 400 errors
	if resp.StatusCode == fiber.StatusBadRequest {
		corsHeader := resp.Header.Get("Access-Control-Allow-Origin")
		if corsHeader != "https://sosquishy.io" {
			t.Fatalf("PRODUCTION BUG REPRODUCED: CORS header missing on 400 error!\n"+
				"Expected: 'https://sosquishy.io'\n"+
				"Got: '%s'\n"+
				"This causes 'CORS Missing Allow Origin' error in browser", corsHeader)
		} else {
			t.Log("✅ CORS headers correctly present on 400 error")
		}
	}
}

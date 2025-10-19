package middleware

import (
	"io"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/db"
)

// setupTestApp creates a test Fiber app with API key middleware
func setupTestApp(t *testing.T) (*fiber.App, string) {
	// Initialize database for testing
	os.Setenv("DB_PATH", ":memory:")
	if err := db.Initialize(); err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}

	// Create a test API key
	apiKey, err := db.CreateAPIKey("Test Key")
	if err != nil {
		t.Fatalf("Failed to create test API key: %v", err)
	}

	// Enable API key authentication for testing
	os.Setenv("API_KEY_AUTH_ENABLED", "true")

	app := fiber.New()
	app.Use(RequireAPIKey())

	// Test routes
	app.Post("/api/keys", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "POST /api/keys"})
	})

	app.Get("/api/keys", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "GET /api/keys"})
	})

	app.Delete("/api/keys/:id", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "DELETE /api/keys"})
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Post("/optimize", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "POST /optimize"})
	})

	return app, apiKey.Key
}

// TestAPIKeyMiddleware_BypassRules tests method-specific bypass rules
func TestAPIKeyMiddleware_BypassRules(t *testing.T) {
	app, validAPIKey := setupTestApp(t)
	defer db.Close()

	tests := []struct {
		name           string
		method         string
		path           string
		apiKey         string
		expectedStatus int
		description    string
	}{
		// POST /api/keys should bypass auth (bootstrap)
		{
			name:           "POST /api/keys without auth",
			method:         "POST",
			path:           "/api/keys",
			apiKey:         "",
			expectedStatus: 200,
			description:    "POST /api/keys should allow unauthenticated requests for bootstrapping",
		},
		// GET /api/keys should require auth
		{
			name:           "GET /api/keys without auth",
			method:         "GET",
			path:           "/api/keys",
			apiKey:         "",
			expectedStatus: 401,
			description:    "GET /api/keys should require authentication",
		},
		{
			name:           "GET /api/keys with valid auth",
			method:         "GET",
			path:           "/api/keys",
			apiKey:         validAPIKey,
			expectedStatus: 200,
			description:    "GET /api/keys should work with valid API key",
		},
		// DELETE /api/keys/:id should require auth
		{
			name:           "DELETE /api/keys/:id without auth",
			method:         "DELETE",
			path:           "/api/keys/1",
			apiKey:         "",
			expectedStatus: 401,
			description:    "DELETE /api/keys should require authentication",
		},
		{
			name:           "DELETE /api/keys/:id with valid auth",
			method:         "DELETE",
			path:           "/api/keys/1",
			apiKey:         validAPIKey,
			expectedStatus: 200,
			description:    "DELETE /api/keys should work with valid API key",
		},
		// /health should bypass auth for all methods
		{
			name:           "GET /health without auth",
			method:         "GET",
			path:           "/health",
			apiKey:         "",
			expectedStatus: 200,
			description:    "GET /health should allow unauthenticated requests",
		},
		// /optimize should require auth by default (secure by default)
		{
			name:           "POST /optimize without auth",
			method:         "POST",
			path:           "/optimize",
			apiKey:         "",
			expectedStatus: 401,
			description:    "POST /optimize should require authentication (secure by default)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, nil)
			if tt.apiKey != "" {
				req.Header.Set("Authorization", "Bearer "+tt.apiKey)
			}

			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				body, _ := io.ReadAll(resp.Body)
				t.Errorf("%s: expected status %d, got %d\nResponse: %s",
					tt.description, tt.expectedStatus, resp.StatusCode, string(body))
			}
		})
	}
}

// TestAPIKeyMiddleware_InvalidKey tests that invalid keys are rejected
func TestAPIKeyMiddleware_InvalidKey(t *testing.T) {
	app, _ := setupTestApp(t)
	defer db.Close()

	req := httptest.NewRequest("GET", "/api/keys", nil)
	req.Header.Set("Authorization", "Bearer sk_invalid_key_12345")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 401 {
		t.Errorf("Expected status 401 for invalid API key, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	if !strings.Contains(string(body), "Invalid or revoked API key") {
		t.Errorf("Expected error message about invalid key, got: %s", string(body))
	}
}

// TestAPIKeyMiddleware_RevokedKey tests that revoked keys are rejected
func TestAPIKeyMiddleware_RevokedKey(t *testing.T) {
	app, validAPIKey := setupTestApp(t)
	defer db.Close()

	// Revoke the key
	if err := db.RevokeAPIKey(1); err != nil {
		t.Fatalf("Failed to revoke API key: %v", err)
	}

	req := httptest.NewRequest("GET", "/api/keys", nil)
	req.Header.Set("Authorization", "Bearer "+validAPIKey)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 401 {
		t.Errorf("Expected status 401 for revoked API key, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	if !strings.Contains(string(body), "Invalid or revoked API key") {
		t.Errorf("Expected error message about revoked key, got: %s", string(body))
	}
}

// TestAPIKeyMiddleware_BearerAndDirectFormat tests both auth header formats
func TestAPIKeyMiddleware_BearerAndDirectFormat(t *testing.T) {
	app, validAPIKey := setupTestApp(t)
	defer db.Close()

	tests := []struct {
		name      string
		authValue string
	}{
		{"Bearer format", "Bearer " + validAPIKey},
		{"Direct format", validAPIKey},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/keys", nil)
			req.Header.Set("Authorization", tt.authValue)

			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != 200 {
				body, _ := io.ReadAll(resp.Body)
				t.Errorf("Expected status 200 for %s, got %d\nResponse: %s",
					tt.name, resp.StatusCode, string(body))
			}
		})
	}
}

// TestAPIKeyMiddleware_Disabled tests that middleware can be disabled
func TestAPIKeyMiddleware_Disabled(t *testing.T) {
	// Disable API key authentication
	os.Setenv("API_KEY_AUTH_ENABLED", "false")
	defer os.Setenv("API_KEY_AUTH_ENABLED", "true")

	os.Setenv("DB_PATH", ":memory:")
	if err := db.Initialize(); err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}
	defer db.Close()

	app := fiber.New()
	app.Use(RequireAPIKey())

	app.Get("/api/keys", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "GET /api/keys"})
	})

	// Should work without API key when disabled
	req := httptest.NewRequest("GET", "/api/keys", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		t.Errorf("Expected status 200 when auth is disabled, got %d", resp.StatusCode)
	}
}

// TestAPIKeyMiddleware_PublicOptimizationEnabled tests PUBLIC_OPTIMIZATION_ENABLED
func TestAPIKeyMiddleware_PublicOptimizationEnabled(t *testing.T) {
	// Enable public optimization mode
	os.Setenv("PUBLIC_OPTIMIZATION_ENABLED", "true")
	os.Setenv("API_KEY_AUTH_ENABLED", "true")
	defer os.Unsetenv("PUBLIC_OPTIMIZATION_ENABLED")
	defer os.Unsetenv("API_KEY_AUTH_ENABLED")

	os.Setenv("DB_PATH", ":memory:")
	if err := db.Initialize(); err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}
	defer db.Close()

	app := fiber.New()
	app.Use(RequireAPIKey())

	app.Post("/optimize", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "POST /optimize"})
	})

	app.Post("/batch-optimize", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "POST /batch-optimize"})
	})

	tests := []struct {
		name           string
		path           string
		expectedStatus int
	}{
		{
			name:           "/optimize without auth",
			path:           "/optimize",
			expectedStatus: 200,
		},
		{
			name:           "/batch-optimize without auth",
			path:           "/batch-optimize",
			expectedStatus: 200,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", tt.path, nil)
			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				body, _ := io.ReadAll(resp.Body)
				t.Errorf("Expected status %d, got %d. Response: %s",
					tt.expectedStatus, resp.StatusCode, string(body))
			}
		})
	}
}

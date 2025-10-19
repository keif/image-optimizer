package routes

import (
	"encoding/json"
	"io"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestHealthHandler(t *testing.T) {
	tests := []struct {
		name           string
		version        string
		commit         string
		expectedStatus int
		checkResponse  func(*testing.T, HealthResponse)
	}{
		{
			name:           "health check with production version",
			version:        "v1.3.2",
			commit:         "c1a2b3c",
			expectedStatus: 200,
			checkResponse: func(t *testing.T, resp HealthResponse) {
				assert.Equal(t, "ok", resp.Status)
				assert.Equal(t, "v1.3.2", resp.Version)
				assert.Equal(t, "c1a2b3c", resp.Commit)
			},
		},
		{
			name:           "health check with dev version",
			version:        "dev",
			commit:         "none",
			expectedStatus: 200,
			checkResponse: func(t *testing.T, resp HealthResponse) {
				assert.Equal(t, "ok", resp.Status)
				assert.Equal(t, "dev", resp.Version)
				assert.Equal(t, "none", resp.Commit)
			},
		},
		{
			name:           "health check with git describe version",
			version:        "v2.1.0-5-g1234567",
			commit:         "1234567",
			expectedStatus: 200,
			checkResponse: func(t *testing.T, resp HealthResponse) {
				assert.Equal(t, "ok", resp.Status)
				assert.Equal(t, "v2.1.0-5-g1234567", resp.Version)
				assert.Equal(t, "1234567", resp.Commit)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a new Fiber app
			app := fiber.New()

			// Register the health handler with test version/commit
			app.Get("/health", HealthHandler(tt.version, tt.commit))

			// Create test request
			req := httptest.NewRequest("GET", "/health", nil)
			req.Header.Set("Content-Type", "application/json")

			// Perform the request
			resp, err := app.Test(req)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, resp.StatusCode)

			// Read response body
			body, err := io.ReadAll(resp.Body)
			assert.NoError(t, err)

			// Parse JSON response
			var healthResp HealthResponse
			err = json.Unmarshal(body, &healthResp)
			assert.NoError(t, err)

			// Verify timestamp is valid RFC3339 format
			parsedTime, err := time.Parse(time.RFC3339, healthResp.Timestamp)
			assert.NoError(t, err, "timestamp should be valid RFC3339 format")

			// Verify timestamp is recent (within last 5 seconds)
			timeDiff := time.Since(parsedTime)
			assert.True(t, timeDiff < 5*time.Second, "timestamp should be recent")

			// Run custom response checks
			tt.checkResponse(t, healthResp)

			// Verify response headers (accept both with and without charset)
			contentType := resp.Header.Get("Content-Type")
			assert.Contains(t, contentType, "application/json")
		})
	}
}

func TestHealthHandler_ResponseStructure(t *testing.T) {
	app := fiber.New()
	app.Get("/health", HealthHandler("v1.0.0", "abc123"))

	req := httptest.NewRequest("GET", "/health", nil)
	resp, err := app.Test(req)
	assert.NoError(t, err)

	body, err := io.ReadAll(resp.Body)
	assert.NoError(t, err)

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	assert.NoError(t, err)

	// Verify all required fields are present
	assert.Contains(t, result, "status")
	assert.Contains(t, result, "version")
	assert.Contains(t, result, "commit")
	assert.Contains(t, result, "timestamp")

	// Verify field types
	assert.IsType(t, "", result["status"])
	assert.IsType(t, "", result["version"])
	assert.IsType(t, "", result["commit"])
	assert.IsType(t, "", result["timestamp"])
}

func TestHealthHandler_NoSensitiveInfo(t *testing.T) {
	app := fiber.New()
	app.Get("/health", HealthHandler("v1.0.0", "abc123"))

	req := httptest.NewRequest("GET", "/health", nil)
	resp, err := app.Test(req)
	assert.NoError(t, err)

	body, err := io.ReadAll(resp.Body)
	assert.NoError(t, err)

	bodyStr := string(body)

	// Verify no sensitive information is exposed
	sensitiveKeywords := []string{
		"password",
		"secret",
		"key",
		"token",
		"api_key",
		"database",
		"db_path",
		"env",
	}

	for _, keyword := range sensitiveKeywords {
		assert.NotContains(t, bodyStr, keyword, "health endpoint should not expose sensitive info: %s", keyword)
	}
}

func BenchmarkHealthHandler(b *testing.B) {
	app := fiber.New()
	app.Get("/health", HealthHandler("v1.0.0", "abc123"))

	req := httptest.NewRequest("GET", "/health", nil)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := app.Test(req)
		if err != nil {
			b.Fatal(err)
		}
	}
}

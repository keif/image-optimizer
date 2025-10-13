package routes

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gofiber/fiber/v2"
)

// loadTestFixture loads a test image fixture
func loadTestFixture(t *testing.T, filename string) []byte {
	t.Helper()
	data, err := os.ReadFile("../tests/fixtures/" + filename)
	if err != nil {
		t.Fatalf("Failed to load test fixture %s: %v", filename, err)
	}
	return data
}

// createMultipartRequest creates a multipart form request with an image file
func createMultipartRequest(t *testing.T, imageData []byte, filename string) (*http.Request, string) {
	t.Helper()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Create form field with proper content type
	h := make(map[string][]string)
	h["Content-Disposition"] = []string{`form-data; name="image"; filename="` + filename + `"`}
	h["Content-Type"] = []string{"image/jpeg"}

	part, err := writer.CreatePart(h)
	if err != nil {
		t.Fatalf("Failed to create multipart part: %v", err)
	}

	_, err = part.Write(imageData)
	if err != nil {
		t.Fatalf("Failed to write image data: %v", err)
	}

	writer.Close()

	req := httptest.NewRequest("POST", "/optimize", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	return req, writer.FormDataContentType()
}

func TestHealthCheck(t *testing.T) {
	app := fiber.New()

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	req := httptest.NewRequest("GET", "/health", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

func TestOptimizeEndpoint_BasicOptimization(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	imageData := loadTestFixture(t, "test-100x100.jpg")
	req, _ := createMultipartRequest(t, imageData, "test.jpg")

	resp, err := app.Test(req, -1) // -1 = no timeout
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(body))
	}

	// Response should be JSON with metadata
	contentType := resp.Header.Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Expected Content-Type application/json, got %s", contentType)
	}
}

func TestOptimizeEndpoint_WithQualityParameter(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	imageData := loadTestFixture(t, "test-100x100.jpg")
	req, _ := createMultipartRequest(t, imageData, "test.jpg")
	req.URL.RawQuery = "quality=90"

	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

func TestOptimizeEndpoint_WithFormatConversion(t *testing.T) {
	tests := []struct {
		name   string
		format string
	}{
		{"Convert to WebP", "webp"},
		{"Convert to PNG", "png"},
		{"Convert to JPEG", "jpeg"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			app := fiber.New()
			RegisterOptimizeRoutes(app)

			imageData := loadTestFixture(t, "test-100x100.jpg")
			req, _ := createMultipartRequest(t, imageData, "test.jpg")
			req.URL.RawQuery = "format=" + tt.format

			resp, err := app.Test(req, -1)
			if err != nil {
				t.Fatalf("Failed to send request: %v", err)
			}

			if resp.StatusCode != http.StatusOK {
				body, _ := io.ReadAll(resp.Body)
				t.Errorf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(body))
			}
		})
	}
}

func TestOptimizeEndpoint_WithResize(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	imageData := loadTestFixture(t, "test-100x100.jpg")
	req, _ := createMultipartRequest(t, imageData, "test.jpg")
	req.URL.RawQuery = "width=50&height=50"

	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

func TestOptimizeEndpoint_ReturnImage(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	imageData := loadTestFixture(t, "test-100x100.jpg")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	h := make(map[string][]string)
	h["Content-Disposition"] = []string{`form-data; name="image"; filename="test.jpg"`}
	h["Content-Type"] = []string{"image/jpeg"}
	part, _ := writer.CreatePart(h)
	part.Write(imageData)
	writer.Close()

	req := httptest.NewRequest("POST", "/optimize?returnImage=true&format=webp", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	// Should return image, not JSON
	// Fiber may set Content-Type to application/octet-stream for binary data
	contentType := resp.Header.Get("Content-Type")
	if contentType != "image/webp" && contentType != "application/octet-stream" {
		t.Errorf("Expected Content-Type image/webp or application/octet-stream, got %s", contentType)
	}

	// Should have Content-Disposition header
	contentDisposition := resp.Header.Get("Content-Disposition")
	if contentDisposition == "" {
		t.Error("Expected Content-Disposition header to be set")
	}

	// Verify we got image data
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response body: %v", err)
	}

	if len(respBody) == 0 {
		t.Error("Expected response body to contain image data")
	}
}

func TestOptimizeEndpoint_NoFile(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	req := httptest.NewRequest("POST", "/optimize", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestOptimizeEndpoint_InvalidQuality(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	imageData := loadTestFixture(t, "test-100x100.jpg")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	h := make(map[string][]string)
	h["Content-Disposition"] = []string{`form-data; name="image"; filename="test.jpg"`}
	h["Content-Type"] = []string{"image/jpeg"}
	part, _ := writer.CreatePart(h)
	part.Write(imageData)
	writer.Close()

	req := httptest.NewRequest("POST", "/optimize?quality=150", body) // Invalid quality > 100
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestOptimizeEndpoint_InvalidFormat(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	imageData := loadTestFixture(t, "test-100x100.jpg")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	h := make(map[string][]string)
	h["Content-Disposition"] = []string{`form-data; name="image"; filename="test.jpg"`}
	h["Content-Type"] = []string{"image/jpeg"}
	part, _ := writer.CreatePart(h)
	part.Write(imageData)
	writer.Close()

	req := httptest.NewRequest("POST", "/optimize?format=invalid", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestOptimizeEndpoint_URLFetching(t *testing.T) {
	// Create a test HTTP server that serves an image
	testServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		imageData := loadTestFixture(t, "test-100x100.jpg")
		w.Header().Set("Content-Type", "image/jpeg")
		w.Write(imageData)
	}))
	defer testServer.Close()

	app := fiber.New()
	RegisterOptimizeRoutes(app)

	// Create request with URL parameter
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("url", testServer.URL+"/test.jpg")
	writer.Close()

	req := httptest.NewRequest("POST", "/optimize?format=webp", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := app.Test(req, 30000) // 30 second timeout for URL fetch
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Errorf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(body))
	}
}

func TestOptimizeEndpoint_InvalidURL(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	// Create request with URL that's not in the whitelist
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("url", "https://blocked-domain.com/image.jpg")
	writer.Close()

	req := httptest.NewRequest("POST", "/optimize", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	// Should get 403 Forbidden due to domain whitelist
	if resp.StatusCode != http.StatusForbidden {
		t.Errorf("Expected status 403 (domain not whitelisted), got %d", resp.StatusCode)
	}
}

func TestOptimizeEndpoint_CombinedParameters(t *testing.T) {
	app := fiber.New()
	RegisterOptimizeRoutes(app)

	imageData := loadTestFixture(t, "test-200x150.png")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	h := make(map[string][]string)
	h["Content-Disposition"] = []string{`form-data; name="image"; filename="test.png"`}
	h["Content-Type"] = []string{"image/png"}
	part, _ := writer.CreatePart(h)
	part.Write(imageData)
	writer.Close()

	req := httptest.NewRequest("POST", "/optimize?quality=85&width=100&height=75&format=webp&returnImage=true", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		t.Errorf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(respBody))
	}

	// Verify image is returned
	// Fiber may set Content-Type to application/octet-stream for binary data
	contentType := resp.Header.Get("Content-Type")
	if contentType != "image/webp" && contentType != "application/octet-stream" {
		t.Errorf("Expected Content-Type image/webp or application/octet-stream, got %s", contentType)
	}
}

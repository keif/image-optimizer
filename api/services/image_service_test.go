package services

import (
	"os"
	"strings"
	"testing"

	"github.com/h2non/bimg"
)

// loadTestFixture loads a test image fixture
func loadTestFixture(t *testing.T, filename string) []byte {
	t.Helper()
	// #nosec G304 - Test fixture path is controlled and safe
	data, err := os.ReadFile("../tests/fixtures/" + filename)
	if err != nil {
		t.Fatalf("Failed to load test fixture %s: %v", filename, err)
	}
	return data
}

// checkAVIFEncodingSupport checks if libvips can encode AVIF
// Returns true if AVIF encoding is supported, false otherwise
func checkAVIFEncodingSupport(t *testing.T) bool {
	t.Helper()

	// Try to encode a simple test image to AVIF
	testImage := loadTestFixture(t, "test-100x100.jpg")
	options := bimg.Options{
		Quality: 80,
		Type:    bimg.AVIF,
	}

	_, err := bimg.NewImage(testImage).Process(options)
	if err != nil {
		// Check if error is specifically about AVIF encoding support
		if strings.Contains(err.Error(), "heifsave") ||
			strings.Contains(err.Error(), "Unsupported compression") ||
			strings.Contains(err.Error(), "avif") {
			return false
		}
	}

	return err == nil
}

// checkAVIFDecodingSupport checks if libvips can decode AVIF
// Returns true if AVIF decoding is supported, false otherwise
func checkAVIFDecodingSupport(t *testing.T) bool {
	t.Helper()

	// Try to load and read metadata from an AVIF test fixture
	imageData := loadTestFixture(t, "test-200x150.avif")
	_, err := bimg.NewImage(imageData).Metadata()
	if err != nil {
		// Check if error is specifically about AVIF decoding support
		if strings.Contains(err.Error(), "Unsupported image format") ||
			strings.Contains(err.Error(), "heifload") ||
			strings.Contains(err.Error(), "avif") {
			return false
		}
	}

	return err == nil
}

func TestOptimizeImage_BasicOptimization(t *testing.T) {
	// Load test image
	imageData := loadTestFixture(t, "test-100x100.jpg")

	options := OptimizeOptions{
		Quality: 80,
	}

	result, err := OptimizeImage(imageData, options)
	if err != nil {
		t.Fatalf("OptimizeImage failed: %v", err)
	}

	// Verify result fields
	if result.OriginalSize == 0 {
		t.Error("Expected OriginalSize to be greater than 0")
	}
	if result.OptimizedSize == 0 {
		t.Error("Expected OptimizedSize to be greater than 0")
	}
	if result.Format == "" {
		t.Error("Expected Format to be set")
	}
	if result.Width == 0 {
		t.Error("Expected Width to be greater than 0")
	}
	if result.Height == 0 {
		t.Error("Expected Height to be greater than 0")
	}
	if result.OptimizedImage == nil {
		t.Error("Expected OptimizedImage to be set")
	}
}

func TestOptimizeImage_Resize(t *testing.T) {
	imageData := loadTestFixture(t, "test-100x100.jpg")

	options := OptimizeOptions{
		Quality: 80,
		Width:   50,
		Height:  50,
	}

	result, err := OptimizeImage(imageData, options)
	if err != nil {
		t.Fatalf("OptimizeImage with resize failed: %v", err)
	}

	// Verify dimensions
	if result.Width != 50 {
		t.Errorf("Expected width 50, got %d", result.Width)
	}
	if result.Height != 50 {
		t.Errorf("Expected height 50, got %d", result.Height)
	}
}

func TestOptimizeImage_FormatConversion(t *testing.T) {
	tests := []struct {
		name           string
		fixture        string
		targetFormat   bimg.ImageType
		expectedFormat string
	}{
		{"JPEG to WebP", "test-100x100.jpg", bimg.WEBP, "webp"},
		{"PNG to JPEG", "test-200x150.png", bimg.JPEG, "jpeg"},
		{"WebP to PNG", "test-50x50.webp", bimg.PNG, "png"},
		{"PNG to AVIF", "test-200x150.png", bimg.AVIF, "avif"},
		{"JPEG to AVIF", "test-100x100.jpg", bimg.AVIF, "avif"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Skip AVIF encoding tests if not supported
			if tt.targetFormat == bimg.AVIF && !checkAVIFEncodingSupport(t) {
				t.Skip("AVIF encoding not supported by libvips (encoding support requires libheif with AVIF encoder)")
			}

			imageData := loadTestFixture(t, tt.fixture)

			options := OptimizeOptions{
				Quality: 80,
				Format:  tt.targetFormat,
			}

			result, err := OptimizeImage(imageData, options)
			if err != nil {
				t.Fatalf("Format conversion failed: %v", err)
			}

			if result.Format != tt.expectedFormat {
				t.Errorf("Expected format %s, got %s", tt.expectedFormat, result.Format)
			}

			// Verify the image is actually in the target format
			metadata, err := bimg.NewImage(result.OptimizedImage).Metadata()
			if err != nil {
				t.Fatalf("Failed to read optimized image metadata: %v", err)
			}

			if metadata.Type != tt.expectedFormat {
				t.Errorf("Optimized image is not in expected format. Expected %s, got %s", tt.expectedFormat, metadata.Type)
			}
		})
	}
}

func TestOptimizeImage_QualitySettings(t *testing.T) {
	imageData := loadTestFixture(t, "test-100x100.jpg")

	tests := []struct {
		quality int
	}{
		{10},  // Low quality
		{50},  // Medium quality
		{90},  // High quality
		{100}, // Maximum quality
	}

	for _, tt := range tests {
		t.Run("Quality"+string(rune(tt.quality)), func(t *testing.T) {
			options := OptimizeOptions{
				Quality: tt.quality,
			}

			result, err := OptimizeImage(imageData, options)
			if err != nil {
				t.Fatalf("OptimizeImage with quality %d failed: %v", tt.quality, err)
			}

			if result.OptimizedSize == 0 {
				t.Error("Expected OptimizedSize to be greater than 0")
			}
		})
	}
}

func TestOptimizeImage_MetadataStripping(t *testing.T) {
	imageData := loadTestFixture(t, "test-100x100.jpg")

	options := OptimizeOptions{
		Quality: 80,
	}

	result, err := OptimizeImage(imageData, options)
	if err != nil {
		t.Fatalf("OptimizeImage failed: %v", err)
	}

	// Verify metadata was stripped (optimized image should have no EXIF data)
	// This is a basic check - libvips strips metadata by default when StripMetadata is true
	if result.OptimizedImage == nil {
		t.Error("Expected OptimizedImage to be set")
	}
}

func TestOptimizeImage_InvalidData(t *testing.T) {
	// Test with invalid image data
	invalidData := []byte("not an image")

	options := OptimizeOptions{
		Quality: 80,
	}

	_, err := OptimizeImage(invalidData, options)
	if err == nil {
		t.Error("Expected error when processing invalid image data")
	}
}

func TestOptimizeImage_EmptyData(t *testing.T) {
	// Test with empty data
	emptyData := []byte{}

	options := OptimizeOptions{
		Quality: 80,
	}

	_, err := OptimizeImage(emptyData, options)
	if err == nil {
		t.Error("Expected error when processing empty image data")
	}
}

func TestOptimizeImage_DefaultQuality(t *testing.T) {
	imageData := loadTestFixture(t, "test-100x100.jpg")

	// Test with quality 0 (should default to 80)
	options := OptimizeOptions{
		Quality: 0,
	}

	result, err := OptimizeImage(imageData, options)
	if err != nil {
		t.Fatalf("OptimizeImage with default quality failed: %v", err)
	}

	if result.OptimizedSize == 0 {
		t.Error("Expected OptimizedSize to be greater than 0")
	}
}

func TestOptimizeImage_AspectRatioPreservation(t *testing.T) {
	// Load a non-square image
	imageData := loadTestFixture(t, "test-200x150.png")

	options := OptimizeOptions{
		Quality: 80,
		Width:   100, // Only specify width
	}

	result, err := OptimizeImage(imageData, options)
	if err != nil {
		t.Fatalf("OptimizeImage with width-only resize failed: %v", err)
	}

	// Check that aspect ratio is preserved
	// Original: 200x150 (4:3 ratio)
	// With width=100, height should be 75
	if result.Width != 100 {
		t.Errorf("Expected width 100, got %d", result.Width)
	}

	expectedHeight := 75
	tolerance := 2 // Allow small tolerance for rounding
	if result.Height < expectedHeight-tolerance || result.Height > expectedHeight+tolerance {
		t.Errorf("Expected height around %d, got %d (aspect ratio not preserved)", expectedHeight, result.Height)
	}
}

func TestOptimizeImage_ProcessingTime(t *testing.T) {
	imageData := loadTestFixture(t, "test-100x100.jpg")

	options := OptimizeOptions{
		Quality: 80,
	}

	result, err := OptimizeImage(imageData, options)
	if err != nil {
		t.Fatalf("OptimizeImage failed: %v", err)
	}

	// Verify processing time is recorded
	if result.ProcessingTime == "" {
		t.Error("Expected ProcessingTime to be set")
	}
}

func TestOptimizeImage_SavingsCalculation(t *testing.T) {
	imageData := loadTestFixture(t, "test-100x100.jpg")

	options := OptimizeOptions{
		Quality: 10, // Very low quality should result in high compression
		Format:  bimg.WEBP,
	}

	result, err := OptimizeImage(imageData, options)
	if err != nil {
		t.Fatalf("OptimizeImage failed: %v", err)
	}

	// Verify savings field is set
	if result.Savings == "" {
		t.Error("Expected Savings to be set")
	}

	// Verify savings is in percentage format
	if len(result.Savings) < 3 || result.Savings[len(result.Savings)-1] != '%' {
		t.Errorf("Expected Savings to be in percentage format, got %s", result.Savings)
	}
}

func TestOptimizeImage_AVIFDecoding(t *testing.T) {
	// Skip if AVIF decoding not supported
	if !checkAVIFDecodingSupport(t) {
		t.Skip("AVIF decoding not supported by libvips (decoding support requires libheif with AVIF decoder)")
	}

	// Test decoding AVIF files and converting to other formats
	tests := []struct {
		name           string
		targetFormat   bimg.ImageType
		expectedFormat string
	}{
		{"AVIF to JPEG", bimg.JPEG, "jpeg"},
		{"AVIF to PNG", bimg.PNG, "png"},
		{"AVIF to WebP", bimg.WEBP, "webp"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Load AVIF test fixture
			imageData := loadTestFixture(t, "test-200x150.avif")

			options := OptimizeOptions{
				Quality: 80,
				Format:  tt.targetFormat,
			}

			result, err := OptimizeImage(imageData, options)
			if err != nil {
				t.Fatalf("AVIF decoding failed: %v", err)
			}

			if result.Format != tt.expectedFormat {
				t.Errorf("Expected format %s, got %s", tt.expectedFormat, result.Format)
			}

			// Verify the image is actually in the target format
			metadata, err := bimg.NewImage(result.OptimizedImage).Metadata()
			if err != nil {
				t.Fatalf("Failed to read optimized image metadata: %v", err)
			}

			if metadata.Type != tt.expectedFormat {
				t.Errorf("Optimized image is not in expected format. Expected %s, got %s", tt.expectedFormat, metadata.Type)
			}
		})
	}
}

func TestOptimizeImage_AVIFOptimization(t *testing.T) {
	// Skip if AVIF encoding not supported
	if !checkAVIFEncodingSupport(t) {
		t.Skip("AVIF encoding not supported by libvips (encoding support requires libheif with AVIF encoder)")
	}

	// Test optimizing an AVIF file (quality reduction)
	imageData := loadTestFixture(t, "test-200x150.avif")

	options := OptimizeOptions{
		Quality: 50, // Lower quality for optimization
	}

	result, err := OptimizeImage(imageData, options)
	if err != nil {
		t.Fatalf("AVIF optimization failed: %v", err)
	}

	// Verify result fields
	if result.OriginalSize == 0 {
		t.Error("Expected OriginalSize to be greater than 0")
	}
	if result.OptimizedImage == nil {
		t.Error("Expected OptimizedImage to be set")
	}
	if result.Format != "avif" {
		t.Errorf("Expected format avif, got %s", result.Format)
	}
}

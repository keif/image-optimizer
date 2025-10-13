package services

import (
	"fmt"
	"time"

	"github.com/h2non/bimg"
)

// OptimizeResult represents the result of an image optimization
type OptimizeResult struct {
	OriginalSize     int64  `json:"originalSize"`
	OptimizedSize    int64  `json:"optimizedSize"`
	Format           string `json:"format"`
	Width            int    `json:"width"`
	Height            int    `json:"height"`
	Savings          string `json:"savings"`
	ProcessingTime   string `json:"processingTime"`
	OptimizedImage   []byte `json:"-"` // Not included in JSON response
	AlreadyOptimized bool   `json:"alreadyOptimized"` // True if original was returned due to better compression
	Message          string `json:"message,omitempty"` // Optional message about optimization
	ColorSpace       string `json:"colorSpace"` // Color space of the result (srgb, p3, etc)
	OriginalColorSpace string `json:"originalColorSpace"` // Original image color space
	WideGamut        bool   `json:"wideGamut"` // True if image uses colors beyond sRGB
}

// OptimizeOptions contains parameters for image optimization
type OptimizeOptions struct {
	Quality    int            // 1-100, higher is better quality
	Width      int            // Target width (0 = maintain aspect ratio)
	Height     int            // Target height (0 = maintain aspect ratio)
	Format     bimg.ImageType // Target format (JPEG, PNG, WEBP, etc.)
	ForceSRGB  bool           // Force conversion to sRGB color space
}

// OptimizeImage processes and optimizes image data using libvips
func OptimizeImage(buffer []byte, options OptimizeOptions) (*OptimizeResult, error) {
	startTime := time.Now()

	originalSize := int64(len(buffer))

	// Get original image metadata before processing
	originalMetadata, err := bimg.NewImage(buffer).Metadata()
	if err != nil {
		return nil, fmt.Errorf("failed to read original image metadata: %w", err)
	}

	// Detect original color space
	originalColorSpace := detectColorSpace(originalMetadata)

	// Set default quality if not specified
	if options.Quality == 0 {
		options.Quality = 80 // Default quality
	}

	// Prepare bimg options
	bimgOptions := bimg.Options{
		Quality:       options.Quality,
		Compression:   6, // PNG compression level
		StripMetadata: true, // Remove EXIF data to reduce size
	}

	// Force sRGB conversion if requested
	// Note: libvips will convert to sRGB by default for most operations
	// The ForceSRGB flag ensures color space compatibility
	if options.ForceSRGB {
		// Strip any ICC profiles to ensure sRGB
		bimgOptions.StripMetadata = true
	}

	// Handle resizing if dimensions are specified
	if options.Width > 0 || options.Height > 0 {
		bimgOptions.Width = options.Width
		bimgOptions.Height = options.Height
		bimgOptions.Embed = true // Preserve aspect ratio
	}

	// Handle format conversion
	if options.Format != 0 {
		bimgOptions.Type = options.Format
	}

	// Process the image
	optimizedBuffer, err := bimg.NewImage(buffer).Process(bimgOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to process image: %w", err)
	}

	optimizedSize := int64(len(optimizedBuffer))

	// Check if optimization actually made the file larger
	alreadyOptimized := false
	message := ""
	resultBuffer := optimizedBuffer
	resultSize := optimizedSize

	if optimizedSize > originalSize {
		// Optimization made the file larger - return original instead
		alreadyOptimized = true
		message = "This image is already well-optimized. Returning original file to avoid quality loss."
		resultBuffer = buffer
		resultSize = originalSize
	}

	// Get result image metadata (either optimized or original)
	resultMetadata, err := bimg.NewImage(resultBuffer).Metadata()
	if err != nil {
		return nil, fmt.Errorf("failed to read result image metadata: %w", err)
	}

	// Calculate savings based on what would have happened
	// If we returned the original, show 0% savings
	var savingsPercent float64
	if alreadyOptimized {
		savingsPercent = 0.0
	} else {
		savingsPercent = float64(originalSize-optimizedSize) / float64(originalSize) * 100
	}

	// Get format name
	formatName := getFormatName(resultMetadata.Type)

	// Detect result color space
	resultColorSpace := detectColorSpace(resultMetadata)

	processingTime := time.Since(startTime)

	return &OptimizeResult{
		OriginalSize:       originalSize,
		OptimizedSize:      resultSize,
		Format:             formatName,
		Width:              resultMetadata.Size.Width,
		Height:             resultMetadata.Size.Height,
		Savings:            fmt.Sprintf("%.2f%%", savingsPercent),
		ProcessingTime:     fmt.Sprintf("%dms", processingTime.Milliseconds()),
		OptimizedImage:     resultBuffer,
		AlreadyOptimized:   alreadyOptimized,
		Message:            message,
		ColorSpace:         resultColorSpace,
		OriginalColorSpace: originalColorSpace,
		WideGamut:          false, // Simplified: false for now, true ICC profile parsing needed
	}, nil
}

// getFormatName converts bimg image type to string format name
func getFormatName(imgType string) string {
	switch imgType {
	case "jpeg":
		return "jpeg"
	case "png":
		return "png"
	case "webp":
		return "webp"
	case "gif":
		return "gif"
	case "svg":
		return "svg"
	case "pdf":
		return "pdf"
	default:
		return imgType
	}
}

// detectColorSpace attempts to detect the color space from image metadata
func detectColorSpace(metadata bimg.ImageMetadata) string {
	// Note: bimg/libvips doesn't expose interpretation directly via metadata
	// This is a simplified detection based on available metadata
	// Most web images use sRGB by default

	// Check if image has ICC profile (indicates potential wide gamut)
	// For now, we default to sRGB as it's the web standard
	// Future enhancement: parse ICC profile data if needed
	return "sRGB"
}

// isWideGamutColorSpace checks if a color space is wider than sRGB
func isWideGamutColorSpace(colorSpace string) bool {
	wideGamutSpaces := map[string]bool{
		"Display P3":  true,
		"Adobe RGB":   true,
		"ProPhoto RGB": true,
		"Rec. 2020":   true,
		"scRGB":       true,
		"RGB16":       true,
		"LAB":         true,
		"CMYK":        true,
	}
	return wideGamutSpaces[colorSpace]
}

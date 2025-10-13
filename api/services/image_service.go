package services

import (
	"fmt"
	"time"

	"github.com/h2non/bimg"
)

// OptimizeResult represents the result of an image optimization
type OptimizeResult struct {
	OriginalSize   int64  `json:"originalSize"`
	OptimizedSize  int64  `json:"optimizedSize"`
	Format         string `json:"format"`
	Width          int    `json:"width"`
	Height         int    `json:"height"`
	Savings        string `json:"savings"`
	ProcessingTime string `json:"processingTime"`
	OptimizedImage []byte `json:"-"` // Not included in JSON response
}

// OptimizeOptions contains parameters for image optimization
type OptimizeOptions struct {
	Quality int            // 1-100, higher is better quality
	Width   int            // Target width (0 = maintain aspect ratio)
	Height  int            // Target height (0 = maintain aspect ratio)
	Format  bimg.ImageType // Target format (JPEG, PNG, WEBP, etc.)
}

// OptimizeImage processes and optimizes image data using libvips
func OptimizeImage(buffer []byte, options OptimizeOptions) (*OptimizeResult, error) {
	startTime := time.Now()

	originalSize := int64(len(buffer))

	// Set default quality if not specified
	if options.Quality == 0 {
		options.Quality = 80 // Default quality
	}

	// Prepare bimg options
	bimgOptions := bimg.Options{
		Quality:      options.Quality,
		Compression:  6, // PNG compression level
		StripMetadata: true, // Remove EXIF data to reduce size
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

	// Get optimized image metadata
	optimizedMetadata, err := bimg.NewImage(optimizedBuffer).Metadata()
	if err != nil {
		return nil, fmt.Errorf("failed to read optimized image metadata: %w", err)
	}

	// Calculate savings
	savingsPercent := float64(originalSize-optimizedSize) / float64(originalSize) * 100
	if savingsPercent < 0 {
		savingsPercent = 0 // Handle cases where optimization increased size
	}

	// Get format name
	formatName := getFormatName(optimizedMetadata.Type)

	processingTime := time.Since(startTime)

	return &OptimizeResult{
		OriginalSize:   originalSize,
		OptimizedSize:  optimizedSize,
		Format:         formatName,
		Width:          optimizedMetadata.Size.Width,
		Height:         optimizedMetadata.Size.Height,
		Savings:        fmt.Sprintf("%.2f%%", savingsPercent),
		ProcessingTime: fmt.Sprintf("%dms", processingTime.Milliseconds()),
		OptimizedImage: optimizedBuffer,
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

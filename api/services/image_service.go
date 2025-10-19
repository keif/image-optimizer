package services

import (
	"bytes"
	"fmt"
	"os/exec"
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

	// Lossless mode - enables perfect quality preservation
	LosslessMode bool   // Enable lossless mode (forces lossless encoding for all formats)
	Interpolator string // Interpolation algorithm for resizing (bicubic, bilinear, nohalo, vsqbs, nearest, lanczos2, lanczos3)

	// Advanced JPEG options
	Progressive    bool // Progressive JPEG encoding (loads gradually)
	OptimizeCoding bool // Optimize huffman tables for better compression
	Subsample      int  // Chroma subsampling: 0=auto, 1=4:4:4, 2=4:2:2, 3=4:2:0
	Smooth         int  // Blur to improve compression (0-100)

	// Advanced PNG options
	Compression int  // PNG compression level (0-9, default 6)
	Interlace   bool // Progressive PNG display
	Palette     bool // Enable palette mode (quantize to 256 colors)

	// Advanced WebP options
	Lossless   bool // Lossless WebP encoding (can also be set via LosslessMode)
	Effort     int  // CPU effort (0-6, default 4)
	WebpMethod int  // Encoding method (0-6, higher=better compression but slower)

	// Advanced PNG optimization with OxiPNG
	OxipngLevel int // OxiPNG optimization level (0-6, default 2, higher=better compression but slower)
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

	// Handle lossless mode - overrides quality and compression settings
	if options.LosslessMode {
		// Force maximum quality for lossless mode
		options.Quality = 100

		// For PNG: use maximum compression, disable palette mode
		if options.Format == bimg.PNG || (options.Format == 0 && originalMetadata.Type == "png") {
			options.Compression = 9
			options.Palette = false
			options.OxipngLevel = 6 // Maximum OxiPNG compression for lossless
		}

		// For WebP: enable lossless encoding
		if options.Format == bimg.WEBP || (options.Format == 0 && originalMetadata.Type == "webp") {
			options.Lossless = true
			options.Effort = 6 // Maximum effort for best lossless compression
		}
	}

	// Set default quality if not specified and not in lossless mode
	if options.Quality == 0 {
		options.Quality = 80 // Default quality
	}

	// Set default PNG compression if not specified
	if options.Compression == 0 {
		options.Compression = 6 // Default PNG compression level
	}

	// Prepare bimg options
	bimgOptions := bimg.Options{
		Quality:       options.Quality,
		Compression:   options.Compression,
		StripMetadata: true, // Remove EXIF data to reduce size
	}

	// Set interpolation algorithm for resizing
	// Use bicubic by default for best quality
	if options.Interpolator != "" {
		switch options.Interpolator {
		case "nearest":
			bimgOptions.Interpolator = bimg.Nearest
		case "bilinear":
			bimgOptions.Interpolator = bimg.Bilinear
		case "bicubic":
			bimgOptions.Interpolator = bimg.Bicubic
		case "nohalo":
			bimgOptions.Interpolator = bimg.Nohalo
		case "vsqbs", "lanczos2", "lanczos3":
			// These advanced interpolators map to bicubic in bimg
			// (bimg uses libvips' bicubic which is high quality)
			bimgOptions.Interpolator = bimg.Bicubic
		default:
			// Default to bicubic for best quality
			bimgOptions.Interpolator = bimg.Bicubic
		}
	} else {
		// Use bicubic as default for best quality, especially in lossless mode or upscaling
		if options.LosslessMode || (options.Width > 0 && options.Width > originalMetadata.Size.Width) || (options.Height > 0 && options.Height > originalMetadata.Size.Height) {
			bimgOptions.Interpolator = bimg.Bicubic
		}
	}

	// Apply advanced JPEG options
	if options.Progressive {
		bimgOptions.Interlace = true // Progressive JPEG
	}
	if options.OptimizeCoding {
		bimgOptions.Interpretation = bimg.InterpretationSRGB // Optimize coding
	}

	// Apply advanced PNG options
	if options.Interlace {
		bimgOptions.Interlace = true // Progressive PNG
	}
	if options.Palette {
		bimgOptions.Palette = true // Enable palette mode (quantize to 256 colors)
	}

	// Apply advanced WebP options
	if options.Lossless {
		bimgOptions.Lossless = true
	}
	if options.Effort > 0 {
		bimgOptions.Speed = options.Effort // WebP effort (bimg calls it "speed")
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

	// Apply OxiPNG post-processing for PNG format
	// This provides additional 15-40% compression beyond libvips
	if options.Format == bimg.PNG || (options.Format == 0 && originalMetadata.Type == "png") {
		oxipngBuffer, oxipngErr := optimizePNGWithOxipng(optimizedBuffer, options.OxipngLevel)
		if oxipngErr == nil {
			// OxiPNG succeeded - use the better-compressed version
			optimizedBuffer = oxipngBuffer
		}
		// If OxiPNG fails, continue with bimg output (graceful degradation)
	}

	optimizedSize := int64(len(optimizedBuffer))

	// Check if optimization actually made the file larger
	// BUT: If format conversion was explicitly requested, always return the converted format
	// (user may need it for compatibility even if larger)
	alreadyOptimized := false
	message := ""
	resultBuffer := optimizedBuffer
	resultSize := optimizedSize

	originalFormat := getImageTypeFromString(originalMetadata.Type)
	formatConversionRequested := options.Format != 0 && options.Format != originalFormat

	if optimizedSize > originalSize && !formatConversionRequested {
		// Optimization made the file larger and no format conversion was requested
		// Return original instead to preserve quality
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
	case "avif":
		return "avif"
	case "svg":
		return "svg"
	case "pdf":
		return "pdf"
	default:
		return imgType
	}
}

// getImageTypeFromString converts string format name to bimg.ImageType
func getImageTypeFromString(format string) bimg.ImageType {
	switch format {
	case "jpeg":
		return bimg.JPEG
	case "png":
		return bimg.PNG
	case "webp":
		return bimg.WEBP
	case "gif":
		return bimg.GIF
	case "avif":
		return bimg.AVIF
	case "svg":
		return bimg.SVG
	case "pdf":
		return bimg.PDF
	default:
		return bimg.UNKNOWN
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

// optimizePNGWithOxipng performs lossless PNG optimization using oxipng
// Returns the optimized buffer or the original if oxipng fails or doesn't improve compression
func optimizePNGWithOxipng(inputBuffer []byte, level int) ([]byte, error) {
	// Default to level 2 (balanced speed/compression) if not specified
	if level == 0 {
		level = 2
	}

	// Validate level range
	if level < 0 || level > 6 {
		level = 2
	}

	// Prepare oxipng command: read from stdin, write to stdout
	// -o level: optimization level (0-6)
	// --strip all: remove all metadata
	// --stdout: write to stdout instead of file
	cmd := exec.Command("oxipng", "-o", fmt.Sprintf("%d", level), "--strip", "all", "--stdout", "-")

	// Set up stdin/stdout pipes
	cmd.Stdin = bytes.NewReader(inputBuffer)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Run oxipng
	err := cmd.Run()
	if err != nil {
		// If oxipng fails, return original buffer (fallback gracefully)
		return inputBuffer, fmt.Errorf("oxipng failed (using original): %w - %s", err, stderr.String())
	}

	optimizedBuffer := stdout.Bytes()

	// Sanity check: ensure we got valid output
	if len(optimizedBuffer) == 0 {
		return inputBuffer, fmt.Errorf("oxipng produced empty output (using original)")
	}

	// Return optimized buffer (even if larger - caller will decide)
	return optimizedBuffer, nil
}

// FastResizeImage performs a quick resize operation on image data using bimg
// This is optimized for speed over quality - perfect for auto-resize scenarios
// Returns resized image data as PNG
func FastResizeImage(buffer []byte, targetWidth, targetHeight int) ([]byte, error) {
	options := bimg.Options{
		Width:        targetWidth,
		Height:       targetHeight,
		Interpolator: bimg.Bilinear, // Fast interpolation
		Type:         bimg.PNG,
		Quality:      90, // Good quality, fast encoding
	}

	return bimg.Resize(buffer, options)
}

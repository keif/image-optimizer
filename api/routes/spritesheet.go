package routes

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	_ "image/gif"  // Register GIF decoder
	_ "image/jpeg" // Register JPEG decoder
	"image/png"
	"io"
	"log"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/services"
	_ "golang.org/x/image/webp" // Register WebP decoder
)

// PackSpritesRequest represents the request body for sprite packing
type PackSpritesRequest struct {
	Images [][]byte `json:"images"`
}

// ResizeInfo contains information about a sprite that was auto-resized
type ResizeInfo struct {
	SpriteName     string `json:"spriteName"`
	OriginalWidth  int    `json:"originalWidth"`
	OriginalHeight int    `json:"originalHeight"`
	NewWidth       int    `json:"newWidth"`
	NewHeight      int    `json:"newHeight"`
}

// OutputFileInfo contains metadata about an output format file
type OutputFileInfo struct {
	Content   string `json:"content"`
	Extension string `json:"extension"`
	MimeType  string `json:"mimeType"`
}

// PackSpritesResponse represents the response for sprite packing
type PackSpritesResponse struct {
	Sheets         []string                  `json:"sheets"`      // Base64-encoded PNG images
	Metadata       []SheetMetadata           `json:"metadata"`    // Metadata for each sheet
	OutputFiles    map[string]OutputFileInfo `json:"outputFiles"` // Format name -> file info (content, extension, mime type)
	TotalSprites   int                       `json:"totalSprites"`
	ResizedSprites []ResizeInfo              `json:"resizedSprites,omitempty"` // Info about auto-resized sprites
	Warnings       []string                  `json:"warnings,omitempty"`       // Warnings about packing issues
}

// SheetMetadata contains information about a packed sheet
type SheetMetadata struct {
	Index       int     `json:"index"`
	Width       int     `json:"width"`
	Height      int     `json:"height"`
	SpriteCount int     `json:"spriteCount"`
	Efficiency  float64 `json:"efficiency"`
}

// SetupSpritesheetRoutes registers spritesheet-related routes
func SetupSpritesheetRoutes(app *fiber.App) {
	app.Post("/pack-sprites", PackSprites)
	app.Post("/optimize-spritesheet", OptimizeSpritesheet)
	app.Get("/spritesheet/formats", GetSpritesheetFormats)
}

// PackSprites handles the sprite packing endpoint
// @Summary Pack multiple sprites into optimized spritesheets
// @Description Accepts multiple image files and packs them into one or more optimized spritesheets using the MaxRects bin packing algorithm. Automatically splits into multiple sheets if needed. IMPORTANT: Each individual sprite must be ≤12288x12288 pixels (hard limit). Use autoResize=true to automatically resize oversized sprites - the response will include details of all resize operations.
// @Tags spritesheet
// @Accept multipart/form-data
// @Produce json
// @Param images formData file true "Sprite images to pack (multiple files supported). Each sprite must be ≤12288x12288 pixels unless autoResize=true."
// @Param padding query int false "Padding between sprites in pixels (0-32)" default(2)
// @Param powerOfTwo query bool false "Force power-of-2 dimensions (256, 512, 1024, etc.). Dimensions capped at maxWidth/maxHeight." default(false)
// @Param trimTransparency query bool false "Trim transparent pixels from sprites" default(false)
// @Param trimOnly query string false "Comma-separated glob patterns: only trim frames matching these patterns (e.g., '*walk*,*run*'). Takes precedence over trimExcept."
// @Param trimExcept query string false "Comma-separated glob patterns: trim all frames EXCEPT those matching these patterns (e.g., '*idle*,*attack*')"
// @Param maxWidth query int false "Maximum sheet width in pixels (256-12288)" default(4096)
// @Param maxHeight query int false "Maximum sheet height in pixels (256-12288)" default(4096)
// @Param autoResize query bool false "Automatically resize sprites exceeding 12288x12288 to fit. Resize details returned in response." default(false)
// @Param outputFormats query string false "Comma-separated list of output formats: json,css,csv,xml,sparrow,texturepacker,cocos2d,unity,godot" default("json")
// @Param imagePath query string false "Image filename to reference in output formats (e.g., Sparrow XML imagePath attribute)" default("spritesheet.png")
// @Param packingMode query string false "Packing algorithm mode: 'optimal' (best efficiency), 'smart' (60-80% efficiency, preserves frame order), 'preserve' (exact order, poorest efficiency). Recommended: use 'smart' for animations." default("smart")
// @Param preserveFrameOrder query bool false "DEPRECATED: Use packingMode='preserve' instead. Preserve sprite upload order (disable height-based sorting for better animation support)" default(false)
// @Param compressionQuality query string false "PNG compression quality: fast, balanced, best" default("balanced")
// @Success 200 {object} PackSpritesResponse "Success response includes resizedSprites array if any sprites were auto-resized, and warnings array if output size exceeds input or other issues detected"
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /pack-sprites [post]
func PackSprites(c *fiber.Ctx) error {
	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse multipart form",
		})
	}

	files := form.File["images"]
	if len(files) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No images provided. Please upload at least one sprite image.",
		})
	}

	// Parse packing options from query parameters
	compressionQuality := c.Query("compressionQuality", "balanced")

	// Validate compression quality
	if compressionQuality != "fast" && compressionQuality != "balanced" && compressionQuality != "best" {
		compressionQuality = "balanced"
	}

	// Check if deprecated preserveFrameOrder parameter was used
	deprecationWarnings := make([]string, 0)
	if c.Query("preserveFrameOrder") != "" {
		deprecationWarnings = append(deprecationWarnings, "DEPRECATION: 'preserveFrameOrder' parameter is deprecated and will be removed in v2.0.0. Use 'packingMode=preserve' instead for exact frame order preservation, or 'packingMode=smart' for balanced efficiency with frame order preservation.")
	}

	options := services.PackingOptions{
		Padding:            parseInt(c.Query("padding", "2")),
		PowerOfTwo:         parseBool(c.Query("powerOfTwo", "false")),
		TrimTransparency:   parseBool(c.Query("trimTransparency", "false")),
		TrimOnly:           parsePatterns(c.Query("trimOnly")),
		TrimExcept:         parsePatterns(c.Query("trimExcept")),
		MaxWidth:           parseInt(c.Query("maxWidth", "4096")),
		MaxHeight:          parseInt(c.Query("maxHeight", "4096")),
		OutputFormats:      parseOutputFormats(c.Query("outputFormats", "json")),
		AutoResize:         parseBool(c.Query("autoResize", "false")),
		PreserveFrameOrder: parseBool(c.Query("preserveFrameOrder", "false")),
		CompressionQuality: compressionQuality,
		ImagePath:          c.Query("imagePath", "spritesheet.png"),
		PackingMode:        c.Query("packingMode", "smart"), // "optimal", "smart", "preserve"
	}

	// Validate options
	if options.MaxWidth < 256 || options.MaxWidth > 12288 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "maxWidth must be between 256 and 12288 pixels",
		})
	}
	if options.MaxHeight < 256 || options.MaxHeight > 12288 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "maxHeight must be between 256 and 12288 pixels",
		})
	}
	if options.Padding < 0 || options.Padding > 32 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "padding must be between 0 and 32 pixels",
		})
	}
	if len(options.OutputFormats) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "At least one output format must be specified",
		})
	}

	// Load sprites from uploaded files
	sprites := make([]services.Sprite, 0, len(files))
	resizedSprites := make([]ResizeInfo, 0)

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fmt.Sprintf("Failed to open file %s: %v", fileHeader.Filename, err),
			})
		}
		defer func() { _ = file.Close() }()

		// Read file data
		data, err := io.ReadAll(file)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fmt.Sprintf("Failed to read file %s: %v", fileHeader.Filename, err),
			})
		}

		// Validate decoded image size (decompression bomb protection)
		// Check this before decoding to catch issues early
		if err := validateDecodedImageSize(data, fileHeader.Filename); err != nil {
			// SECURITY EVENT: Decompression bomb in sprite packing
			log.Printf("[SECURITY] Decompression bomb in sprite packing - IP: %s, Filename: %s, Size: %d bytes, Error: %v",
				c.IP(), fileHeader.Filename, len(data), err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		// Decode image
		img, _, err := image.Decode(bytes.NewReader(data))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("Failed to decode image %s: %v", fileHeader.Filename, err),
			})
		}

		originalWidth := img.Bounds().Dx()
		originalHeight := img.Bounds().Dy()
		width := originalWidth
		height := originalHeight

		// Validate individual sprite size against absolute maximum (12288x12288)
		const maxSpriteSize = 12288

		// Calculate effective max size accounting for padding
		// Each sprite needs padding on all sides, so reduce max by padding * 2
		effectiveMaxWidth := options.MaxWidth - (options.Padding * 2)
		effectiveMaxHeight := options.MaxHeight - (options.Padding * 2)

		// Ensure effective dimensions are at least 256 (minimum sprite size)
		if effectiveMaxWidth < 256 {
			effectiveMaxWidth = 256
		}
		if effectiveMaxHeight < 256 {
			effectiveMaxHeight = 256
		}

		if width > maxSpriteSize || height > maxSpriteSize {
			if !options.AutoResize {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": fmt.Sprintf(
						"Sprite '%s' is %dx%d pixels, which exceeds the maximum allowed size of %dx%d per sprite. "+
							"Options: (1) Enable autoResize=true to automatically resize sprites, or "+
							"(2) Resize manually using /optimize or /optimize-spritesheet endpoints.",
						fileHeader.Filename, width, height, maxSpriteSize, maxSpriteSize,
					),
				})
			}

			// Auto-resize sprite to fit within effective max size (accounting for padding)
			scale := 1.0
			if width > effectiveMaxWidth {
				scale = float64(effectiveMaxWidth) / float64(width)
			}
			if height > effectiveMaxHeight {
				heightScale := float64(effectiveMaxHeight) / float64(height)
				if heightScale < scale {
					scale = heightScale
				}
			}

			width = int(float64(originalWidth) * scale)
			height = int(float64(originalHeight) * scale)

			// Use fast resize path optimized for speed
			resizedData, err := services.FastResizeImage(data, width, height)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": fmt.Sprintf("Failed to resize sprite %s: %v", fileHeader.Filename, err),
				})
			}

			// Decode resized image
			img, _, err = image.Decode(bytes.NewReader(resizedData))
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": fmt.Sprintf("Failed to decode resized sprite %s: %v", fileHeader.Filename, err),
				})
			}

			// Track resize operation
			resizedSprites = append(resizedSprites, ResizeInfo{
				SpriteName:     fileHeader.Filename,
				OriginalWidth:  originalWidth,
				OriginalHeight: originalHeight,
				NewWidth:       width,
				NewHeight:      height,
			})
		}

		// Create sprite
		sprites = append(sprites, services.Sprite{
			Name:   fileHeader.Filename,
			Image:  img,
			Width:  width,
			Height: height,
		})
	}

	// Pack sprites
	result, err := services.PackSprites(sprites, options)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to pack sprites: %v", err),
		})
	}

	// Encode sheets as base64 PNG
	sheetData := make([]string, len(result.Sheets))
	metadata := make([]SheetMetadata, len(result.Sheets))

	for i, sheet := range result.Sheets {
		// Encode sheet to PNG
		var buf bytes.Buffer
		if err := png.Encode(&buf, sheet.Image); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fmt.Sprintf("Failed to encode sheet %d: %v", i, err),
			})
		}

		// Convert to base64
		sheetData[i] = base64.StdEncoding.EncodeToString(buf.Bytes())

		// Build metadata
		metadata[i] = SheetMetadata{
			Index:       i,
			Width:       sheet.Width,
			Height:      sheet.Height,
			SpriteCount: len(sheet.Sprites),
			Efficiency:  sheet.Efficiency,
		}
	}

	// Convert format byte arrays to OutputFileInfo with metadata
	outputFiles := make(map[string]OutputFileInfo)
	for format, data := range result.Formats {
		extension, mimeType := getFormatMetadata(format)
		outputFiles[format] = OutputFileInfo{
			Content:   string(data),
			Extension: extension,
			MimeType:  mimeType,
		}
	}

	// Combine deprecation warnings with packing warnings
	allWarnings := append(deprecationWarnings, result.Warnings...)

	// Prepare response
	response := PackSpritesResponse{
		Sheets:         sheetData,
		Metadata:       metadata,
		OutputFiles:    outputFiles,
		TotalSprites:   len(sprites),
		ResizedSprites: resizedSprites,
		Warnings:       allWarnings,
	}

	return c.JSON(response)
}

// Helper functions

func parseInt(s string) int {
	val, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return val
}

func parseBool(s string) bool {
	val, err := strconv.ParseBool(s)
	if err != nil {
		return false
	}
	return val
}

func parseOutputFormats(s string) []string {
	if s == "" {
		return []string{"json"}
	}

	parts := strings.Split(s, ",")
	formats := make([]string, 0, len(parts))
	validFormats := map[string]bool{
		"json":          true,
		"css":           true,
		"csv":           true,
		"xml":           true,
		"sparrow":       true,
		"texturepacker": true,
		"cocos2d":       true,
		"unity":         true,
		"godot":         true,
	}

	for _, part := range parts {
		format := strings.TrimSpace(strings.ToLower(part))
		if validFormats[format] {
			formats = append(formats, format)
		}
	}

	return formats
}

func parsePatterns(s string) []string {
	if s == "" {
		return []string{}
	}

	parts := strings.Split(s, ",")
	patterns := make([]string, 0, len(parts))

	for _, part := range parts {
		pattern := strings.TrimSpace(part)
		if pattern != "" {
			patterns = append(patterns, pattern)
		}
	}

	return patterns
}

// getFormatMetadata returns the file extension and MIME type for a given output format
func getFormatMetadata(format string) (string, string) {
	switch format {
	case "sparrow", "xml", "texturepacker":
		return ".xml", "application/xml"
	case "json", "unity":
		return ".json", "application/json"
	case "css":
		return ".css", "text/css"
	case "csv":
		return ".csv", "text/csv"
	case "cocos2d":
		return ".plist", "application/xml"
	case "godot":
		return ".tres", "text/plain"
	default:
		return ".txt", "text/plain"
	}
}

// GetSpritesheetFormats returns the list of supported output formats
// @Summary Get supported spritesheet output formats
// @Description Returns a list of all supported output formats for spritesheet coordinate data
// @Tags spritesheet
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /spritesheet/formats [get]
func GetSpritesheetFormats(c *fiber.Ctx) error {
	formats := []map[string]string{
		{
			"name":        "json",
			"description": "JSON format with sprite coordinates and metadata",
			"extension":   ".json",
		},
		{
			"name":        "css",
			"description": "CSS classes for background-position sprite usage",
			"extension":   ".css",
		},
		{
			"name":        "csv",
			"description": "CSV format with sprite name, x, y, width, height",
			"extension":   ".csv",
		},
		{
			"name":        "xml",
			"description": "XML format compatible with generic sprite tools",
			"extension":   ".xml",
		},
		{
			"name":        "unity",
			"description": "Unity TextureImporter metadata format",
			"extension":   ".meta",
		},
		{
			"name":        "godot",
			"description": "Godot Engine AtlasTexture resource format",
			"extension":   ".tres",
		},
	}

	return c.JSON(fiber.Map{
		"formats": formats,
	})
}

// OptimizeSpritesheet handles importing an existing spritesheet and re-optimizing it
// @Summary Optimize an existing spritesheet
// @Description Accepts a spritesheet PNG and its XML, extracts frames, optionally deduplicates, and repacks optimally. Frame order is preserved by default to maintain animation sequences.
// @Tags spritesheet
// @Accept multipart/form-data
// @Produce json
// @Param spritesheet formData file true "Spritesheet PNG image"
// @Param xml formData file true "Spritesheet XML (Sparrow format)"
// @Param deduplicate query bool false "Remove duplicate frames" default(false)
// @Param padding query int false "Padding between sprites in pixels" default(2)
// @Param powerOfTwo query bool false "Force power-of-2 dimensions. Dimensions capped at maxWidth/maxHeight." default(false)
// @Param trimTransparency query bool false "Trim transparent pixels from sprites" default(false)
// @Param trimOnly query string false "Comma-separated glob patterns: only trim frames matching these patterns (e.g., '*walk*,*run*'). Takes precedence over trimExcept."
// @Param trimExcept query string false "Comma-separated glob patterns: trim all frames EXCEPT those matching these patterns (e.g., '*idle*,*attack*')"
// @Param maxWidth query int false "Maximum sheet width in pixels (256-12288)" default(4096)
// @Param maxHeight query int false "Maximum sheet height in pixels (256-12288)" default(4096)
// @Param outputFormats query string false "Comma-separated list of output formats: json,css,csv,xml,sparrow,texturepacker,cocos2d,unity,godot" default("sparrow")
// @Param imagePath query string false "Image filename to reference in output formats (e.g., Sparrow XML imagePath attribute)" default("spritesheet.png")
// @Param packingMode query string false "Packing algorithm mode: 'optimal' (best efficiency), 'smart' (60-80% efficiency, preserves frame order), 'preserve' (exact order, poorest efficiency). Recommended: use 'smart' for animations." default("smart")
// @Param preserveFrameOrder query bool false "DEPRECATED: Use packingMode='preserve' instead. Preserve original frame order (recommended for animations)" default(true)
// @Param compressionQuality query string false "PNG compression quality: fast, balanced, best" default("balanced")
// @Success 200 {object} map[string]interface{} "Response includes warnings array if output size exceeds input or other packing issues detected"
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /optimize-spritesheet [post]
func OptimizeSpritesheet(c *fiber.Ctx) error {
	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Failed to parse multipart form",
		})
	}

	// Get spritesheet image
	spritesheetFiles := form.File["spritesheet"]
	if len(spritesheetFiles) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "No spritesheet image provided",
		})
	}

	// Get XML file
	xmlFiles := form.File["xml"]
	if len(xmlFiles) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "No XML file provided",
		})
	}

	// Read spritesheet image
	sheetFile, err := spritesheetFiles[0].Open()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Failed to open spritesheet file",
		})
	}
	defer func() { _ = sheetFile.Close() }()

	sheetData, err := io.ReadAll(sheetFile)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Failed to read spritesheet data",
		})
	}

	// Validate decoded image size (decompression bomb protection)
	if err := validateDecodedImageSize(sheetData, spritesheetFiles[0].Filename); err != nil {
		// SECURITY EVENT: Decompression bomb in spritesheet optimization
		log.Printf("[SECURITY] Decompression bomb in spritesheet optimization - IP: %s, Filename: %s, Size: %d bytes, Error: %v",
			c.IP(), spritesheetFiles[0].Filename, len(sheetData), err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	sheetImg, _, err := image.Decode(bytes.NewReader(sheetData))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Failed to decode spritesheet image",
		})
	}

	// Read XML file
	xmlFile, err := xmlFiles[0].Open()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Failed to open XML file",
		})
	}
	defer func() { _ = xmlFile.Close() }()

	xmlData, err := io.ReadAll(xmlFile)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Failed to read XML data",
		})
	}

	// Parse XML to extract frame data
	frames, err := services.ParseSparrowXML(xmlData)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to parse XML: %v", err),
		})
	}

	// Extract individual frames from the spritesheet
	sprites, err := services.ExtractFramesFromSheet(sheetImg, frames)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to extract frames: %v", err),
		})
	}

	originalCount := len(sprites)
	var nameMapping map[string]string

	// Optionally deduplicate
	deduplicate := c.Query("deduplicate", "false")
	if deduplicate == "true" {
		sprites, nameMapping = services.DeduplicateSprites(sprites)
	}

	// Parse packing options (same as PackSprites)
	// Default preserveFrameOrder to true for imported spritesheets to maintain animation sequences
	preserveFrameOrder := c.Query("preserveFrameOrder", "true")
	compressionQuality := c.Query("compressionQuality", "balanced")

	// Check if deprecated preserveFrameOrder parameter was used
	deprecationWarnings := make([]string, 0)
	if c.Query("preserveFrameOrder") != "" {
		deprecationWarnings = append(deprecationWarnings, "DEPRECATION: 'preserveFrameOrder' parameter is deprecated and will be removed in v2.0.0. Use 'packingMode=preserve' instead for exact frame order preservation, or 'packingMode=smart' for balanced efficiency with frame order preservation.")
	}

	// Validate compression quality
	if compressionQuality != "fast" && compressionQuality != "balanced" && compressionQuality != "best" {
		compressionQuality = "balanced"
	}

	options := services.PackingOptions{
		Padding:            parseInt(c.Query("padding", "2")),
		PowerOfTwo:         parseBool(c.Query("powerOfTwo", "false")),
		TrimTransparency:   parseBool(c.Query("trimTransparency", "false")),
		TrimOnly:           parsePatterns(c.Query("trimOnly")),
		TrimExcept:         parsePatterns(c.Query("trimExcept")),
		MaxWidth:           parseInt(c.Query("maxWidth", "4096")),
		MaxHeight:          parseInt(c.Query("maxHeight", "4096")),
		OutputFormats:      parseOutputFormats(c.Query("outputFormats", "sparrow")),
		NameMapping:        nameMapping, // Pass deduplication mapping to preserve all frame names in XML
		PreserveFrameOrder: parseBool(preserveFrameOrder),
		CompressionQuality: compressionQuality,
		ImagePath:          c.Query("imagePath", "spritesheet.png"),
		OriginalSize:       len(sheetData),                  // For compression warnings
		PackingMode:        c.Query("packingMode", "smart"), // "optimal", "smart", "preserve"
	}

	// Pack the sprites using existing packing logic
	result, err := services.PackSprites(sprites, options)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to pack sprites: %v", err),
		})
	}

	// Encode sheets to base64
	base64Sheets := make([]string, len(result.Sheets))
	for i, sheet := range result.Sheets {
		base64Sheets[i] = base64.StdEncoding.EncodeToString(sheet.ImageBuffer)
	}

	// Build metadata response
	metadata := make([]SheetMetadata, len(result.Sheets))
	for i, sheet := range result.Sheets {
		metadata[i] = SheetMetadata{
			Index:       i,
			Width:       sheet.Width,
			Height:      sheet.Height,
			SpriteCount: len(sheet.Sprites),
			Efficiency:  sheet.Efficiency,
		}
	}

	// Convert output formats to OutputFileInfo with metadata
	outputFiles := make(map[string]OutputFileInfo)
	for format, data := range result.Formats {
		extension, mimeType := getFormatMetadata(format)
		outputFiles[format] = OutputFileInfo{
			Content:   string(data),
			Extension: extension,
			MimeType:  mimeType,
		}
	}

	response := fiber.Map{
		"sheets":            base64Sheets,
		"metadata":          metadata,
		"outputFiles":       outputFiles,
		"totalSprites":      result.TotalSprites,
		"originalCount":     originalCount,
		"duplicatesRemoved": originalCount - len(sprites),
	}

	if deduplicate == "true" {
		response["nameMapping"] = nameMapping
	}

	// Combine deprecation warnings with packing warnings
	allWarnings := append(deprecationWarnings, result.Warnings...)
	if len(allWarnings) > 0 {
		response["warnings"] = allWarnings
	}

	return c.JSON(response)
}

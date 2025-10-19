package routes

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/png"
	"io"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/keif/image-optimizer/services"
)

// PackSpritesRequest represents the request body for sprite packing
type PackSpritesRequest struct {
	Images [][]byte `json:"images"`
}

// PackSpritesResponse represents the response for sprite packing
type PackSpritesResponse struct {
	Sheets       []string          `json:"sheets"`       // Base64-encoded PNG images
	Metadata     []SheetMetadata   `json:"metadata"`     // Metadata for each sheet
	OutputFiles  map[string]string `json:"outputFiles"`  // Format name -> file content
	TotalSprites int               `json:"totalSprites"`
}

// SheetMetadata contains information about a packed sheet
type SheetMetadata struct {
	Index      int     `json:"index"`
	Width      int     `json:"width"`
	Height     int     `json:"height"`
	SpriteCount int    `json:"spriteCount"`
	Efficiency float64 `json:"efficiency"`
}

// SetupSpritesheetRoutes registers spritesheet-related routes
func SetupSpritesheetRoutes(app *fiber.App) {
	app.Post("/pack-sprites", PackSprites)
	app.Get("/spritesheet/formats", GetSpritesheetFormats)
}

// PackSprites handles the sprite packing endpoint
// @Summary Pack multiple sprites into optimized spritesheets
// @Description Accepts multiple image files and packs them into one or more optimized spritesheets using the MaxRects bin packing algorithm
// @Tags spritesheet
// @Accept multipart/form-data
// @Produce json
// @Param images formData file true "Sprite images to pack (multiple files supported)"
// @Param padding query int false "Padding between sprites in pixels" default(2)
// @Param powerOfTwo query bool false "Force power-of-2 dimensions (256, 512, 1024, etc.)" default(false)
// @Param trimTransparency query bool false "Trim transparent pixels from sprites" default(false)
// @Param maxWidth query int false "Maximum sheet width in pixels" default(2048)
// @Param maxHeight query int false "Maximum sheet height in pixels" default(2048)
// @Param outputFormats query string false "Comma-separated list of output formats: json,css,csv,xml,sparrow,texturepacker,cocos2d,unity,godot" default("json")
// @Success 200 {object} PackSpritesResponse
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
	options := services.PackingOptions{
		Padding:          parseInt(c.Query("padding", "2")),
		PowerOfTwo:       parseBool(c.Query("powerOfTwo", "false")),
		TrimTransparency: parseBool(c.Query("trimTransparency", "false")),
		MaxWidth:         parseInt(c.Query("maxWidth", "2048")),
		MaxHeight:        parseInt(c.Query("maxHeight", "2048")),
		OutputFormats:    parseOutputFormats(c.Query("outputFormats", "json")),
	}

	// Validate options
	if options.MaxWidth < 256 || options.MaxWidth > 8192 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "maxWidth must be between 256 and 8192 pixels",
		})
	}
	if options.MaxHeight < 256 || options.MaxHeight > 8192 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "maxHeight must be between 256 and 8192 pixels",
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
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fmt.Sprintf("Failed to open file %s: %v", fileHeader.Filename, err),
			})
		}
		defer file.Close()

		// Read file data
		data, err := io.ReadAll(file)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fmt.Sprintf("Failed to read file %s: %v", fileHeader.Filename, err),
			})
		}

		// Decode image
		img, _, err := image.Decode(bytes.NewReader(data))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("Failed to decode image %s: %v", fileHeader.Filename, err),
			})
		}

		// Create sprite
		sprites = append(sprites, services.Sprite{
			Name:   fileHeader.Filename,
			Image:  img,
			Width:  img.Bounds().Dx(),
			Height: img.Bounds().Dy(),
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

	// Convert format byte arrays to strings for JSON response
	outputFiles := make(map[string]string)
	for format, data := range result.Formats {
		outputFiles[format] = string(data)
	}

	// Prepare response
	response := PackSpritesResponse{
		Sheets:       sheetData,
		Metadata:     metadata,
		OutputFiles:  outputFiles,
		TotalSprites: len(sprites),
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

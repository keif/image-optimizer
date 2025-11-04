package services

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"math"
	"sort"
	"strings"
)

// Sprite represents a single sprite to be packed
type Sprite struct {
	Name          string      // Name/identifier for the sprite
	Image         image.Image // The image data
	Buffer        []byte      // Original image buffer
	Width         int         // Current width (after trimming if applicable)
	Height        int         // Current height (after trimming if applicable)
	Trimmed       bool        // Whether transparency was trimmed
	TrimmedX      int         // Pixels trimmed from left
	TrimmedY      int         // Pixels trimmed from top
	OriginalW     int         // Original width before trimming
	OriginalH     int         // Original height before trimming
	OriginalIndex int         // Original position in source (for preserving order)
}

// PackedSprite represents a sprite with its position in the packed sheet
type PackedSprite struct {
	Sprite
	X int // X position in the sheet
	Y int // Y position in the sheet
	// Trimmed, TrimmedX, TrimmedY, OriginalW, OriginalH are inherited from Sprite
}

// PackingOptions contains parameters for sprite packing
type PackingOptions struct {
	Padding               int               // Padding between sprites (pixels)
	PowerOfTwo            bool              // Force output dimensions to power of 2
	TrimTransparency      bool              // Trim transparent borders from sprites
	MaxWidth              int               // Maximum sheet width (0 = unlimited)
	MaxHeight             int               // Maximum sheet height (0 = unlimited)
	OutputFormats         []string          // Desired output formats (json, css, csv, xml, sparrow, texturepacker, cocos2d, unity, godot)
	AllowRotation         bool              // Allow sprite rotation for better packing
	AutoResize            bool              // Automatically resize sprites that exceed MaxWidth/MaxHeight
	NameMapping           map[string]string // Maps duplicate sprite names to canonical names (for deduplication)
	PreserveFrameOrder    bool              // Preserve original frame order in output (disables height sorting) - DEPRECATED: use PackingMode="preserve"
	CompressionQuality    string            // PNG compression: "fast", "balanced", "best" (default: "balanced")
	PreserveAnimationHold bool              // Don't deduplicate consecutive identical frames (preserves animation timing)
	ImagePath             string            // Image path to reference in Sparrow XML (default: "spritesheet.png")
	OriginalSize          int               // Original input file size in bytes (for compression warnings)
	PackingMode           string            // Packing mode: "optimal" (default), "smart", "preserve"
}

// Spritesheet represents the packed result
type Spritesheet struct {
	Width       int            // Final sheet width
	Height      int            // Final sheet height
	Sprites     []PackedSprite // Packed sprites with positions
	Image       image.Image    // The composite image
	ImageBuffer []byte         // PNG-encoded image buffer
	Efficiency  float64        // Packing efficiency (0-1)
}

// PackingResult contains the spritesheet and all requested output formats
type PackingResult struct {
	Sheets       []Spritesheet     // One or more sheets (if split)
	Formats      map[string][]byte // Output format data (json, css, csv, xml)
	TotalSprites int               // Total number of sprites packed
	Warnings     []string          // Warnings about packing issues (e.g., size inflation)
}

// Rectangle represents a rectangular area for packing
type Rectangle struct {
	X      int
	Y      int
	Width  int
	Height int
}

// MaxRectsPacker implements the MaxRects bin packing algorithm
type MaxRectsPacker struct {
	Width     int
	Height    int
	FreeRects []Rectangle
	UsedRects []Rectangle
	Padding   int
}

// NewMaxRectsPacker creates a new MaxRects packer
func NewMaxRectsPacker(width, height, padding int) *MaxRectsPacker {
	return &MaxRectsPacker{
		Width:  width,
		Height: height,
		FreeRects: []Rectangle{
			{X: 0, Y: 0, Width: width, Height: height},
		},
		UsedRects: []Rectangle{},
		Padding:   padding,
	}
}

// Insert attempts to insert a rectangle and returns the position if successful
func (p *MaxRectsPacker) Insert(width, height int) (Rectangle, bool) {
	// Add padding to dimensions
	paddedWidth := width + p.Padding*2
	paddedHeight := height + p.Padding*2

	// Find best position using Best Short Side Fit (BSSF) heuristic
	bestRect := Rectangle{X: -1, Y: -1, Width: 0, Height: 0}
	bestShortSideFit := math.MaxInt32
	bestLongSideFit := math.MaxInt32

	for _, rect := range p.FreeRects {
		if rect.Width >= paddedWidth && rect.Height >= paddedHeight {
			leftoverHoriz := rect.Width - paddedWidth
			leftoverVert := rect.Height - paddedHeight
			shortSideFit := minInt(leftoverHoriz, leftoverVert)
			longSideFit := maxInt(leftoverHoriz, leftoverVert)

			if shortSideFit < bestShortSideFit || (shortSideFit == bestShortSideFit && longSideFit < bestLongSideFit) {
				bestRect = Rectangle{
					X:      rect.X + p.Padding,
					Y:      rect.Y + p.Padding,
					Width:  width,
					Height: height,
				}
				bestShortSideFit = shortSideFit
				bestLongSideFit = longSideFit
			}
		}
	}

	if bestRect.X == -1 {
		return Rectangle{}, false
	}

	// Place the rectangle
	usedRect := Rectangle{
		X:      bestRect.X - p.Padding,
		Y:      bestRect.Y - p.Padding,
		Width:  paddedWidth,
		Height: paddedHeight,
	}

	// Split free rectangles
	p.splitFreeRectangles(usedRect)
	p.pruneFreeRectangles()
	p.UsedRects = append(p.UsedRects, usedRect)

	return bestRect, true
}

// splitFreeRectangles splits free rectangles when a new rectangle is placed
func (p *MaxRectsPacker) splitFreeRectangles(usedRect Rectangle) {
	newFreeRects := []Rectangle{}

	for _, freeRect := range p.FreeRects {
		if p.rectanglesIntersect(freeRect, usedRect) {
			// Split the free rectangle
			splits := p.splitRectangle(freeRect, usedRect)
			newFreeRects = append(newFreeRects, splits...)
		} else {
			newFreeRects = append(newFreeRects, freeRect)
		}
	}

	p.FreeRects = newFreeRects
}

// splitRectangle splits a free rectangle based on the used rectangle
func (p *MaxRectsPacker) splitRectangle(freeRect, usedRect Rectangle) []Rectangle {
	splits := []Rectangle{}

	// Left split
	if usedRect.X > freeRect.X && usedRect.X < freeRect.X+freeRect.Width {
		splits = append(splits, Rectangle{
			X:      freeRect.X,
			Y:      freeRect.Y,
			Width:  usedRect.X - freeRect.X,
			Height: freeRect.Height,
		})
	}

	// Right split
	if usedRect.X+usedRect.Width < freeRect.X+freeRect.Width {
		splits = append(splits, Rectangle{
			X:      usedRect.X + usedRect.Width,
			Y:      freeRect.Y,
			Width:  freeRect.X + freeRect.Width - (usedRect.X + usedRect.Width),
			Height: freeRect.Height,
		})
	}

	// Top split
	if usedRect.Y > freeRect.Y && usedRect.Y < freeRect.Y+freeRect.Height {
		splits = append(splits, Rectangle{
			X:      freeRect.X,
			Y:      freeRect.Y,
			Width:  freeRect.Width,
			Height: usedRect.Y - freeRect.Y,
		})
	}

	// Bottom split
	if usedRect.Y+usedRect.Height < freeRect.Y+freeRect.Height {
		splits = append(splits, Rectangle{
			X:      freeRect.X,
			Y:      usedRect.Y + usedRect.Height,
			Width:  freeRect.Width,
			Height: freeRect.Y + freeRect.Height - (usedRect.Y + usedRect.Height),
		})
	}

	return splits
}

// pruneFreeRectangles removes rectangles that are completely contained in others
func (p *MaxRectsPacker) pruneFreeRectangles() {
	pruned := []Rectangle{}

	for i := 0; i < len(p.FreeRects); i++ {
		contained := false
		for j := 0; j < len(p.FreeRects); j++ {
			if i != j && p.rectangleContains(p.FreeRects[j], p.FreeRects[i]) {
				contained = true
				break
			}
		}
		if !contained {
			pruned = append(pruned, p.FreeRects[i])
		}
	}

	p.FreeRects = pruned
}

// rectanglesIntersect checks if two rectangles intersect
func (p *MaxRectsPacker) rectanglesIntersect(a, b Rectangle) bool {
	return a.X < b.X+b.Width && a.X+a.Width > b.X &&
		a.Y < b.Y+b.Height && a.Y+a.Height > b.Y
}

// rectangleContains checks if rectangle a contains rectangle b
func (p *MaxRectsPacker) rectangleContains(a, b Rectangle) bool {
	return a.X <= b.X && a.Y <= b.Y &&
		a.X+a.Width >= b.X+b.Width && a.Y+a.Height >= b.Y+b.Height
}

// Helper functions
func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// nextPowerOfTwo returns the next power of 2 >= n
func nextPowerOfTwo(n int) int {
	if n <= 0 {
		return 1
	}
	n--
	n |= n >> 1
	n |= n >> 2
	n |= n >> 4
	n |= n >> 8
	n |= n >> 16
	n++
	return n
}

// TrimTransparency trims transparent borders from an image
func TrimTransparency(img image.Image) (image.Image, int, int, int, int, error) {
	bounds := img.Bounds()
	minX, minY := bounds.Max.X, bounds.Max.Y
	maxX, maxY := 0, 0

	// Find the bounding box of non-transparent pixels
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			_, _, _, a := img.At(x, y).RGBA()
			if a > 0 { // Non-transparent pixel
				if x < minX {
					minX = x
				}
				if x > maxX {
					maxX = x
				}
				if y < minY {
					minY = y
				}
				if y > maxY {
					maxY = y
				}
			}
		}
	}

	// If no non-transparent pixels found, return error
	if maxX < minX || maxY < minY {
		return nil, 0, 0, 0, 0, fmt.Errorf("image is fully transparent after trimming")
	}

	// Calculate trimmed dimensions
	trimmedX := minX - bounds.Min.X
	trimmedY := minY - bounds.Min.Y
	trimmedWidth := maxX - minX + 1
	trimmedHeight := maxY - minY + 1

	// Create trimmed image
	trimmed := image.NewRGBA(image.Rect(0, 0, trimmedWidth, trimmedHeight))
	for y := 0; y < trimmedHeight; y++ {
		for x := 0; x < trimmedWidth; x++ {
			trimmed.Set(x, y, img.At(minX+x, minY+y))
		}
	}

	return trimmed, trimmedX, trimmedY, bounds.Dx(), bounds.Dy(), nil
}

// PackSprites packs multiple sprites into one or more spritesheets
//
// Multi-sheet splitting: If sprites don't fit in one sheet, they will be split across multiple sheets.
// However, each INDIVIDUAL sprite must fit within MaxWidth x MaxHeight (max 12288x12288).
// If a single sprite exceeds these dimensions, packing will fail - multi-sheet splitting cannot
// split individual sprites across sheets.
//
// For oversized sprites, use the optimize-spritesheet endpoint with maxWidth/maxHeight parameters
// to resize sprites before packing.
func PackSprites(sprites []Sprite, options PackingOptions) (*PackingResult, error) {
	if len(sprites) == 0 {
		return nil, fmt.Errorf("no sprites provided")
	}

	// Process sprites (trim transparency if requested)
	processedSprites := make([]Sprite, len(sprites))
	for i, sprite := range sprites {
		processedSprites[i] = sprite
		// Preserve original index for frame order preservation
		processedSprites[i].OriginalIndex = i

		if options.TrimTransparency {
			trimmed, trimX, trimY, origW, origH, err := TrimTransparency(sprite.Image)
			if err != nil {
				return nil, fmt.Errorf("frame '%s' is fully transparent after trimming. Disable trimTransparency or check source image", sprite.Name)
			}
			processedSprites[i].Image = trimmed
			processedSprites[i].Width = trimmed.Bounds().Dx()
			processedSprites[i].Height = trimmed.Bounds().Dy()
			// Store trim info
			processedSprites[i].Trimmed = true
			processedSprites[i].TrimmedX = trimX
			processedSprites[i].TrimmedY = trimY
			processedSprites[i].OriginalW = origW
			processedSprites[i].OriginalH = origH
		}
	}

	// Sort sprites for optimal packing based on PackingMode
	// - "optimal": Full height-based sorting (best packing, ignores order)
	// - "preserve": No sorting (preserves exact order, poor packing)
	// - "smart": Local height grouping (good packing, mostly preserves order)
	packingMode := "smart" // Default (best balance of compression + frame order)
	if options.PreserveFrameOrder {
		packingMode = "preserve"
	}
	if options.PackingMode != "" {
		packingMode = options.PackingMode
	}

	switch packingMode {
	case "optimal":
		// Sort by height descending for best packing efficiency
		sort.Slice(processedSprites, func(i, j int) bool {
			return processedSprites[i].Height > processedSprites[j].Height
		})
	case "smart":
		// Smart sorting: Group nearby sprites with similar heights
		// This preserves general order while improving packing efficiency
		smartSort(processedSprites)
	case "preserve":
		// No sorting - preserve exact original order
		// (already in OriginalIndex order)
	}

	// Determine initial sheet dimensions
	totalArea := 0
	for _, sprite := range processedSprites {
		totalArea += (sprite.Width + options.Padding*2) * (sprite.Height + options.Padding*2)
	}

	// Start with square-ish dimensions
	initialSize := int(math.Sqrt(float64(totalArea)) * 1.2) // 20% overhead

	if options.PowerOfTwo {
		initialSize = nextPowerOfTwo(initialSize)
	}

	// Apply max dimensions if specified
	maxW := initialSize
	maxH := initialSize
	if options.MaxWidth > 0 {
		maxW = options.MaxWidth
	}
	if options.MaxHeight > 0 {
		maxH = options.MaxHeight
	}

	// Pack sprites
	sheets := []Spritesheet{}
	remainingSprites := processedSprites

	for len(remainingSprites) > 0 {
		sheet, unpacked := packSingleSheet(remainingSprites, maxW, maxH, options)
		if sheet == nil {
			// Find the largest sprite to give helpful error
			maxSpriteW, maxSpriteH := 0, 0
			largestSpriteName := ""
			for _, sprite := range remainingSprites {
				if sprite.Width > maxSpriteW || sprite.Height > maxSpriteH {
					maxSpriteW = sprite.Width
					maxSpriteH = sprite.Height
					largestSpriteName = sprite.Name
				}
			}

			// Cap suggestions at API maximum (12288x12288)
			const maxAllowed = 12288
			suggestedW := maxW
			suggestedH := maxH

			if maxSpriteW > maxAllowed || maxSpriteH > maxAllowed {
				// Sprite exceeds absolute maximum - can't pack even with max sheet size
				return nil, fmt.Errorf(
					"failed to pack sprites - sprite '%s' is %dx%d pixels, which exceeds the maximum sheet size of %dx%d. "+
						"Individual sprites must fit within sheet dimensions. Current sheet size: %dx%d. "+
						"Either increase sheet size to maximum (%dx%d) or enable autoResize to automatically resize oversized sprites",
					largestSpriteName, maxSpriteW, maxSpriteH, maxAllowed, maxAllowed, maxW, maxH, maxAllowed, maxAllowed,
				)
			}

			// Calculate suggested dimensions (with 20% overhead for packing efficiency)
			desiredW := int(float64(maxSpriteW) * 1.2)
			desiredH := int(float64(maxSpriteH) * 1.2)

			if desiredW > suggestedW {
				suggestedW = desiredW
			}
			if desiredH > suggestedH {
				suggestedH = desiredH
			}

			// Cap at maximum allowed
			if suggestedW > maxAllowed {
				suggestedW = maxAllowed
			}
			if suggestedH > maxAllowed {
				suggestedH = maxAllowed
			}

			// Round up to next power of 2 for cleaner suggestion
			if options.PowerOfTwo {
				suggestedW = nextPowerOfTwo(suggestedW)
				suggestedH = nextPowerOfTwo(suggestedH)
				// Ensure we don't exceed max after rounding
				if suggestedW > maxAllowed {
					suggestedW = maxAllowed
				}
				if suggestedH > maxAllowed {
					suggestedH = maxAllowed
				}
			} else {
				// Round to nearest 512
				suggestedW = ((suggestedW + 511) / 512) * 512
				suggestedH = ((suggestedH + 511) / 512) * 512
				// Ensure we don't exceed max after rounding
				if suggestedW > maxAllowed {
					suggestedW = maxAllowed
				}
				if suggestedH > maxAllowed {
					suggestedH = maxAllowed
				}
			}

			return nil, fmt.Errorf(
				"failed to pack sprites - largest sprite '%s' is %dx%d pixels, but max sheet dimensions are %dx%d. Try increasing maxWidth and maxHeight to %dx%d",
				largestSpriteName, maxSpriteW, maxSpriteH, maxW, maxH, suggestedW, suggestedH,
			)
		}

		sheets = append(sheets, *sheet)
		remainingSprites = unpacked

		// If there are remaining sprites, we're doing atlas splitting
		if len(remainingSprites) > 0 && len(sheets) >= 10 {
			return nil, fmt.Errorf("too many atlas splits - consider increasing max dimensions")
		}
	}

	// Generate output formats
	formats := make(map[string][]byte)
	if len(options.OutputFormats) > 0 {
		// Use provided imagePath or default to "spritesheet.png"
		imagePath := options.ImagePath
		if imagePath == "" {
			imagePath = "spritesheet.png"
		}

		for _, format := range options.OutputFormats {
			data, err := generateOutputFormat(sheets, format, options.NameMapping, imagePath)
			if err != nil {
				return nil, fmt.Errorf("failed to generate %s format: %w", format, err)
			}
			formats[format] = data
		}
	}

	// Check for size inflation warnings
	warnings := []string{}
	if options.OriginalSize > 0 {
		// Calculate total output size
		totalOutputSize := 0
		for _, sheet := range sheets {
			totalOutputSize += len(sheet.ImageBuffer)
		}

		// Warn if output is larger than input
		if totalOutputSize > options.OriginalSize {
			percentIncrease := float64(totalOutputSize-options.OriginalSize) / float64(options.OriginalSize) * 100
			warnings = append(warnings, fmt.Sprintf(
				"Output size (%s) is %.1f%% larger than input (%s). Consider adjusting compression settings or dimensions.",
				formatBytes(totalOutputSize),
				percentIncrease,
				formatBytes(options.OriginalSize),
			))
		}
	}

	return &PackingResult{
		Sheets:       sheets,
		Formats:      formats,
		TotalSprites: len(sprites),
		Warnings:     warnings,
	}, nil
}

// packSingleSheet packs sprites into a single sheet
func packSingleSheet(sprites []Sprite, maxW, maxH int, options PackingOptions) (*Spritesheet, []Sprite) {
	packer := NewMaxRectsPacker(maxW, maxH, options.Padding)
	packed := []PackedSprite{}
	unpacked := []Sprite{}

	for _, sprite := range sprites {
		pos, ok := packer.Insert(sprite.Width, sprite.Height)
		if ok {
			packed = append(packed, PackedSprite{
				Sprite: sprite,
				X:      pos.X,
				Y:      pos.Y,
			})
		} else {
			unpacked = append(unpacked, sprite)
		}
	}

	if len(packed) == 0 {
		return nil, sprites
	}

	// Calculate actual dimensions used
	actualW, actualH := 0, 0
	for _, ps := range packed {
		if ps.X+ps.Width > actualW {
			actualW = ps.X + ps.Width
		}
		if ps.Y+ps.Height > actualH {
			actualH = ps.Y + ps.Height
		}
	}

	// Apply power-of-2 if requested
	finalW, finalH := actualW, actualH
	if options.PowerOfTwo {
		finalW = nextPowerOfTwo(actualW)
		finalH = nextPowerOfTwo(actualH)

		// Cap at max dimensions to prevent excessive size inflation
		if options.MaxWidth > 0 && finalW > options.MaxWidth {
			finalW = options.MaxWidth
		}
		if options.MaxHeight > 0 && finalH > options.MaxHeight {
			finalH = options.MaxHeight
		}
	}

	// Create composite image
	composite := image.NewRGBA(image.Rect(0, 0, finalW, finalH))

	// Fill with transparent background
	draw.Draw(composite, composite.Bounds(), &image.Uniform{color.RGBA{0, 0, 0, 0}}, image.Point{}, draw.Src)

	// Draw sprites
	for _, ps := range packed {
		draw.Draw(composite, image.Rect(ps.X, ps.Y, ps.X+ps.Width, ps.Y+ps.Height),
			ps.Image, ps.Image.Bounds().Min, draw.Over)
	}

	// Encode to PNG with compression level based on quality setting
	var buf bytes.Buffer
	var compressionLevel png.CompressionLevel
	var oxipngLevel int

	switch options.CompressionQuality {
	case "fast":
		compressionLevel = png.BestSpeed // Level 1 - fastest
		oxipngLevel = 1
	case "best":
		compressionLevel = png.BestCompression // Level 9 - best compression
		oxipngLevel = 3
	default: // "balanced" or empty
		compressionLevel = png.DefaultCompression // Level 6 - good balance
		oxipngLevel = 2
	}

	encoder := &png.Encoder{
		CompressionLevel: compressionLevel,
	}
	if err := encoder.Encode(&buf, composite); err != nil {
		return nil, sprites
	}

	// Post-process with OxiPNG for better compression
	// This is worth it for spritesheets since they're downloaded once and cached
	optimizedBuffer, err := optimizePNGWithOxipng(buf.Bytes(), oxipngLevel)
	if err == nil && len(optimizedBuffer) < len(buf.Bytes()) {
		// OxiPNG succeeded and made it smaller - use it
		buf = *bytes.NewBuffer(optimizedBuffer)
	}
	// If OxiPNG fails or doesn't improve, use the original

	// Calculate efficiency
	usedArea := 0
	for _, ps := range packed {
		usedArea += ps.Width * ps.Height
	}
	totalArea := finalW * finalH
	efficiency := 0.0
	if totalArea > 0 {
		efficiency = float64(usedArea) / float64(totalArea)
	}

	sheet := &Spritesheet{
		Width:       finalW,
		Height:      finalH,
		Sprites:     packed,
		Image:       composite,
		ImageBuffer: buf.Bytes(),
		Efficiency:  efficiency,
	}

	return sheet, unpacked
}

// generateOutputFormat generates coordinate data in the requested format
func generateOutputFormat(sheets []Spritesheet, format string, nameMapping map[string]string, imagePath string) ([]byte, error) {
	switch strings.ToLower(format) {
	case "json":
		return generateJSON(sheets, nameMapping)
	case "css":
		return generateCSS(sheets, nameMapping)
	case "csv":
		return generateCSV(sheets, nameMapping)
	case "xml":
		return generateXML(sheets, nameMapping)
	case "sparrow":
		return generateSparrow(sheets, nameMapping, imagePath)
	case "texturepacker":
		return generateTexturePacker(sheets, nameMapping)
	case "cocos2d":
		return generateCocos2d(sheets, nameMapping)
	case "unity":
		return generateUnity(sheets, nameMapping)
	case "godot":
		return generateGodot(sheets, nameMapping)
	default:
		return nil, fmt.Errorf("unsupported format: %s", format)
	}
}

// JSON output format
func generateJSON(sheets []Spritesheet, _ map[string]string) ([]byte, error) {
	type JSONSprite struct {
		Name   string `json:"name"`
		X      int    `json:"x"`
		Y      int    `json:"y"`
		Width  int    `json:"width"`
		Height int    `json:"height"`
		Sheet  int    `json:"sheet"`
	}

	type JSONOutput struct {
		Sheets  []map[string]interface{} `json:"sheets"`
		Sprites []JSONSprite             `json:"sprites"`
	}

	output := JSONOutput{
		Sheets:  []map[string]interface{}{},
		Sprites: []JSONSprite{},
	}

	for i, sheet := range sheets {
		output.Sheets = append(output.Sheets, map[string]interface{}{
			"index":      i,
			"width":      sheet.Width,
			"height":     sheet.Height,
			"efficiency": fmt.Sprintf("%.2f%%", sheet.Efficiency*100),
		})

		for _, sprite := range sheet.Sprites {
			output.Sprites = append(output.Sprites, JSONSprite{
				Name:   sprite.Name,
				X:      sprite.X,
				Y:      sprite.Y,
				Width:  sprite.Width,
				Height: sprite.Height,
				Sheet:  i,
			})
		}
	}

	return json.MarshalIndent(output, "", "  ")
}

// CSS output format
func generateCSS(sheets []Spritesheet, _ map[string]string) ([]byte, error) {
	var buf bytes.Buffer

	for sheetIdx, sheet := range sheets {
		sheetName := fmt.Sprintf("spritesheet-%d.png", sheetIdx)

		buf.WriteString(fmt.Sprintf("/* Spritesheet %d - %dx%d - %.2f%% efficient */\n\n",
			sheetIdx, sheet.Width, sheet.Height, sheet.Efficiency*100))

		for _, sprite := range sheet.Sprites {
			className := strings.ReplaceAll(sprite.Name, ".", "-")
			className = strings.ReplaceAll(className, " ", "-")

			buf.WriteString(fmt.Sprintf(".sprite-%s {\n", className))
			buf.WriteString(fmt.Sprintf("  background-image: url('%s');\n", sheetName))
			buf.WriteString(fmt.Sprintf("  background-position: -%dpx -%dpx;\n", sprite.X, sprite.Y))
			buf.WriteString(fmt.Sprintf("  width: %dpx;\n", sprite.Width))
			buf.WriteString(fmt.Sprintf("  height: %dpx;\n", sprite.Height))
			buf.WriteString("}\n\n")
		}
	}

	return buf.Bytes(), nil
}

// CSV output format
func generateCSV(sheets []Spritesheet, _ map[string]string) ([]byte, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Header
	_ = writer.Write([]string{"name", "sheet", "x", "y", "width", "height"})

	for sheetIdx, sheet := range sheets {
		for _, sprite := range sheet.Sprites {
			_ = writer.Write([]string{
				sprite.Name,
				fmt.Sprintf("%d", sheetIdx),
				fmt.Sprintf("%d", sprite.X),
				fmt.Sprintf("%d", sprite.Y),
				fmt.Sprintf("%d", sprite.Width),
				fmt.Sprintf("%d", sprite.Height),
			})
		}
	}

	writer.Flush()
	return buf.Bytes(), nil
}

// XML output format
func generateXML(sheets []Spritesheet, _ map[string]string) ([]byte, error) {
	type XMLSprite struct {
		Name   string `xml:"name,attr"`
		X      int    `xml:"x,attr"`
		Y      int    `xml:"y,attr"`
		Width  int    `xml:"width,attr"`
		Height int    `xml:"height,attr"`
	}

	type XMLSheet struct {
		Index      int         `xml:"index,attr"`
		Width      int         `xml:"width,attr"`
		Height     int         `xml:"height,attr"`
		Efficiency float64     `xml:"efficiency,attr"`
		Sprites    []XMLSprite `xml:"sprite"`
	}

	type XMLOutput struct {
		XMLName xml.Name   `xml:"spritesheets"`
		Sheets  []XMLSheet `xml:"sheet"`
	}

	output := XMLOutput{Sheets: []XMLSheet{}}

	for i, sheet := range sheets {
		xmlSheet := XMLSheet{
			Index:      i,
			Width:      sheet.Width,
			Height:     sheet.Height,
			Efficiency: sheet.Efficiency,
			Sprites:    []XMLSprite{},
		}

		for _, sprite := range sheet.Sprites {
			xmlSheet.Sprites = append(xmlSheet.Sprites, XMLSprite{
				Name:   sprite.Name,
				X:      sprite.X,
				Y:      sprite.Y,
				Width:  sprite.Width,
				Height: sprite.Height,
			})
		}

		output.Sheets = append(output.Sheets, xmlSheet)
	}

	return xml.MarshalIndent(output, "", "  ")
}

// Unity output format (TexturePackerJSONArray format)
func generateUnity(sheets []Spritesheet, _ map[string]string) ([]byte, error) {
	type UnityFrame struct {
		Filename string `json:"filename"`
		Frame    struct {
			X int `json:"x"`
			Y int `json:"y"`
			W int `json:"w"`
			H int `json:"h"`
		} `json:"frame"`
		SourceSize struct {
			W int `json:"w"`
			H int `json:"h"`
		} `json:"sourceSize"`
	}

	type UnityOutput struct {
		Frames []UnityFrame `json:"frames"`
		Meta   struct {
			Image string `json:"image"`
			Size  struct {
				W int `json:"w"`
				H int `json:"h"`
			} `json:"size"`
			Scale string `json:"scale"`
		} `json:"meta"`
	}

	// Unity typically uses single sheet, use first sheet
	if len(sheets) == 0 {
		return nil, fmt.Errorf("no sheets to export")
	}

	sheet := sheets[0]
	output := UnityOutput{Frames: []UnityFrame{}}
	output.Meta.Image = "spritesheet-0.png"
	output.Meta.Size.W = sheet.Width
	output.Meta.Size.H = sheet.Height
	output.Meta.Scale = "1"

	for _, sprite := range sheet.Sprites {
		frame := UnityFrame{
			Filename: sprite.Name,
		}
		frame.Frame.X = sprite.X
		frame.Frame.Y = sprite.Y
		frame.Frame.W = sprite.Width
		frame.Frame.H = sprite.Height
		frame.SourceSize.W = sprite.Width
		frame.SourceSize.H = sprite.Height

		output.Frames = append(output.Frames, frame)
	}

	return json.MarshalIndent(output, "", "  ")
}

// Godot output format (.tres resource file)
func generateGodot(sheets []Spritesheet, _ map[string]string) ([]byte, error) {
	var buf bytes.Buffer

	for sheetIdx, sheet := range sheets {
		buf.WriteString("[gd_resource type=\"AtlasTexture\" format=2]\n\n")
		buf.WriteString(fmt.Sprintf("[ext_resource path=\"res://spritesheet-%d.png\" type=\"Texture\" id=1]\n\n", sheetIdx))

		for i, sprite := range sheet.Sprites {
			buf.WriteString(fmt.Sprintf("[sub_resource type=\"AtlasTexture\" id=%d]\n", i+1))
			buf.WriteString("atlas = ExtResource( 1 )\n")
			buf.WriteString(fmt.Sprintf("region = Rect2( %d, %d, %d, %d )\n\n",
				sprite.X, sprite.Y, sprite.Width, sprite.Height))
		}
	}

	return buf.Bytes(), nil
}

// Sparrow/Starling XML format (used by HaxeFlixel, Friday Night Funkin', etc.)
func generateSparrow(sheets []Spritesheet, nameMapping map[string]string, imagePath string) ([]byte, error) {
	type SparrowSprite struct {
		Name        string `xml:"name,attr"`
		X           int    `xml:"x,attr"`
		Y           int    `xml:"y,attr"`
		Width       int    `xml:"width,attr"`
		Height      int    `xml:"height,attr"`
		FrameX      int    `xml:"frameX,attr,omitempty"`
		FrameY      int    `xml:"frameY,attr,omitempty"`
		FrameWidth  int    `xml:"frameWidth,attr,omitempty"`
		FrameHeight int    `xml:"frameHeight,attr,omitempty"`
	}

	type SparrowAtlas struct {
		XMLName   xml.Name        `xml:"TextureAtlas"`
		ImagePath string          `xml:"imagePath,attr"`
		Sprites   []SparrowSprite `xml:"SubTexture"`
	}

	// Sparrow typically uses single sheet
	if len(sheets) == 0 {
		return nil, fmt.Errorf("no sheets to export")
	}

	sheet := sheets[0]
	atlas := SparrowAtlas{
		ImagePath: imagePath,
		Sprites:   []SparrowSprite{},
	}

	// Build a map from sprite name to sprite data for quick lookup
	spriteMap := make(map[string]PackedSprite)
	for _, sprite := range sheet.Sprites {
		spriteMap[sprite.Name] = sprite
	}

	// Create reverse mapping: canonical name -> list of all original names (including duplicates)
	reverseMapping := make(map[string][]string)
	for originalName, canonicalName := range nameMapping {
		reverseMapping[canonicalName] = append(reverseMapping[canonicalName], originalName)
	}

	// Sort the duplicate names within each group to ensure consistent ordering
	for _, names := range reverseMapping {
		sort.Strings(names)
	}

	// Build entries sorted by OriginalIndex
	type spriteEntry struct {
		sprite        SparrowSprite
		originalIndex int
	}
	entries := []spriteEntry{}

	for _, packedSprite := range sheet.Sprites {
		// Get all names that should reference this sprite (canonical + duplicates)
		names := reverseMapping[packedSprite.Name]
		if len(names) == 0 {
			// No mapping, just use the sprite's name with its original index
			names = []string{packedSprite.Name}
		}

		// For each mapped name, create an entry using the packed sprite's OriginalIndex as base
		// This ensures proper ordering
		for _, name := range names {
			sparrowSprite := SparrowSprite{
				Name:   name,
				X:      packedSprite.X,
				Y:      packedSprite.Y,
				Width:  packedSprite.Width,
				Height: packedSprite.Height,
			}

			// Add frame offset data if sprite was trimmed
			if packedSprite.Trimmed {
				sparrowSprite.FrameX = -packedSprite.TrimmedX      // Negative offset from left
				sparrowSprite.FrameY = -packedSprite.TrimmedY      // Negative offset from top
				sparrowSprite.FrameWidth = packedSprite.OriginalW  // Original width
				sparrowSprite.FrameHeight = packedSprite.OriginalH // Original height
			}

			// Use the packedSprite's OriginalIndex for all its duplicates
			entries = append(entries, spriteEntry{
				sprite:        sparrowSprite,
				originalIndex: packedSprite.OriginalIndex,
			})
		}
	}

	// Sort entries by original index to preserve frame order
	sort.Slice(entries, func(i, j int) bool {
		// First sort by original index
		if entries[i].originalIndex != entries[j].originalIndex {
			return entries[i].originalIndex < entries[j].originalIndex
		}
		// If same original index (duplicates), sort by name for consistency
		return entries[i].sprite.Name < entries[j].sprite.Name
	})

	// Add sorted sprites to atlas
	for _, entry := range entries {
		atlas.Sprites = append(atlas.Sprites, entry.sprite)
	}

	return xml.MarshalIndent(atlas, "", "  ")
}

// TexturePacker Generic XML format
func generateTexturePacker(sheets []Spritesheet, _ map[string]string) ([]byte, error) {
	type TPSprite struct {
		Name      string `xml:"n,attr"`
		X         int    `xml:"x,attr"`
		Y         int    `xml:"y,attr"`
		Width     int    `xml:"w,attr"`
		Height    int    `xml:"h,attr"`
		OffsetX   int    `xml:"oX,attr,omitempty"`
		OffsetY   int    `xml:"oY,attr,omitempty"`
		OriginalW int    `xml:"oW,attr,omitempty"`
		OriginalH int    `xml:"oH,attr,omitempty"`
	}

	type TPAtlas struct {
		XMLName   xml.Name   `xml:"TextureAtlas"`
		ImagePath string     `xml:"imagePath,attr"`
		Width     int        `xml:"width,attr"`
		Height    int        `xml:"height,attr"`
		Sprites   []TPSprite `xml:"sprite"`
	}

	// TexturePacker typically uses single sheet
	if len(sheets) == 0 {
		return nil, fmt.Errorf("no sheets to export")
	}

	sheet := sheets[0]
	atlas := TPAtlas{
		ImagePath: "spritesheet-0.png",
		Width:     sheet.Width,
		Height:    sheet.Height,
		Sprites:   []TPSprite{},
	}

	for _, sprite := range sheet.Sprites {
		tpSprite := TPSprite{
			Name:   sprite.Name,
			X:      sprite.X,
			Y:      sprite.Y,
			Width:  sprite.Width,
			Height: sprite.Height,
		}

		// Add offset data if sprite was trimmed
		if sprite.Trimmed {
			tpSprite.OffsetX = sprite.TrimmedX
			tpSprite.OffsetY = sprite.TrimmedY
			tpSprite.OriginalW = sprite.OriginalW
			tpSprite.OriginalH = sprite.OriginalH
		}

		atlas.Sprites = append(atlas.Sprites, tpSprite)
	}

	return xml.MarshalIndent(atlas, "", "  ")
}

// Cocos2d plist format (Apple Property List XML)
func generateCocos2d(sheets []Spritesheet, _ map[string]string) ([]byte, error) {
	var buf bytes.Buffer

	buf.WriteString("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
	buf.WriteString("<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n")
	buf.WriteString("<plist version=\"1.0\">\n<dict>\n")
	buf.WriteString("\t<key>frames</key>\n\t<dict>\n")

	// Cocos2d typically uses single sheet
	if len(sheets) == 0 {
		return nil, fmt.Errorf("no sheets to export")
	}

	sheet := sheets[0]

	for _, sprite := range sheet.Sprites {
		buf.WriteString(fmt.Sprintf("\t\t<key>%s</key>\n", sprite.Name))
		buf.WriteString("\t\t<dict>\n")

		// Frame: {{x,y},{w,h}}
		buf.WriteString("\t\t\t<key>frame</key>\n")
		buf.WriteString(fmt.Sprintf("\t\t\t<string>{{%d,%d},{%d,%d}}</string>\n",
			sprite.X, sprite.Y, sprite.Width, sprite.Height))

		// Offset: {offsetX, offsetY} - center offset if trimmed
		if sprite.Trimmed {
			offsetX := (sprite.OriginalW - sprite.Width) / 2
			offsetY := (sprite.OriginalH - sprite.Height) / 2
			buf.WriteString("\t\t\t<key>offset</key>\n")
			buf.WriteString(fmt.Sprintf("\t\t\t<string>{%d,%d}</string>\n", offsetX, offsetY))
		} else {
			buf.WriteString("\t\t\t<key>offset</key>\n")
			buf.WriteString("\t\t\t<string>{0,0}</string>\n")
		}

		// Source size: {originalW, originalH}
		origW := sprite.Width
		origH := sprite.Height
		if sprite.Trimmed {
			origW = sprite.OriginalW
			origH = sprite.OriginalH
		}
		buf.WriteString("\t\t\t<key>sourceSize</key>\n")
		buf.WriteString(fmt.Sprintf("\t\t\t<string>{%d,%d}</string>\n", origW, origH))

		buf.WriteString("\t\t</dict>\n")
	}

	buf.WriteString("\t</dict>\n")
	buf.WriteString("\t<key>metadata</key>\n")
	buf.WriteString("\t<dict>\n")
	buf.WriteString("\t\t<key>format</key>\n")
	buf.WriteString("\t\t<integer>2</integer>\n")
	buf.WriteString("\t\t<key>textureFileName</key>\n")
	buf.WriteString("\t\t<string>spritesheet-0.png</string>\n")
	buf.WriteString("\t\t<key>size</key>\n")
	buf.WriteString(fmt.Sprintf("\t\t<string>{%d,%d}</string>\n", sheet.Width, sheet.Height))
	buf.WriteString("\t</dict>\n")
	buf.WriteString("</dict>\n</plist>\n")

	return buf.Bytes(), nil
}

// ============================================================================
// Spritesheet Import and Optimization
// ============================================================================

// FrameData represents a single frame extracted from XML
type FrameData struct {
	Name        string
	X           int
	Y           int
	Width       int
	Height      int
	FrameX      int // Offset from original position (for trimmed sprites)
	FrameY      int // Offset from original position
	FrameWidth  int // Original width before trimming
	FrameHeight int // Original height before trimming
}

// ParseSparrowXML parses a Sparrow/Starling format XML and returns frame data
func ParseSparrowXML(xmlData []byte) ([]FrameData, error) {
	type SubTexture struct {
		Name        string `xml:"name,attr"`
		X           int    `xml:"x,attr"`
		Y           int    `xml:"y,attr"`
		Width       int    `xml:"width,attr"`
		Height      int    `xml:"height,attr"`
		FrameX      int    `xml:"frameX,attr"`
		FrameY      int    `xml:"frameY,attr"`
		FrameWidth  int    `xml:"frameWidth,attr"`
		FrameHeight int    `xml:"frameHeight,attr"`
	}

	type TextureAtlas struct {
		XMLName     xml.Name     `xml:"TextureAtlas"`
		SubTextures []SubTexture `xml:"SubTexture"`
	}

	var atlas TextureAtlas
	if err := xml.Unmarshal(xmlData, &atlas); err != nil {
		return nil, fmt.Errorf("failed to parse Sparrow XML: %w", err)
	}

	frames := make([]FrameData, len(atlas.SubTextures))
	for i, st := range atlas.SubTextures {
		//nolint:staticcheck // Cannot convert SubTexture to FrameData due to XML tags
		frames[i] = FrameData{
			Name:        st.Name,
			X:           st.X,
			Y:           st.Y,
			Width:       st.Width,
			Height:      st.Height,
			FrameX:      st.FrameX,
			FrameY:      st.FrameY,
			FrameWidth:  st.FrameWidth,
			FrameHeight: st.FrameHeight,
		}
	}

	return frames, nil
}

// ExtractFramesFromSheet extracts individual sprite frames from a spritesheet using frame data
func ExtractFramesFromSheet(sheetImage image.Image, frames []FrameData) ([]Sprite, error) {
	sprites := make([]Sprite, len(frames))

	for i, frame := range frames {
		// Extract the frame region from the sheet
		rect := image.Rect(frame.X, frame.Y, frame.X+frame.Width, frame.Y+frame.Height)
		frameImg := image.NewRGBA(rect)
		draw.Draw(frameImg, frameImg.Bounds(), sheetImage, rect.Min, draw.Src)

		// Encode to PNG buffer using fast compression
		// Individual frames are typically small, so fast encoding is preferred
		var buf bytes.Buffer
		encoder := &png.Encoder{
			CompressionLevel: png.BestSpeed, // Fast encoding for frame extraction
		}
		if err := encoder.Encode(&buf, frameImg); err != nil {
			return nil, fmt.Errorf("failed to encode frame %s: %w", frame.Name, err)
		}

		sprites[i] = Sprite{
			Name:          frame.Name,
			Image:         frameImg,
			Buffer:        buf.Bytes(),
			Width:         frame.Width,
			Height:        frame.Height,
			OriginalIndex: i, // Preserve extraction order
		}

		// Store original trim data if present
		if frame.FrameWidth > 0 && frame.FrameHeight > 0 {
			sprites[i].Trimmed = true
			sprites[i].TrimmedX = -frame.FrameX // Sparrow uses negative offsets
			sprites[i].TrimmedY = -frame.FrameY
			sprites[i].OriginalW = frame.FrameWidth
			sprites[i].OriginalH = frame.FrameHeight
		}
	}

	return sprites, nil
}

// FrameNameInfo stores information about a frame name for XML output ordering
type FrameNameInfo struct {
	Name          string // Frame name
	CanonicalName string // Name of the unique sprite this frame maps to
	OriginalIndex int    // Original position in the sprite sequence
}

// DeduplicateSprites removes duplicate sprites and returns unique ones with frame info
// The returned map contains ALL frame names (including duplicates) with their original indices
func DeduplicateSprites(sprites []Sprite) ([]Sprite, map[string]string) {
	type spriteHash struct {
		hash   string
		sprite Sprite
	}

	seen := make(map[string]spriteHash)
	nameMapping := make(map[string]string) // Maps all names (duplicate or not) to canonical name
	uniqueSprites := []Sprite{}

	for _, sprite := range sprites {
		// Create a simple hash by comparing pixel data
		hash := fmt.Sprintf("%d_%d_%v", sprite.Width, sprite.Height, sprite.Buffer[:minInt(100, len(sprite.Buffer))])

		if existing, found := seen[hash]; found {
			// Check if images are actually identical (full pixel comparison)
			if bytesEqual(sprite.Buffer, existing.sprite.Buffer) {
				// Duplicate found - map this name to the canonical one
				nameMapping[sprite.Name] = existing.sprite.Name
				continue
			}
		}

		// New unique sprite - preserve original index from first occurrence
		spriteToAdd := sprite
		uniqueSprites = append(uniqueSprites, spriteToAdd)
		seen[hash] = spriteHash{hash: hash, sprite: spriteToAdd}
		nameMapping[sprite.Name] = sprite.Name // Maps to itself (canonical)
	}

	return uniqueSprites, nameMapping
}

// bytesEqual compares two byte slices for equality
func bytesEqual(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

// formatBytes formats byte count as human-readable string
func formatBytes(bytes int) string {
	if bytes < 1024 {
		return fmt.Sprintf("%d B", bytes)
	} else if bytes < 1024*1024 {
		return fmt.Sprintf("%.1f KB", float64(bytes)/1024)
	} else {
		return fmt.Sprintf("%.1f MB", float64(bytes)/(1024*1024))
	}
}

// smartSort performs smart sorting that preserves general frame order while grouping
// sprites with similar heights for better packing efficiency. This is a compromise
// between "optimal" (full height sorting) and "preserve" (no sorting).
//
// Algorithm:
// 1. Divide sprites into chunks based on original index
// 2. Within each chunk, sort by height descending
// 3. This keeps frames mostly in order but allows local optimization
//
// Chunk size: Dynamically calculated based on total sprite count
// - Small sets (<30): chunks of 10
// - Medium sets (30-100): chunks of 15
// - Large sets (>100): chunks of 20
func smartSort(sprites []Sprite) {
	if len(sprites) <= 1 {
		return
	}

	// Determine chunk size based on total sprite count
	chunkSize := 15 // Default
	if len(sprites) < 30 {
		chunkSize = 10
	} else if len(sprites) > 100 {
		chunkSize = 20
	}

	// Process sprites in chunks
	for i := 0; i < len(sprites); i += chunkSize {
		end := i + chunkSize
		if end > len(sprites) {
			end = len(sprites)
		}

		// Sort this chunk by height descending
		sort.Slice(sprites[i:end], func(a, b int) bool {
			return sprites[i+a].Height > sprites[i+b].Height
		})
	}
}

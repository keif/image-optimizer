package services

import (
	"bytes"
	"encoding/xml"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// createTestSprite creates a simple test sprite with a specific color
func createTestSprite(name string, width, height int, fillColor color.RGBA) Sprite {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, fillColor)
		}
	}

	// Encode to PNG buffer for deduplication to work
	var buf bytes.Buffer
	encoder := &png.Encoder{CompressionLevel: png.BestSpeed}
	_ = encoder.Encode(&buf, img)

	return Sprite{
		Name:   name,
		Image:  img,
		Buffer: buf.Bytes(),
		Width:  width,
		Height: height,
	}
}

// TestPreserveFrameOrder tests that frame order is preserved when PreserveFrameOrder is enabled
func TestPreserveFrameOrder(t *testing.T) {
	sprites := []Sprite{
		createTestSprite("frame0000", 100, 100, color.RGBA{255, 0, 0, 255}),
		createTestSprite("frame0001", 200, 50, color.RGBA{0, 255, 0, 255}),  // Different height
		createTestSprite("frame0002", 150, 150, color.RGBA{0, 0, 255, 255}), // Different height
		createTestSprite("frame0003", 100, 100, color.RGBA{255, 255, 0, 255}),
	}

	options := PackingOptions{
		Padding:            2,
		PowerOfTwo:         false,
		TrimTransparency:   false,
		MaxWidth:           2048,
		MaxHeight:          2048,
		OutputFormats:      []string{"sparrow"},
		PreserveFrameOrder: true,
	}

	result, err := PackSprites(sprites, options)
	if err != nil {
		t.Fatalf("Failed to pack sprites with PreserveFrameOrder: %v", err)
	}

	if len(result.Sheets) == 0 {
		t.Fatal("No sheets generated")
	}

	t.Logf("Generated %d sheets", len(result.Sheets))
	for i, sheet := range result.Sheets {
		t.Logf("Sheet %d: %dx%d with %d sprites", i, sheet.Width, sheet.Height, len(sheet.Sprites))
	}

	// Verify frame order is preserved across all sheets
	// Collect all sprites from all sheets in order
	allSprites := []PackedSprite{}
	for _, sheet := range result.Sheets {
		allSprites = append(allSprites, sheet.Sprites...)
	}

	// Verify we have all 4 sprites
	expectedOrder := []string{"frame0000", "frame0001", "frame0002", "frame0003"}
	if len(allSprites) != len(expectedOrder) {
		t.Fatalf("Expected %d total sprites across all sheets, got %d", len(expectedOrder), len(allSprites))
	}

	// Verify order is preserved
	for i, expected := range expectedOrder {
		if allSprites[i].Name != expected {
			t.Errorf("Sprite %d: expected %s, got %s", i, expected, allSprites[i].Name)
		}
	}
}

// TestFrameOrderNotPreserved tests that frames are reordered by height when PreserveFrameOrder is disabled
func TestFrameOrderNotPreserved(t *testing.T) {
	sprites := []Sprite{
		createTestSprite("small", 100, 50, color.RGBA{255, 0, 0, 255}),
		createTestSprite("large", 100, 200, color.RGBA{0, 255, 0, 255}),
		createTestSprite("medium", 100, 100, color.RGBA{0, 0, 255, 255}),
	}

	options := PackingOptions{
		Padding:            2,
		PowerOfTwo:         false,
		TrimTransparency:   false,
		MaxWidth:           2048,
		MaxHeight:          2048,
		OutputFormats:      []string{"sparrow"},
		PreserveFrameOrder: false, // Allow reordering
	}

	result, err := PackSprites(sprites, options)
	if err != nil {
		t.Fatalf("Failed to pack sprites: %v", err)
	}

	// When PreserveFrameOrder is false, sprites are sorted by height (descending)
	// So the packing order should be: large (200), medium (100), small (50)
	// However, the Sparrow XML should still be sorted by OriginalIndex
	// to maintain the original frame sequence in the XML output

	sparrowXML := result.Formats["sparrow"]
	type SubTexture struct {
		Name string `xml:"name,attr"`
	}
	type TextureAtlas struct {
		XMLName     xml.Name     `xml:"TextureAtlas"`
		SubTextures []SubTexture `xml:"SubTexture"`
	}

	var atlas TextureAtlas
	if err := xml.Unmarshal(sparrowXML, &atlas); err != nil {
		t.Fatalf("Failed to parse Sparrow XML: %v", err)
	}

	// Even with PreserveFrameOrder=false, the XML output should maintain original order
	expectedOrder := []string{"small", "large", "medium"}
	for i, expected := range expectedOrder {
		if atlas.SubTextures[i].Name != expected {
			t.Errorf("Frame %d: expected %s, got %s", i, expected, atlas.SubTextures[i].Name)
		}
	}
}

// TestDuplicateFramePreservation tests that duplicate frames are preserved in XML with deduplication
func TestDuplicateFramePreservation(t *testing.T) {
	// Create sprites where some are identical (simulating animation on 2's)
	sprites := []Sprite{
		createTestSprite("frame0000", 100, 100, color.RGBA{255, 0, 0, 255}),
		createTestSprite("frame0001", 100, 100, color.RGBA{0, 255, 0, 255}),
		createTestSprite("frame0002", 100, 100, color.RGBA{0, 255, 0, 255}), // Duplicate of frame0001
		createTestSprite("frame0003", 100, 100, color.RGBA{0, 0, 255, 255}),
	}

	// Deduplicate sprites
	uniqueSprites, nameMapping := DeduplicateSprites(sprites)

	// Should have 3 unique sprites (frame0001 and frame0002 are duplicates)
	if len(uniqueSprites) != 3 {
		t.Fatalf("Expected 3 unique sprites, got %d", len(uniqueSprites))
	}

	options := PackingOptions{
		Padding:            2,
		PowerOfTwo:         false,
		TrimTransparency:   false,
		MaxWidth:           2048,
		MaxHeight:          2048,
		OutputFormats:      []string{"sparrow"},
		NameMapping:        nameMapping,
		PreserveFrameOrder: true,
	}

	result, err := PackSprites(uniqueSprites, options)
	if err != nil {
		t.Fatalf("Failed to pack sprites: %v", err)
	}

	sparrowXML := result.Formats["sparrow"]
	type SubTexture struct {
		Name string `xml:"name,attr"`
		X    int    `xml:"x,attr"`
		Y    int    `xml:"y,attr"`
	}
	type TextureAtlas struct {
		XMLName     xml.Name     `xml:"TextureAtlas"`
		SubTextures []SubTexture `xml:"SubTexture"`
	}

	var atlas TextureAtlas
	if err := xml.Unmarshal(sparrowXML, &atlas); err != nil {
		t.Fatalf("Failed to parse Sparrow XML: %v", err)
	}

	// Should have 4 SubTexture entries (preserving duplicates)
	if len(atlas.SubTextures) != 4 {
		t.Fatalf("Expected 4 SubTexture entries, got %d", len(atlas.SubTextures))
	}

	// frame0001 and frame0002 should have same coordinates
	frame1 := atlas.SubTextures[1]
	frame2 := atlas.SubTextures[2]
	if frame1.X != frame2.X || frame1.Y != frame2.Y {
		t.Errorf("Duplicate frames should have same coordinates: frame0001(%d,%d) != frame0002(%d,%d)",
			frame1.X, frame1.Y, frame2.X, frame2.Y)
	}
}

// TestCompressionQuality tests different compression quality settings
func TestCompressionQuality(t *testing.T) {
	sprite := createTestSprite("test", 256, 256, color.RGBA{128, 128, 128, 255})

	testCases := []struct {
		name               string
		compressionQuality string
	}{
		{"fast", "fast"},
		{"balanced", "balanced"},
		{"best", "best"},
		{"default", ""}, // Should default to balanced
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			options := PackingOptions{
				Padding:            2,
				PowerOfTwo:         false,
				TrimTransparency:   false,
				MaxWidth:           2048,
				MaxHeight:          2048,
				OutputFormats:      []string{"json"},
				CompressionQuality: tc.compressionQuality,
			}

			result, err := PackSprites([]Sprite{sprite}, options)
			if err != nil {
				t.Fatalf("Failed to pack sprite with compression %s: %v", tc.compressionQuality, err)
			}

			if len(result.Sheets) == 0 {
				t.Fatal("No sheets generated")
			}

			if len(result.Sheets[0].ImageBuffer) == 0 {
				t.Fatal("Image buffer is empty")
			}

			// Just verify it produces valid output - size comparison is difficult
			// because OxiPNG may optimize differently
			t.Logf("Compression %s: buffer size = %d bytes", tc.compressionQuality, len(result.Sheets[0].ImageBuffer))
		})
	}
}

// TestRealSpritesheetOptimization tests optimization with real test data
func TestRealSpritesheetOptimization(t *testing.T) {
	testDataPath := filepath.Join("..", "testdata", "spritesheets")

	testCases := []struct {
		name       string
		pngFile    string
		xmlFile    string
		dedupe     bool
		expectDupe bool // Whether we expect duplicates to be found
	}{
		{
			name:       "SmolSprite_Pikafriend",
			pngFile:    "smol_sprite_pikafriend.png",
			xmlFile:    "smol_sprite_pikafriend.xml",
			dedupe:     true,
			expectDupe: true, // This file has duplicate frames
		},
		{
			name:       "NormSprite_Turmoil",
			pngFile:    "norm_sprite_Turmoil_stand.png",
			xmlFile:    "norm_sprite_Turmoil_stand.xml",
			dedupe:     true,
			expectDupe: true, // This file has many duplicate frames
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Check if test files exist
			pngPath := filepath.Join(testDataPath, tc.pngFile)
			xmlPath := filepath.Join(testDataPath, tc.xmlFile)

			if _, err := os.Stat(pngPath); os.IsNotExist(err) {
				t.Skipf("Test file not found: %s", pngPath)
			}
			if _, err := os.Stat(xmlPath); os.IsNotExist(err) {
				t.Skipf("Test file not found: %s", xmlPath)
			}

			// Load PNG
			pngFile, err := os.Open(pngPath)
			if err != nil {
				t.Fatalf("Failed to open PNG: %v", err)
			}
			defer func() {
				if err := pngFile.Close(); err != nil {
					t.Logf("Warning: failed to close PNG file: %v", err)
				}
			}()

			sheetImg, err := png.Decode(pngFile)
			if err != nil {
				t.Fatalf("Failed to decode PNG: %v", err)
			}

			// Load XML
			xmlData, err := os.ReadFile(xmlPath)
			if err != nil {
				t.Fatalf("Failed to read XML: %v", err)
			}

			// Parse XML
			frames, err := ParseSparrowXML(xmlData)
			if err != nil {
				t.Fatalf("Failed to parse XML: %v", err)
			}

			originalFrameCount := len(frames)
			t.Logf("Original frame count: %d", originalFrameCount)

			// Extract frames
			sprites, err := ExtractFramesFromSheet(sheetImg, frames)
			if err != nil {
				t.Fatalf("Failed to extract frames: %v", err)
			}

			// Deduplicate if requested
			var nameMapping map[string]string
			if tc.dedupe {
				sprites, nameMapping = DeduplicateSprites(sprites)
				t.Logf("After deduplication: %d unique sprites", len(sprites))

				if tc.expectDupe && len(sprites) >= originalFrameCount {
					t.Errorf("Expected deduplication to reduce sprite count, but got %d sprites from %d frames",
						len(sprites), originalFrameCount)
				}
			}

			// Pack with PreserveFrameOrder enabled
			options := PackingOptions{
				Padding:            2,
				PowerOfTwo:         false,
				TrimTransparency:   false,
				MaxWidth:           4096,
				MaxHeight:          4096,
				OutputFormats:      []string{"sparrow"},
				NameMapping:        nameMapping,
				PreserveFrameOrder: true,
				CompressionQuality: "balanced",
			}

			result, err := PackSprites(sprites, options)
			if err != nil {
				t.Fatalf("Failed to pack sprites: %v", err)
			}

			// Verify Sparrow XML
			sparrowXML := result.Formats["sparrow"]
			type SubTexture struct {
				Name string `xml:"name,attr"`
			}
			type TextureAtlas struct {
				XMLName     xml.Name     `xml:"TextureAtlas"`
				SubTextures []SubTexture `xml:"SubTexture"`
			}

			var atlas TextureAtlas
			if err := xml.Unmarshal(sparrowXML, &atlas); err != nil {
				t.Fatalf("Failed to parse generated Sparrow XML: %v", err)
			}

			// Verify frame count (should match original even with deduplication)
			if len(atlas.SubTextures) != originalFrameCount {
				t.Errorf("Expected %d frames in output XML, got %d", originalFrameCount, len(atlas.SubTextures))
			}

			// Verify all frame names are present (order may differ with deduplication)
			expectedNames := make(map[string]bool)
			for _, frame := range frames {
				expectedNames[frame.Name] = true
			}

			outputNames := make(map[string]bool)
			for _, subTexture := range atlas.SubTextures {
				outputNames[subTexture.Name] = true
			}

			// Check that all expected names are in the output
			for name := range expectedNames {
				if !outputNames[name] {
					t.Errorf("Missing frame name in output: %s", name)
				}
			}

			// Check that no unexpected names are in the output
			for name := range outputNames {
				if !expectedNames[name] {
					t.Errorf("Unexpected frame name in output: %s", name)
				}
			}

			t.Logf("Successfully repacked %s: %d unique sprites -> %d output frames",
				tc.name, len(sprites), len(atlas.SubTextures))
		})
	}
}

// TestOriginalIndexPreservation tests that OriginalIndex is preserved through processing
func TestOriginalIndexPreservation(t *testing.T) {
	sprites := []Sprite{
		createTestSprite("a", 50, 50, color.RGBA{255, 0, 0, 255}),
		createTestSprite("b", 100, 100, color.RGBA{0, 255, 0, 255}),
		createTestSprite("c", 75, 75, color.RGBA{0, 0, 255, 255}),
	}

	// Manually set OriginalIndex
	for i := range sprites {
		sprites[i].OriginalIndex = i
	}

	options := PackingOptions{
		Padding:            2,
		PowerOfTwo:         false,
		TrimTransparency:   false,
		MaxWidth:           2048,
		MaxHeight:          2048,
		OutputFormats:      []string{},
		PreserveFrameOrder: false, // Allow height sorting
	}

	result, err := PackSprites(sprites, options)
	if err != nil {
		t.Fatalf("Failed to pack sprites: %v", err)
	}

	// Verify OriginalIndex is preserved in packed sprites
	for _, packed := range result.Sheets[0].Sprites {
		originalName := packed.Name
		expectedIndex := -1
		for i, s := range sprites {
			if s.Name == originalName {
				expectedIndex = i
				break
			}
		}

		if packed.OriginalIndex != expectedIndex {
			t.Errorf("Sprite %s: expected OriginalIndex %d, got %d",
				packed.Name, expectedIndex, packed.OriginalIndex)
		}
	}
}

// TestSparrowXMLFrameSequence verifies that sequential duplicate frames are output correctly
func TestSparrowXMLFrameSequence(t *testing.T) {
	// Simulate animation on 2's: frame A, frame B, frame B (hold), frame C
	sprites := []Sprite{
		createTestSprite("anim0000", 100, 100, color.RGBA{255, 0, 0, 255}),
		createTestSprite("anim0001", 100, 100, color.RGBA{0, 255, 0, 255}),
		createTestSprite("anim0002", 100, 100, color.RGBA{0, 255, 0, 255}), // Same as 0001
		createTestSprite("anim0003", 100, 100, color.RGBA{0, 0, 255, 255}),
	}

	uniqueSprites, nameMapping := DeduplicateSprites(sprites)

	options := PackingOptions{
		Padding:            2,
		PowerOfTwo:         false,
		TrimTransparency:   false,
		MaxWidth:           2048,
		MaxHeight:          2048,
		OutputFormats:      []string{"sparrow"},
		NameMapping:        nameMapping,
		PreserveFrameOrder: true,
	}

	result, err := PackSprites(uniqueSprites, options)
	if err != nil {
		t.Fatalf("Failed to pack sprites: %v", err)
	}

	sparrowXML := result.Formats["sparrow"]
	xmlStr := string(sparrowXML)

	// Verify all frame names appear in order
	expectedFrames := []string{"anim0000", "anim0001", "anim0002", "anim0003"}
	for i, frameName := range expectedFrames {
		if !strings.Contains(xmlStr, frameName) {
			t.Errorf("Frame %d (%s) not found in XML output", i, frameName)
		}
	}

	// Verify sequence order by checking that frames appear in XML in the expected order
	lastIndex := -1
	for _, frameName := range expectedFrames {
		index := strings.Index(xmlStr, `name="`+frameName+`"`)
		if index <= lastIndex {
			t.Errorf("Frame %s appears out of order in XML (index %d <= %d)", frameName, index, lastIndex)
		}
		lastIndex = index
	}
}

// createTransparentSprite creates a fully transparent sprite for testing
func createTransparentSprite(name string, width, height int) Sprite {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	// All pixels are transparent by default (alpha = 0)

	// Encode to PNG buffer for deduplication to work
	var buf bytes.Buffer
	encoder := &png.Encoder{CompressionLevel: png.BestSpeed}
	_ = encoder.Encode(&buf, img)

	return Sprite{
		Name:   name,
		Image:  img,
		Buffer: buf.Bytes(),
		Width:  width,
		Height: height,
	}
}

// TestTrimTransparency_FullyTransparent tests that TrimTransparency returns an error for fully transparent images
func TestTrimTransparency_FullyTransparent(t *testing.T) {
	transparentSprite := createTransparentSprite("transparent", 100, 100)

	_, _, _, _, _, err := TrimTransparency(transparentSprite.Image)
	if err == nil {
		t.Error("Expected error when trimming fully transparent image, got nil")
	}

	if err != nil && !strings.Contains(err.Error(), "fully transparent") {
		t.Errorf("Expected error message to contain 'fully transparent', got: %s", err.Error())
	}
}

// TestTrimTransparency_PartiallyTransparent tests that TrimTransparency works correctly for partially transparent images
func TestTrimTransparency_PartiallyTransparent(t *testing.T) {
	// Create a sprite with transparent borders
	img := image.NewRGBA(image.Rect(0, 0, 100, 100))
	// Fill center with opaque red (leaving 10px transparent border)
	for y := 10; y < 90; y++ {
		for x := 10; x < 90; x++ {
			img.Set(x, y, color.RGBA{255, 0, 0, 255})
		}
	}

	trimmed, trimX, trimY, origW, origH, err := TrimTransparency(img)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	// Check trim offsets
	if trimX != 10 || trimY != 10 {
		t.Errorf("Expected trim offset (10, 10), got (%d, %d)", trimX, trimY)
	}

	// Check original dimensions
	if origW != 100 || origH != 100 {
		t.Errorf("Expected original dimensions (100, 100), got (%d, %d)", origW, origH)
	}

	// Check trimmed dimensions (should be 80x80)
	if trimmed.Bounds().Dx() != 80 || trimmed.Bounds().Dy() != 80 {
		t.Errorf("Expected trimmed dimensions (80, 80), got (%d, %d)", trimmed.Bounds().Dx(), trimmed.Bounds().Dy())
	}
}

// TestPackSprites_TransparentFrameError tests that PackSprites returns an error when trimming a transparent frame
func TestPackSprites_TransparentFrameError(t *testing.T) {
	sprites := []Sprite{
		createTestSprite("normal_frame", 100, 100, color.RGBA{255, 0, 0, 255}),
		createTransparentSprite("transparent_frame", 100, 100),
		createTestSprite("another_normal", 100, 100, color.RGBA{0, 255, 0, 255}),
	}

	options := PackingOptions{
		Padding:          2,
		PowerOfTwo:       false,
		TrimTransparency: true, // Enable trimming to trigger the error
		MaxWidth:         4096,
		MaxHeight:        4096,
	}

	_, err := PackSprites(sprites, options)
	if err == nil {
		t.Error("Expected error when packing sprites with transparent frame and trimming enabled, got nil")
	}

	if err != nil {
		if !strings.Contains(err.Error(), "transparent_frame") {
			t.Errorf("Expected error message to contain sprite name 'transparent_frame', got: %s", err.Error())
		}
		if !strings.Contains(err.Error(), "fully transparent") {
			t.Errorf("Expected error message to contain 'fully transparent', got: %s", err.Error())
		}
		if !strings.Contains(err.Error(), "Disable trimTransparency") {
			t.Errorf("Expected error message to suggest disabling trimTransparency, got: %s", err.Error())
		}
	}
}

// TestPackSprites_TransparentFrameNoTrim tests that PackSprites works with transparent frames when trimming is disabled
func TestPackSprites_TransparentFrameNoTrim(t *testing.T) {
	sprites := []Sprite{
		createTestSprite("normal_frame", 100, 100, color.RGBA{255, 0, 0, 255}),
		createTransparentSprite("transparent_frame", 100, 100),
		createTestSprite("another_normal", 100, 100, color.RGBA{0, 255, 0, 255}),
	}

	options := PackingOptions{
		Padding:          2,
		PowerOfTwo:       false,
		TrimTransparency: false, // Disabled - should not error
		MaxWidth:         4096,
		MaxHeight:        4096,
	}

	result, err := PackSprites(sprites, options)
	if err != nil {
		t.Errorf("Unexpected error when packing sprites with transparent frame and trimming disabled: %v", err)
	}

	if result == nil {
		t.Fatal("Expected packing result, got nil")
	}

	// Verify all 3 sprites are in the result
	if len(result.Sheets) == 0 {
		t.Fatal("Expected at least one sheet in result")
	}

	totalSprites := 0
	for _, sheet := range result.Sheets {
		totalSprites += len(sheet.Sprites)
	}

	if totalSprites != 3 {
		t.Errorf("Expected 3 sprites in result, got %d", totalSprites)
	}
}

// createTransparentBorderedSprite creates a sprite with transparent borders
// This allows us to test trimming behavior
func createTransparentBorderedSprite(name string, contentWidth, contentHeight, borderSize int, fillColor color.RGBA) Sprite {
	totalWidth := contentWidth + (borderSize * 2)
	totalHeight := contentHeight + (borderSize * 2)
	img := image.NewRGBA(image.Rect(0, 0, totalWidth, totalHeight))

	// Fill with transparent
	transparent := color.RGBA{0, 0, 0, 0}
	for y := 0; y < totalHeight; y++ {
		for x := 0; x < totalWidth; x++ {
			img.Set(x, y, transparent)
		}
	}

	// Fill content area with color
	for y := borderSize; y < borderSize+contentHeight; y++ {
		for x := borderSize; x < borderSize+contentWidth; x++ {
			img.Set(x, y, fillColor)
		}
	}

	// Encode to PNG buffer
	var buf bytes.Buffer
	encoder := &png.Encoder{CompressionLevel: png.BestSpeed}
	_ = encoder.Encode(&buf, img)

	return Sprite{
		Name:   name,
		Image:  img,
		Buffer: buf.Bytes(),
		Width:  totalWidth,
		Height: totalHeight,
	}
}

// TestSimpleGlobMatch tests the glob pattern matching function
func TestSimpleGlobMatch(t *testing.T) {
	tests := []struct {
		name     string
		pattern  string
		testName string
		expected bool
	}{
		{"exact match", "sprite.png", "sprite.png", true},
		{"no match", "sprite.png", "other.png", false},
		{"wildcard prefix", "*walk*", "sprite-walk-001.png", true},
		{"wildcard suffix", "idle*", "idle-001.png", true},
		{"wildcard both sides", "*run*", "character-run-001.png", true},
		{"multiple wildcards", "*-walk-*.png", "sprite-walk-001.png", true},
		{"wildcard no match", "*walk*", "sprite-idle-001.png", false},
		{"empty pattern", "", "sprite.png", false},
		{"wildcard only", "*", "anything.png", true},
		{"pattern longer than name", "*verylongpattern*", "short.png", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := simpleGlobMatch(tt.testName, tt.pattern)
			if result != tt.expected {
				t.Errorf("simpleGlobMatch(%q, %q) = %v, expected %v", tt.testName, tt.pattern, result, tt.expected)
			}
		})
	}
}

// TestMatchesPattern tests the pattern matching with multiple patterns
func TestMatchesPattern(t *testing.T) {
	tests := []struct {
		name     string
		patterns []string
		testName string
		expected bool
	}{
		{"match first pattern", []string{"*walk*", "*run*"}, "sprite-walk-001.png", true},
		{"match second pattern", []string{"*walk*", "*run*"}, "sprite-run-001.png", true},
		{"no match", []string{"*walk*", "*run*"}, "sprite-idle-001.png", false},
		{"empty patterns", []string{}, "sprite.png", false},
		{"single pattern match", []string{"*idle*"}, "character-idle-001.png", true},
		{"single pattern no match", []string{"*idle*"}, "character-walk-001.png", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := matchesPattern(tt.testName, tt.patterns)
			if result != tt.expected {
				t.Errorf("matchesPattern(%q, %v) = %v, expected %v", tt.testName, tt.patterns, result, tt.expected)
			}
		})
	}
}

// TestShouldTrimSprite tests the trim decision logic
func TestShouldTrimSprite(t *testing.T) {
	tests := []struct {
		name       string
		spriteName string
		options    PackingOptions
		expected   bool
	}{
		{
			name:       "trim disabled",
			spriteName: "sprite-walk-001.png",
			options: PackingOptions{
				TrimTransparency: false,
			},
			expected: false,
		},
		{
			name:       "trim all by default",
			spriteName: "sprite-walk-001.png",
			options: PackingOptions{
				TrimTransparency: true,
			},
			expected: true,
		},
		{
			name:       "trim only matching pattern",
			spriteName: "sprite-walk-001.png",
			options: PackingOptions{
				TrimTransparency: true,
				TrimOnly:         []string{"*walk*", "*run*"},
			},
			expected: true,
		},
		{
			name:       "trim only not matching",
			spriteName: "sprite-idle-001.png",
			options: PackingOptions{
				TrimTransparency: true,
				TrimOnly:         []string{"*walk*", "*run*"},
			},
			expected: false,
		},
		{
			name:       "trim except matching pattern",
			spriteName: "sprite-idle-001.png",
			options: PackingOptions{
				TrimTransparency: true,
				TrimExcept:       []string{"*idle*", "*attack*"},
			},
			expected: false,
		},
		{
			name:       "trim except not matching",
			spriteName: "sprite-walk-001.png",
			options: PackingOptions{
				TrimTransparency: true,
				TrimExcept:       []string{"*idle*", "*attack*"},
			},
			expected: true,
		},
		{
			name:       "trim only takes precedence over trim except",
			spriteName: "sprite-walk-001.png",
			options: PackingOptions{
				TrimTransparency: true,
				TrimOnly:         []string{"*walk*"},
				TrimExcept:       []string{"*walk*"}, // This should be ignored
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := shouldTrimSprite(tt.spriteName, tt.options)
			if result != tt.expected {
				t.Errorf("shouldTrimSprite(%q, options) = %v, expected %v", tt.spriteName, result, tt.expected)
			}
		})
	}
}

// TestSelectiveTrimming tests the actual selective trimming behavior
func TestSelectiveTrimming(t *testing.T) {
	// Create test sprites with transparent borders
	sprites := []Sprite{
		createTransparentBorderedSprite("sprite-walk-001.png", 50, 50, 10, color.RGBA{255, 0, 0, 255}),
		createTransparentBorderedSprite("sprite-walk-002.png", 50, 50, 10, color.RGBA{255, 0, 0, 255}),
		createTransparentBorderedSprite("sprite-idle-001.png", 50, 50, 10, color.RGBA{0, 255, 0, 255}),
		createTransparentBorderedSprite("sprite-idle-002.png", 50, 50, 10, color.RGBA{0, 255, 0, 255}),
	}

	t.Run("trim only walk sprites", func(t *testing.T) {
		options := PackingOptions{
			Padding:          2,
			PowerOfTwo:       false,
			TrimTransparency: true,
			TrimOnly:         []string{"*walk*"},
			MaxWidth:         4096,
			MaxHeight:        4096,
			OutputFormats:    []string{"json"},
			PackingMode:      "optimal",
		}

		result, err := PackSprites(sprites, options)
		if err != nil {
			t.Fatalf("PackSprites failed: %v", err)
		}

		// Check that walk sprites were trimmed
		for _, sheet := range result.Sheets {
			for _, sprite := range sheet.Sprites {
				if strings.Contains(sprite.Name, "walk") {
					if !sprite.Trimmed {
						t.Errorf("Expected sprite %s to be trimmed, but it wasn't", sprite.Name)
					}
					if sprite.Width != 50 || sprite.Height != 50 {
						t.Errorf("Expected trimmed sprite %s to be 50x50, got %dx%d", sprite.Name, sprite.Width, sprite.Height)
					}
					if sprite.OriginalW != 70 || sprite.OriginalH != 70 {
						t.Errorf("Expected original dimensions to be 70x70, got %dx%d", sprite.OriginalW, sprite.OriginalH)
					}
				} else if strings.Contains(sprite.Name, "idle") {
					if sprite.Trimmed {
						t.Errorf("Expected sprite %s to NOT be trimmed, but it was", sprite.Name)
					}
					if sprite.Width != 70 || sprite.Height != 70 {
						t.Errorf("Expected untrimmed sprite %s to be 70x70, got %dx%d", sprite.Name, sprite.Width, sprite.Height)
					}
				}
			}
		}
	})

	t.Run("trim except idle sprites", func(t *testing.T) {
		options := PackingOptions{
			Padding:          2,
			PowerOfTwo:       false,
			TrimTransparency: true,
			TrimExcept:       []string{"*idle*"},
			MaxWidth:         4096,
			MaxHeight:        4096,
			OutputFormats:    []string{"json"},
			PackingMode:      "optimal",
		}

		result, err := PackSprites(sprites, options)
		if err != nil {
			t.Fatalf("PackSprites failed: %v", err)
		}

		// Check that idle sprites were NOT trimmed, others were trimmed
		for _, sheet := range result.Sheets {
			for _, sprite := range sheet.Sprites {
				if strings.Contains(sprite.Name, "idle") {
					if sprite.Trimmed {
						t.Errorf("Expected sprite %s to NOT be trimmed, but it was", sprite.Name)
					}
				} else if strings.Contains(sprite.Name, "walk") {
					if !sprite.Trimmed {
						t.Errorf("Expected sprite %s to be trimmed, but it wasn't", sprite.Name)
					}
				}
			}
		}
	})

	t.Run("trim all when no patterns specified", func(t *testing.T) {
		options := PackingOptions{
			Padding:          2,
			PowerOfTwo:       false,
			TrimTransparency: true,
			MaxWidth:         4096,
			MaxHeight:        4096,
			OutputFormats:    []string{"json"},
			PackingMode:      "optimal",
		}

		result, err := PackSprites(sprites, options)
		if err != nil {
			t.Fatalf("PackSprites failed: %v", err)
		}

		// Check that all sprites were trimmed
		for _, sheet := range result.Sheets {
			for _, sprite := range sheet.Sprites {
				if !sprite.Trimmed {
					t.Errorf("Expected sprite %s to be trimmed, but it wasn't", sprite.Name)
				}
			}
		}
	})

	t.Run("trim none when disabled", func(t *testing.T) {
		options := PackingOptions{
			Padding:          2,
			PowerOfTwo:       false,
			TrimTransparency: false,
			TrimOnly:         []string{"*walk*"}, // Should be ignored
			MaxWidth:         4096,
			MaxHeight:        4096,
			OutputFormats:    []string{"json"},
			PackingMode:      "optimal",
		}

		result, err := PackSprites(sprites, options)
		if err != nil {
			t.Fatalf("PackSprites failed: %v", err)
		}

		// Check that no sprites were trimmed
		for _, sheet := range result.Sheets {
			for _, sprite := range sheet.Sprites {
				if sprite.Trimmed {
					t.Errorf("Expected sprite %s to NOT be trimmed, but it was", sprite.Name)
				}
			}
		}
	})
}

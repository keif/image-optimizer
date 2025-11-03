# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Phase 4: Spritesheet Optimizer Enhancements

- **Smart Packing Mode** - Three-tiered packing strategy for optimal efficiency vs frame order
  - `packingMode` parameter with options: `optimal` (default), `smart`, `preserve`
  - `optimal`: Maximum efficiency (85-95%), height-based sorting
  - `smart`: Balanced efficiency (60-80%) with frame order preservation via chunk sorting
  - `preserve`: Exact frame order preservation (may sacrifice efficiency)
  - Ideal for animations requiring specific frame sequences
- **Dynamic Image Path Parameter** - Customize output image filename
  - `imagePath` parameter for all spritesheet output formats
  - Fixes hardcoded "spritesheet-0.png" references in Sparrow, TexturePacker, etc.
  - Allows proper asset naming in game engines
- **Compression Size Warnings** - Intelligent feedback when optimization increases size
  - Automatic warning when output size exceeds input size
  - Shows percentage difference in `warnings` array
  - Helps users optimize settings (powerOfTwo, maxWidth/maxHeight, quality)
- **PowerOfTwo Dimension Capping** - Respects max dimensions when rounding
  - Prevents 51% size inflation at maxWidth/maxHeight boundaries
  - Caps power-of-two rounding to specified max dimensions
  - Improves predictability of output dimensions
- **Transparent Frame Validation** - Detects fully transparent frames during trimming
  - Returns descriptive error with frame name and remediation steps
  - Prevents silent failures that create invalid spritesheets
  - Error message: "Frame '{name}' is fully transparent after trimming. Disable trimTransparency or check source image."
- **Comprehensive Swagger Documentation** - Interactive API docs at `/swagger/index.html`
  - All Phase 4 parameters documented with examples
  - Deprecation warnings for old parameters (`preserveFrameOrder`)
  - Request/response schemas with validation rules
- New `preserveFrameOrder` query parameter for spritesheet endpoints
  - Available on `/pack-sprites` (default: false) and `/optimize-spritesheet` (default: true)
  - Preserves sprite upload order instead of height-based sorting
  - Critical for maintaining animation frame sequences
  - **DEPRECATED**: Use `packingMode=preserve` instead
- New `compressionQuality` query parameter for spritesheet endpoints
  - Options: `fast`, `balanced` (default), `best`
  - Controls PNG compression level and OxiPNG optimization level
  - Trade-off between processing speed and file size
- Comprehensive test suite for spritesheet service (76 total tests, up from 72)
  - Frame order preservation tests
  - Duplicate frame handling tests
  - Compression quality tests
  - Real spritesheet optimization tests
  - Transparent frame validation tests (4 new tests)
  - Packing mode tests (optimal/smart/preserve)
  - PowerOfTwo capping tests
  - Compression warning tests
- Documentation for `/optimize-spritesheet` endpoint in README
- Troubleshooting guide for animation issues in README

### Fixed

- **Shape distortion bug**: Fixed "<" pattern appearing in optimized spritesheets
  - Root cause: Height-based sorting destroyed original spatial layout
  - Solution: Added `PreserveFrameOrder` option to skip sorting
- **File size increase bug**: Fixed ~1MB file size bloat in optimized spritesheets
  - Root cause: Fast PNG compression (level 1) with low OxiPNG level
  - Solution: Added configurable compression quality settings
- **XML frame order bug**: Fixed frames appearing out of sequence in Sparrow XML
  - Root cause: Packing algorithm reordered sprites without preserving original index
  - Solution: Added `OriginalIndex` tracking to `Sprite` struct
- **Animation framerate bug**: Fixed duplicate frames being removed from animations
  - Root cause: Deduplication removed duplicate frame entries from XML
  - Solution: Preserve all frame names in XML via reverse name mapping
- **PowerOfTwo size inflation**: Fixed 51% size increase when using powerOfTwo with maxWidth/maxHeight
  - Root cause: Power-of-two rounding ignored max dimension constraints
  - Solution: Cap power-of-two dimensions to specified maxWidth/maxHeight
- **Silent trim failures**: Fixed fully transparent frames causing invalid spritesheets
  - Root cause: TrimTransparency didn't validate if frame became completely empty
  - Solution: Return error when frame is fully transparent after trimming

### Changed

- Default compression quality changed from "fast" to "balanced"
- Spritesheet imports (`/optimize-spritesheet`) now default to `preserveFrameOrder=true`
- Enhanced Swagger documentation for spritesheet endpoints
- `preserveFrameOrder` parameter deprecated in favor of `packingMode` (backward compatible)

### Deprecated

- `preserveFrameOrder` parameter - Use `packingMode="preserve"` instead
  - Still functional for backward compatibility
  - Will be removed in v2.0.0

## [0.1.2-beta.3] - 2025-01-XX

### Added

- Initial spritesheet optimization functionality
- MaxRects bin packing algorithm
- Multiple output format support (JSON, CSS, CSV, XML, Sparrow, Unity, Godot)

[Unreleased]: https://github.com/keif/image-optimizer/compare/v0.1.2-beta.3...HEAD
[0.1.2-beta.3]: https://github.com/keif/image-optimizer/releases/tag/v0.1.2-beta.3

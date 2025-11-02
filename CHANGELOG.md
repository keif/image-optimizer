# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New `preserveFrameOrder` query parameter for spritesheet endpoints
  - Available on `/pack-sprites` (default: false) and `/optimize-spritesheet` (default: true)
  - Preserves sprite upload order instead of height-based sorting
  - Critical for maintaining animation frame sequences
- New `compressionQuality` query parameter for spritesheet endpoints
  - Options: `fast`, `balanced` (default), `best`
  - Controls PNG compression level and OxiPNG optimization level
  - Trade-off between processing speed and file size
- Comprehensive test suite for spritesheet service (7 new tests)
  - Frame order preservation tests
  - Duplicate frame handling tests
  - Compression quality tests
  - Real spritesheet optimization tests
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

### Changed

- Default compression quality changed from "fast" to "balanced"
- Spritesheet imports (`/optimize-spritesheet`) now default to `preserveFrameOrder=true`
- Enhanced Swagger documentation for spritesheet endpoints

## [0.1.2-beta.3] - 2025-01-XX

### Added

- Initial spritesheet optimization functionality
- MaxRects bin packing algorithm
- Multiple output format support (JSON, CSS, CSV, XML, Sparrow, Unity, Godot)

[Unreleased]: https://github.com/keif/image-optimizer/compare/v0.1.2-beta.3...HEAD
[0.1.2-beta.3]: https://github.com/keif/image-optimizer/releases/tag/v0.1.2-beta.3

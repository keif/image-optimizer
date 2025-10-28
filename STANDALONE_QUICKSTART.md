# Standalone Binary - Quick Start

Get the Image Optimizer running in 30 seconds!

## Download & Run

```bash
# 1. Download binary for your platform
# (Check GitHub releases page)

# 2. Make it executable (macOS/Linux)
chmod +x image-optimizer-*

# 3. Run it!
./image-optimizer-darwin-arm64
```

That's it! Open <http://localhost:3000> in your browser.

## Command-Line Options

```bash
# Custom port
./image-optimizer --port 8080

# Show version
./image-optimizer --version

# Disable auth (testing only)
DISABLE_AUTH=true ./image-optimizer

# Custom database location
DB_PATH=/custom/path/db.sqlite ./image-optimizer
```

## Quick Testing

After starting the binary, test it works:

```bash
# Health check
curl http://localhost:3000/health

# API documentation
open http://localhost:3000/swagger/index.html

# Web interface
open http://localhost:3000
```

## Building from Source

```bash
# From project root
./scripts/build-standalone.sh

# Binary will be in dist/
./dist/image-optimizer-darwin-arm64
```

## Troubleshooting

### macOS: "App can't be opened"

```bash
# Remove quarantine flag
xattr -d com.apple.quarantine image-optimizer-*

# Or right-click and select "Open"
```

### Port Already in Use

```bash
# Use different port
./image-optimizer --port 8080
```

### Permission Denied

```bash
# Make executable
chmod +x image-optimizer-*
```

## What's Included

- Full API server with image optimization
- Web interface for easy usage
- API key management
- Swagger documentation
- Health monitoring
- No external dependencies needed!

## Platform Support

- macOS (Intel & Apple Silicon)
- Linux (x64 & ARM)
- Windows (x64)

Note: Due to CGO/libvips requirements, build on target platform for best results.

## Learn More

- Full documentation: `cmd/standalone/README.md`
- Build guide: `STANDALONE_BUILD.md`
- API docs: <http://localhost:3000/swagger/index.html>

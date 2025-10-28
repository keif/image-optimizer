# Standalone Binary Build Guide

This document describes the standalone all-in-one binary build for the Image Optimizer, which combines the API server and web interface into a single executable.

## Overview

The standalone binary is a complete, self-contained version of the Image Optimizer that includes:

- Full API server with all optimization endpoints
- Embedded Next.js web interface (static export)
- Built-in SQLite database for API key management
- No external dependencies (except system libraries for image processing)
- Single binary deployment for easy distribution

## Architecture

### Frontend Integration

The web interface is built using Next.js with static export mode:

1. Next.js builds a static version of the site (HTML, CSS, JS)
2. Static files are embedded into the Go binary using `//go:embed`
3. Go's `embed.FS` serves the files at runtime
4. API client uses relative URLs (same-origin) for API calls

### Backend Integration

The API server runs on the same port as the frontend:

- Frontend: served from `/` (index.html, assets, etc.)
- API: served from `/optimize`, `/api/*`, `/health`, etc.
- No CORS needed since frontend and backend are same-origin
- Database stored in user's home directory or current directory

## Files Created

### Main Files

1. **`/Users/keif/projects/git/image-optimizer/cmd/standalone/main.go`**
   - Entry point for standalone binary
   - Embeds frontend files using `//go:embed embedded/*`
   - Configures Fiber server with both API routes and static file serving
   - Handles database initialization
   - Command-line flags: `--port`, `--version`

2. **`/Users/keif/projects/git/image-optimizer/scripts/build-standalone.sh`**
   - Automated build script
   - Steps:
     1. Builds Next.js frontend with `NEXT_PUBLIC_API_URL=''`
     2. Copies static files to `cmd/standalone/embedded/`
     3. Removes empty directories (Go embed requirement)
     4. Builds Go binaries with version info
   - Targets multiple platforms (though cross-compilation has limitations)

3. **`/Users/keif/projects/git/image-optimizer/cmd/standalone/README.md`**
   - User-facing documentation
   - Quick start guide
   - Command-line options
   - Troubleshooting tips

### Modified Files

1. **`/Users/keif/projects/git/image-optimizer/web/package.json`**
   - Added `build:standalone` script
   - Sets `NEXT_PUBLIC_API_URL=''` for same-origin API calls

2. **`/Users/keif/projects/git/image-optimizer/web/next.config.mjs`**
   - Updated to force `export` mode when `NEXT_PUBLIC_API_URL=''`
   - Disables image optimization for static export

3. **`/Users/keif/projects/git/image-optimizer/web/app/api/config/route.ts`**
   - Returns empty string for API URL in standalone mode
   - Allows API client to use relative URLs

4. **`/Users/keif/projects/git/image-optimizer/web/lib/api.ts`**
   - Updated to handle empty API URL (same-origin)
   - Uses relative paths when baseUrl is empty

5. **`/Users/keif/projects/git/image-optimizer/.gitignore`**
   - Added `cmd/standalone/embedded/` to ignore embedded files

## Building the Binary

### Prerequisites

- Go 1.24+ (with CGO enabled)
- Node.js 18+ with pnpm
- System libraries: libvips, SQLite

### Build Process

```bash
# From project root
./scripts/build-standalone.sh
```

This will create binaries in the `dist/` directory.

### Current Platform Build

The build script successfully builds for the current platform (darwin/arm64 in this case):

```
Binary: dist/image-optimizer-darwin-arm64
Size: 29MB
```

### Cross-Platform Build Limitations

Cross-platform builds fail due to:

1. **SQLite CGO Requirements**: SQLite needs CGO, which complicates cross-compilation
2. **libvips Dependencies**: Image processing library has platform-specific binaries
3. **System Library Differences**: macOS vs Linux vs Windows system calls

**Recommended Approach**: Build on each target platform natively, or use a CI/CD pipeline with platform-specific runners.

## Running the Binary

### Basic Usage

```bash
# Run with default settings (port 3000)
./dist/image-optimizer-darwin-arm64

# Run on custom port
./dist/image-optimizer-darwin-arm64 --port 8080

# Show version
./dist/image-optimizer-darwin-arm64 --version
```

### First Run

On first run, the binary will:

1. Create database directory in `~/.image-optimizer/data/`
2. Initialize SQLite database with schema
3. Start web server on specified port
4. Print startup message with local URL

### Accessing the Application

- **Web Interface**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/swagger/index.html`
- **Health Check**: `http://localhost:3000/health`

## Technical Details

### Embedded Files

- Location: `cmd/standalone/embedded/`
- Size: ~2.5MB (compressed assets)
- Files: HTML, CSS, JS, images, fonts
- Access: Read-only at runtime via `embed.FS`

### Database

- Default location: `~/.image-optimizer/data/api_keys.db`
- Fallback: `./data/api_keys.db`
- Override: Set `DB_PATH` environment variable
- Schema: API keys, metrics (hourly aggregates), format tracking

### Security

- API key authentication enabled by default
- Rate limiting middleware active
- Security headers applied
- CORS configured for same-origin
- To disable auth for testing: `DISABLE_AUTH=true ./binary`

### Performance

- Response compression (gzip, deflate, brotli)
- Static asset caching (1 hour max-age)
- 20MB body limit for large uploads
- 7-minute timeouts for long operations

## Example Commands

### Production Deployment

```bash
# Run on port 80 (requires sudo)
sudo ./image-optimizer-darwin-arm64 --port 80

# Run as systemd service
sudo cp image-optimizer-linux-amd64 /usr/local/bin/image-optimizer
sudo systemctl start image-optimizer
```

### Development Testing

```bash
# Disable auth for quick testing
DISABLE_AUTH=true ./image-optimizer-darwin-arm64

# Custom database location
DB_PATH=/tmp/test.db ./image-optimizer-darwin-arm64

# Different port
./image-optimizer-darwin-arm64 --port 9000
```

## Distribution

The standalone binary can be distributed as:

1. **Direct download**: Host binaries on GitHub releases
2. **Package managers**: Create packages for Homebrew, apt, etc.
3. **Container image**: Build Docker image with binary
4. **Installer**: Create platform-specific installers

## Known Issues and Limitations

### Cross-Compilation

- Cross-platform builds require platform-specific toolchains
- SQLite CGO dependency makes cross-compilation complex
- libvips requires platform-specific compilation

### Recommendations

- Build on target platform for best results
- Use CI/CD with matrix builds for multiple platforms
- Consider using cross-compilation tools like `xgo` or `zig`

### Next.js Static Export Limitations

- No server-side rendering
- No API routes (we use static JSON files instead)
- No dynamic routes (all routes pre-rendered)
- No custom headers (applied by Go server instead)

These are acceptable tradeoffs for a standalone binary deployment.

## Future Improvements

1. **Multi-platform CI/CD**: Set up GitHub Actions with matrix builds
2. **Compression**: Add UPX compression to reduce binary size
3. **Auto-updates**: Implement self-update mechanism
4. **Installer**: Create platform-specific installers (PKG, MSI, DEB, RPM)
5. **Code signing**: Sign binaries for macOS/Windows
6. **Pure Go SQLite**: Consider using modernc.org/sqlite for CGO-free builds

## Troubleshooting

### Build Failures

- Ensure Go 1.24+ with CGO enabled
- Install libvips development headers
- Check system library paths
- Verify pnpm installation

### Runtime Issues

- Check port availability
- Verify database permissions
- Ensure sufficient disk space
- Check system library versions

### Frontend Not Loading

- Verify embedded files exist in binary (should be ~29MB)
- Check browser console for errors
- Ensure API config has empty URL: `{"apiUrl":""}`
- Try accessing `/health` endpoint directly

## Conclusion

The standalone binary successfully combines the Image Optimizer API and web interface into a single, portable executable. While cross-platform builds have limitations, the binary works perfectly when built on the target platform. The 29MB size is reasonable for a complete application with embedded frontend, and the user experience is seamless with same-origin API calls.

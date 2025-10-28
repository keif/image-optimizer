# Image Optimizer Standalone Binary

A single all-in-one binary that combines the Image Optimizer API and web interface into one executable. No external dependencies required - just download and run!

## Features

- Complete API server with all optimization endpoints
- Embedded Next.js web interface
- Single binary - no installation required
- Cross-platform support (macOS, Linux, Windows)
- Offline operation - no internet connection needed
- Built-in SQLite database for API key management
- Swagger API documentation

## Quick Start

1. Download the binary for your platform from the releases page
2. Run the binary:

```bash
# macOS/Linux
./image-optimizer-darwin-arm64

# Windows
image-optimizer-windows-amd64.exe
```

1. Open your browser to `http://localhost:3000`

That's it! The application is now running locally.

## Command-Line Options

```bash
# Run on a custom port
./image-optimizer --port 8080

# Show version information
./image-optimizer --version
```

## Default Settings

- **Port**: 3000
- **Database Location**: `~/.image-optimizer/data/api_keys.db` (or `./data/api_keys.db` if home directory is inaccessible)
- **API Documentation**: `http://localhost:3000/swagger/index.html`
- **Health Check**: `http://localhost:3000/health`

## API Endpoints

All API endpoints are available at the same origin as the web interface:

- `POST /optimize` - Optimize a single image
- `POST /pack-sprites` - Pack multiple images into a spritesheet
- `POST /optimize-spritesheet` - Optimize and repack an existing spritesheet
- `GET /health` - Health check endpoint
- `GET /swagger/*` - API documentation

## API Key Management

The standalone binary includes the same API key authentication as the main service. You can:

1. Create API keys through the web interface at `http://localhost:3000`
2. Manage keys via the API at `/api/keys`

For local development and testing, you can disable API key authentication by setting the `DISABLE_AUTH` environment variable:

```bash
DISABLE_AUTH=true ./image-optimizer
```

## Building from Source

To build the standalone binary yourself:

```bash
# From the project root
./scripts/build-standalone.sh
```

This will:

1. Build the Next.js frontend with static export
2. Embed the static files into the Go binary
3. Create binaries for all supported platforms

Binaries will be output to the `dist/` directory.

## Platform Support

The build script creates binaries for:

- macOS Intel (darwin/amd64)
- macOS Apple Silicon (darwin/arm64)
- Linux Intel (linux/amd64)
- Linux ARM (linux/arm64)
- Windows (windows/amd64)

## Limitations

- Cross-platform builds may have limitations due to SQLite's CGO requirements
- For best results, build on the target platform
- Some advanced features may require additional system libraries (libvips for certain image formats)

## Troubleshooting

### "Permission denied" on macOS/Linux

Make the binary executable:

```bash
chmod +x image-optimizer-*
```

### "App can't be opened" on macOS

macOS Gatekeeper may block unsigned binaries. Right-click the binary and select "Open" to bypass this, or remove the quarantine flag:

```bash
xattr -d com.apple.quarantine image-optimizer-darwin-arm64
```

### Port already in use

Use a different port:

```bash
./image-optimizer --port 8080
```

### Database location

The binary will try to create the database in:

1. `~/.image-optimizer/data/` (preferred)
2. `./data/` (fallback if home directory is inaccessible)

You can override this with the `DB_PATH` environment variable:

```bash
DB_PATH=/custom/path/api_keys.db ./image-optimizer
```

## Security Notes

- The standalone binary includes API key authentication by default
- For production deployments, consider using a reverse proxy (nginx, Caddy) with TLS
- The embedded frontend cannot be modified without rebuilding the binary
- Database file contains sensitive API key information - protect accordingly

## License

Same as the main Image Optimizer project - see LICENSE file in the project root.

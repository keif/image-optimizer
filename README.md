# Squish - Image Optimizer

An API-first image optimization service built with Go and Fiber. Squish is designed for local development with future expansion to a multi-user SaaS platform.

## Live Demo

**Try it now:** [https://sosquishy.io](https://sosquishy.io)

**API Endpoint:** `https://api.sosquishy.io`
- [Health Check](https://api.sosquishy.io/health)
- [API Documentation](https://api.sosquishy.io/swagger/index.html)

## Features

- **Image Optimization**: Resize, convert, and compress images
- **Modern Format Support**: AVIF, WebP, JPEG, PNG, and GIF with format-specific controls
- **Advanced Compression Options**: JPEG progressive encoding, PNG compression levels, WebP lossless, and more
- **Batch Processing**: Optimize multiple images in a single API request
- **Spritesheet Packer**: Pack multiple sprites into optimized spritesheets with MaxRects algorithm
  - Multiple output formats (JSON, CSS, CSV, XML, Unity, Godot)
  - Automatic packing with transparency trimming and padding control
  - Power-of-2 dimensions for GPU optimization
  - Multi-sheet atlas splitting for large sprite sets
- **Interactive Before/After Comparison**: Visual slider to compare original vs optimized images
- **Privacy First**: No server storage, in-memory processing only, zero tracking
- **RESTful API**: Clean HTTP endpoints for easy integration
- **OpenAPI/Swagger**: Interactive API documentation at `/swagger`
- **API Key Authentication**: Secure API access with SQLite-backed key management
- **Rate Limiting**: Configurable request limits to prevent abuse
- **CLI Tool**: Command-line interface for batch processing and automation
- **Containerized**: Docker-ready for consistent deployment
- **Performance**: Built with Go and Fiber for high throughput
- **Developer-Friendly**: Simple API design with JSON responses
- **Web UI**: Modern Next.js interface with drag-and-drop support

## Support This Project

If you find this tool useful, consider supporting its development and hosting costs! This is a free service that costs money to run. Your support helps keep it available for everyone.

**Ways to Support:**

- ☕ **[Buy Me a Coffee](https://buymeacoffee.com/keif)** - One-time donation
- 💖 **[GitHub Sponsors](https://github.com/sponsors/keif)** - Monthly support
- 🎉 **[Ko-fi](https://ko-fi.com/keif)** - One-time or monthly
- 💰 **[PayPal](https://paypal.me/keif)** - Direct donation

**Other Ways to Help:**
- ⭐ Star this repository
- 🐛 Report bugs and suggest features
- 📝 Improve documentation
- 🔀 Submit pull requests
- 📢 Share with others who might find it useful

Every contribution, no matter how small, is greatly appreciated and helps keep this project alive! 🙏

## Project Structure

```
image-optimizer/
├── api/
│   ├── main.go              # Application entry point
│   ├── routes/
│   │   ├── optimize.go      # Optimization endpoints
│   │   └── api_keys.go      # API key management
│   ├── services/
│   │   └── image_service.go # Image processing logic
│   ├── middleware/          # Rate limiting & auth
│   ├── db/                  # Database operations
│   ├── docs/                # Swagger documentation
│   ├── utils/               # Utility functions
│   └── tests/               # Test files
├── cli/
│   ├── imgopt.go            # CLI client
│   └── go.mod
├── web/                     # Next.js frontend
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── lib/                 # API client & types
│   └── Dockerfile
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

**For Local Development:**
- Go 1.24+ (required for dependencies)
- libvips 8.17+ (image processing library)
  - macOS: `brew install vips`
  - Ubuntu/Debian: `apt-get install libvips-dev`
  - Alpine Linux: `apk add vips-dev`

**For Docker Deployment:**
- Docker and Docker Compose (all dependencies included in container)
- Optional: Tilt for enhanced development experience (https://tilt.dev)

### Running Locally with Go

```bash
# Navigate to the api directory
cd api

# Install dependencies
go mod download

# Run the server
go run main.go
```

The API will be available at `http://localhost:8080`

### Running with Docker

The easiest way to run the entire stack (API + Web Frontend) is with Docker Compose:

```bash
# Build and start both services (API + Web)
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (resets database)
docker-compose down -v
```

**Access the application:**
- Web Interface: http://localhost:3000
- API Server: http://localhost:8080
- API Documentation: http://localhost:8080/swagger/index.html

**Note:** API key authentication is disabled by default in Docker for easy testing. To enable it, set `API_KEY_AUTH_ENABLED=true` in `docker-compose.yml` and create an API key using the `/api/keys` endpoint.

### Running with Tilt (Recommended for Development)

[Tilt](https://tilt.dev) provides an enhanced development experience with live reload, better observability, and streamlined workflows.

**Prerequisites:**
- Install Tilt: https://docs.tilt.dev/install.html
- Docker Desktop or compatible container runtime

**Start development environment:**
```bash
# Start Tilt (opens UI in browser automatically)
tilt up

# View logs in terminal instead
tilt up --stream

# Stop all services
tilt down
```

**Features:**
- **Live Reload**: Code changes automatically rebuild and reload services
- **Visual Dashboard**: Monitor all services at http://localhost:10350
- **One-Command Setup**: Starts both API and web services with dependencies
- **Manual Commands**: Run tests, linting, and coverage from the UI
- **Health Checks**: Automatic dependency management and health monitoring

**Available Actions** (via Tilt UI):
- `api-tests`: Run all API tests
- `api-lint`: Run Go vet linter
- `api-coverage`: Generate test coverage report

**Access the application:**
- Tilt UI: http://localhost:10350
- Web Interface: http://localhost:3000
- API Server: http://localhost:8080
- API Documentation: http://localhost:8080/swagger/index.html

## Deployment

### Frontend Deployment (GitHub Pages)

The frontend (Next.js static site) is deployed via **GitHub Pages**:

```bash
# Build the frontend
cd web
pnpm run build

# The build output is in web/out/
# Commit and push to trigger GitHub Pages deployment
git add .
git commit -m "Update frontend"
git push origin main
```

**Configuration:**
- Static export mode is configured in `web/next.config.js`
- GitHub Pages serves the `out/` directory after build
- Environment variables for API endpoint are configured at build time

**Production URL:** https://sosquishy.io

### Backend Deployment (Hetzner Cloud)

The backend API is deployed to **Hetzner Cloud VPS** (Ubuntu 22.04 with Caddy reverse proxy):

**For complete migration and deployment guide, see [HETZNER_MIGRATION.md](./HETZNER_MIGRATION.md)**

**Quick deployment:**

```bash
# Copy source to server (bimg requires CGO, so we build on server)
cd /Users/keif/projects/git/image-optimizer
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='web' \
  ./api/ root@sosquishy-server:/tmp/api-build/

# SSH and build on server (MUST build on Linux, not Mac!)
ssh sosquishy-server
cd /tmp/api-build
go build -v \
  -ldflags "-X main.version=$(git describe --tags --always 2>/dev/null || echo 'v0.1.0') -X main.commit=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown') -X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -o image-optimizer \
  main.go

# Verify it's a Linux binary
file image-optimizer
# Must show: "ELF 64-bit LSB executable, x86-64"

# Deploy
mv image-optimizer /usr/local/bin/image-optimizer
chmod +x /usr/local/bin/image-optimizer
rm -rf /tmp/api-build
systemctl restart image-optimizer

# Check status
systemctl status image-optimizer

# Check health (verify version info)
curl https://api.sosquishy.io/health | jq
```

**Production API:** https://api.sosquishy.io

**Migration notes:**
- Migrated from Fly.io due to memory limitations (OOM errors with large images)
- Hetzner CX22: 4GB RAM (vs Fly.io 2GB) at lower cost (~$6.50/month vs ~$12/month)

## CLI Tool

The `imgopt` CLI provides a convenient command-line interface for optimizing images locally. It calls the local API server, so make sure the API is running first.

### Building the CLI

```bash
cd cli
go build -o imgopt imgopt.go

# Optionally, install globally
sudo mv imgopt /usr/local/bin/
```

### CLI Usage

```bash
imgopt [options] <file1> [file2] [file3] ...
```

**Options:**
- `-quality <int>`: Quality level from 1-100 (default: 80)
- `-width <int>`: Target width in pixels (default: 0 = no resize)
- `-height <int>`: Target height in pixels (default: 0 = no resize)
- `-format <string>`: Output format (jpeg, png, webp, avif, gif)
- `-output <path>`: Output directory (default: same as input)
- `-api <url>`: API endpoint URL (default: http://localhost:8080/optimize)
- `-config <path>`: Path to config file (default: .imgoptrc or ~/.imgoptrc)
- `-v, -version`: Show version information
- `-h, -help`: Show help message

### Configuration File

Create a `.imgoptrc` file (YAML format) to set default values and reduce repetitive CLI flags:

**Search Order:**
1. Project directory (`./.imgoptrc`)
2. Home directory (`~/.imgoptrc`)
3. Custom path (via `-config` flag)

**Precedence:** Defaults < Config File < CLI Flags

**Example `.imgoptrc`:**
```yaml
quality: 85
format: "webp"
output: "optimized/"
api: "http://localhost:8080/optimize"
```

See [`cli/.imgoptrc.example`](cli/.imgoptrc.example) for a complete configuration template.

**Examples:**

```bash
# Basic optimization
imgopt photo.jpg

# Convert to WebP with custom quality
imgopt -quality=90 -format=webp photo.jpg

# Resize and optimize
imgopt -width=800 -height=600 photo.jpg

# Batch process multiple files
imgopt -format=webp *.jpg

# Save to specific output directory
imgopt -output=optimized/ photo1.jpg photo2.png photo3.gif

# Resize all images in a directory
imgopt -width=1920 -quality=85 ~/Photos/*.jpg

# Use custom config file
imgopt -config=project.imgoptrc *.jpg
```

**Output:**

The CLI creates optimized files with `-optimized` suffix in the filename:
- `photo.jpg` → `photo-optimized.webp` (if format specified)
- `image.png` → `image-optimized.png` (if no format change)

Optimized images are saved to:
- Same directory as the input file (default)
- Specified output directory (with `-output` flag)

**Example Output:**
```
Optimizing 3 file(s)...

[1/3] Processing photo1.jpg... ✓ Saved 74.91% (74.91% reduction, 32ms)
[2/3] Processing photo2.png... ✓ Saved 10.91% (10.91% reduction, 47ms)
[3/3] Processing photo3.jpg... ✓ Saved 83.35% (83.35% reduction, 9ms)

============================================================
Optimization Summary
============================================================
Files processed: 3
Successful: 3
Failed: 0

Total original size: 24.2 KB
Total optimized size: 6.7 KB
Total savings: 72.43%
Total processing time: 88ms
============================================================
```

## API Endpoints

### Interactive API Documentation

```bash
GET /swagger/*
```

View interactive Swagger/OpenAPI documentation at `http://localhost:8080/swagger/index.html`

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Optimize Image

```bash
POST /optimize?quality={1-100}&width={pixels}&height={pixels}&format={jpeg|png|webp|avif|gif}&returnImage={true|false}
Content-Type: multipart/form-data
```

**Form Parameters (provide one):**
- `image` (file): The image file to optimize via upload
- `url` (string): URL of the image to fetch and optimize

**Query Parameters (all optional):**
- `quality` (integer): Compression quality from 1-100 (default: 80)
  - Higher values = better quality, larger file size
  - Lower values = lower quality, smaller file size
- `width` (integer): Target width in pixels (default: original)
  - Set to 0 or omit to maintain original width
- `height` (integer): Target height in pixels (default: original)
  - Set to 0 or omit to maintain original height
  - Aspect ratio is preserved when resizing
- `format` (string): Target output format (default: original)
  - Supported: `jpeg`, `jpg`, `png`, `webp`, `avif`, `gif`
- `returnImage` (boolean): Return the optimized image file instead of JSON metadata (default: false)
  - `true`: Returns the optimized image with appropriate Content-Type header
  - `false`: Returns JSON metadata about the optimization
- `forceSRGB` (boolean): Force conversion to sRGB color space (default: false)

**Advanced JPEG Options:**
- `progressive` (boolean): Enable progressive JPEG encoding (loads gradually)
- `optimizeCoding` (boolean): Optimize Huffman tables for better compression
- `subsample` (integer): Chroma subsampling mode (0=auto, 1=4:4:4, 2=4:2:2, 3=4:2:0)
- `smooth` (integer): Smoothing factor 0-100 (blur to improve compression)

**Advanced PNG Options:**
- `compression` (integer): PNG compression level 0-9 (0=fastest, 9=best compression, default: 6)
- `interlace` (boolean): Enable interlaced/progressive PNG encoding
- `palette` (boolean): Enable palette mode (quantize to 256 colors for smaller files)
- `oxipngLevel` (integer): OxiPNG optimization level 0-6 (0=fastest, 6=best, default: 2, adds 15-40% extra compression)

**Advanced WebP Options:**
- `lossless` (boolean): Use lossless WebP encoding (perfect quality, larger files)
- `effort` (integer): Compression effort 0-6 (0=fastest, 6=best compression, default: 4)
- `webpMethod` (integer): Encoding method 0-6 (higher=better compression but slower)

**Supported Input Formats:**
- JPEG/JPG
- PNG
- WebP
- AVIF
- GIF

**Examples:**

**1. Basic optimization (returns JSON metadata):**
```bash
curl -X POST http://localhost:8080/optimize \
  -F "image=@/path/to/your/image.jpg"
```

**2. High-quality JPEG conversion:**
```bash
curl -X POST "http://localhost:8080/optimize?format=jpeg&quality=95" \
  -F "image=@/path/to/your/image.png"
```

**3. Resize and convert to WebP:**
```bash
curl -X POST "http://localhost:8080/optimize?width=800&height=600&format=webp&quality=85" \
  -F "image=@/path/to/your/image.jpg"
```

**4. Return optimized image file (not JSON):**
```bash
curl -X POST "http://localhost:8080/optimize?format=webp&quality=80&returnImage=true" \
  -F "image=@/path/to/your/image.jpg" \
  --output optimized.webp
```

**5. Fetch and optimize image from URL:**
```bash
curl -X POST "http://localhost:8080/optimize?format=webp" \
  -F "url=https://example.com/image.jpg"
```

**6. Fetch from URL and return optimized image:**
```bash
curl -X POST "http://localhost:8080/optimize?format=webp&returnImage=true" \
  -F "url=https://example.com/image.jpg" \
  --output optimized.webp
```

**7. Advanced JPEG optimization with progressive encoding and Huffman optimization:**
```bash
curl -X POST "http://localhost:8080/optimize?format=jpeg&quality=85&progressive=true&optimizeCoding=true" \
  -F "image=@photo.png"
```

**8. Maximum PNG compression with OxiPNG and palette mode:**
```bash
curl -X POST "http://localhost:8080/optimize?format=png&compression=9&palette=true&oxipngLevel=6" \
  -F "image=@screenshot.png"
```

**9. Lossless WebP with maximum effort:**
```bash
curl -X POST "http://localhost:8080/optimize?format=webp&lossless=true&effort=6" \
  -F "image=@graphic.png"
```

**10. Convert to AVIF for best compression (20-30% smaller than WebP):**
```bash
curl -X POST "http://localhost:8080/optimize?format=avif&quality=80" \
  -F "image=@photo.jpg"
```

**Response (when returnImage=false or omitted):**
```json
{
  "originalSize": 1024000,
  "optimizedSize": 665600,
  "format": "jpeg",
  "width": 1920,
  "height": 1080,
  "savings": "35.00%",
  "processingTime": "42ms"
}
```

**Response (when returnImage=true):**
Returns the optimized image file with appropriate `Content-Type` header (e.g., `image/webp`, `image/jpeg`, etc.) and `Content-Disposition: inline` header.

### Batch Optimize Images

```bash
POST /batch-optimize?quality={1-100}&width={pixels}&height={pixels}&format={jpeg|png|webp|avif|gif}
Content-Type: multipart/form-data
```

Optimize multiple images in a single request with the same settings. This endpoint is ideal for bulk processing workflows.

**Form Parameters:**
- `images` (files): Multiple image files to optimize (use the same field name for all files)

**Query Parameters:**
Same as the `/optimize` endpoint - all query parameters apply to every image in the batch.

**Examples:**

**1. Basic batch optimization:**
```bash
curl -X POST "http://localhost:8080/batch-optimize" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.png" \
  -F "images=@photo3.webp"
```

**2. Batch convert to WebP with custom quality:**
```bash
curl -X POST "http://localhost:8080/batch-optimize?format=webp&quality=85" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.png" \
  -F "images=@photo3.jpg"
```

**3. Batch resize and optimize:**
```bash
curl -X POST "http://localhost:8080/batch-optimize?width=800&height=600&quality=90" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

**Response:**
```json
{
  "results": [
    {
      "filename": "photo1.jpg",
      "success": true,
      "originalSize": 1024000,
      "optimizedSize": 665600,
      "format": "webp",
      "width": 1920,
      "height": 1080,
      "savings": "35.00%"
    },
    {
      "filename": "photo2.png",
      "success": true,
      "originalSize": 512000,
      "optimizedSize": 384000,
      "format": "webp",
      "width": 1280,
      "height": 720,
      "savings": "25.00%"
    },
    {
      "filename": "photo3.webp",
      "success": false,
      "error": "Invalid file type. Supported types: jpeg, jpg, png, webp, gif, avif"
    }
  ],
  "summary": {
    "total": 3,
    "successful": 2,
    "failed": 1,
    "totalOriginalSize": 1536000,
    "totalOptimizedSize": 1049600,
    "totalSavings": "31.67%",
    "processingTime": "156ms"
  }
}
```

**Key Features:**
- **Graceful Failure Handling**: Individual image failures don't stop the batch
- **Detailed Results**: Each image gets its own result object with success/failure status
- **Summary Statistics**: Aggregate metrics for the entire batch
- **Same Parameters**: All images processed with the same quality, format, and dimension settings

### Pack Sprites into Spritesheet

```bash
POST /pack-sprites?padding={pixels}&powerOfTwo={bool}&trimTransparency={bool}&maxWidth={pixels}&maxHeight={pixels}&outputFormats={formats}
Content-Type: multipart/form-data
```

Pack multiple sprite images into optimized spritesheets using the MaxRects bin packing algorithm.

**Form Parameters:**
- `images` (files): Multiple sprite image files to pack (required)

**Query Parameters (all optional):**
- `padding` (integer): Padding between sprites in pixels (default: 2)
  - Range: 0-32 pixels
  - Prevents texture bleeding in games
- `powerOfTwo` (boolean): Force power-of-2 dimensions like 256, 512, 1024, 2048 (default: false)
  - Recommended for GPU optimization
- `trimTransparency` (boolean): Remove transparent borders from sprites (default: false)
  - Saves space by trimming empty pixels
  - Original dimensions are preserved in metadata
- `maxWidth` (integer): Maximum sheet width in pixels (default: 2048)
  - Range: 256-8192 pixels
- `maxHeight` (integer): Maximum sheet height in pixels (default: 2048)
  - Range: 256-8192 pixels
- `outputFormats` (string): Comma-separated list of output formats (default: "json")
  - Available: `json`, `css`, `csv`, `xml`, `sparrow`, `texturepacker`, `cocos2d`, `unity`, `godot`

**Examples:**

**1. Basic sprite packing with JSON output:**
```bash
curl -X POST "http://localhost:8080/pack-sprites" \
  -F "images=@sprite1.png" \
  -F "images=@sprite2.png" \
  -F "images=@sprite3.png"
```

**2. Pack with padding and power-of-2 dimensions:**
```bash
curl -X POST "http://localhost:8080/pack-sprites?padding=4&powerOfTwo=true" \
  -F "images=@sprite1.png" \
  -F "images=@sprite2.png" \
  -F "images=@sprite3.png"
```

**3. Pack with transparency trimming and multiple output formats:**
```bash
curl -X POST "http://localhost:8080/pack-sprites?trimTransparency=true&outputFormats=json,sparrow,unity" \
  -F "images=@sprite1.png" \
  -F "images=@sprite2.png"
```

**4. Pack large sprite set with custom dimensions:**
```bash
curl -X POST "http://localhost:8080/pack-sprites?maxWidth=4096&maxHeight=4096&padding=8" \
  -F "images=@*.png"
```

**Response:**
```json
{
  "sheets": [
    "iVBORw0KGgoAAAANSUhEUgAA..."  // Base64-encoded PNG
  ],
  "metadata": [
    {
      "index": 0,
      "width": 512,
      "height": 512,
      "spriteCount": 24,
      "efficiency": 0.87
    }
  ],
  "outputFiles": {
    "json": "{ \"frames\": { ... } }",
    "css": ".sprite-1 { background-position: 0px 0px; ... }",
    "unity": "fileFormatVersion: 2\nguid: ...\n..."
  },
  "totalSprites": 24
}
```

**Response Fields:**
- `sheets`: Array of base64-encoded PNG images (one or more if split)
- `metadata`: Information about each sheet (dimensions, sprite count, packing efficiency)
- `outputFiles`: Sprite coordinate data in requested formats
- `totalSprites`: Total number of sprites packed

**Output Format Details:**

- **JSON**: Generic format with sprite names, positions, and dimensions
- **CSS**: CSS classes with `background-position` for web sprites
- **CSV**: Comma-separated values (name, x, y, width, height)
- **XML**: Generic XML format for sprite coordinates
- **Sparrow**: Sparrow/Starling XML format with frame offsets (HaxeFlixel, Friday Night Funkin')
- **TexturePacker**: TexturePacker Generic XML format with trim offsets
- **Cocos2d**: Cocos2d plist format (Apple Property List XML)
- **Unity**: Unity TextureImporter metadata format (`.meta`)
- **Godot**: Godot Engine AtlasTexture resource format (`.tres`)

**Web UI:**

Visit `/spritesheet` on the web interface for a visual drag-and-drop sprite packer with:
- Multi-file upload with preview
- Interactive configuration controls
- Real-time sheet preview
- Download packed sheets and coordinate files

**Key Features:**
- **MaxRects Algorithm**: Industry-standard bin packing with Best Short Side Fit heuristic
- **High Efficiency**: Typically achieves 85-95% space utilization
- **Atlas Splitting**: Automatically creates multiple sheets if sprites exceed max dimensions
- **Transparency Trimming**: Removes transparent borders while preserving original dimensions in metadata
- **Multi-Format Export**: Generate all output formats in a single API call
- **GPU Optimization**: Power-of-2 dimensions for optimal GPU texture performance

### API Key Management

All API key management endpoints require authentication (except the initial key creation for bootstrapping).

#### Create API Key

```bash
POST /api/keys
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My API Key"
}
```

**Response:**
```json
{
  "id": 1,
  "key": "sk_abc123...",
  "name": "My API Key",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Important:** Save the API key value immediately - it won't be shown again!

#### List API Keys

```bash
GET /api/keys
Authorization: Bearer sk_your_api_key
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "My API Key",
    "created_at": "2025-01-15T10:30:00Z",
    "revoked_at": null
  },
  {
    "id": 2,
    "name": "Production Key",
    "created_at": "2025-01-15T11:00:00Z",
    "revoked_at": "2025-01-16T09:00:00Z"
  }
]
```

Note: For security, the actual key values are not returned in list responses.

#### Revoke API Key

```bash
DELETE /api/keys/:id
Authorization: Bearer sk_your_api_key
```

**Response:**
```json
{
  "message": "API key revoked successfully"
}
```

### Using API Keys

Include your API key in the `Authorization` header for all protected endpoints:

```bash
# Using Bearer token format (recommended)
curl -X POST "http://localhost:8080/optimize?format=webp" \
  -H "Authorization: Bearer sk_your_api_key_here" \
  -F "image=@photo.jpg"

# Direct key format (also supported)
curl -X POST "http://localhost:8080/optimize?format=webp" \
  -H "Authorization: sk_your_api_key_here" \
  -F "image=@photo.jpg"
```

**Bypassed Endpoints** (no API key required):
- `/health` - Health check (all methods)
- `/swagger/*` - API documentation (all methods)
- `/optimize` - Image optimization (all methods, for public web UI access)
- `/batch-optimize` - Batch optimization (all methods, for public web UI access)
- `POST /api/keys` - API key creation only (for bootstrapping)
  - **Note**: `GET /api/keys` (list) and `DELETE /api/keys/:id` (revoke) require authentication

## Configuration

The service can be configured using environment variables. See `.env.example` for all available options.

### Key Configuration Options

**Server:**
- `PORT`: Server port (default: 8080)

**Database:**
- `DB_PATH`: Path to SQLite database (default: ./data/api_keys.db)

**Rate Limiting:**
- `RATE_LIMIT_ENABLED`: Enable/disable rate limiting (default: true)
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 100)
- `RATE_LIMIT_WINDOW`: Time window for rate limiting (default: 1m)

**API Key Authentication:**
- `API_KEY_AUTH_ENABLED`: Enable/disable API key auth (default: true)

**URL Fetching:**
- `ALLOWED_DOMAINS`: Comma-separated list of allowed domains for URL fetching
  - Default includes: cloudinary.com, imgur.com, unsplash.com, pexels.com, localhost, 127.0.0.1
  - Leave empty to allow all domains (not recommended for production)

**Example .env file:**
```bash
PORT=8080
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m
API_KEY_AUTH_ENABLED=true
ALLOWED_DOMAINS=cloudinary.com,imgur.com,example.com
```

## Development

### Building the Binary

```bash
cd api
go build -o image-optimizer
./image-optimizer
```

### Running Tests

The project includes comprehensive unit and integration tests with high code coverage.

**Run all tests:**
```bash
cd api
go test -v ./...
```

**Run tests with coverage:**
```bash
cd api
go test -v -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```

**Generate HTML coverage report:**
```bash
cd api
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
# Open coverage.html in your browser
```

**Run tests with race detector:**
```bash
cd api
go test -v -race ./...
```

**Test specific packages:**
```bash
# Test only services
cd api
go test -v ./services/

# Test only routes
cd api
go test -v ./routes/
```

**Current Test Coverage:**
- **Services**: 84.4% coverage
- **Routes**: 69.8% coverage
- **Middleware**: Security and auth testing
- **Total Tests**: 35 tests passing

**Test Structure:**
```
api/
├── middleware/
│   └── api_key_test.go           # Security and auth middleware tests
├── services/
│   └── image_service_test.go    # Unit tests for image processing
├── routes/
│   └── optimize_test.go          # Integration tests for API endpoints
└── tests/
    └── fixtures/                 # Test image fixtures
        ├── test-100x100.jpg
        ├── test-200x150.png
        └── test-50x50.webp
```

### Continuous Integration

The project uses GitHub Actions for automated testing on every push and pull request.

**CI Pipeline includes:**
- ✅ Unit and integration tests
- ✅ Race condition detection
- ✅ Test coverage reporting
- ✅ Binary compilation (API + CLI)
- ✅ Docker image building

View the workflow at `.github/workflows/test.yml`

## Roadmap

### Phase 2: Core Functionality ✅ COMPLETED
- [x] Implement real image optimization using `bimg` (libvips)
- [x] Add support for custom dimensions and quality settings
- [x] Add support for format conversion (JPEG, PNG, WebP, AVIF, GIF)
- [x] Implement URL-based image fetching with security controls
- [x] Return optimized image file (not just metadata)
- [x] Add batch processing endpoint

### Phase 3: CLI & Tools ✅ COMPLETED
- [x] Build CLI client (`imgopt`) for local image optimization
- [x] Implement progress tracking for batch operations
- [x] Add configuration file support (.imgoptrc)

### Phase 4: Testing & Quality ✅ COMPLETED
- [x] Unit tests for image service (84.4% coverage)
- [x] Integration tests for API endpoints (69.8% coverage)
- [x] Test fixtures and sample images
- [x] Test coverage reporting
- [x] GitHub Actions CI/CD pipeline

### Phase 5: API Enhancement ✅ COMPLETED
- [x] OpenAPI/Swagger documentation
- [x] API key authentication
- [x] Rate limiting
- [ ] Usage metrics and analytics (deferred to Phase 5.1)

### Phase 6: Web Interface ✅ COMPLETED
- [x] Next.js frontend for drag-and-drop optimization
- [x] TypeScript API client with full type safety
- [x] Responsive UI with dark mode
- [x] Real-time optimization preview
- [x] Interactive before/after image comparison with slider
- [x] Side-by-side comparison mode
- [x] Zoom and pan functionality for detailed inspection
- [x] Shareable results with Web Share API
- [x] Docker support for full-stack deployment
- [ ] User dashboard (deferred to Phase 6.1)
- [ ] Optimization history (deferred to Phase 6.1)

### Phase 7: SaaS Features
- [ ] User authentication and authorization
- [ ] Multi-tenant support
- [ ] Subscription management
- [ ] Cloud storage integration (S3, GCS)

## Tech Stack

- **Backend**: Go 1.24, Fiber v2
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Image Processing**: bimg (libvips wrapper), libvips 8.17+
- **Database**: SQLite (with migration path to PostgreSQL)
- **Containerization**: Docker, Docker Compose
- **Deployment**: Hetzner Cloud VPS (API), GitHub Pages (Frontend)
- **Future**: PostgreSQL, Redis, User authentication

## Features in Detail

### Real-time Image Optimization
- **libvips-powered**: Uses libvips through bimg for blazing-fast image processing
- **Format conversion**: Convert between JPEG, PNG, WebP, AVIF, and GIF
- **Quality control**: Adjustable compression quality (1-100)
- **Advanced compression**: Format-specific options for fine-tuned optimization
  - **JPEG**: Progressive encoding, Huffman optimization, chroma subsampling, smoothing
  - **PNG**: Compression levels (0-9), interlacing, palette mode (256 colors), **OxiPNG post-processing (15-40% extra savings)**
  - **WebP**: Lossless mode, compression effort (0-6), encoding method (0-6)
  - **AVIF**: Next-generation format with 20-30% better compression than WebP
- **Smart resizing**: Maintains aspect ratio while resizing
- **Metadata stripping**: Removes EXIF data to reduce file size
- **Color space management**: sRGB conversion for maximum compatibility
- **Real-time metrics**: Get instant feedback on file size savings

### Interactive Before/After Comparison
- **Draggable Slider**: Drag a handle to reveal differences between original and optimized images
- **Side-by-Side View**: Compare images in a split-screen layout
- **Zoom & Pan**: Inspect images up to 4x magnification with pan support
- **Metric Overlays**: Real-time display of savings, file sizes, and processing time
- **Shareable Results**: Share optimization results via Web Share API or clipboard
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatic theme detection and manual toggle

### URL-Based Image Fetching
- **Flexible input**: Fetch images from URLs or upload files
- **Security controls**: Built-in protection against abuse
- **Timeout handling**: 10-second timeout for URL fetches
- **Size limits**: 10MB maximum file size for both uploads and URL fetches

### Privacy-First Architecture
- **Zero Storage**: Images are processed entirely in-memory and never written to disk
- **Ephemeral Processing**: Automatic cleanup after each request via Go's garbage collector
- **No Tracking**: No analytics, cookies, or personal data collection
- **No History**: Completely stateless - no optimization logs or user activity tracking
- **GDPR Compliant**: No personal data retention means no compliance burden
- **Open Source**: Full transparency - review the code to verify privacy claims

## Security

The API includes comprehensive security controls to protect against abuse and unauthorized access.

### Security Features

1. **API Key Authentication** ✅
   - SQLite-backed key storage with secure random generation
   - Bearer token support in Authorization header
   - Revocable keys with audit trail (created_at, revoked_at)
   - **Secure by default**: Requires API keys for all optimization endpoints
   - **Public Access Mode**: Configurable via `PUBLIC_OPTIMIZATION_ENABLED` for public web UIs
   - Method-specific bypass rules (only POST /api/keys allows bootstrap, GET/DELETE require auth)
   - Configurable via `API_KEY_AUTH_ENABLED` environment variable

   **Configuration Options:**
   - **Private/Self-hosted** (default, most secure):
     ```bash
     API_KEY_AUTH_ENABLED=true
     PUBLIC_OPTIMIZATION_ENABLED=false  # Requires API keys
     ```
   - **Public Website** (like sosquishy.io):
     ```bash
     API_KEY_AUTH_ENABLED=true
     PUBLIC_OPTIMIZATION_ENABLED=true   # Public web UI access
     RATE_LIMIT_ENABLED=true            # Prevent abuse
     ```
   - **Local Development**:
     ```bash
     API_KEY_AUTH_ENABLED=false         # Easy testing
     ```

2. **Rate Limiting** ✅
   - In-memory sliding window rate limiter
   - Default: 100 requests per minute per IP
   - Configurable limits via environment variables
   - Returns HTTP 429 when limits exceeded
   - Disable for development with `RATE_LIMIT_ENABLED=false`

3. **Domain Whitelist for URL Fetching** ✅
   - Default safe list: cloudinary.com, imgur.com, unsplash.com, pexels.com, localhost
   - Configurable via `ALLOWED_DOMAINS` environment variable
   - Wildcard subdomain matching (e.g., "example.com" matches "cdn.example.com")
   - Empty list allows all domains (development mode only)

4. **Size Limits**
   - Maximum 10MB for uploaded files and URL fetches
   - Prevents memory exhaustion attacks
   - Configurable in source code (`maxImageSize` constant)

5. **Request Timeouts**
   - 10-second timeout for URL fetches
   - Prevents hanging connections
   - Protects against slow-loris style attacks

6. **Input Validation**
   - URL format validation
   - File type validation (JPEG, PNG, WebP, AVIF, GIF only)
   - Parameter range checking (quality 1-100, dimensions > 0)
   - Strict content-type validation

### Production Security Checklist

For production deployments:

**Required (Essential):**
- ✅ **Enable API key authentication** (`API_KEY_AUTH_ENABLED=true`)
- ✅ **Configure public access mode** (`PUBLIC_OPTIMIZATION_ENABLED=true` for public sites, `false` for private)
- ✅ **Configure rate limiting** (adjust `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW`)
- ✅ **Set domain whitelist** (specify allowed domains in `ALLOWED_DOMAINS`)

**Recommended (Additional Protection):**
- ⚠️ **Use HTTPS** (configure TLS or deploy behind reverse proxy)
- ⚠️ **Deploy behind reverse proxy** (nginx, Caddy, Traefik for additional protection)
- ⚠️ **Regular security audits** (review API keys, monitor rate limit violations)
- ⚠️ **Database backups** (backup SQLite database regularly)
- ⚠️ **Monitor logs** (track failed auth attempts, rate limit hits)

**Deployment Types:**

| Use Case | API_KEY_AUTH_ENABLED | PUBLIC_OPTIMIZATION_ENABLED | Notes |
|----------|---------------------|----------------------------|-------|
| Public website (sosquishy.io) | `true` | `true` | Web UI works, rate limiting protects API |
| Private/Self-hosted | `true` | `false` | Most secure, all requests need API keys |
| Local development | `false` | `true` | Easy testing, no security |

## License

MIT

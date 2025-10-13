# Image Optimizer

An API-first image optimization service built with Go and Fiber. Designed for local development with future expansion to a multi-user SaaS platform.

## Features

- **Image Optimization**: Resize, convert, and compress images
- **RESTful API**: Clean HTTP endpoints for easy integration
- **OpenAPI/Swagger**: Interactive API documentation at `/swagger`
- **API Key Authentication**: Secure API access with SQLite-backed key management
- **Rate Limiting**: Configurable request limits to prevent abuse
- **CLI Tool**: Command-line interface for batch processing and automation
- **Containerized**: Docker-ready for consistent deployment
- **Performance**: Built with Go and Fiber for high throughput
- **Developer-Friendly**: Simple API design with JSON responses

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
- Go 1.23+
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
- `-format <string>`: Output format (jpeg, png, webp, gif)
- `-output <path>`: Output directory (default: same as input)
- `-api <url>`: API endpoint URL (default: http://localhost:8080/optimize)
- `-v, -version`: Show version information
- `-h, -help`: Show help message

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
POST /optimize?quality={1-100}&width={pixels}&height={pixels}&format={jpeg|png|webp|gif}&returnImage={true|false}
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
  - Supported: `jpeg`, `jpg`, `png`, `webp`, `gif`
- `returnImage` (boolean): Return the optimized image file instead of JSON metadata (default: false)
  - `true`: Returns the optimized image with appropriate Content-Type header
  - `false`: Returns JSON metadata about the optimization

**Supported Input Formats:**
- JPEG/JPG
- PNG
- WebP
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
- `/health` - Health check
- `/swagger/*` - API documentation
- `/api/keys` - API key creation (for bootstrapping)

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
- **Total Tests**: 23 tests passing

**Test Structure:**
```
api/
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
- [x] Add support for format conversion (JPEG, PNG, WebP, GIF)
- [x] Implement URL-based image fetching with security controls
- [x] Return optimized image file (not just metadata)
- [ ] Add batch processing endpoint

### Phase 3: CLI & Tools ✅ COMPLETED
- [x] Build CLI client (`imgopt`) for local image optimization
- [x] Implement progress tracking for batch operations
- [ ] Add configuration file support (.imgoptrc)

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
- [x] Docker support for full-stack deployment
- [ ] User dashboard (deferred to Phase 6.1)
- [ ] Optimization history (deferred to Phase 6.1)

### Phase 7: SaaS Features
- [ ] User authentication and authorization
- [ ] Multi-tenant support
- [ ] Subscription management
- [ ] Cloud storage integration (S3, GCS)

## Tech Stack

- **Backend**: Go 1.23, Fiber v2
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Image Processing**: bimg (libvips wrapper), libvips 8.17+
- **Database**: SQLite (with migration path to PostgreSQL)
- **Containerization**: Docker, Docker Compose
- **Future**: PostgreSQL, Redis, User authentication

## Features in Detail

### Real-time Image Optimization
- **libvips-powered**: Uses libvips through bimg for blazing-fast image processing
- **Format conversion**: Convert between JPEG, PNG, WebP, and GIF
- **Quality control**: Adjustable compression quality (1-100)
- **Smart resizing**: Maintains aspect ratio while resizing
- **Metadata stripping**: Removes EXIF data to reduce file size
- **Real-time metrics**: Get instant feedback on file size savings

### URL-Based Image Fetching
- **Flexible input**: Fetch images from URLs or upload files
- **Security controls**: Built-in protection against abuse
- **Timeout handling**: 10-second timeout for URL fetches
- **Size limits**: 10MB maximum file size for both uploads and URL fetches

## Security

The API includes comprehensive security controls to protect against abuse and unauthorized access.

### Security Features

1. **API Key Authentication** ✅
   - SQLite-backed key storage with secure random generation
   - Bearer token support in Authorization header
   - Revocable keys with audit trail (created_at, revoked_at)
   - Configurable via `API_KEY_AUTH_ENABLED` environment variable

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
   - File type validation (JPEG, PNG, WebP, GIF only)
   - Parameter range checking (quality 1-100, dimensions > 0)
   - Strict content-type validation

### Production Security Checklist

For production deployments:

- ✅ **Enable API key authentication** (`API_KEY_AUTH_ENABLED=true`)
- ✅ **Configure rate limiting** (adjust `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW`)
- ✅ **Set domain whitelist** (specify allowed domains in `ALLOWED_DOMAINS`)
- ⚠️ **Use HTTPS** (configure TLS or deploy behind reverse proxy)
- ⚠️ **Deploy behind reverse proxy** (nginx, Caddy, Traefik for additional protection)
- ⚠️ **Regular security audits** (review API keys, monitor rate limit violations)
- ⚠️ **Database backups** (backup SQLite database regularly)
- ⚠️ **Monitor logs** (track failed auth attempts, rate limit hits)

## License

MIT

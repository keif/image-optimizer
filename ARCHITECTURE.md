# Squish Architecture Documentation

## Overview

Squish is a modern image optimization service with three deployment modes:

1. **API Server** - Standalone HTTP API with Swagger docs
2. **Web Application** - Next.js frontend with integrated API
3. **CLI Tool** - Command-line interface for batch processing

## System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Deployment Modes                         │
├──────────────┬──────────────────┬──────────────────────────┤
│   API Only   │   Standalone     │         CLI              │
│   (Server)   │  (API + Web UI)  │    (Command Line)        │
└──────────────┴──────────────────┴──────────────────────────┘
       │               │                      │
       ▼               ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core Services                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Image Proc  │  │ Sprite Pack  │  │  Rate Limiting   │  │
│  │  (libvips)  │  │  (MaxRects)  │  │  (In-Memory)     │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Metrics    │  │   API Keys   │  │   Validation     │  │
│  │  (SQLite)   │  │   (SQLite)   │  │   (Fiber)        │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```text
image-optimizer/
├── api/                      # Go API server
│   ├── main.go              # API entry point
│   ├── routes/              # HTTP route handlers
│   ├── services/            # Business logic
│   ├── middleware/          # Rate limiting, auth, CORS
│   ├── db/                  # Database operations
│   ├── utils/               # Helper functions
│   ├── docs/                # Swagger generated docs
│   └── tests/               # API tests
│
├── web/                      # Next.js web application
│   ├── app/                 # Next.js 14 App Router
│   │   ├── page.tsx        # Home page (optimizer)
│   │   ├── spritesheet/    # Sprite packer page
│   │   ├── articles/       # Educational content
│   │   ├── feedback/       # GitHub issues integration
│   │   └── api/            # Next.js API routes
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities
│   └── public/             # Static assets
│
├── cli/                     # Command-line tool
│   └── main.go             # CLI entry point
│
├── cmd/                     # Additional commands
│   └── standalone/         # All-in-one binary
│       └── main.go         # Embedded web + API
│
├── scripts/                 # Build and deploy scripts
├── .github/workflows/       # CI/CD pipelines
└── docker-compose.yml       # Local development setup
```

## Technology Stack

### Backend (API)

- **Language**: Go 1.23+
- **Framework**: Fiber v2 (HTTP framework)
- **Image Processing**: libvips (via h2non/bimg)
- **Database**: SQLite (for metrics and API keys)
- **API Documentation**: Swagger/OpenAPI (swaggo)
- **Authentication**: API key bearer tokens
- **Rate Limiting**: In-memory sliding window

### Frontend (Web)

- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Build Target**: Static export (for standalone mode)
- **Components**:
  - File upload (react-dropzone)
  - Image comparison (react-compare-slider)
  - Zoom/pan (react-zoom-pan-pinch)

### CLI

- **Language**: Go 1.23+
- **Build**: Pure Go binary (CGO disabled)
- **Features**: Batch processing, directory watching

### Infrastructure

- **Container**: Docker with multi-stage builds
- **Orchestration**: Docker Compose (dev), Tilt (hot-reload)
- **Deployment**: Hetzner Cloud (production)
- **CI/CD**: GitHub Actions
- **Release**: Multi-platform binaries (macOS, Linux, Windows)

## Core Components

### 1. Image Processing Service

**Location**: `api/services/image_service.go`

**Responsibilities**:

- Image format conversion (JPEG, PNG, WebP, AVIF, GIF)
- Resizing with aspect ratio preservation
- Compression with format-specific options
- Metadata extraction
- Quality optimization

**Key Functions**:

```go
OptimizeImage(imageData []byte, options OptimizationOptions) (*OptimizedImage, error)
BatchOptimize(images []ImageInput) ([]OptimizedImage, error)
```

**Dependencies**:

- libvips (C library) via CGO
- Image format encoders (JPEG, PNG, WebP, AVIF)

**Performance**:

- In-memory processing (no disk I/O)
- Streaming for large files
- Concurrent batch processing

### 2. Spritesheet Packer

**Location**: `api/services/spritesheet_service.go`

**Algorithm**: MaxRects (Maximum Rectangles)

- Bin packing algorithm for optimal space usage
- Multiple heuristics (Best Short Side Fit, Best Long Side Fit, etc.)
- Automatic atlas splitting for oversized sheets

**Features**:

- Transparency trimming
- Padding/spacing control
- Power-of-2 dimensions (GPU optimization)
- Multiple output formats (JSON, CSS, XML, Unity, Godot)

**Output Formats**:

- **JSON**: Frame data for JavaScript/web games
- **CSS**: Background position sprites
- **CSV**: Data interchange
- **XML**: Generic metadata
- **Unity**: TextureImporter metadata
- **Godot**: AtlasTexture resources

### 3. Rate Limiting Middleware

**Location**: `api/middleware/rate_limiter.go`

**Implementation**: Sliding window algorithm

- Per-IP tracking
- In-memory store (map with mutex)
- Configurable limits and windows
- Automatic cleanup of expired entries

**Configuration**:

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m
```

**Bypass**: Health checks, Swagger docs, bootstrap endpoints

### 4. API Key Authentication

**Location**: `api/middleware/api_key_auth.go`

**Features**:

- SQLite-backed key storage
- Secure random key generation (32 bytes, base64)
- Bearer token authentication
- Optional: Public optimization endpoints
- Trusted origins for CORS

**Database Schema**:

```sql
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    name TEXT,
    created_at DATETIME,
    revoked_at DATETIME
);
```

**Endpoints**:

- `POST /api/keys` - Create new key
- `GET /api/keys` - List all keys
- `GET /api/keys/:id` - Get specific key
- `DELETE /api/keys/:id` - Revoke key

### 5. Metrics & Analytics

**Location**: `api/services/metrics_service.go`

**Storage**: SQLite with time-series aggregation

**Tracked Metrics**:

- Request counts
- Processing times
- File sizes (before/after)
- Compression ratios
- Error rates
- Format usage

**Database Schema**:

```sql
CREATE TABLE metrics (
    timestamp DATETIME,
    metric_type TEXT,
    metric_value REAL,
    metadata TEXT
);
```

**Aggregation**: Hourly, daily, weekly rollups

### 6. Web UI Components

**Key Components**:

#### Home Page (`web/app/page.tsx`)

- Drag-and-drop file upload
- Image preview with zoom/pan
- Before/after comparison slider
- Format selection and quality controls
- Batch optimization queue

#### Spritesheet Packer (`web/app/spritesheet/page.tsx`)

- Multi-file sprite upload
- Visual packing preview
- Output format selection
- Download packed atlas + metadata

#### Articles (`web/app/articles/`)

- Educational content on image optimization
- Best practices guides
- Format comparisons
- Performance tips

#### Feedback (`web/app/feedback/`)

- GitHub Issues integration
- Feature requests
- Bug reports
- Community voting (👍 reactions)

## Data Flow

### Image Optimization Request

```text
User Upload
    │
    ▼
┌─────────────────┐
│  Web UI/CLI     │ (File validation, format detection)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  API Endpoint   │ POST /api/optimize
│  (Rate Limit)   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Image Service  │ (Load, process, compress)
│  (libvips)      │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Response       │ (Optimized image + metadata)
└─────────────────┘
    │
    ▼
User Download
```

### Spritesheet Packing Request

```text
Multiple Images
    │
    ▼
┌─────────────────┐
│  Upload Queue   │ (Validate, extract dimensions)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Packing Service │ (MaxRects algorithm)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Atlas Generator │ (Composite image)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Metadata Export │ (JSON/CSS/XML/etc)
└─────────────────┘
    │
    ▼
Download ZIP (atlas + metadata)
```

## Deployment Modes

### 1. API Server Only

**Use Case**: Microservice architecture, headless API

**Deployment**:

```bash
# Docker
docker run -p 8080:8080 squish-api

# Binary
./image-optimizer-server-linux-amd64 --port 8080
```

**Features**:

- Swagger UI at `/swagger/index.html`
- Health check at `/health`
- All API endpoints
- No web interface

### 2. Standalone (API + Web)

**Use Case**: Complete self-hosted solution

**Deployment**:

```bash
# Download standalone binary
./image-optimizer-standalone-macos-arm64

# Or use Docker Compose
docker-compose up -d
```

**Features**:

- Embedded Next.js frontend
- Full web UI at `http://localhost:3000`
- API at `http://localhost:8080`
- Single binary deployment

**Technical Details**:

- Web assets embedded with Go `embed` directive
- Static Next.js export served from memory
- Zero external dependencies (except libvips system lib)

### 3. CLI Tool

**Use Case**: Automation, CI/CD pipelines, batch processing

**Usage**:

```bash
# Single file
imgopt --input image.jpg --output optimized.jpg --quality 85

# Directory
imgopt --dir ./images --format webp --quality 80

# Batch with config
imgopt --config optimize.json
```

**Features**:

- Parallel processing
- Progress bars
- Format conversion
- Recursive directory walking
- JSON configuration

## Security

### Authentication

- **API Keys**: Bearer token authentication
- **Public Endpoints**: Optional for web UI access
- **Trusted Origins**: CORS whitelist

### Rate Limiting

- **Per-IP tracking**: Prevents abuse
- **Sliding window**: Fair usage across time
- **Configurable limits**: Adjust for load

### Data Privacy

- **No persistent storage**: All processing in-memory
- **No logging of images**: Zero data retention
- **No tracking**: No analytics or telemetry
- **Temporary processing**: Files discarded after response

### Input Validation

- **File type checking**: Magic number validation
- **Size limits**: Configurable max file size
- **Format whitelisting**: Only supported formats
- **Dimension limits**: Prevent resource exhaustion

## Configuration

### Environment Variables

```env
# Server
PORT=8080

# Database
DB_PATH=/app/data/api_keys.db

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m

# Authentication
API_KEY_AUTH_ENABLED=false
PUBLIC_OPTIMIZATION_ENABLED=true

# Security
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8080
ALLOWED_DOMAINS=cloudinary.com,imgur.com,unsplash.com,pexels.com,localhost

# Performance
MAX_UPLOAD_SIZE=50MB
WORKER_POOL_SIZE=10
```

### Docker Compose Configuration

**Key Features**:

- Health checks with retry logic
- Volume persistence for database
- Network isolation
- Restart policies
- Resource limits

## Development Workflow

### Local Development with Tilt

**Requirements**:

- Docker Desktop
- Tilt (v0.34.2+)
- Go 1.23+
- Node.js 20+
- pnpm

**Setup**:

```bash
# Start development environment
tilt up

# Services available at:
# - API: http://localhost:8080
# - Web: http://localhost:3000
# - Tilt UI: http://localhost:10350
```

**Features**:

- Hot reload for both API and web
- Live log streaming
- Manual test/lint commands
- Health check monitoring

### Testing

**API Tests**:

```bash
cd api
go test ./...
go test -coverprofile=coverage.out ./...
```

**Linting**:

```bash
# Go
cd api && go vet ./...

# Web
cd web && pnpm lint
```

**Integration Tests**:

```bash
# Start services
docker-compose up -d

# Run tests
./scripts/integration-test.sh
```

## CI/CD Pipeline

### GitHub Actions Workflows

**1. Test** (`.github/workflows/test.yml`)

- Run on every push
- Execute Go tests
- Code coverage reporting

**2. Lint** (`.github/workflows/lint.yml`)

- Go vet
- ESLint for web
- Markdown linting

**3. Release** (`.github/workflows/release.yml`)

- Triggered by version tags (v*)
- Build multi-platform binaries:
  - Standalone (macOS Intel/ARM, Linux, Windows)
  - CLI (all platforms)
  - API Server (all platforms)
- Generate SHA256 checksums
- Create GitHub Release with artifacts

**4. Deploy API** (`.github/workflows/deploy-api-hetzner.yml`)

- Deploy to Hetzner Cloud
- Update running containers
- Health check verification

### Release Process

```bash
# 1. Tag release
git tag v0.1.1
git push origin v0.1.1

# 2. GitHub Actions builds:
#    - 12 binaries (3 types × 4 platforms)
#    - SHA256SUMS.txt
#    - Auto-generated release notes

# 3. Artifacts available at:
#    https://github.com/keif/image-optimizer/releases
```

## Performance Considerations

### Image Processing

- **libvips**: Fast C library with streaming
- **In-memory**: No disk I/O
- **Concurrent**: Worker pool for batch processing
- **Streaming**: Large file support

### Rate Limiting

- **In-memory map**: Fast lookups
- **Mutex protection**: Thread-safe
- **Periodic cleanup**: Prevent memory leaks

### Database

- **SQLite**: Embedded, no network overhead
- **Connection pooling**: Reuse connections
- **Indexes**: Optimized queries
- **Aggregation**: Pre-computed rollups

### Frontend

- **Static export**: Fast CDN delivery
- **Code splitting**: Lazy loaded routes
- **Image optimization**: Next.js Image component
- **Caching**: Aggressive browser caching

## Monitoring & Observability

### Health Checks

- **Endpoint**: `GET /health`
- **Checks**: Database connectivity, disk space
- **Response**: JSON status + uptime

### Metrics

- **Request latency**: p50, p95, p99
- **Error rates**: 4xx, 5xx by endpoint
- **Resource usage**: Memory, CPU
- **Business metrics**: Optimization counts, compression ratios

### Logging

- **Structured**: JSON logs
- **Levels**: Debug, Info, Warn, Error
- **Context**: Request ID, user agent
- **No PII**: Privacy-preserving

## Future Enhancements

### Planned Features

1. **Video optimization**: MP4, WebM compression
2. **PDF optimization**: Compress embedded images
3. **Batch API**: Process multiple files in single request
4. **Webhooks**: Async processing notifications
5. **Cloud storage**: S3/GCS integration
6. **CDN integration**: Cloudflare, Fastly
7. **User accounts**: Multi-tenant SaaS mode

### Scalability

- **Horizontal scaling**: Stateless API servers
- **Load balancing**: Round-robin, least connections
- **Caching layer**: Redis for rate limiting
- **Queue system**: RabbitMQ/SQS for async jobs
- **Object storage**: S3 for persistent storage

## Troubleshooting

### Common Issues

#### 1. Tilt shows "Updating" indefinitely

- Known issue with Tilt v0.34.2 and docker-compose healthchecks
- Containers are running and healthy despite UI status
- Workaround: Verify with `docker ps` and access services directly

#### 2. Windows libvips build failures

- Requires pkg-config and libvips prebuilt binaries
- Set CGO_CFLAGS and CGO_LDFLAGS manually
- See `.github/workflows/release.yml` for reference

#### 3. Memory usage high

- Large images processed in memory
- Configure MAX_UPLOAD_SIZE appropriately
- Consider worker pool size vs available RAM

#### 4. Rate limiting too aggressive

- Adjust RATE_LIMIT_MAX and RATE_LIMIT_WINDOW
- Consider Redis for distributed rate limiting

## Contributing

See `CONTRIBUTING.md` for:

- Code style guidelines
- Pull request process
- Testing requirements
- Commit message format

## License

See `LICENSE` file for details.

## Support

- **Issues**: <https://github.com/keif/image-optimizer/issues>
- **Discussions**: <https://github.com/keif/image-optimizer/discussions>
- **Email**: <support@sosquishy.io>

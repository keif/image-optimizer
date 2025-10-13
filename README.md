# Image Optimizer

An API-first image optimization service built with Go and Fiber. Designed for local development with future expansion to a multi-user SaaS platform.

## Features

- **Image Optimization**: Resize, convert, and compress images
- **RESTful API**: Clean HTTP endpoints for easy integration
- **Containerized**: Docker-ready for consistent deployment
- **Performance**: Built with Go and Fiber for high throughput
- **Developer-Friendly**: Simple API design with JSON responses

## Project Structure

```
image-optimizer/
├── api/
│   ├── main.go              # Application entry point
│   ├── routes/
│   │   └── optimize.go      # Optimization endpoints
│   ├── services/
│   │   └── image_service.go # Image processing logic
│   ├── utils/               # Utility functions
│   └── tests/               # Test files
├── cli/                     # CLI client (future)
├── web/                     # Next.js frontend (future)
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

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the container
docker-compose down
```

## API Endpoints

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
POST /optimize?quality={1-100}&width={pixels}&height={pixels}&format={jpeg|png|webp|gif}
Content-Type: multipart/form-data
```

**Form Parameters:**
- `image` (file, required): The image file to optimize

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

**Supported Input Formats:**
- JPEG/JPG
- PNG
- WebP
- GIF

**Examples:**

**Basic optimization (default quality 80):**
```bash
curl -X POST http://localhost:8080/optimize \
  -F "image=@/path/to/your/image.jpg"
```

**High-quality JPEG conversion:**
```bash
curl -X POST "http://localhost:8080/optimize?format=jpeg&quality=95" \
  -F "image=@/path/to/your/image.png"
```

**Resize and convert to WebP:**
```bash
curl -X POST "http://localhost:8080/optimize?width=800&height=600&format=webp&quality=85" \
  -F "image=@/path/to/your/image.jpg"
```

**Compress PNG with maximum quality:**
```bash
curl -X POST "http://localhost:8080/optimize?quality=100" \
  -F "image=@/path/to/your/image.png"
```

**Response:**
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

## Development

### Building the Binary

```bash
cd api
go build -o image-optimizer
./image-optimizer
```

### Running Tests

```bash
cd api
go test ./...
```

## Roadmap

### Phase 2: Core Functionality ✅ COMPLETED
- [x] Implement real image optimization using `bimg` (libvips)
- [x] Add support for custom dimensions and quality settings
- [x] Add support for format conversion (JPEG, PNG, WebP, GIF)
- [ ] Implement URL-based image fetching
- [ ] Add batch processing endpoint
- [ ] Return optimized image file (not just metadata)

### Phase 3: CLI & Tools
- [ ] Build CLI client (`imgopt`) for local image optimization
- [ ] Add configuration file support
- [ ] Implement progress tracking for batch operations

### Phase 4: API Enhancement
- [ ] OpenAPI/Swagger documentation
- [ ] API key authentication
- [ ] Rate limiting
- [ ] Usage metrics and analytics

### Phase 5: Web Interface
- [ ] Next.js frontend for drag-and-drop optimization
- [ ] User dashboard
- [ ] Optimization history

### Phase 6: SaaS Features
- [ ] User authentication and authorization
- [ ] Multi-tenant support
- [ ] Subscription management
- [ ] Cloud storage integration (S3, GCS)

## Tech Stack

- **Backend**: Go 1.23, Fiber v2
- **Image Processing**: bimg (libvips wrapper), libvips 8.17+
- **Containerization**: Docker, Docker Compose
- **Future**: Next.js, PostgreSQL, Redis

## Features in Detail

### Real-time Image Optimization
- **libvips-powered**: Uses libvips through bimg for blazing-fast image processing
- **Format conversion**: Convert between JPEG, PNG, WebP, and GIF
- **Quality control**: Adjustable compression quality (1-100)
- **Smart resizing**: Maintains aspect ratio while resizing
- **Metadata stripping**: Removes EXIF data to reduce file size
- **Real-time metrics**: Get instant feedback on file size savings

## License

MIT

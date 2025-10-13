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

- Go 1.23+ (for local development)
- Docker and Docker Compose (for containerized deployment)

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
POST /optimize
Content-Type: multipart/form-data
```

**Parameters:**
- `image` (file): The image file to optimize

**Supported Formats:**
- JPEG/JPG
- PNG
- WebP
- GIF

**Example using curl:**
```bash
curl -X POST http://localhost:8080/optimize \
  -F "image=@/path/to/your/image.jpg"
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

### Phase 2: Core Functionality
- [ ] Implement real image optimization using `bimg` (libvips)
- [ ] Add support for custom dimensions and quality settings
- [ ] Implement URL-based image fetching
- [ ] Add batch processing endpoint

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
- **Image Processing**: bimg/libvips (planned)
- **Containerization**: Docker, Docker Compose
- **Future**: Next.js, PostgreSQL, Redis

## License

MIT

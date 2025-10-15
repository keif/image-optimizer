# Build stage
FROM golang:1.24-alpine AS builder

# Install build dependencies including libvips
RUN apk add --no-cache \
    git \
    gcc \
    g++ \
    make \
    musl-dev \
    vips-dev

WORKDIR /app

# Copy go mod files
COPY api/go.mod api/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY api/ ./

# Build the application with CGO enabled (required for libvips)
RUN CGO_ENABLED=1 GOOS=linux go build -a -o main .

# Runtime stage
FROM alpine:latest

# Install runtime dependencies for libvips
RUN apk --no-cache add \
    ca-certificates \
    vips

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./main"]

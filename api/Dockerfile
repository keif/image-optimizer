# Build stage
FROM golang:1.24-alpine AS builder

# Build arguments for version information
ARG APP_VERSION=dev
ARG GIT_COMMIT=none
ARG BUILD_TIME=unknown

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    g++ \
    make \
    vips-dev \
    libheif-dev

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application with version information injected via ldflags
RUN CGO_ENABLED=1 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags="-X main.version=${APP_VERSION} -X main.commit=${GIT_COMMIT} -X main.buildTime=${BUILD_TIME}" \
    -o main .

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache \
    vips \
    libheif \
    oxipng \
    ca-certificates

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV DB_PATH=/app/data/api_keys.db
ENV RATE_LIMIT_ENABLED=true
ENV RATE_LIMIT_MAX=100
ENV RATE_LIMIT_WINDOW=1m
ENV API_KEY_AUTH_ENABLED=false

# Run the application
CMD ["./main"]

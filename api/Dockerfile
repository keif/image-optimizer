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
    libheif-dev \
    wget \
    tar

WORKDIR /app

# Download and install optimization tools
# Using separate RUN commands for better layer caching during development

# Install oxipng (PNG optimizer) - has pre-compiled binaries
RUN OXIPNG_VERSION=9.1.5 && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        OXIPNG_ARCH="x86_64-unknown-linux-musl"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        OXIPNG_ARCH="aarch64-unknown-linux-musl"; \
    else \
        echo "Warning: Unsupported architecture for oxipng: $ARCH (will use libvips only)"; \
        exit 0; \
    fi && \
    wget -q "https://github.com/shssoichiro/oxipng/releases/download/v${OXIPNG_VERSION}/oxipng-${OXIPNG_VERSION}-${OXIPNG_ARCH}.tar.gz" && \
    tar -xzf "oxipng-${OXIPNG_VERSION}-${OXIPNG_ARCH}.tar.gz" && \
    mv oxipng /usr/local/bin/oxipng && \
    chmod +x /usr/local/bin/oxipng && \
    rm "oxipng-${OXIPNG_VERSION}-${OXIPNG_ARCH}.tar.gz" && \
    oxipng --version

# Note: MozJPEG is not included in Docker image due to complexity
# - Requires building from source (slow builds, large build deps)
# - Can be added on production server via deploy script
# - Code has graceful fallback to libjpeg-turbo (already good compression)

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
    ca-certificates \
    wget

WORKDIR /app

# Copy binaries from builder
COPY --from=builder /app/main .
# Copy oxipng if it was successfully built (may not exist on all architectures)
COPY --from=builder /usr/local/bin/oxipng* /usr/local/bin/ || true

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

#!/bin/bash
set -e

# Build script for creating standalone all-in-one binaries
# This script builds the Next.js frontend and embeds it into a Go binary
# for cross-platform distribution

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get project root (parent of scripts directory)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo -e "${GREEN}Building Image Optimizer Standalone Binary${NC}"
echo "Project root: $PROJECT_ROOT"
echo ""

# Step 1: Build Next.js frontend
echo -e "${YELLOW}Step 1/3: Building Next.js frontend...${NC}"
cd "$PROJECT_ROOT/web"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed${NC}"
    echo "Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install
fi

# Build the frontend with static export
echo "Building frontend for standalone binary..."
pnpm run build:standalone

# Check if build succeeded
if [ ! -d "out" ]; then
    echo -e "${RED}Error: Frontend build failed - 'out' directory not created${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend build complete!${NC}"
echo ""

# Step 2: Copy static files to embedded directory
echo -e "${YELLOW}Step 2/3: Copying static files to embedded directory...${NC}"
EMBEDDED_DIR="$PROJECT_ROOT/cmd/standalone/embedded"

# Clean up old embedded files
if [ -d "$EMBEDDED_DIR" ]; then
    rm -rf "$EMBEDDED_DIR"
fi

# Create embedded directory and copy files
mkdir -p "$EMBEDDED_DIR"
cp -r "$PROJECT_ROOT/web/out/"* "$EMBEDDED_DIR/"

# Remove empty directories (Go embed doesn't support empty dirs)
find "$EMBEDDED_DIR" -type d -empty -delete

echo -e "${GREEN}Static files copied to: $EMBEDDED_DIR${NC}"
echo ""

# Step 3: Build Go binaries for all platforms
echo -e "${YELLOW}Step 3/3: Building Go binaries...${NC}"
cd "$PROJECT_ROOT"

# Get version information
VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "none")
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build flags
LDFLAGS="-s -w"
LDFLAGS="$LDFLAGS -X main.version=$VERSION"
LDFLAGS="$LDFLAGS -X main.commit=$COMMIT"
LDFLAGS="$LDFLAGS -X main.buildTime=$BUILD_TIME"

# Output directory for binaries
OUTPUT_DIR="$PROJECT_ROOT/dist"
mkdir -p "$OUTPUT_DIR"

# Build for each platform
platforms=(
    "darwin/amd64"
    "darwin/arm64"
    "linux/amd64"
    "linux/arm64"
    "windows/amd64"
)

echo "Building binaries with:"
echo "  Version: $VERSION"
echo "  Commit: $COMMIT"
echo "  Build Time: $BUILD_TIME"
echo ""

for platform in "${platforms[@]}"; do
    IFS='/' read -r GOOS GOARCH <<< "$platform"
    output_name="image-optimizer-$GOOS-$GOARCH"

    if [ "$GOOS" = "windows" ]; then
        output_name="$output_name.exe"
    fi

    echo "Building for $GOOS/$GOARCH..."

    # Set CGO_ENABLED based on platform
    # SQLite requires CGO, so we need to handle cross-compilation carefully
    # Build from the api directory since that's where go.mod is
    cd "$PROJECT_ROOT/api"

    if [ "$GOOS" = "$(go env GOOS)" ] && [ "$GOARCH" = "$(go env GOARCH)" ]; then
        # Building for current platform - use CGO
        CGO_ENABLED=1 GOOS=$GOOS GOARCH=$GOARCH go build \
            -ldflags "$LDFLAGS" \
            -o "$OUTPUT_DIR/$output_name" \
            "$PROJECT_ROOT/cmd/standalone/main.go"
    else
        # Cross-compiling - disable CGO (SQLite will use pure Go fallback if available)
        # Note: This may not work perfectly for all platforms. For production,
        # consider building on each platform natively or using a cross-compilation toolchain.
        CGO_ENABLED=1 GOOS=$GOOS GOARCH=$GOARCH go build \
            -ldflags "$LDFLAGS" \
            -o "$OUTPUT_DIR/$output_name" \
            "$PROJECT_ROOT/cmd/standalone/main.go" || {
                echo -e "${YELLOW}Warning: Failed to build for $GOOS/$GOARCH (this is expected for cross-platform SQLite builds)${NC}"
                echo -e "${YELLOW}For production builds, compile on the target platform or use a cross-compilation toolchain${NC}"
                continue
            }
    fi

    if [ -f "$OUTPUT_DIR/$output_name" ]; then
        size=$(du -h "$OUTPUT_DIR/$output_name" | cut -f1)
        echo -e "${GREEN}  ✓ $output_name ($size)${NC}"
    fi
done

echo ""
echo -e "${GREEN}Build complete!${NC}"
echo ""
echo "Binaries available in: $OUTPUT_DIR"
echo ""
echo "To run the standalone binary:"
echo "  $OUTPUT_DIR/image-optimizer-$(go env GOOS)-$(go env GOARCH)"
echo ""
echo "Command-line options:"
echo "  --port PORT        Port to listen on (default: 3000)"
echo "  --version          Show version information"
echo ""

#!/bin/bash

# Build all binaries: standalone, CLI, and API server
# Usage: ./scripts/build-all.sh [version]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from git or argument
VERSION="${1:-$(git describe --tags --always --dirty 2>/dev/null || echo 'dev')}"
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Building Image Optimizer Binaries${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Commit:  ${COMMIT}${NC}"
echo -e "${BLUE}Date:    ${BUILD_DATE}${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Platforms to build
PLATFORMS=(
    "darwin/amd64"
    "darwin/arm64"
    "linux/amd64"
    "linux/arm64"
    "windows/amd64"
)

# Create dist directory
mkdir -p dist

# Build standalone binary (all-in-one with embedded UI)
echo -e "${GREEN}Step 1: Building standalone binary with embedded UI...${NC}"
./scripts/build-standalone.sh "$VERSION"
echo

# Build API server binaries
echo -e "${GREEN}Step 2: Building API server binaries...${NC}"
LDFLAGS="-X main.version=${VERSION} -X main.commit=${COMMIT} -X main.buildDate=${BUILD_DATE}"

for platform in "${PLATFORMS[@]}"; do
    IFS="/" read -r GOOS GOARCH <<< "$platform"
    output_name="image-optimizer-server-${GOOS}-${GOARCH}"

    if [ "$GOOS" = "windows" ]; then
        output_name="${output_name}.exe"
    fi

    echo -e "${BLUE}Building API server for ${GOOS}/${GOARCH}...${NC}"

    if GOOS=$GOOS GOARCH=$GOARCH CGO_ENABLED=1 go build \
        -ldflags "$LDFLAGS" \
        -o "dist/${output_name}" \
        ./api; then
        echo -e "${GREEN}✓ Built: dist/${output_name}${NC}"
    else
        echo -e "${YELLOW}⚠ Failed to build for ${GOOS}/${GOARCH} (likely needs platform-specific toolchain)${NC}"
    fi
done
echo

# Build CLI binaries
echo -e "${GREEN}Step 3: Building CLI binaries...${NC}"
CLI_LDFLAGS="-X main.version=${VERSION}"

for platform in "${PLATFORMS[@]}"; do
    IFS="/" read -r GOOS GOARCH <<< "$platform"
    output_name="imgopt-${GOOS}-${GOARCH}"

    if [ "$GOOS" = "windows" ]; then
        output_name="${output_name}.exe"
    fi

    echo -e "${BLUE}Building CLI for ${GOOS}/${GOARCH}...${NC}"

    # CLI doesn't need CGO, so cross-compilation works
    if GOOS=$GOOS GOARCH=$GOARCH CGO_ENABLED=0 go build \
        -ldflags "$CLI_LDFLAGS" \
        -o "dist/${output_name}" \
        ./cli; then
        echo -e "${GREEN}✓ Built: dist/${output_name}${NC}"
    else
        echo -e "${RED}✗ Failed to build CLI for ${GOOS}/${GOARCH}${NC}"
    fi
done
echo

# List all built binaries
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo
echo "Built binaries:"
ls -lh dist/ | grep -v "^total" | awk '{printf "  %s %10s  %s\n", $9, $5, ""}'
echo
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test binaries: ./dist/image-optimizer-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/')"
echo "  2. Create release: gh release create v${VERSION} dist/* --title \"v${VERSION}\" --notes \"Release notes here\""
echo "  3. Upload to GitHub: git tag v${VERSION} && git push origin v${VERSION}"

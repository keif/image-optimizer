#!/bin/bash
set -e

# Hetzner Deployment Script for Image Optimizer API
# Usage: ./deploy-hetzner.sh

echo "🚀 Deploying Image Optimizer API to Hetzner..."

# Configuration
SERVER="root@sosquishy-server"
BUILD_DIR="/tmp/api-build"
API_DIR="./api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get version info from local git (before rsync excludes .git)
echo -e "${BLUE}📋 Getting version info...${NC}"
VERSION=$(git describe --tags --always 2>/dev/null || echo 'v0.1.0')
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "Version: ${VERSION}"
echo "Commit: ${COMMIT}"
echo "Build Time: ${BUILD_TIME}"

# Step 1: Copy source to server
echo -e "${BLUE}📦 Step 1: Copying source code to server...${NC}"
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='web' \
  ${API_DIR}/ ${SERVER}:${BUILD_DIR}/

# Step 2: Build on server and deploy
echo -e "${BLUE}🔨 Step 2: Building on server...${NC}"
ssh ${SERVER} "bash -s" << ENDSSH
set -e

cd /tmp/api-build

# Install dependencies if missing
echo "Checking dependencies..."

# Check and install Go if missing
if ! command -v go &> /dev/null; then
    echo "Go not found, installing Go 1.23..."
    apt-get update
    apt-get install -y wget
    wget -q https://go.dev/dl/go1.23.2.linux-amd64.tar.gz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf go1.23.2.linux-amd64.tar.gz
    rm go1.23.2.linux-amd64.tar.gz
    export PATH=\$PATH:/usr/local/go/bin
    echo "✓ Go installed: \$(go version)"
else
    echo "✓ Go already installed: \$(go version)"
fi

# Ensure Go is in PATH for this session
export PATH=\$PATH:/usr/local/go/bin

# Install oxipng for PNG optimization (pre-compiled binary approach)
if ! command -v oxipng &> /dev/null; then
    echo "Installing oxipng (pre-compiled)..."
    ARCH=\$(uname -m)
    if [ "\$ARCH" = "x86_64" ]; then
        OXIPNG_URL="https://github.com/shssoichiro/oxipng/releases/download/v9.1.5/oxipng-9.1.5-x86_64-unknown-linux-musl.tar.gz"
    elif [ "\$ARCH" = "aarch64" ]; then
        OXIPNG_URL="https://github.com/shssoichiro/oxipng/releases/download/v9.1.5/oxipng-9.1.5-aarch64-unknown-linux-musl.tar.gz"
    else
        echo "Warning: Unsupported architecture \$ARCH for oxipng"
        OXIPNG_URL=""
    fi

    if [ -n "\$OXIPNG_URL" ]; then
        wget -q \$OXIPNG_URL -O oxipng.tar.gz || {
            echo "Warning: Failed to download oxipng, PNG optimization will be limited"
        }
        if [ -f oxipng.tar.gz ]; then
            tar -xzf oxipng.tar.gz
            mv oxipng-*/oxipng /usr/local/bin/ 2>/dev/null || echo "Warning: Failed to extract oxipng"
            rm -rf oxipng.tar.gz oxipng-*
            chmod +x /usr/local/bin/oxipng 2>/dev/null
            if command -v oxipng &> /dev/null; then
                echo "✓ oxipng installed: \$(oxipng --version)"
            fi
        fi
    fi
else
    echo "✓ oxipng already installed: \$(oxipng --version)"
fi

# Install mozjpeg for JPEG optimization
if ! command -v cjpeg &> /dev/null || ! cjpeg -version 2>&1 | grep -q "mozjpeg"; then
    echo "Installing mozjpeg..."
    apt-get update && apt-get install -y mozjpeg 2>/dev/null || {
        echo "Note: mozjpeg not in apt repos, checking for libjpeg-turbo..."
        apt-get install -y libjpeg-turbo-progs 2>/dev/null || echo "Note: Using system libjpeg"
    }
    if command -v cjpeg &> /dev/null; then
        echo "✓ JPEG tools installed: \$(cjpeg -version 2>&1 | head -n1)"
    fi
else
    echo "✓ mozjpeg already installed"
fi

# Build with version info from local git
echo "Building binary with version info..."
echo "  Version: ${VERSION}"
echo "  Commit: ${COMMIT}"
echo "  Build Time: ${BUILD_TIME}"

go build -v \
  -ldflags "-X main.version=${VERSION} -X main.commit=${COMMIT} -X main.buildTime=${BUILD_TIME}" \
  -o image-optimizer \
  main.go

# Verify it's a Linux binary
echo "Verifying binary..."
BINARY_TYPE=\$(file image-optimizer)
if [[ \$BINARY_TYPE == *"ELF 64-bit"* ]]; then
    echo "✓ Binary is correct (Linux ELF 64-bit)"
else
    echo "✗ ERROR: Binary is not Linux ELF! Got: \$BINARY_TYPE"
    exit 1
fi

# Deploy
echo "Deploying binary..."
mv image-optimizer /usr/local/bin/image-optimizer
chmod +x /usr/local/bin/image-optimizer

# Restart service
echo "Restarting service..."
systemctl restart image-optimizer

# Wait a moment for service to start
sleep 2

# Check status
echo "Checking service status..."
systemctl status image-optimizer --no-pager -l

# Cleanup
echo "Cleaning up build directory..."
cd ~
rm -rf /tmp/api-build

echo "Deployment complete!"
ENDSSH

# Step 3: Verify deployment
echo -e "${BLUE}✅ Step 3: Verifying deployment...${NC}"
echo "Checking health endpoint..."
sleep 1

HEALTH_RESPONSE=$(curl -s https://api.sosquishy.io/health)
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ API is responding!${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Health check failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo "API is live at: https://api.sosquishy.io"

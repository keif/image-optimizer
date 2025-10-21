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

# Install oxipng for PNG optimization
if ! command -v oxipng &> /dev/null; then
    echo "Installing oxipng..."
    cargo install oxipng || {
        echo "Warning: Failed to install oxipng via cargo, trying apt..."
        apt-get update && apt-get install -y oxipng || echo "Warning: oxipng not available, PNG optimization will be limited"
    }
fi

# Install mozjpeg for JPEG optimization
if ! command -v cjpeg &> /dev/null || ! cjpeg -version 2>&1 | grep -q "mozjpeg"; then
    echo "Installing mozjpeg..."
    apt-get update && apt-get install -y mozjpeg || {
        echo "Warning: mozjpeg not available via apt, trying manual install..."
        # Fallback: download pre-compiled binary or build from source
        echo "Warning: mozjpeg not available, JPEG optimization will use standard libjpeg"
    }
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
BINARY_TYPE=$(file image-optimizer)
if [[ $BINARY_TYPE == *"ELF 64-bit"* ]]; then
    echo "✓ Binary is correct (Linux ELF 64-bit)"
else
    echo "✗ ERROR: Binary is not Linux ELF! Got: $BINARY_TYPE"
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

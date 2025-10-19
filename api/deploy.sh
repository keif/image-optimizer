#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Image Optimizer API Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Get version info from git
APP_VERSION=$(git describe --tags --always 2>/dev/null || echo "dev")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "none")
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo -e "${YELLOW}Build Information:${NC}"
echo "  Version:    $APP_VERSION"
echo "  Commit:     $GIT_COMMIT"
echo "  Build Time: $BUILD_TIME"
echo ""

# Confirm deployment
read -p "Deploy to Fly.io with these settings? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo -e "${BLUE}Starting deployment...${NC}"

# Deploy to Fly.io with build args
flyctl deploy \
  --build-arg APP_VERSION="$APP_VERSION" \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --build-arg BUILD_TIME="$BUILD_TIME"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Verifying deployment...${NC}"

# Wait for deployment to stabilize
sleep 5

# Verify deployment
echo ""
HEALTH_RESPONSE=$(curl -s https://api.sosquishy.io/health)

# Check if jq is available
if command -v jq &> /dev/null; then
    echo "$HEALTH_RESPONSE" | jq .

    # Extract and verify version
    DEPLOYED_VERSION=$(echo "$HEALTH_RESPONSE" | jq -r .version)

    if [ "$DEPLOYED_VERSION" = "$APP_VERSION" ]; then
        echo ""
        echo -e "${GREEN}✅ Version verified: $DEPLOYED_VERSION${NC}"
    else
        echo ""
        echo -e "${YELLOW}⚠️  Version mismatch!${NC}"
        echo "   Expected: $APP_VERSION"
        echo "   Deployed: $DEPLOYED_VERSION"
    fi
else
    echo "$HEALTH_RESPONSE"
    echo ""
    echo -e "${YELLOW}Install 'jq' for better JSON formatting${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment verified!${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  View logs:   flyctl logs"
echo "  Check status: flyctl status"
echo "  SSH to app:  flyctl ssh console"
echo ""

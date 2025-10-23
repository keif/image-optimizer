#!/bin/bash
set -e

# Docker-based Hetzner Deployment Script for Full Stack (API + Frontend)
# Usage: ./deploy-docker-hetzner.sh

echo "🚀 Deploying Full Stack to Hetzner (Docker)..."

# Configuration
SERVER="${HETZNER_SERVER:-root@sosquishy-server}"
DEPLOY_PATH="/opt/image-optimizer-docker"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get version info from local git
echo -e "${BLUE}📋 Getting version info...${NC}"
VERSION=$(git describe --tags --always 2>/dev/null || echo 'v0.1.0')
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "Version: ${VERSION}"
echo "Commit: ${COMMIT}"
echo "Build Time: ${BUILD_TIME}"

# Step 1: Sync code to server
echo -e "${BLUE}📦 Step 1: Syncing code to server...${NC}"
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='web/node_modules' --exclude='web/.next' \
  --exclude='*.log' --exclude='data/' \
  ./ ${SERVER}:${DEPLOY_PATH}/

# Step 2: Build and deploy on server
echo -e "${BLUE}🔨 Step 2: Building and deploying on server...${NC}"
ssh ${SERVER} "bash -s" << ENDSSH
set -e

cd ${DEPLOY_PATH}

# Export version info for docker-compose
export APP_VERSION="${VERSION}"
export GIT_COMMIT="${COMMIT}"
export BUILD_TIME="${BUILD_TIME}"

echo "Building Docker image with version: \$APP_VERSION"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose not found. Installing..."
    apt-get update
    apt-get install -y docker-compose
fi

# Create data directory if it doesn't exist
if [ ! -d "${DEPLOY_PATH}/data" ]; then
    echo "Creating data directory..."
    mkdir -p ${DEPLOY_PATH}/data

    # Check if we're migrating from binary deployment
    if [ -f /opt/image-optimizer/data/api_keys.db ]; then
        echo "📦 Migrating existing database from binary deployment..."
        cp /opt/image-optimizer/data/api_keys.db ${DEPLOY_PATH}/data/
        chown -R \$(id -u):\$(id -g) ${DEPLOY_PATH}/data
        echo "✅ Database migrated successfully"
    fi
fi

# Update Caddyfile if it exists
if [ -f "Caddyfile.prod" ]; then
    echo "Updating Caddyfile..."
    sudo cp Caddyfile.prod /etc/caddy/Caddyfile
    sudo caddy validate --config /etc/caddy/Caddyfile
    sudo systemctl reload caddy
    echo "✓ Caddyfile updated and reloaded"
fi

# Build the Docker images (no cache to ensure latest code)
echo "Building Docker images..."
docker-compose -f ${COMPOSE_FILE} build --no-cache

# Stop old containers
echo "Stopping old containers..."
docker-compose -f ${COMPOSE_FILE} down || true

# Start new containers
echo "Starting new containers..."
docker-compose -f ${COMPOSE_FILE} up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check container status
echo "Container status:"
docker-compose -f ${COMPOSE_FILE} ps

# Verify API health
echo "Testing API health endpoint..."
curl -f http://localhost:8080/health || {
    echo "❌ API health check failed! Showing logs:"
    docker logs squish-api --tail=50
    exit 1
}
echo "✓ API is healthy"

# Verify Frontend
echo "Testing Frontend..."
curl -f -s -o /dev/null http://localhost:3000/ || {
    echo "❌ Frontend check failed! Showing logs:"
    docker logs squish-web --tail=50
    exit 1
}
echo "✓ Frontend is serving"

# Check recent logs
echo "Recent logs from both services:"
echo "=== API Logs ==="
docker logs squish-api --tail=10
echo ""
echo "=== Web Logs ==="
docker logs squish-web --tail=10

# If we were running systemd service, stop it
if systemctl is-active --quiet image-optimizer; then
    echo "Stopping old systemd service..."
    systemctl stop image-optimizer
    systemctl disable image-optimizer
fi

# Cleanup old Docker images
echo "Cleaning up old Docker images..."
docker image prune -f

echo "✅ Deployment complete on server!"
ENDSSH

# Step 3: Verify deployment
echo -e "${BLUE}✅ Step 3: Verifying deployment...${NC}"
sleep 3

# Check API
echo "Checking API..."
API_RESPONSE=$(curl -s https://api.sosquishy.io/health)
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ API is responding!${NC}"
    echo "Response: $API_RESPONSE"

    # Extract version if jq is available
    if command -v jq &> /dev/null; then
        DEPLOYED_VERSION=$(echo "$API_RESPONSE" | jq -r '.version')
        if [ "$DEPLOYED_VERSION" = "$VERSION" ]; then
            echo -e "${GREEN}✓ API version verified: $DEPLOYED_VERSION${NC}"
        else
            echo -e "${YELLOW}⚠️  Version mismatch!${NC}"
            echo "   Expected: $VERSION"
            echo "   Deployed: $DEPLOYED_VERSION"
        fi
    fi
else
    echo -e "${RED}✗ API health check failed${NC}"
    exit 1
fi

# Check Frontend
echo "Checking Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sosquishy.io)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is serving (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}✗ Frontend check failed (HTTP $FRONTEND_STATUS)${NC}"
    exit 1
fi

# Check ads.txt redirect
echo "Checking ads.txt redirect..."
ADS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sosquishy.io/ads.txt)
if [ "$ADS_STATUS" = "301" ] || [ "$ADS_STATUS" = "302" ]; then
    echo -e "${GREEN}✓ ads.txt redirect working (HTTP $ADS_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  ads.txt returned HTTP $ADS_STATUS${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Full Stack Deployment Successful!${NC}"
echo -e "${BLUE}Services:${NC}"
echo "  Frontend: https://sosquishy.io"
echo "  API:      https://api.sosquishy.io"
echo "  Swagger:  https://api.sosquishy.io/swagger/index.html"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  SSH to server:        ssh ${SERVER}"
echo "  View all logs:        ssh ${SERVER} 'cd ${DEPLOY_PATH} && docker-compose -f ${COMPOSE_FILE} logs -f'"
echo "  View API logs:        ssh ${SERVER} 'docker logs -f squish-api'"
echo "  View Web logs:        ssh ${SERVER} 'docker logs -f squish-web'"
echo "  Restart services:     ssh ${SERVER} 'cd ${DEPLOY_PATH} && docker-compose -f ${COMPOSE_FILE} restart'"
echo "  Check status:         ssh ${SERVER} 'cd ${DEPLOY_PATH} && docker-compose -f ${COMPOSE_FILE} ps'"
echo ""

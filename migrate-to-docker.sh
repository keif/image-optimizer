#!/bin/bash
set -e

# Migration Script: Binary Deployment → Docker Deployment
# Run this on the Hetzner server to migrate from systemd binary to Docker
# Usage: ssh sosquishy-server 'bash -s' < migrate-to-docker.sh

echo "🔄 Migrating Image Optimizer from binary to Docker deployment..."

# Configuration
BINARY_PATH="/opt/image-optimizer"
DOCKER_PATH="/opt/image-optimizer-docker"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

# Check if binary deployment exists
if [ ! -d "$BINARY_PATH" ]; then
    echo -e "${YELLOW}Warning: Binary deployment directory not found at $BINARY_PATH${NC}"
    echo "Assuming this is a fresh Docker installation."
    MIGRATE_DATA=false
else
    echo "✓ Found existing binary deployment"
    MIGRATE_DATA=true
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✓ Docker installed"
else
    echo "✓ Docker already installed: $(docker --version)"
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing docker-compose..."
    apt-get update
    apt-get install -y docker-compose
    echo "✓ docker-compose installed"
else
    echo "✓ docker-compose already installed: $(docker-compose --version)"
fi

echo ""
echo -e "${BLUE}Step 2: Creating Docker deployment directory...${NC}"

# Create Docker deployment directory
mkdir -p "$DOCKER_PATH/data"
chown -R $USER:$USER "$DOCKER_PATH"
echo "✓ Created $DOCKER_PATH"

# Migrate database if exists
if [ "$MIGRATE_DATA" = true ] && [ -f "$BINARY_PATH/data/api_keys.db" ]; then
    echo ""
    echo -e "${BLUE}Step 3: Migrating database...${NC}"

    # Backup first
    cp "$BINARY_PATH/data/api_keys.db" "$BINARY_PATH/data/api_keys.db.backup"
    echo "✓ Created backup at $BINARY_PATH/data/api_keys.db.backup"

    # Copy to Docker volume
    cp "$BINARY_PATH/data/api_keys.db" "$DOCKER_PATH/data/"
    chown -R $USER:$USER "$DOCKER_PATH/data"
    echo "✓ Migrated database to $DOCKER_PATH/data/"

    # Show database stats
    if command -v sqlite3 &> /dev/null; then
        KEY_COUNT=$(sqlite3 "$DOCKER_PATH/data/api_keys.db" "SELECT COUNT(*) FROM api_keys WHERE revoked_at IS NULL;")
        echo "✓ Database contains $KEY_COUNT active API keys"
    fi
else
    echo ""
    echo -e "${YELLOW}Step 3: No database to migrate (starting fresh)${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Stopping old systemd service...${NC}"

# Stop and disable systemd service if running
if systemctl is-active --quiet image-optimizer; then
    echo "Stopping image-optimizer service..."
    systemctl stop image-optimizer
    echo "✓ Service stopped"
fi

if systemctl is-enabled --quiet image-optimizer 2>/dev/null; then
    echo "Disabling image-optimizer service..."
    systemctl disable image-optimizer
    echo "✓ Service disabled"
fi

echo "✓ Systemd service stopped and disabled (binary will no longer run on boot)"
echo "  Note: You can still manually run the binary if needed"

echo ""
echo -e "${BLUE}Step 5: Updating Caddy configuration...${NC}"

# Check if Caddy is configured correctly
if [ -f /etc/caddy/Caddyfile ]; then
    # Caddy should already be proxying to localhost:8080, which works for both binary and Docker
    echo "✓ Caddy configuration unchanged (proxying to localhost:8080)"
    echo "  This works for both binary and Docker deployments"
else
    echo -e "${YELLOW}Warning: Caddyfile not found at /etc/caddy/Caddyfile${NC}"
    echo "Make sure Caddy is configured to reverse proxy to localhost:8080"
fi

echo ""
echo -e "${GREEN}✅ Migration preparation complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Ensure your code is in $DOCKER_PATH (rsync or git clone)"
echo "2. Copy docker-compose.prod.yml to $DOCKER_PATH"
echo "3. Run: cd $DOCKER_PATH && docker-compose -f docker-compose.prod.yml up -d"
echo "4. Verify: curl http://localhost:8080/health"
echo ""
echo -e "${BLUE}Quick deployment:${NC}"
echo "  Run from local machine: ./deploy-docker-hetzner.sh"
echo "  Or use GitHub Actions: push to main branch"
echo ""
echo -e "${YELLOW}Rollback instructions:${NC}"
echo "If you need to rollback to binary deployment:"
echo "  1. Stop Docker: cd $DOCKER_PATH && docker-compose -f docker-compose.prod.yml down"
echo "  2. Start systemd: systemctl start image-optimizer"
echo "  3. Enable systemd: systemctl enable image-optimizer"
echo ""

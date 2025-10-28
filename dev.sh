#!/bin/bash
set -e

echo "🔨 Building images for development..."

# Build API with dev Dockerfile
echo "  → Building API..."
docker build -t squish-api:latest ./api -f ./api/Dockerfile.dev

# Build web
echo "  → Building web..."
docker build -t squish-web:latest ./web -f ./web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080

echo "✅ Builds complete"
echo ""
echo "🚀 Starting services with docker-compose..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 3

# Check status
docker-compose ps

echo ""
echo "✅ Development environment ready!"
echo ""
echo "  📍 Services:"
echo "     • API Server:    http://localhost:8080"
echo "     • Web Interface: http://localhost:3000"
echo "     • Swagger Docs:  http://localhost:8080/swagger/index.html"
echo ""
echo "  📝 Useful commands:"
echo "     • View logs:     docker-compose logs -f"
echo "     • Stop services: docker-compose down"
echo "     • Restart:       ./dev.sh"
echo ""

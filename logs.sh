#!/bin/bash

# Production Logs Helper Script
# Quick access to production logs for image-optimizer

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="${HETZNER_USER:-root}"
SERVER_HOST="${HETZNER_HOST:-sosquishy-server}"
CONTAINER_API="squish-api"
CONTAINER_WEB="squish-web"

# Usage function
usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  api [lines]       - View API logs (default: 100 lines)"
    echo "  web [lines]       - View web logs (default: 100 lines)"
    echo "  follow-api        - Follow API logs in real-time"
    echo "  follow-web        - Follow web logs in real-time"
    echo "  status            - Show container status"
    echo "  all [lines]       - View both API and web logs"
    echo "  errors [lines]    - View only error logs (default: 50 lines)"
    echo ""
    echo "Examples:"
    echo "  $0 api              # Last 100 lines of API logs"
    echo "  $0 api 500          # Last 500 lines of API logs"
    echo "  $0 follow-api       # Follow API logs in real-time"
    echo "  $0 errors           # Last 50 error lines"
    echo "  $0 status           # Container status"
    exit 1
}

# Default command
COMMAND="${1:-api}"
LINES="${2:-100}"

case "$COMMAND" in
    api)
        echo -e "${BLUE}📋 Fetching API logs (last $LINES lines)...${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker logs ${CONTAINER_API} --tail=${LINES}"
        ;;

    web)
        echo -e "${BLUE}📋 Fetching Web logs (last $LINES lines)...${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker logs ${CONTAINER_WEB} --tail=${LINES}"
        ;;

    follow-api)
        echo -e "${BLUE}📋 Following API logs (Ctrl+C to exit)...${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker logs ${CONTAINER_API} -f"
        ;;

    follow-web)
        echo -e "${BLUE}📋 Following Web logs (Ctrl+C to exit)...${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker logs ${CONTAINER_WEB} -f"
        ;;

    status)
        echo -e "${BLUE}📊 Container Status:${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker ps -a | grep -E '(CONTAINER|squish-)'"
        echo ""
        echo -e "${BLUE}🔍 Health Status:${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker inspect ${CONTAINER_API} --format='API Health: {{.State.Health.Status}}' 2>/dev/null || echo 'API: No health check configured'"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker inspect ${CONTAINER_WEB} --format='Web Health: {{.State.Health.Status}}' 2>/dev/null || echo 'Web: No health check configured'"
        ;;

    all)
        LINES="${2:-100}"
        echo -e "${BLUE}📋 API Logs (last $LINES lines):${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker logs ${CONTAINER_API} --tail=${LINES}"
        echo ""
        echo -e "${BLUE}📋 Web Logs (last $LINES lines):${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker logs ${CONTAINER_WEB} --tail=${LINES}"
        ;;

    errors)
        LINES="${2:-50}"
        echo -e "${RED}🔥 Error Logs (last $LINES lines matching 'error', 'failed', 'panic'):${NC}"
        ssh ${SERVER_USER}@${SERVER_HOST} "docker logs ${CONTAINER_API} --tail=1000 2>&1 | grep -iE '(error|failed|panic|fatal)' | tail -n ${LINES}"
        ;;

    -h|--help|help)
        usage
        ;;

    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        usage
        ;;
esac

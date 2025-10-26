#!/bin/bash
#
# Metrics Cleanup Script
#
# This script deletes metrics data older than the specified retention period.
# It should be run daily via cron to maintain the 30-day retention policy
# specified in the privacy policy.
#
# Usage:
#   ./cleanup-metrics.sh [retention_days]
#
# Examples:
#   ./cleanup-metrics.sh           # Use default 30-day retention
#   ./cleanup-metrics.sh 90        # Use custom 90-day retention
#
# Environment Variables:
#   API_URL       - API endpoint URL (default: http://localhost:8080)
#   API_KEY       - API key for authentication (required if API key auth is enabled)
#
# Cron example (daily at 2 AM):
#   0 2 * * * API_KEY="your-api-key" /path/to/cleanup-metrics.sh >> /var/log/metrics-cleanup.log 2>&1
#

set -e

# Default retention period (matches privacy policy)
RETENTION_DAYS="${1:-30}"

# API endpoint
API_URL="${API_URL:-http://localhost:8080}"

# API key (optional, from environment)
API_KEY="${API_KEY:-}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================"
echo "Metrics Cleanup Script"
echo "========================================"
echo "Date: $(date)"
echo "Retention Period: ${RETENTION_DAYS} days"
echo "API URL: ${API_URL}"
if [ -n "$API_KEY" ]; then
    echo "Authentication: Using API key"
else
    echo "Authentication: No API key (unauthenticated)"
fi
echo ""

# Build curl command
CURL_CMD="curl -s -w \"\n%{http_code}\" -X POST \"${API_URL}/admin/cleanup-metrics?days=${RETENTION_DAYS}\""

# Add API key header if provided
if [ -n "$API_KEY" ]; then
    CURL_CMD="curl -s -w \"\n%{http_code}\" -H \"Authorization: Bearer ${API_KEY}\" -X POST \"${API_URL}/admin/cleanup-metrics?days=${RETENTION_DAYS}\""
fi

# Make cleanup request
echo "Cleaning up metrics data..."
response=$(eval "$CURL_CMD")
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | sed '$d')

# Check response
if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Cleanup successful${NC}"
    echo "Response: $body"
    exit 0
else
    echo -e "${RED}✗ Cleanup failed (HTTP $http_code)${NC}"
    echo "Response: $body"
    exit 1
fi

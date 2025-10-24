#!/bin/bash
# Quick local test for large spritesheet processing
# Bypasses Docker for faster testing during development

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

IMAGE_FILE="api/testdata/spritesheets/large_funkin_example_Convict_Full.png"
API_URL="${1:-http://localhost:8080}"

echo -e "${BLUE}📸 Testing Large Spritesheet Processing${NC}"
echo "Image: $IMAGE_FILE"
echo "API: $API_URL"
echo ""

# Check if image exists
if [ ! -f "$IMAGE_FILE" ]; then
    echo -e "${RED}❌ Error: Image not found at $IMAGE_FILE${NC}"
    exit 1
fi

# Get image info
echo -e "${BLUE}Image Info:${NC}"
identify "$IMAGE_FILE" | head -1 || file "$IMAGE_FILE"
ls -lh "$IMAGE_FILE" | awk '{print "Size: " $5}'
echo ""

# Test optimization with timing
echo -e "${BLUE}🔄 Sending to API for optimization...${NC}"
START_TIME=$(date +%s)

RESPONSE=$(curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "image=@${IMAGE_FILE}" \
  -F "format=webp" \
  -F "quality=80" \
  --max-time 300 \
  -w "\n%{http_code}\n%{time_total}" \
  -o /tmp/optimized_output.webp \
  "${API_URL}/optimize" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 2 | head -n 1)
TIME_TOTAL=$(echo "$RESPONSE" | tail -n 1)
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo -e "${BLUE}Results:${NC}"
echo "HTTP Status: $HTTP_CODE"
echo "Processing Time: ${TIME_TOTAL}s (curl)"
echo "Total Time: ${ELAPSED}s (wall clock)"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success!${NC}"

    # Show optimized file info
    if [ -f /tmp/optimized_output.webp ]; then
        echo ""
        echo -e "${BLUE}Optimized File:${NC}"
        ls -lh /tmp/optimized_output.webp | awk '{print "Size: " $5}'
        file /tmp/optimized_output.webp
        identify /tmp/optimized_output.webp 2>/dev/null | head -1 || echo "(WebP format)"

        # Calculate savings
        ORIGINAL_SIZE=$(stat -f%z "$IMAGE_FILE" 2>/dev/null || stat -c%s "$IMAGE_FILE")
        OPTIMIZED_SIZE=$(stat -f%z /tmp/optimized_output.webp 2>/dev/null || stat -c%s /tmp/optimized_output.webp)
        SAVINGS=$((100 - (OPTIMIZED_SIZE * 100 / ORIGINAL_SIZE)))

        echo ""
        echo -e "${GREEN}💾 File Size Reduction: ${SAVINGS}%${NC}"
        echo "Original: $(numfmt --to=iec-i --suffix=B $ORIGINAL_SIZE 2>/dev/null || echo "${ORIGINAL_SIZE} bytes")"
        echo "Optimized: $(numfmt --to=iec-i --suffix=B $OPTIMIZED_SIZE 2>/dev/null || echo "${OPTIMIZED_SIZE} bytes")"
    fi
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}❌ Request timeout or connection failed${NC}"
    echo "The request took longer than 300 seconds (5 minutes)"
    exit 1
else
    echo -e "${RED}❌ Failed with HTTP $HTTP_CODE${NC}"
    if [ -f /tmp/optimized_output.webp ]; then
        echo ""
        echo "Response body:"
        cat /tmp/optimized_output.webp
    fi
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Performance Analysis:${NC}"
if (( $(echo "$TIME_TOTAL > 60" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Processing took over 1 minute${NC}"
    echo "Recommendations:"
    echo "  - Increase Caddy proxy timeout beyond 5s health check"
    echo "  - Consider streaming response for progress feedback"
    echo "  - Document expected processing times for large images"
elif (( $(echo "$TIME_TOTAL > 30" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Processing took over 30 seconds${NC}"
    echo "Recommendations:"
    echo "  - Increase client-side timeout to at least ${TIME_TOTAL}s + 10s buffer"
    echo "  - Add loading indicator with time estimate"
else
    echo -e "${GREEN}✅ Processing time is reasonable (under 30s)${NC}"
fi

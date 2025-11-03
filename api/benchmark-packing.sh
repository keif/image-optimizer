#!/bin/bash

# Benchmark script for comparing packing modes
# Tests: optimal, smart, preserve modes across small, medium, and large datasets

set -e

API_URL="${API_URL:-https://api.sosquishy.io}"

echo "=================================================================="
echo "  Packing Mode Benchmark"
echo "=================================================================="
echo "API: $API_URL"
echo

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to benchmark a single dataset with all modes
benchmark_dataset() {
  local name=$1
  local png=$2
  local xml=$3
  local frames=$4

  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Dataset: $name${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "Frames: $frames"
  echo "Input Size: $(ls -lh "$png" | awk '{print $5}')"
  echo

  # Table header
  printf "%-12s | %-10s | %-12s | %-15s | %-10s\n" "Mode" "Efficiency" "Output Size" "Processing Time" "Dimensions"
  echo "-------------+------------+--------------+-----------------+------------"

  for mode in optimal smart preserve; do
    # Make API request and capture response
    response=$(curl -s -X POST "$API_URL/optimize-spritesheet?packingMode=$mode&outputFormats=json" \
      -F "spritesheet=@$png" \
      -F "xml=@$xml")

    # Parse response
    efficiency=$(echo "$response" | jq -r '.metadata[0].efficiency * 100' | xargs printf "%.1f")
    width=$(echo "$response" | jq -r '.metadata[0].width')
    height=$(echo "$response" | jq -r '.metadata[0].height')
    processing_time=$(echo "$response" | jq -r '.processingTime // "N/A"')

    # Calculate output size from base64 image
    sheet_b64=$(echo "$response" | jq -r '.sheets[0]')
    output_size_bytes=$(echo "$sheet_b64" | base64 -d 2>/dev/null | wc -c | tr -d ' ')
    output_size_mb=$(echo "scale=2; $output_size_bytes / 1024 / 1024" | bc)

    # Format and print row
    printf "%-12s | %9s%% | %10s MB | %15s | %dx%d\n" \
      "$mode" \
      "$efficiency" \
      "$output_size_mb" \
      "$processing_time" \
      "$width" \
      "$height"
  done

  echo
}

# Run benchmarks
benchmark_dataset \
  "Small (33 frames)" \
  "testdata/spritesheets/smol_sprite_pikafriend.png" \
  "testdata/spritesheets/smol_sprite_pikafriend.xml" \
  33

benchmark_dataset \
  "Medium (104 frames)" \
  "testdata/spritesheets/norm_sprite_Turmoil_stand.png" \
  "testdata/spritesheets/norm_sprite_Turmoil_stand.xml" \
  104

benchmark_dataset \
  "Large (165 frames)" \
  "testdata/spritesheets/animation_100_frames_Mario_EXE_Melted.png" \
  "testdata/spritesheets/animation_100_frames_Mario_EXE_Melted.xml" \
  165

echo "=================================================================="
echo "  Benchmark Complete!"
echo "=================================================================="
echo
echo -e "${GREEN}Key Insights:${NC}"
echo "  • optimal: Maximum efficiency (85-95%), best for static assets"
echo "  • smart: Balanced efficiency (60-80%), preserves frame order in chunks"
echo "  • preserve: Exact frame order, may sacrifice efficiency for animations"
echo
echo -e "${YELLOW}Recommendations:${NC}"
echo "  • Use 'optimal' for UI sprites, icons, and static game assets"
echo "  • Use 'smart' for animations (best balance of efficiency + frame order)"
echo "  • Use 'preserve' only when exact frame sequence is critical"
echo

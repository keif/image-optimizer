#!/bin/bash

# Benchmark script for comparing packing modes
# Tests: optimal, smart, preserve modes across small, medium, and large datasets

API_URL="${API_URL:-https://api.sosquishy.io}"
MAX_WIDTH="${MAX_WIDTH:-4096}"
MAX_HEIGHT="${MAX_HEIGHT:-4096}"

echo "=================================================================="
echo "  Packing Mode Benchmark"
echo "=================================================================="
echo "API: $API_URL"
echo "Max Dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}"
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
  printf "%-12s | %-12s | %-12s | %-15s | %-10s\n" "Mode" "Size Change" "Output Size" "Processing Time" "Dimensions"
  echo "-------------+--------------+--------------+-----------------+------------"

  for mode in optimal smart preserve; do
    # Create temp files
    temp_json=$(mktemp /tmp/benchmark_json_XXXXXX)
    temp_output=$(mktemp /tmp/benchmark_png_XXXXXX)

    # Make API request - get JSON response with base64 PNG (with 3 minute timeout)
    start_time=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time * 1000')
    http_code=$(curl -s -w "%{http_code}" -o "$temp_json" --max-time 180 \
      -X POST "$API_URL/optimize-spritesheet?packingMode=$mode&outputFormats=json&maxWidth=$MAX_WIDTH&maxHeight=$MAX_HEIGHT" \
      -F "spritesheet=@$png" \
      -F "xml=@$xml")
    end_time=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time * 1000')
    processing_time=$((end_time - start_time))

    # Small delay between requests to prevent overwhelming the API
    sleep 2

    # Check for HTTP errors
    if [ "$http_code" != "200" ]; then
      # Try to get error message from response
      error=$(cat "$temp_json" 2>/dev/null | jq -r '.error // .message // empty' 2>/dev/null)
      if [ -z "$error" ]; then
        error="HTTP $http_code"
      fi
      printf "%-12s | %-12s | %-12s | %-15s | %s\n" \
        "$mode" \
        "ERROR" \
        "N/A" \
        "N/A" \
        "$error"
      rm -f "$temp_json" "$temp_output"
      continue
    fi

    # Extract base64 PNG from JSON and decode it
    if ! jq -r '.sheets[0]' "$temp_json" 2>/dev/null | base64 -d > "$temp_output" 2>/dev/null; then
      printf "%-12s | %-12s | %-12s | %-15s | %s\n" \
        "$mode" \
        "ERROR" \
        "N/A" \
        "N/A" \
        "Failed to decode PNG"
      rm -f "$temp_json" "$temp_output"
      continue
    fi

    # Get image dimensions using identify (ImageMagick/GraphicsMagick)
    if command -v identify &> /dev/null; then
      dimensions=$(identify -format "%wx%h" "$temp_output" 2>/dev/null | head -1)
      width=$(echo "$dimensions" | cut -d'x' -f1)
      height=$(echo "$dimensions" | cut -d'x' -f2)
      # Verify we got valid numbers
      if ! [[ "$width" =~ ^[0-9]+$ ]] || ! [[ "$height" =~ ^[0-9]+$ ]]; then
        width="N/A"
        height="N/A"
      fi
    else
      width="N/A"
      height="N/A"
    fi

    # Get output file size
    output_size_bytes=$(wc -c < "$temp_output" | tr -d ' ')

    # Format size dynamically (KB for small files, MB for large)
    if [ "$output_size_bytes" -lt 102400 ]; then
      # Less than 100KB - show in KB
      output_size_kb=$(echo "scale=1; $output_size_bytes / 1024" | bc)
      output_size_display="${output_size_kb} KB"
    else
      # 100KB or more - show in MB
      output_size_mb=$(echo "scale=2; $output_size_bytes / 1024 / 1024" | bc)
      output_size_display="${output_size_mb} MB"
    fi

    # Calculate size change (negative = compression, positive = expansion)
    input_size_bytes=$(wc -c < "$png" | tr -d ' ')
    size_change=$(echo "scale=1; (($output_size_bytes - $input_size_bytes) / $input_size_bytes) * 100" | bc)

    # If output is larger, show expansion percentage
    # If output is smaller, show compression percentage
    if (( $(echo "$size_change > 0" | bc -l) )); then
      # Output is LARGER - show expansion as positive
      efficiency_fmt="+$(printf "%.1f" "$size_change")"
    else
      # Output is SMALLER - show compression as positive (flip sign)
      compression=$(echo "scale=1; $size_change * -1" | bc)
      efficiency_fmt=$(printf "%.1f" "$compression")
    fi

    # Format and print row
    if [ "$width" = "N/A" ]; then
      dimensions_display="N/A"
    else
      dimensions_display="${width}x${height}"
    fi

    printf "%-12s | %11s%% | %12s | %12s ms | %s\n" \
      "$mode" \
      "$efficiency_fmt" \
      "$output_size_display" \
      "$processing_time" \
      "$dimensions_display"

    # Clean up temp files
    rm -f "$temp_json" "$temp_output"
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

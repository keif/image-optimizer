# Packing Mode Benchmark Results

**Test Configuration:**

- API: <http://localhost:8080>
- Max Dimensions: 8192x8192
- Date: 2025-11-04
- Test Datasets: 3 (Small, Medium, Large)

---

## Dataset: Small (33 frames)

**Input:** 4.6K

| Mode     | Size Change | Output Size | Processing Time | Dimensions |
|----------|-------------|-------------|-----------------|------------|
| optimal  | 40.0%       | 2.6 KB      | 172 ms         | 1186x24    |
| smart    | 40.0%       | 2.6 KB      | 50 ms          | 1186x24    |
| preserve | 40.0%       | 2.6 KB      | 50 ms          | 1186x24    |

**Analysis:**

- All packing modes produce identical results for small datasets
- Smart and preserve are 3.4x faster than optimal (50ms vs 172ms)
- Achieved 40% file size reduction
- Output dimensions identical across all modes

**Recommendation:** Use `smart` or `preserve` for speed with no quality tradeoff

---

## Dataset: Medium (104 frames)

**Input:** 1.7M

| Mode     | Size Change | Output Size | Processing Time | Dimensions  |
|----------|-------------|-------------|-----------------|-------------|
| optimal  | +270.0%     | 6.35 MB     | 37860 ms       | 8125x8094   |
| smart    | +90.0%      | 3.34 MB     | 25785 ms       | 8154x5373   |
| preserve | +80.0%      | 3.19 MB     | 26134 ms       | 8188x5397   |

**Analysis:**

- ⚠️ **All modes expanded the file size** (original was already well-optimized)
- Optimal mode created massive near-square spritesheet (8125x8094), causing 270% expansion
- Preserve mode performed best: smallest output (3.19 MB, +80%)
- Smart mode: middle ground (3.34 MB, +90%)
- Processing times: 25-38 seconds

**Issue Identified:**
The `maxWidth=8192` limit allows creation of excessively large spritesheets. Optimal mode tries to create near-square layouts which waste significant space when approaching the 8192 limit.

**Recommendation:** Use `preserve` mode OR reduce maxWidth to 4096 for better results

---

## Dataset: Large (165 frames)

**Input:** 5.1M

| Mode     | Size Change | Output Size | Processing Time | Dimensions  |
|----------|-------------|-------------|-----------------|-------------|
| optimal  | 10.0%       | 4.45 MB     | 69918 ms       | 8125x8186   |
| smart    | +40.0%      | 7.45 MB     | 82883 ms       | 8181x8117   |
| preserve | +40.0%      | 7.47 MB     | 76785 ms       | 7934x8185   |

**Analysis:**

- Optimal mode achieved actual compression: 10% reduction (5.1M → 4.45 MB)
- Smart and preserve both expanded by 40%
- All modes created very large spritesheets (7934-8188 pixels wide)
- Processing times: 70-83 seconds (1-1.5 minutes)

**Recommendation:** Use `optimal` mode for large datasets when compression is priority

---

## Key Findings

### Performance vs Quality Tradeoffs

1. **Small Datasets (<50 frames)**
   - All modes perform identically
   - Smart/preserve are 3x faster
   - ✅ **Recommendation:** Use `smart` or `preserve`

2. **Medium Datasets (50-150 frames)**
   - Optimal creates oversized spritesheets with maxWidth=8192
   - Preserve produces smallest output despite being "inefficient"
   - ⚠️ All modes expanded file size in this test
   - ✅ **Recommendation:** Use `preserve` OR reduce maxWidth to 4096

3. **Large Datasets (150+ frames)**
   - Optimal achieves compression (10% reduction)
   - Smart/preserve both expand file size
   - Very long processing times (70-83 seconds)
   - ✅ **Recommendation:** Use `optimal`

### Critical Issue: maxWidth=8192

The test revealed that `maxWidth=8192` is **too aggressive** for most use cases:

- Creates spritesheets over 8000 pixels wide
- Introduces significant padding and wasted space
- Can actually increase file size vs more constrained dimensions
- Not supported by many game engines (Unity defaults to 4096)

### Revised Recommendations

**General Guidelines:**

- Default to `maxWidth=4096, maxHeight=4096` (industry standard)
- Only use 8192 for exceptionally large datasets (>200 frames)
- Consider compression quality settings to reduce output size

**Mode Selection:**

- **Animations:** Use `smart` mode (balances efficiency with frame order)
- **Static assets:** Use `optimal` mode (maximum packing efficiency)
- **Exact sequences:** Use `preserve` mode (maintains precise order)

---

## Next Steps

1. **Re-run benchmark with maxWidth=4096** (more realistic constraint)
2. Compare results against these 8192 baseline numbers
3. Test with compression quality settings (JPEG quality, PNG optimization)
4. Document optimal settings per use case

---

## Test Methodology

**Script:** `benchmark-packing.sh`
**Process:**

1. Upload spritesheet + XML to API
2. Request optimization with specified packing mode
3. Receive JSON response with base64-encoded PNG
4. Decode PNG and measure dimensions + file size
5. Calculate size change vs original input

**Metrics:**

- **Size Change:** Positive % = compression, +X% = expansion
- **Output Size:** Final PNG file size
- **Processing Time:** API request duration (includes network latency)
- **Dimensions:** Final spritesheet width×height

**Note:** Processing times include JSON encoding/decoding overhead, so actual optimization may be faster than reported.

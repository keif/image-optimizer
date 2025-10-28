# Installation Guide

Download and install the Image Optimizer binaries for your platform.

## Quick Install

### Standalone Binary (Recommended for Desktop Use)

**The easiest way to get started** - single binary with web UI included:

```bash
# macOS (Apple Silicon)
curl -L https://github.com/keif/image-optimizer/releases/latest/download/image-optimizer-standalone-darwin-arm64 -o imgopt
chmod +x imgopt
./imgopt

# macOS (Intel)
curl -L https://github.com/keif/image-optimizer/releases/latest/download/image-optimizer-standalone-darwin-amd64 -o imgopt
chmod +x imgopt
./imgopt

# Linux (Intel)
curl -L https://github.com/keif/image-optimizer/releases/latest/download/image-optimizer-standalone-linux-amd64 -o imgopt
chmod +x imgopt
./imgopt

# Linux (ARM)
curl -L https://github.com/keif/image-optimizer/releases/latest/download/image-optimizer-standalone-linux-arm64 -o imgopt
chmod +x imgopt
./imgopt

# Windows (download manually)
# Visit: https://github.com/keif/image-optimizer/releases/latest
# Download: image-optimizer-standalone-windows-amd64.exe
# Run: image-optimizer-standalone-windows-amd64.exe
```

Then open your browser to: **<http://localhost:3000>**

---

## Binary Types

We provide three types of binaries:

### 1. Standalone All-in-One (`image-optimizer-standalone-*`)

**Includes:** API server + Web UI embedded
**Use case:** Desktop users who want a complete local app
**Size:** ~30 MB
**Runs on:** Port 3000 (configurable with `--port`)

```bash
./image-optimizer-standalone-darwin-arm64
# Opens web UI at http://localhost:3000
```

**Features:**

- ✅ Complete web interface
- ✅ API server included
- ✅ No external dependencies
- ✅ Offline capable
- ✅ Single binary

---

### 2. CLI Client (`imgopt-*`)

**Includes:** Command-line interface only
**Use case:** Batch processing, automation, CI/CD
**Size:** ~9 MB
**Requires:** API server running (locally or remote)

```bash
# Optimize a single image
./imgopt-darwin-arm64 photo.jpg

# Batch optimize
./imgopt-darwin-arm64 *.jpg

# Custom quality and format
./imgopt-darwin-arm64 --quality 90 --format webp photo.jpg

# Use remote API
./imgopt-darwin-arm64 --api https://api.sosquishy.io photo.jpg
```

**Features:**

- ✅ Fast batch processing
- ✅ Scriptable
- ✅ No CGO dependencies
- ✅ Works with local or remote API
- ✅ Config file support

---

### 3. API Server (`image-optimizer-server-*`)

**Includes:** API backend only
**Use case:** Server deployments, Docker, production
**Size:** ~33 MB
**Runs on:** Port 8080 (configurable with PORT env var)

```bash
./image-optimizer-server-darwin-arm64
# API available at http://localhost:8080
```

**Features:**

- ✅ RESTful API
- ✅ Swagger documentation
- ✅ API key authentication
- ✅ Rate limiting
- ✅ Metrics tracking

---

## System Requirements

### All Platforms

**Required:**

- **libvips** - Image processing library

**Optional:**

- SQLite (included in binaries)

### Installation by Platform

#### macOS

```bash
# Install libvips
brew install vips

# Download and run standalone
curl -L https://github.com/keif/image-optimizer/releases/latest/download/image-optimizer-standalone-darwin-arm64 -o imgopt
chmod +x imgopt
./imgopt
```

#### Linux (Ubuntu/Debian)

```bash
# Install libvips
sudo apt-get update
sudo apt-get install -y libvips-dev

# Download and run standalone
curl -L https://github.com/keif/image-optimizer/releases/latest/download/image-optimizer-standalone-linux-amd64 -o imgopt
chmod +x imgopt
./imgopt
```

#### Linux (RHEL/CentOS/Fedora)

```bash
# Install libvips
sudo dnf install -y vips vips-devel

# Download and run standalone
curl -L https://github.com/keif/image-optimizer/releases/latest/download/image-optimizer-standalone-linux-amd64 -o imgopt
chmod +x imgopt
./imgopt
```

#### Windows

1. Install libvips:
   - Download from: <https://www.libvips.org/>
   - Or use chocolatey: `choco install vips`

2. Download binary:
   - Visit: <https://github.com/keif/image-optimizer/releases/latest>
   - Download: `image-optimizer-standalone-windows-amd64.exe`

3. Run:

   ```cmd
   image-optimizer-standalone-windows-amd64.exe
   ```

---

## Installation Methods

### Method 1: Download from GitHub Releases (Recommended)

Visit: <https://github.com/keif/image-optimizer/releases/latest>

Download the appropriate binary for your platform:

**Standalone (with UI):**

- `image-optimizer-standalone-darwin-arm64` (macOS Apple Silicon)
- `image-optimizer-standalone-darwin-amd64` (macOS Intel)
- `image-optimizer-standalone-linux-amd64` (Linux Intel)
- `image-optimizer-standalone-linux-arm64` (Linux ARM/Raspberry Pi)
- `image-optimizer-standalone-windows-amd64.exe` (Windows)

**CLI:**

- `imgopt-darwin-arm64`
- `imgopt-darwin-amd64`
- `imgopt-linux-amd64`
- `imgopt-linux-arm64`
- `imgopt-windows-amd64.exe`

**API Server:**

- `image-optimizer-server-darwin-arm64`
- `image-optimizer-server-darwin-amd64`
- `image-optimizer-server-linux-amd64`
- `image-optimizer-server-linux-arm64`
- `image-optimizer-server-windows-amd64.exe`

### Method 2: Build from Source

```bash
# Clone repository
git clone https://github.com/keif/image-optimizer.git
cd image-optimizer

# Install dependencies
brew install vips  # macOS
# or
sudo apt-get install libvips-dev  # Linux

# Build standalone
./scripts/build-standalone.sh

# Build CLI + API
./scripts/build-all.sh

# Binaries in dist/
ls -lh dist/
```

### Method 3: Docker

```bash
# Run API server
docker pull ghcr.io/keif/image-optimizer:latest
docker run -p 8080:8080 ghcr.io/keif/image-optimizer:latest

# With docker-compose
docker-compose up
```

---

## Verification

Verify your installation:

```bash
# Standalone
./image-optimizer-standalone-darwin-arm64 --version

# CLI
./imgopt-darwin-arm64 --version

# API Server
./image-optimizer-server-darwin-arm64 --version

# Check SHA256 checksum
sha256sum image-optimizer-standalone-darwin-arm64
# Compare with SHA256SUMS.txt from release
```

---

## Usage Examples

### Standalone Binary

```bash
# Start server (default port 3000)
./image-optimizer-standalone-darwin-arm64

# Custom port
./image-optimizer-standalone-darwin-arm64 --port 8000

# Open browser
open http://localhost:3000
```

### CLI

```bash
# Optimize single image
./imgopt-darwin-arm64 photo.jpg

# Batch optimize with quality
./imgopt-darwin-arm64 --quality 85 *.jpg

# Convert to WebP
./imgopt-darwin-arm64 --format webp photo.jpg

# Resize
./imgopt-darwin-arm64 --width 1920 --height 1080 photo.jpg

# Save to different directory
./imgopt-darwin-arm64 --output ./optimized/ *.jpg

# Use config file
cat > .imgoptrc << EOF
quality: 90
format: webp
output: ./optimized/
api: http://localhost:8080
EOF

./imgopt-darwin-arm64 photo.jpg
```

### API Server

```bash
# Start API server
./image-optimizer-server-darwin-arm64

# Check health
curl http://localhost:8080/health

# View API documentation
open http://localhost:8080/swagger/index.html

# Optimize image via API
curl -X POST http://localhost:8080/optimize \
  -F "image=@photo.jpg" \
  -F "quality=85" \
  -o optimized.jpg
```

---

## Troubleshooting

### "libvips not found"

**Solution:** Install libvips

```bash
# macOS
brew install vips

# Ubuntu/Debian
sudo apt-get install libvips-dev

# Windows
choco install vips
```

### "Permission denied"

**Solution:** Make binary executable

```bash
chmod +x image-optimizer-standalone-darwin-arm64
```

### "Port already in use"

**Solution:** Use a different port

```bash
./image-optimizer-standalone-darwin-arm64 --port 8000
```

### "Database locked"

**Solution:** Only run one instance at a time, or use different ports

---

## Uninstall

Simply delete the binary:

```bash
rm image-optimizer-standalone-darwin-arm64
rm -rf ~/.image-optimizer/  # Remove data directory (optional)
```

---

## Next Steps

- Read the [User Guide](./cmd/standalone/README.md)
- Check the [API Documentation](https://api.sosquishy.io/swagger/index.html)
- View [Examples](./EXAMPLES.md)
- Report issues on [GitHub](https://github.com/keif/image-optimizer/issues)

---

## Support

- **Documentation:** <https://github.com/keif/image-optimizer>
- **Issues:** <https://github.com/keif/image-optimizer/issues>
- **Releases:** <https://github.com/keif/image-optimizer/releases>

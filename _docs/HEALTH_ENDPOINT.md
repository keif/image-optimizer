# Health Endpoint Implementation Guide

## Overview

The `/health` endpoint provides a comprehensive health check for the Image Optimizer API, including version information, git commit hash, and current timestamp. This endpoint is designed for:

- **Uptime monitoring** services (UptimeRobot, Pingdom, etc.)
- **Load balancer health checks** (Fly.io, AWS ELB, etc.)
- **Version verification** during deployments
- **Debugging and troubleshooting**

**Security:** This endpoint exposes no sensitive information and is safe for public access.

---

## Response Format

### Successful Response (HTTP 200)

```json
{
  "status": "ok",
  "version": "v1.3.2",
  "commit": "c1a2b3c",
  "timestamp": "2025-10-19T19:42:00Z"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `status` | string | Always "ok" when API is healthy | `"ok"` |
| `version` | string | Application version from git tag or commit | `"v1.3.2"` or `"v1.3.2-5-g1234567"` |
| `commit` | string | Short git commit hash (7 characters) | `"c1a2b3c"` |
| `timestamp` | string | Current server time in RFC3339 format (UTC) | `"2025-10-19T19:42:00Z"` |

---

## Implementation Details

### File Structure

```
api/
├── version.go              # Build-time version variables
├── main.go                 # Main application (uses HealthHandler)
├── routes/
│   ├── health.go           # Health endpoint handler
│   └── health_test.go      # Comprehensive tests
└── Dockerfile              # Build config with ldflags
```

### 1. Version Variables (`api/version.go`)

```go
package main

// Build-time variables injected via -ldflags
var (
    version   = "dev"     // Set via: -X main.version=$(git describe --tags --always)
    commit    = "none"    // Set via: -X main.commit=$(git rev-parse --short HEAD)
    buildTime = "unknown" // Set via: -X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)
)
```

**How it works:**

- Variables are declared with default values ("dev", "none", "unknown")
- At build time, Docker passes build args via `-ldflags`
- The Go linker replaces the default values with actual git information
- These values are embedded in the compiled binary

### 2. Health Handler (`api/routes/health.go`)

```go
func HealthHandler(version, commit string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        response := HealthResponse{
            Status:    "ok",
            Version:   version,
            Commit:    commit,
            Timestamp: time.Now().UTC().Format(time.RFC3339),
        }
        return c.Status(fiber.StatusOK).JSON(response)
    }
}
```

**Key features:**

- Returns closure that captures version and commit
- Generates fresh timestamp on each request
- Always returns HTTP 200 (unless server is down)
- Uses RFC3339 format for timestamp (ISO 8601 compatible)

### 3. Main Application (`api/main.go`)

```go
func main() {
    // Log version info on startup
    log.Printf("Image Optimizer API")
    log.Printf("Version: %s", version)
    log.Printf("Commit: %s", commit)
    log.Printf("Build Time: %s", buildTime)

    // ... other setup ...

    // Register health endpoint
    app.Get("/health", routes.HealthHandler(version, commit))
}
```

**Startup logs example:**

```
Image Optimizer API
Version: v1.3.2
Commit: c1a2b3c
Build Time: 2025-10-19T15:30:00Z
Starting server on port 8080
```

---

## Build Configuration

### Dockerfile Updates

The `api/Dockerfile` has been updated to accept build arguments and inject them via `-ldflags`:

```dockerfile
# Build arguments for version information
ARG APP_VERSION=dev
ARG GIT_COMMIT=none
ARG BUILD_TIME=unknown

# Build the application with version information injected via ldflags
RUN CGO_ENABLED=1 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags="-X main.version=${APP_VERSION} -X main.commit=${GIT_COMMIT} -X main.buildTime=${BUILD_TIME}" \
    -o main .
```

**What this does:**

1. Declares `ARG` variables with defaults
2. Uses `${APP_VERSION}`, `${GIT_COMMIT}`, and `${BUILD_TIME}` in ldflags
3. The `-X` flag sets the value of string variables at link time
4. Format: `-X package.variable=value`

---

## Deployment Commands

### Local Development

```bash
cd /Users/keif/projects/git/image-optimizer/api

# Build with version info
docker build \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  -t image-optimizer:latest .

# Run locally
docker run -p 8080:8080 image-optimizer:latest

# Test health endpoint
curl http://localhost:8080/health
```

### Fly.io Deployment (Production)

#### Option 1: Manual Deploy with Build Args

```bash
cd /Users/keif/projects/git/image-optimizer/api

# Deploy with version information
flyctl deploy \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

#### Option 2: Deploy Script (Recommended)

Create `api/deploy.sh`:

```bash
#!/bin/bash
set -e

# Get version info from git
APP_VERSION=$(git describe --tags --always)
GIT_COMMIT=$(git rev-parse --short HEAD)
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "Deploying Image Optimizer API"
echo "Version: $APP_VERSION"
echo "Commit: $GIT_COMMIT"
echo "Build Time: $BUILD_TIME"

# Deploy to Fly.io with build args
flyctl deploy \
  --build-arg APP_VERSION="$APP_VERSION" \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --build-arg BUILD_TIME="$BUILD_TIME"

echo "Deployment complete!"
echo "Verifying health endpoint..."

# Wait for deployment to stabilize
sleep 5

# Verify deployment
curl -s https://api.sosquishy.io/health | jq .

echo "✅ Deployment verified!"
```

Make it executable:

```bash
chmod +x api/deploy.sh
```

Deploy:

```bash
./api/deploy.sh
```

#### Option 3: GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for git describe

      - name: Set up Fly CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Get version info
        id: version
        run: |
          echo "APP_VERSION=$(git describe --tags --always)" >> $GITHUB_OUTPUT
          echo "GIT_COMMIT=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT
          echo "BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $GITHUB_OUTPUT

      - name: Deploy to Fly.io
        run: |
          cd api
          flyctl deploy \
            --build-arg APP_VERSION="${{ steps.version.outputs.APP_VERSION }}" \
            --build-arg GIT_COMMIT="${{ steps.version.outputs.GIT_COMMIT }}" \
            --build-arg BUILD_TIME="${{ steps.version.outputs.BUILD_TIME }}"
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

      - name: Verify deployment
        run: |
          sleep 10
          curl -f https://api.sosquishy.io/health
```

---

## Git Versioning Strategies

### Using Git Tags (Recommended for Production)

```bash
# Create a semantic version tag
git tag -a v1.3.2 -m "Release v1.3.2"
git push origin v1.3.2

# Deploy (will use tag as version)
flyctl deploy \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Result: version = "v1.3.2", commit = "c1a2b3c"
```

### Without Tags (Development)

```bash
# Deploy without tags
flyctl deploy \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Result: version = "c1a2b3c" (just the commit hash)
```

### Between Tags (Interim Builds)

```bash
# If you're 5 commits ahead of v1.3.2
git describe --tags --always
# Output: v1.3.2-5-g1234567

# Result: version = "v1.3.2-5-g1234567", commit = "1234567"
```

---

## Testing

### Run Tests

```bash
cd /Users/keif/projects/git/image-optimizer/api

# Run health endpoint tests
go test ./routes -run TestHealth -v

# Run all tests
go test ./... -v

# Run with coverage
go test ./routes -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Test Output Example

```
=== RUN   TestHealthHandler
=== RUN   TestHealthHandler/health_check_with_production_version
=== RUN   TestHealthHandler/health_check_with_dev_version
=== RUN   TestHealthHandler/health_check_with_git_describe_version
--- PASS: TestHealthHandler (0.01s)
    --- PASS: TestHealthHandler/health_check_with_production_version (0.00s)
    --- PASS: TestHealthHandler/health_check_with_dev_version (0.00s)
    --- PASS: TestHealthHandler/health_check_with_git_describe_version (0.00s)
=== RUN   TestHealthHandler_ResponseStructure
--- PASS: TestHealthHandler_ResponseStructure (0.00s)
=== RUN   TestHealthHandler_NoSensitiveInfo
--- PASS: TestHealthHandler_NoSensitiveInfo (0.00s)
PASS
ok      github.com/keif/image-optimizer/routes  0.123s
```

---

## Verification After Deployment

### Basic Health Check

After deploying to Fly.io, verify the health endpoint is working:

```bash
curl https://api.sosquishy.io/health
```

**Expected response:**

```json
{
  "status": "ok",
  "version": "v1.3.2",
  "commit": "c1a2b3c",
  "timestamp": "2025-10-19T19:42:00Z"
}
```

### Detailed Verification

```bash
# Pretty print with jq
curl -s https://api.sosquishy.io/health | jq .

# Check HTTP status code
curl -I https://api.sosquishy.io/health

# Expected:
HTTP/2 200
content-type: application/json; charset=utf-8
```

### Verify Version Matches Deployment

```bash
# Get deployed version
DEPLOYED_VERSION=$(curl -s https://api.sosquishy.io/health | jq -r .version)

# Get local git version
LOCAL_VERSION=$(git describe --tags --always)

# Compare
if [ "$DEPLOYED_VERSION" = "$LOCAL_VERSION" ]; then
  echo "✅ Version matches: $DEPLOYED_VERSION"
else
  echo "❌ Version mismatch!"
  echo "   Deployed: $DEPLOYED_VERSION"
  echo "   Local: $LOCAL_VERSION"
fi
```

### Verify All Fields

```bash
curl -s https://api.sosquishy.io/health | jq '
  {
    "Status OK": (.status == "ok"),
    "Has Version": (.version != null and .version != ""),
    "Has Commit": (.commit != null and .commit != ""),
    "Has Timestamp": (.timestamp != null and .timestamp != ""),
    "Timestamp Valid": (.timestamp | fromdate | . > 0)
  }
'
```

### Check Response Time

```bash
# Measure response time
curl -w "\nResponse Time: %{time_total}s\n" -s https://api.sosquishy.io/health

# Expect < 100ms for healthy API
```

### Browser Verification

Simply open in your browser:

```
https://api.sosquishy.io/health
```

You should see the JSON response rendered nicely by your browser's JSON viewer.

---

## Integration with Monitoring Services

### Fly.io Health Checks

Fly.io automatically uses the `/health` endpoint for health checks (configured in `fly.toml`):

```toml
[[services.http_checks]]
  interval = "30s"
  timeout = "5s"
  grace_period = "10s"
  method = "GET"
  path = "/health"
  protocol = "http"
```

**What this means:**

- Fly checks `/health` every 30 seconds
- If it fails, the instance is restarted
- During deployment, waits 10 seconds before checking

### UptimeRobot Configuration

1. Go to <https://uptimerobot.com/>
2. Add New Monitor
3. Settings:
   - Monitor Type: HTTP(s)
   - Friendly Name: `Image Optimizer API`
   - URL: `https://api.sosquishy.io/health`
   - Monitoring Interval: 5 minutes
   - Keyword: `"ok"` (check response contains "ok")

### Pingdom Configuration

1. Go to <https://www.pingdom.com/>
2. Add New Check
3. Settings:
   - Name: `Image Optimizer API`
   - URL: `https://api.sosquishy.io/health`
   - Check Interval: 1 minute
   - String to expect: `"status":"ok"`

---

## Troubleshooting

### Issue: Version shows "dev" in production

**Cause:** Build args not passed during deployment

**Solution:**

```bash
# Always use build args when deploying
flyctl deploy \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

### Issue: Commit shows "none"

**Cause:** Git repository not initialized or build args missing

**Solution:**

```bash
# Verify git repo exists
git status

# Verify you have commits
git log --oneline -1

# Deploy with build args
flyctl deploy --build-arg GIT_COMMIT=$(git rev-parse --short HEAD)
```

### Issue: "git describe" fails

**Cause:** No git tags exist

**Solution:**

```bash
# Create a tag
git tag v1.0.0
git push origin v1.0.0

# Or use --always flag (already included)
git describe --tags --always
# Falls back to commit hash if no tags exist
```

### Issue: Health endpoint returns 404

**Cause:** Route not registered or middleware blocking

**Solution:**

```bash
# Check app logs
flyctl logs

# Verify route is registered in main.go
grep -n "HealthHandler" api/main.go

# Test locally
curl http://localhost:8080/health
```

### Issue: Response missing timestamp

**Cause:** Handler not generating timestamp

**Solution:** Already implemented - timestamp is generated on each request in `routes/health.go:28`

---

## Best Practices

### 1. Always Tag Production Releases

```bash
git tag -a v1.3.2 -m "Release v1.3.2: Add health endpoint with version info"
git push origin v1.3.2
```

### 2. Use Semantic Versioning

- **Major** (v2.0.0): Breaking changes
- **Minor** (v1.3.0): New features, backwards compatible
- **Patch** (v1.3.2): Bug fixes

### 3. Verify After Every Deployment

```bash
# Quick verification script
curl -s https://api.sosquishy.io/health | jq '{version, commit, status}'
```

### 4. Monitor Health Endpoint

- Set up UptimeRobot or Pingdom
- Alert on downtime or slow responses
- Track historical uptime

### 5. Include in Smoke Tests

After deployment, always check:

```bash
# 1. Health endpoint
curl https://api.sosquishy.io/health

# 2. Swagger docs
curl https://api.sosquishy.io/swagger/index.html

# 3. Sample optimization
curl -X POST https://api.sosquishy.io/optimize -F "image=@test.jpg"
```

---

## Security Considerations

### What This Endpoint Exposes

✅ **Safe to expose:**

- Application version (public information)
- Git commit hash (public if GitHub repo is public)
- Current timestamp (public information)
- Health status ("ok")

❌ **Does NOT expose:**

- Environment variables
- Database credentials
- API keys
- Internal paths
- Server configuration
- User data

### Rate Limiting

The health endpoint is **exempt from API key requirements** but still subject to rate limiting (configured in `middleware/`).

**Why?**

- Monitoring services need unauthenticated access
- Rate limiting prevents abuse
- No sensitive data exposed

---

## Complete Example: Deploy New Version

```bash
# 1. Make your changes
# ... edit code ...

# 2. Commit changes
git add .
git commit -m "Add new feature"

# 3. Tag the release
git tag -a v1.4.0 -m "Release v1.4.0: New feature"
git push origin main
git push origin v1.4.0

# 4. Deploy with version info
cd api
flyctl deploy \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# 5. Verify deployment
curl -s https://api.sosquishy.io/health | jq .

# Expected output:
# {
#   "status": "ok",
#   "version": "v1.4.0",
#   "commit": "d4e5f6g",
#   "timestamp": "2025-10-19T20:15:00Z"
# }

# 6. Check logs
flyctl logs

# Should see:
# Image Optimizer API
# Version: v1.4.0
# Commit: d4e5f6g
# Build Time: 2025-10-19T20:10:00Z
```

---

## Quick Reference

### Commands

```bash
# Deploy with version info
flyctl deploy \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Test health endpoint
curl https://api.sosquishy.io/health

# Verify version
curl -s https://api.sosquishy.io/health | jq -r .version

# Run tests
go test ./routes -run TestHealth -v
```

### Files Modified

- ✅ `api/version.go` - Version variables (NEW)
- ✅ `api/routes/health.go` - Health handler (NEW)
- ✅ `api/routes/health_test.go` - Tests (NEW)
- ✅ `api/main.go` - Updated to use HealthHandler
- ✅ `api/Dockerfile` - Added build args and ldflags

---

**Documentation Version:** 1.0
**Last Updated:** 2025-10-19
**Author:** Image Optimizer API Team

# Render → Fly.io Migration Guide
## Image Optimizer API Migration

---

## Overview

**Current Setup:**
- Platform: Render.com
- URL: `https://image-optimizer-1t9i.onrender.com`
- Custom Domain: `api.sosquishy.io`
- Tech: Go 1.24 + Fiber + libvips
- Memory: 512 MB (hitting limits)
- Database: SQLite (persistent volume needed)

**Target Setup:**
- Platform: Fly.io
- Memory: 2 GB
- Region: Auto-selected (can specify)
- Cost: ~$5-10/month (vs Render's pricing)

---

## Migration Plan

### Phase 1: Preparation (5 minutes)
1. Install Fly CLI
2. Create Fly.io account
3. Review current environment variables on Render

### Phase 2: Initial Setup (10 minutes)
1. Initialize Fly app
2. Configure fly.toml
3. Create volume for SQLite database
4. Set environment variables

### Phase 3: Deployment (5 minutes)
1. Deploy application
2. Verify health endpoint
3. Test API endpoints

### Phase 4: Domain Migration (10 minutes)
1. Add custom domain to Fly
2. Configure DNS records
3. Enable HTTPS certificates
4. Update CORS origins

### Phase 5: Cutover (5 minutes)
1. Final testing on new domain
2. Monitor logs and metrics
3. Scale if needed
4. Delete Render service (optional)

**Total Time: ~35 minutes**

---

## Step-by-Step Instructions

### Step 1: Install Fly CLI

**macOS:**
```bash
brew install flyctl
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify installation:**
```bash
flyctl version
```

---

### Step 2: Authenticate with Fly.io

```bash
flyctl auth login
```

This will open a browser window for authentication.

---

### Step 3: Navigate to Your Project

```bash
cd /Users/keif/projects/git/image-optimizer/api
```

---

### Step 4: Initialize Fly Application

```bash
# This will scan your Dockerfile and generate fly.toml
flyctl launch --no-deploy

# When prompted:
# - App name: image-optimizer (or choose your own)
# - Region: Choose closest to your users (e.g., iad for US East, lax for US West)
# - PostgreSQL: NO (we're using SQLite)
# - Redis: NO
# - Deploy now: NO (we'll configure first)
```

**Note:** This creates a `fly.toml` file. We'll replace it with our custom configuration.

---

### Step 5: Create Persistent Volume for SQLite Database

```bash
# Create a 1GB volume (can expand later)
flyctl volumes create image_optimizer_data \
  --region iad \
  --size 1

# If you chose a different region during launch, use that region here
```

**Important:** The volume must be in the same region as your app.

---

### Step 6: Replace fly.toml with Production Config

Replace the auto-generated `fly.toml` with this configuration:

```toml
# See the full configuration in the next section
```

(The actual file is provided separately below)

---

### Step 7: Set Environment Variables

```bash
# Production CORS origins (update with your actual frontend URL)
flyctl secrets set CORS_ORIGINS="https://sosquishy.io,https://www.sosquishy.io,https://keif.github.io"

# Public optimization access (required for public web UI)
flyctl secrets set PUBLIC_OPTIMIZATION_ENABLED=true

# API key authentication (enabled for API key management)
flyctl secrets set API_KEY_AUTH_ENABLED=true

# Rate limiting
flyctl secrets set RATE_LIMIT_ENABLED=true
flyctl secrets set RATE_LIMIT_MAX=100
flyctl secrets set RATE_LIMIT_WINDOW=1m

# Database path (matches volume mount)
flyctl secrets set DB_PATH=/app/data/api_keys.db

# Optional: Domain whitelist (comma-separated)
# flyctl secrets set ALLOWED_DOMAINS="cloudinary.com,imgur.com,unsplash.com,pexels.com"
```

**View all secrets:**
```bash
flyctl secrets list
```

---

### Step 8: Deploy to Fly.io

```bash
# Deploy the application
flyctl deploy

# This will:
# 1. Build Docker image using your Dockerfile
# 2. Push to Fly.io registry
# 3. Create VM with 2GB RAM
# 4. Mount persistent volume at /app/data
# 5. Start the application
```

**Monitor deployment:**
```bash
flyctl logs
```

---

### Step 9: Verify Deployment

```bash
# Check app status
flyctl status

# Test health endpoint
curl https://image-optimizer.fly.dev/health

# Expected response:
# {"status":"ok"}

# Check Swagger docs
curl https://image-optimizer.fly.dev/swagger/index.html
```

---

### Step 10: Add Custom Domain

```bash
# Add your custom domain
flyctl certs add api.sosquishy.io

# This will output DNS configuration instructions
```

**Example output:**
```
Your certificate for api.sosquishy.io is being issued.
Add the following DNS records to your domain:

CNAME record:
  Host: api.sosquishy.io
  Points to: image-optimizer.fly.dev
```

---

### Step 11: Configure DNS Records

Go to your DNS provider (e.g., Cloudflare, Namecheap, Route53) and add:

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: api (or api.sosquishy.io)
Value: image-optimizer.fly.dev
TTL: Auto or 300
Proxy: Disabled (important!)
```

**Option B: A and AAAA Records**
```bash
# Get Fly's IP addresses
flyctl ips list

# Add these to your DNS:
Type: A
Name: api
Value: <IPv4 from above>

Type: AAAA
Name: api
Value: <IPv6 from above>
```

---

### Step 12: Verify HTTPS Certificate

```bash
# Check certificate status
flyctl certs show api.sosquishy.io

# Wait for "issued" status (usually 1-5 minutes)
```

**Test HTTPS:**
```bash
curl https://api.sosquishy.io/health
```

---

### Step 13: Update CORS Origins (if needed)

If you need to add more origins:

```bash
flyctl secrets set CORS_ORIGINS="https://sosquishy.io,https://www.sosquishy.io,https://keif.github.io,https://api.sosquishy.io"
```

---

### Step 14: Scale Memory to 2GB

```bash
# Set VM size to 2GB RAM
flyctl scale memory 2048

# Verify
flyctl status
```

**Available memory sizes:**
- 256 MB (shared CPU)
- 512 MB (shared CPU)
- 1024 MB (1 GB)
- 2048 MB (2 GB) ← Your target
- 4096 MB (4 GB)
- 8192 MB (8 GB)

---

### Step 15: Monitor and Verify

```bash
# Watch logs in real-time
flyctl logs

# Check metrics
flyctl metrics

# SSH into the running instance (for debugging)
flyctl ssh console

# Inside the container:
ls -lah /app/data/  # Verify database directory
ps aux              # Check running processes
df -h               # Check disk usage
```

---

## Post-Migration Checklist

- [ ] Health endpoint responding at `https://api.sosquishy.io/health`
- [ ] Swagger docs accessible at `https://api.sosquishy.io/swagger/index.html`
- [ ] Image optimization working (test `/optimize` endpoint)
- [ ] Spritesheet packing working (test `/pack-sprites` endpoint)
- [ ] CORS headers working (test from frontend)
- [ ] Rate limiting working (send 100+ requests)
- [ ] SQLite database persisting (create API key, restart app, verify key still exists)
- [ ] Memory at 2GB (`flyctl status`)
- [ ] No timeout errors on large file uploads (test 10MB+ files)

---

## Testing Endpoints

```bash
# 1. Health check
curl https://api.sosquishy.io/health

# 2. Optimize single image
curl -X POST https://api.sosquishy.io/optimize \
  -F "image=@test-image.jpg" \
  -F "format=webp" \
  -F "quality=80" \
  --output optimized.webp

# 3. Pack sprites (requires sprite images)
curl -X POST https://api.sosquishy.io/pack-sprites \
  -F "sprites=@sprite1.png" \
  -F "sprites=@sprite2.png" \
  -F "maxWidth=2048" \
  -F "maxHeight=2048" \
  --output spritesheet.zip

# 4. API key creation (requires initial bootstrap or existing key)
curl -X POST https://api.sosquishy.io/api/keys \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Rollback Plan

If something goes wrong:

```bash
# 1. Check logs for errors
flyctl logs

# 2. Roll back to previous deployment
flyctl releases

# Get the release version number
flyctl rollback v<version-number>

# 3. Or redeploy specific version
flyctl deploy --image registry.fly.io/image-optimizer:<version>
```

**Emergency fallback:**
- Keep Render service running during initial testing
- Switch DNS back to Render if issues occur
- Debug on Fly.io without affecting users

---

## Cost Comparison

**Render.com (Current):**
- 512 MB: ~$7-25/month (depending on plan)
- Limited free tier hours

**Fly.io (New):**
- 2 GB RAM: ~$5-10/month
- Includes 3GB persistent volume
- Pay-as-you-go pricing
- More generous free tier (2340 hours/month)

**Estimated savings: $5-15/month + better performance**

---

## Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `8080` | Internal port (auto-set by Fly) |
| `CORS_ORIGINS` | `https://sosquishy.io,...` | Allowed frontend origins |
| `DB_PATH` | `/app/data/api_keys.db` | SQLite database location |
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW` | `1m` | Rate limit time window |
| `API_KEY_AUTH_ENABLED` | `true` | Enable API key system |
| `PUBLIC_OPTIMIZATION_ENABLED` | `true` | Allow public access to optimization endpoints |
| `ALLOWED_DOMAINS` | (optional) | Whitelist for URL-based image fetching |

---

## Troubleshooting

### Issue: "no such image" during build
**Solution:**
```bash
flyctl deploy --local-only
```

### Issue: Volume not mounting
**Solution:**
```bash
# Check volume exists
flyctl volumes list

# Recreate if needed
flyctl volumes destroy image_optimizer_data
flyctl volumes create image_optimizer_data --region iad --size 1
```

### Issue: CORS errors from frontend
**Solution:**
```bash
# Verify CORS origins include your frontend
flyctl secrets list
flyctl secrets set CORS_ORIGINS="https://sosquishy.io,https://www.sosquishy.io"
```

### Issue: Out of memory errors
**Solution:**
```bash
# Scale up memory
flyctl scale memory 4096

# Or add swap (if needed)
# Edit fly.toml to add swap_size_mb
```

### Issue: Certificate not issuing
**Solution:**
```bash
# Verify DNS is correct
dig api.sosquishy.io

# Force certificate refresh
flyctl certs remove api.sosquishy.io
flyctl certs add api.sosquishy.io
```

### Issue: Database not persisting
**Solution:**
```bash
# Check volume is mounted
flyctl ssh console
ls -lah /app/data/

# Verify fly.toml has correct mount config
# Should have: destination = "/app/data"
```

---

## Useful Fly.io Commands

```bash
# View all apps
flyctl apps list

# Destroy app (careful!)
flyctl apps destroy image-optimizer

# Scale horizontally (multiple instances)
flyctl scale count 2

# View pricing for current config
flyctl platform vm-sizes

# Open app in browser
flyctl open

# View dashboard
flyctl dashboard

# SSH into running container
flyctl ssh console

# Run one-off command
flyctl ssh console -C "ls -la /app/data"

# Copy file from VM
flyctl ssh sftp get /app/data/api_keys.db ./local-backup.db

# View all regions
flyctl platform regions

# Change region (requires redeployment)
flyctl regions set iad lax
```

---

## Next Steps After Migration

1. **Monitor for 24-48 hours** - Watch logs, metrics, error rates
2. **Update frontend config** - Point API calls to `api.sosquishy.io`
3. **Test all features** - Optimization, spritesheet packing, API keys
4. **Set up monitoring** - Use Fly metrics or external monitoring (UptimeRobot, Pingdom)
5. **Configure auto-scaling** (optional) - `flyctl autoscale` for traffic spikes
6. **Backup database** - Schedule periodic backups of SQLite database
7. **Delete Render service** - Once confident, remove from Render to stop billing

---

## Support Resources

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io/
- Fly.io Status: https://status.fly.io/
- Your project issues: https://github.com/keif/image-optimizer/issues

---

**Migration Date:** _______________________

**Migrated By:** _______________________

**Notes:**

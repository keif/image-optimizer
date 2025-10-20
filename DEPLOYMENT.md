# Deployment Guide

## Architecture

- **Frontend**: GitHub Pages (static Next.js export at https://sosquishy.io)
- **Backend**: Hetzner Cloud VPS (Ubuntu 22.04, previously Fly.io)
  - **Migration reason**: Memory limitations on Fly.io causing OOM (Out of Memory) errors

## Quick Links

- **Migration to Hetzner**: See [HETZNER_MIGRATION.md](./HETZNER_MIGRATION.md) for complete migration guide from Fly.io
- **Memory Issue**: The migration was triggered by OOM (Out of Memory) errors on Fly.io's 2GB VMs during large image processing

---

## Custom Domain Setup

### Frontend Domain: sosquishy.io

The frontend is deployed to GitHub Pages with a custom domain.

#### DNS Configuration

Add the following DNS records in your domain provider (sosquishy.io):

**For sosquishy.io (apex domain):**

```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
TTL: 3600 (or Auto)
```

**For www.sosquishy.io:**

```
Type: CNAME
Name: www
Value: keif.github.io
TTL: 3600 (or Auto)
```

#### GitHub Pages Configuration

1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Custom domain: `sosquishy.io`
4. Check "Enforce HTTPS" (after DNS propagates)

### Backend API: Hetzner Cloud

The API is hosted at: `https://api.sosquishy.io` (Hetzner Cloud VPS)

**DNS Configuration:**

Add the following DNS record in your domain provider:

```
Type: A
Name: api
Value: [Your Hetzner Server IP]
TTL: 3600 (or Auto)
```

**CORS is configured to allow:**
- `https://sosquishy.io` (custom domain)
- `https://www.sosquishy.io` (www subdomain)
- `http://localhost:3000` (local development)

## Deployment Workflow

### Frontend Deployment

Automatic deployment via GitHub Actions (`.github/workflows/deploy-pages.yml`):

1. Triggers on push to `main` branch (when `web/` changes)
2. Builds Next.js app with production API URL
3. Deploys static files to GitHub Pages
4. Available at: `https://sosquishy.io`

**Manual deployment:**
```bash
cd web
NEXT_PUBLIC_API_URL=https://api.sosquishy.io pnpm run build
# Output in: web/out/
```

### Backend Deployment (Hetzner Cloud)

**For complete migration guide, see [HETZNER_MIGRATION.md](./HETZNER_MIGRATION.md)**

**Quick deployment using script:**

```bash
# One-command deployment
./deploy-hetzner.sh
```

The script will:
1. Copy source code to server
2. Build binary on server with version info
3. Verify binary is Linux ELF (not macOS)
4. Deploy to /usr/local/bin/
5. Restart systemd service
6. Verify health endpoint

**Manual deployment steps:**

1. Copy source to server:
   ```bash
   cd /Users/keif/projects/git/image-optimizer
   rsync -avz --exclude='node_modules' --exclude='.git' --exclude='web' \
     ./api/ root@sosquishy-server:/tmp/api-build/
   ```

2. Build on server (IMPORTANT: Build on Linux, not on your Mac):
   ```bash
   ssh sosquishy-server
   cd /tmp/api-build

   # Build with version info
   go build -v \
     -ldflags "-X main.version=$(git describe --tags --always 2>/dev/null || echo 'v0.1.0') -X main.commit=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown') -X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
     -o image-optimizer \
     main.go

   # Verify it's a Linux binary (must show "ELF 64-bit LSB executable")
   file image-optimizer

   # Deploy
   mv image-optimizer /usr/local/bin/image-optimizer
   chmod +x /usr/local/bin/image-optimizer
   rm -rf /tmp/api-build
   ```

3. Restart service:
   ```bash
   systemctl restart image-optimizer
   ```

4. Verify deployment:
   ```bash
   curl https://api.sosquishy.io/health
   ```

**Important Notes:**
- The app uses `bimg` which requires CGO - you MUST build on the Linux server
- Never build on your Mac and copy the binary - it won't work (different architecture)
- Always verify with `file image-optimizer` - must show "ELF 64-bit LSB executable"
- The ldflags set version info: `-X main.version`, `-X main.commit`, `-X main.buildTime`

**Alternative: Docker deployment**
- See Section 7 in [HETZNER_MIGRATION.md](./HETZNER_MIGRATION.md)

## Environment Variables

### Frontend (GitHub Actions)

Set in workflow file (`.github/workflows/deploy-pages.yml`):

```yaml
env:
  NEXT_PUBLIC_API_URL: https://api.sosquishy.io
```

### Backend (Hetzner Cloud)

Configured in `/opt/image-optimizer/.env`:

- `PORT`: 8080
- `CORS_ORIGINS`: https://sosquishy.io,https://www.sosquishy.io,http://localhost:3000
- `DB_PATH`: /opt/image-optimizer/data/api_keys.db
- `RATE_LIMIT_ENABLED`: true
- `RATE_LIMIT_MAX`: 100
- `RATE_LIMIT_WINDOW`: 1m
- `API_KEY_AUTH_ENABLED`: true
- `PUBLIC_OPTIMIZATION_ENABLED`: true
- `ALLOWED_DOMAINS`: cloudinary.com,imgur.com,unsplash.com,pexels.com,localhost,127.0.0.1

## DNS Propagation

After adding DNS records, propagation can take:
- **Minimum**: 5-10 minutes
- **Typical**: 1-2 hours
- **Maximum**: 48 hours (rare)

Check propagation status:
```bash
# Check A records for apex domain
dig sosquishy.io A

# Expected output:
# sosquishy.io.  3600  IN  A  185.199.108.153
# sosquishy.io.  3600  IN  A  185.199.109.153
# sosquishy.io.  3600  IN  A  185.199.110.153
# sosquishy.io.  3600  IN  A  185.199.111.153
```

## Testing

### Test Frontend
```bash
curl -I https://sosquishy.io
# Should return: HTTP/2 200
```

### Test Backend
```bash
curl https://api.sosquishy.io/health
# Should return: {"status":"ok"}
```

### Test CORS
```bash
curl -H "Origin: https://sosquishy.io" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.sosquishy.io/optimize
# Should include: Access-Control-Allow-Origin header
```

## Troubleshooting

### Frontend not loading
1. Check GitHub Actions workflow status
2. Verify DNS propagation: `dig sosquishy.io`
3. Check GitHub Pages settings
4. Clear browser cache

### CORS errors
1. Verify domain in `render.yaml` CORS_ORIGINS
2. Redeploy API on Render.com
3. Check browser console for exact error
4. Test with curl (see above)

### API not responding
1. Check Render.com dashboard for service status
2. Review API logs on Render.com
3. Test health endpoint: `/health`
4. Verify environment variables

## Updating Deployment

### Update Frontend
```bash
# Make changes to web/
git add .
git commit -m "Update frontend"
git push origin main
# GitHub Actions will automatically deploy
```

### Update Backend
```bash
# Make changes to api/
git add .
git commit -m "Update backend"
git push origin main
# Render.com will automatically deploy
```

### Update Configuration
```bash
# Edit render.yaml for backend config
# Edit .github/workflows/deploy-pages.yml for frontend config
git add .
git commit -m "Update deployment configuration"
git push origin main
```

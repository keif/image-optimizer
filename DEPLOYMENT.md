# Deployment Guide

## Architecture

- **Frontend**: GitHub Pages (static Next.js export)
- **Backend**: Render.com (Go API with libvips)

## Custom Domain Setup

### Frontend Domain: squish.baker.is

The frontend is deployed to GitHub Pages with a custom domain.

#### DNS Configuration

Add the following DNS records in your domain provider (baker.is):

**For squish.baker.is:**

```
Type: CNAME
Name: squish
Value: keif.github.io
TTL: 3600 (or Auto)
```

**For image-optimizer.baker.is (optional alternative):**

```
Type: CNAME
Name: image-optimizer
Value: keif.github.io
TTL: 3600 (or Auto)
```

#### GitHub Pages Configuration

1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Custom domain: `squish.baker.is`
4. Check "Enforce HTTPS" (after DNS propagates)

### Backend API: Render.com

The API is hosted at: `https://image-optimizer-1t9i.onrender.com`

**CORS is configured to allow:**
- `https://keif.github.io` (GitHub Pages default)
- `https://squish.baker.is` (custom domain)
- `https://image-optimizer.baker.is` (alternative domain)
- `http://localhost:3000` (local development)

## Deployment Workflow

### Frontend Deployment

Automatic deployment via GitHub Actions (`.github/workflows/deploy-pages.yml`):

1. Triggers on push to `main` branch (when `web/` changes)
2. Builds Next.js app with production API URL
3. Deploys static files to GitHub Pages
4. Available at: `https://squish.baker.is`

**Manual deployment:**
```bash
cd web
NEXT_PUBLIC_API_URL=https://image-optimizer-1t9i.onrender.com pnpm run build
# Output in: web/out/
```

### Backend Deployment

Automatic deployment via Render.com:

1. Connected to GitHub repository
2. Auto-deploys on push to `main` branch
3. Uses `render.yaml` for configuration
4. Dockerfile: `api/Dockerfile`

**Manual trigger:**
- Visit Render.com dashboard → Manual Deploy

## Environment Variables

### Frontend (GitHub Actions)

Set in workflow file (`.github/workflows/deploy-pages.yml`):

```yaml
env:
  NEXT_PUBLIC_API_URL: https://image-optimizer-1t9i.onrender.com
```

### Backend (Render.com)

Configured in `render.yaml`:

- `PORT`: 8080
- `CORS_ORIGINS`: https://keif.github.io,https://squish.baker.is,https://image-optimizer.baker.is,http://localhost:3000
- `DB_PATH`: /opt/render/project/data/api_keys.db
- `RATE_LIMIT_ENABLED`: true
- `RATE_LIMIT_MAX`: 100
- `RATE_LIMIT_WINDOW`: 1m
- `API_KEY_AUTH_ENABLED`: true
- `ALLOWED_DOMAINS`: cloudinary.com,imgur.com,unsplash.com,pexels.com

## DNS Propagation

After adding DNS records, propagation can take:
- **Minimum**: 5-10 minutes
- **Typical**: 1-2 hours
- **Maximum**: 48 hours (rare)

Check propagation status:
```bash
# Check CNAME record
dig squish.baker.is CNAME

# Expected output:
# squish.baker.is.  3600  IN  CNAME  keif.github.io.
```

## Testing

### Test Frontend
```bash
curl -I https://squish.baker.is
# Should return: HTTP/2 200
```

### Test Backend
```bash
curl https://image-optimizer-1t9i.onrender.com/health
# Should return: {"status":"ok"}
```

### Test CORS
```bash
curl -H "Origin: https://squish.baker.is" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://image-optimizer-1t9i.onrender.com/optimize
# Should include: Access-Control-Allow-Origin header
```

## Troubleshooting

### Frontend not loading
1. Check GitHub Actions workflow status
2. Verify DNS propagation: `dig squish.baker.is`
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

# Fly.io Deployment - Quick Command Reference

## Copy-Paste Ready Commands

### 1. Install Fly CLI (macOS)

```bash
brew install flyctl
```

### 2. Authenticate

```bash
flyctl auth login
```

### 3. Navigate to API Directory

```bash
cd /Users/keif/projects/git/image-optimizer/api
```

### 4. Initialize App (Don't Deploy Yet)

```bash
flyctl launch --no-deploy
# Choose app name: image-optimizer
# Choose region: iad (or your preference)
# PostgreSQL: NO
# Redis: NO
```

### 5. Create Persistent Volume

```bash
flyctl volumes create image_optimizer_data --region iad --size 1
```

### 6. Set Environment Variables (Secrets)

```bash
flyctl secrets set CORS_ORIGINS="https://sosquishy.io,https://www.sosquishy.io,https://keif.github.io"
flyctl secrets set PUBLIC_OPTIMIZATION_ENABLED=true
flyctl secrets set API_KEY_AUTH_ENABLED=true
flyctl secrets set RATE_LIMIT_ENABLED=true
flyctl secrets set RATE_LIMIT_MAX=100
flyctl secrets set RATE_LIMIT_WINDOW=1m
flyctl secrets set DB_PATH=/app/data/api_keys.db
```

### 7. Deploy Application

```bash
flyctl deploy
```

### 8. Verify Deployment

```bash
flyctl status
flyctl logs
curl https://image-optimizer.fly.dev/health
```

### 9. Scale Memory to 2GB

```bash
flyctl scale memory 2048
```

### 10. Add Custom Domain

```bash
flyctl certs add api.sosquishy.io
```

### 11. Get DNS Configuration

```bash
flyctl certs show api.sosquishy.io
```

**Add this to your DNS:**

```
Type: CNAME
Name: api
Value: image-optimizer.fly.dev
TTL: Auto
Proxy: OFF
```

### 12. Verify Certificate

```bash
flyctl certs show api.sosquishy.io
# Wait for status: "issued"

curl https://api.sosquishy.io/health
```

---

## Common Management Commands

### View Logs

```bash
flyctl logs
flyctl logs --follow  # Real-time
```

### Check Status

```bash
flyctl status
```

### List Secrets

```bash
flyctl secrets list
```

### SSH into Container

```bash
flyctl ssh console
```

### View Metrics

```bash
flyctl metrics
```

### Scale Resources

```bash
# Memory
flyctl scale memory 4096

# Instance count
flyctl scale count 2

# Show pricing
flyctl platform vm-sizes
```

### Rollback Deployment

```bash
flyctl releases
flyctl rollback v<VERSION>
```

### Destroy App (WARNING: Permanent)

```bash
flyctl apps destroy image-optimizer
```

---

## Testing Commands

### Test Health Endpoint

```bash
curl https://api.sosquishy.io/health
```

### Test Image Optimization

```bash
curl -X POST https://api.sosquishy.io/optimize \
  -F "image=@test.jpg" \
  -F "format=webp" \
  -F "quality=80" \
  --output optimized.webp
```

### Test Swagger Docs

```bash
open https://api.sosquishy.io/swagger/index.html
```

---

## Emergency Commands

### View All Apps

```bash
flyctl apps list
```

### Restart App

```bash
flyctl apps restart image-optimizer
```

### Delete Volume (CAREFUL: Data Loss)

```bash
flyctl volumes list
flyctl volumes destroy <VOLUME_ID>
```

### Remove Certificate

```bash
flyctl certs remove api.sosquishy.io
```

---

## One-Line Full Deployment

**After initial setup, redeploy with:**

```bash
flyctl deploy && flyctl logs
```

---

## Complete Migration (All Commands)

```bash
# 1. Install and authenticate
brew install flyctl
flyctl auth login

# 2. Navigate to project
cd /Users/keif/projects/git/image-optimizer/api

# 3. Initialize (no deploy)
flyctl launch --no-deploy

# 4. Create volume
flyctl volumes create image_optimizer_data --region iad --size 1

# 5. Set all secrets
flyctl secrets set \
  CORS_ORIGINS="https://sosquishy.io,https://www.sosquishy.io,https://keif.github.io" \
  PUBLIC_OPTIMIZATION_ENABLED=true \
  API_KEY_AUTH_ENABLED=true \
  RATE_LIMIT_ENABLED=true \
  RATE_LIMIT_MAX=100 \
  RATE_LIMIT_WINDOW=1m \
  DB_PATH=/app/data/api_keys.db

# 6. Deploy
flyctl deploy

# 7. Scale memory
flyctl scale memory 2048

# 8. Add domain
flyctl certs add api.sosquishy.io

# 9. Verify
flyctl status
curl https://api.sosquishy.io/health
```

---

## DNS Configuration (Copy to DNS Provider)

**For Cloudflare, Namecheap, Route53, etc.:**

```
Record Type: CNAME
Name: api
Target: image-optimizer.fly.dev
TTL: Auto (or 300)
Proxy Status: DNS Only (disable proxy/CDN)
```

**Alternative: A/AAAA Records**

```bash
# Get IPs first
flyctl ips list

# Then add:
Type: A
Name: api
Value: <IPv4 from command>

Type: AAAA
Name: api
Value: <IPv6 from command>
```

---

## Post-Deployment Checklist

```bash
# ✅ Health check
curl https://api.sosquishy.io/health

# ✅ Swagger docs
curl -I https://api.sosquishy.io/swagger/index.html

# ✅ CORS working (check from browser console)
# ✅ Memory at 2GB
flyctl status | grep Memory

# ✅ Volume mounted
flyctl ssh console -C "ls -lah /app/data"

# ✅ Logs clean
flyctl logs

# ✅ Certificate issued
flyctl certs show api.sosquishy.io
```

---

## Troubleshooting

**Build fails:**

```bash
flyctl deploy --local-only
```

**Certificate not issuing:**

```bash
dig api.sosquishy.io  # Verify DNS
flyctl certs remove api.sosquishy.io
flyctl certs add api.sosquishy.io
```

**Volume issues:**

```bash
flyctl volumes list
flyctl ssh console -C "df -h"
```

**Memory issues:**

```bash
flyctl scale memory 4096
```

---

## Cost Estimate

Run this to see pricing:

```bash
flyctl platform vm-sizes
```

**Expected cost for 2GB RAM:**

- ~$0.007/hour
- ~$5-10/month
- Includes 1GB volume
- Free HTTPS certificates
- Free bandwidth (up to limits)

---

## Support

- Docs: <https://fly.io/docs/>
- Community: <https://community.fly.io/>
- Status: <https://status.fly.io/>

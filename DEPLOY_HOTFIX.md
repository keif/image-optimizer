# Hot Fix Deployment Guide

## Issues Fixed

1. **CSP Error**: Added `baker.goatcounter.com` to Content-Security-Policy
2. **CORS Logging**: Added logging to verify CORS origins are being loaded correctly

## Deploy Steps

### 1. Build Frontend

```bash
cd web
pnpm run build
```

### 2. Deploy Frontend (GitHub Pages)

```bash
git add .
git commit -m "fix: add baker.goatcounter.com to CSP policy and improve CORS logging"
git push origin main
```

GitHub Actions will automatically deploy the frontend.

### 3. Deploy API (Hetzner)

```bash
# From project root
cd api

# Build on server (required for bimg/libvips)
ssh sosquishy-server

# On server:
cd /tmp
rm -rf api-build
mkdir api-build
exit

# Copy source to server
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='web' --exclude='data' \
  ./api/ root@sosquishy-server:/tmp/api-build/

# SSH back to server and build
ssh sosquishy-server

cd /tmp/api-build
go build -v -o image-optimizer main.go

# Verify it's a Linux binary
file image-optimizer

# Deploy and restart
sudo mv image-optimizer /usr/local/bin/image-optimizer
sudo chmod +x /usr/local/bin/image-optimizer
sudo systemctl restart image-optimizer

# Check logs for CORS configuration
sudo journalctl -u image-optimizer -f --lines=50
```

### 4. Verify Fixes

Check the logs for this line:

```text
CORS Origins: https://sosquishy.io,https://www.sosquishy.io
```

If you see this, CORS is configured correctly!

### 5. Test in Browser

1. Go to <https://sosquishy.io>
2. Upload an image
3. Check browser console - should see no CSP or CORS errors

## If CORS Still Fails

The 400 error might be happening **before** CORS middleware runs. Check:

1. Rate limiting - is the IP being blocked?
2. API key middleware - is it rejecting requests incorrectly?

Run this to check API logs:

```bash
ssh sosquishy-server "sudo journalctl -u image-optimizer -n 100"
```

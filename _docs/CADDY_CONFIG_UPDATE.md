# Caddy Configuration Updates for Docker Deployment

## ads.txt Redirect

If you need to add the ads.txt redirect to your Caddy configuration:

### For API Domain (api.sosquishy.io)

If you want the redirect on the API domain:

```bash
# SSH to Hetzner server
ssh sosquishy-server

# Edit Caddyfile
sudo nano /etc/caddy/Caddyfile
```

Add this redirect inside the `api.sosquishy.io` block:

```caddy
api.sosquishy.io {
    # ads.txt redirect
    redir /ads.txt https://srv.adstxtmanager.com/19390/sosquishy.io 301

    # Reverse proxy to Docker container
    reverse_proxy localhost:8080 {
        health_uri /health
        health_interval 30s
        health_timeout 5s

        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }

    encode gzip

    log {
        output file /var/log/caddy/api.sosquishy.io.log
        format json
    }

    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }
}
```

Then reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Test:

```bash
curl -I https://api.sosquishy.io/ads.txt
# Should return: HTTP/2 301
# Location: https://srv.adstxtmanager.com/19390/sosquishy.io
```

### For Main Domain (sosquishy.io)

Since your main domain is on GitHub Pages, you have two options:

#### Option 1: Serve sosquishy.io from Hetzner (Full Migration)

Add sosquishy.io to Caddy and point DNS to Hetzner:

```caddy
# Main domain
sosquishy.io, www.sosquishy.io {
    # Redirect www to non-www
    @www host www.sosquishy.io
    redir @www https://sosquishy.io{uri} permanent

    # ads.txt redirect
    redir /ads.txt https://srv.adstxtmanager.com/19390/sosquishy.io 301

    # Serve static files from Docker volume or directory
    root * /var/www/sosquishy.io
    file_server

    encode gzip

    log {
        output file /var/log/caddy/sosquishy.io.log
        format json
    }
}

# API subdomain
api.sosquishy.io {
    # ... (existing API config)
}
```

**Steps:**

1. Build static site: `cd web && pnpm build`
2. Copy to server: `rsync -avz web/out/ sosquishy-server:/var/www/sosquishy.io/`
3. Update DNS: Point `sosquishy.io` A record to Hetzner IP
4. Reload Caddy

#### Option 2: GitHub Pages with Custom ads.txt (Recommended)

Since GitHub Pages doesn't support redirects, create a static ads.txt file:

```bash
# In your web/ directory
cd web

# Create public/ads.txt
cat > public/ads.txt <<'EOF'
# Redirect handled by meta refresh since GitHub Pages doesn't support 301
<meta http-equiv="refresh" content="0;url=https://srv.adstxtmanager.com/19390/sosquishy.io">
EOF

# Rebuild and deploy
pnpm build
git add public/ads.txt
git commit -m "feat: add ads.txt redirect"
git push origin main
```

**Note:** This uses HTML meta refresh instead of HTTP 301 redirect.
For a true 301 redirect, you need server-side control (Caddy on Hetzner).

#### Option 3: Next.js Redirect (Better for GitHub Pages)

Add redirect in `web/next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...

  async redirects() {
    return [
      {
        source: '/ads.txt',
        destination: 'https://srv.adstxtmanager.com/19390/sosquishy.io',
        permanent: true,  // 301 redirect
      },
    ]
  },
}

export default nextConfig
```

Then rebuild and deploy:

```bash
cd web
pnpm build
git add next.config.mjs
git commit -m "feat: add ads.txt redirect"
git push origin main
```

## Complete Caddyfile for Docker Deployment

Here's the complete recommended Caddyfile for API-only Docker deployment:

```caddy
# Image Optimizer API
api.sosquishy.io {
    # ads.txt redirect (if needed on API domain)
    redir /ads.txt https://srv.adstxtmanager.com/19390/sosquishy.io 301

    # Reverse proxy to Docker container on localhost:8080
    reverse_proxy localhost:8080 {
        # Health check
        health_uri /health
        health_interval 30s
        health_timeout 5s

        # Headers
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }

    # Enable gzip compression
    encode gzip

    # Logging
    log {
        output file /var/log/caddy/api.sosquishy.io.log
        format json
        level INFO
    }

    # Security headers
    header {
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # XSS protection
        X-Content-Type-Options "nosniff"
        # Enable HSTS (1 year)
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        # Remove Server header
        -Server
    }
}

# Optional: Redirect www subdomain
www.api.sosquishy.io {
    redir https://api.sosquishy.io{uri} permanent
}
```

## Applying the Changes

1. **Backup current config**:

   ```bash
   ssh sosquishy-server
   sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup
   ```

2. **Edit Caddyfile**:

   ```bash
   sudo nano /etc/caddy/Caddyfile
   ```

3. **Validate config**:

   ```bash
   sudo caddy validate --config /etc/caddy/Caddyfile
   ```

4. **Apply changes**:

   ```bash
   sudo systemctl reload caddy
   ```

5. **Verify**:

   ```bash
   # Check Caddy status
   sudo systemctl status caddy

   # Test redirect
   curl -I https://api.sosquishy.io/ads.txt

   # Check logs
   sudo tail -f /var/log/caddy/api.sosquishy.io.log
   ```

## Notes

- **Docker networking**: The container binds to `127.0.0.1:8080` (localhost only),
so Caddy is the only way to access it from outside
- **No restart needed**: Caddy automatically obtains/renews Let's Encrypt certificates
- **Logging**: All access logs go to `/var/log/caddy/api.sosquishy.io.log` in JSON format
- **Health checks**: Caddy monitors the backend and stops sending traffic if unhealthy

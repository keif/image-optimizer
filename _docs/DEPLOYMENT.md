# Deployment Instructions

## Production Deployment to Hetzner (sosquishy.io)

### Initial Setup

If this is your first deployment, you need to set up the systemd service:

```bash
# 1. SSH to your server
ssh root@sosquishy-server

# 2. Create working directory
mkdir -p /opt/image-optimizer/data

# 3. Copy systemd service file to server
# From your local machine:
scp api/image-optimizer.service root@sosquishy-server:/etc/systemd/system/

# 4. Enable and start the service
ssh root@sosquishy-server
systemctl daemon-reload
systemctl enable image-optimizer
systemctl start image-optimizer
```

### Updating Environment Variables

After adding the origin-based security feature, you need to update the systemd service file on the server:

```bash
# SSH to server
ssh root@sosquishy-server

# Edit the service file
nano /etc/systemd/system/image-optimizer.service

# Add the TRUSTED_ORIGINS environment variable:
Environment="TRUSTED_ORIGINS=https://sosquishy.io,https://www.sosquishy.io"

# Reload systemd and restart service
systemctl daemon-reload
systemctl restart image-optimizer

# Verify it's running
systemctl status image-optimizer
```

### Standard Deployment

Use the deployment script to build and deploy code changes:

```bash
./deploy-hetzner.sh
```

This script will:

1. Copy source code to server
2. Build the Go binary on the server
3. Deploy to `/usr/local/bin/image-optimizer`
4. Restart the systemd service
5. Verify health endpoint

### Configuration for sosquishy.io

**Recommended production settings:**

```bash
API_KEY_AUTH_ENABLED=true
PUBLIC_OPTIMIZATION_ENABLED=false
TRUSTED_ORIGINS=https://sosquishy.io,https://www.sosquishy.io
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m
CORS_ORIGINS=https://sosquishy.io,https://www.sosquishy.io
```

This configuration:

- ✅ Requires API keys for all requests
- ✅ Allows sosquishy.io frontend to bypass API keys (origin-based auth)
- ✅ Blocks all other domains from accessing without API keys
- ✅ Rate limits requests to prevent abuse (100 req/min per IP)
- ✅ Enables CORS for your frontend domains

### Alternative: Wildcard Subdomain Support

If you want to allow all subdomains:

```bash
TRUSTED_ORIGINS=https://*.sosquishy.io
```

This will match:

- `https://sosquishy.io`
- `https://www.sosquishy.io`
- `https://api.sosquishy.io`
- Any other subdomain

### Verifying the Configuration

```bash
# Check service status
systemctl status image-optimizer

# View logs
journalctl -u image-optimizer -f

# Test health endpoint
curl https://api.sosquishy.io/health

# Test from your frontend (should work without API key)
curl -H "Origin: https://sosquishy.io" https://api.sosquishy.io/optimize

# Test from untrusted origin (should require API key)
curl -H "Origin: https://evil.com" https://api.sosquishy.io/optimize
# Should return: {"error":"Missing API key..."}
```

### Local Development

For local development, use docker-compose:

```bash
docker-compose up
```

Local configuration (already set in docker-compose.yml):

- API_KEY_AUTH_ENABLED=false (easier testing)
- TRUSTED_ORIGINS=<http://localhost:3000>,<http://localhost:8080>
- PUBLIC_OPTIMIZATION_ENABLED=true

### Troubleshooting

**Service won't start:**

```bash
journalctl -u image-optimizer -n 50
```

**Check environment variables:**

```bash
systemctl show image-optimizer | grep Environment
```

**Test API key requirement:**

```bash
# Without API key (from untrusted origin)
curl https://api.sosquishy.io/api/keys
# Should work (bootstrap endpoint always allowed)

# Optimization endpoint without key from untrusted origin
curl https://api.sosquishy.io/optimize
# Should return 401 if not from trusted origin

# From trusted origin
curl -H "Origin: https://sosquishy.io" https://api.sosquishy.io/optimize
# Should work without API key
```

### Next Deployment Steps

After updating the systemd service file with TRUSTED_ORIGINS:

1. **Update systemd service** (one-time):

   ```bash
   scp api/image-optimizer.service root@sosquishy-server:/etc/systemd/system/
   ssh root@sosquishy-server "systemctl daemon-reload && systemctl restart image-optimizer"
   ```

2. **Deploy code changes**:

   ```bash
   ./deploy-hetzner.sh
   ```

3. **Verify**:

   ```bash
   curl -H "Origin: https://sosquishy.io" https://api.sosquishy.io/health
   ```

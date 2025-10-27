# Full Stack Docker Deployment on Hetzner

Complete guide for deploying the entire Image Optimizer stack (Frontend + API) using Docker on Hetzner Cloud.

## Overview

This deployment uses:

- **Docker** for containerization
- **docker-compose** for orchestration
- **Next.js** (standalone mode) for frontend
- **Go + Fiber** for API backend
- **GitHub Actions** for automated CI/CD
- **Caddy** as reverse proxy (HTTPS with Let's Encrypt)
- **SQLite** database in Docker volume

## Architecture

```text
Internet
   ↓
Caddy (Port 443/80) → HTTPS + Reverse Proxy + ads.txt redirect
   ├─→ sosquishy.io → Docker Container (Port 3000) → Next.js Frontend
   └─→ api.sosquishy.io → Docker Container (Port 8080) → Go API
                                  ↓
                          Docker Volume (/app/data) → SQLite Database
```

## Pre-Deployment Checklist

### 1. Server Setup

- [ ] Hetzner Cloud server provisioned (CX22 or higher recommended)
- [ ] SSH access configured
- [ ] Caddy installed
- [ ] Firewall (UFW) configured (ports 22, 80, 443)

### 2. DNS Configuration (CRITICAL - Must Complete Before Deployment)

See [DNS_SETUP.md](DNS_SETUP.md) for detailed instructions.

- [ ] Get Hetzner server IP address
- [ ] Update DNS records:
  - [ ] `sosquishy.io` A record → Hetzner IP
  - [ ] `www.sosquishy.io` A record → Hetzner IP
  - [ ] `api.sosquishy.io` A record → Hetzner IP
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify DNS with `dig sosquishy.io A +short`

### 3. GitHub Secrets Configuration

See [GitHub Secrets Setup](#github-secrets-setup) section below for detailed instructions.

- [ ] Get Hetzner server IP or hostname
- [ ] Get SSH private key
- [ ] Add GitHub Secrets:
  - [ ] `HETZNER_HOST` = Server IP
  - [ ] `HETZNER_USER` = SSH user (usually `root`)
  - [ ] `HETZNER_SSH_KEY` = Private SSH key (entire content)

### 4. Server Preparation

SSH into server and run:

```bash
ssh sosquishy-server

# Create deployment directory
sudo mkdir -p /opt/image-optimizer-docker/data
sudo chown -R $USER:$USER /opt/image-optimizer-docker

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install docker-compose if not installed
if ! command -v docker-compose &> /dev/null; then
    apt-get update
    apt-get install -y docker-compose
fi

# Verify installations
docker --version
docker-compose --version
caddy version

# Check if old systemd service is running (will be stopped during deployment)
systemctl status image-optimizer || echo "No old service found"
```

### 5. Migrate Existing Database (If Applicable)

If you have an existing database from binary deployment:

```bash
# On server
ssh sosquishy-server

# Check if old database exists
ls -la /opt/image-optimizer/data/api_keys.db

# If it exists, copy to Docker directory
sudo cp /opt/image-optimizer/data/api_keys.db /opt/image-optimizer-docker/data/
sudo chown -R $USER:$USER /opt/image-optimizer-docker/data
```

## GitHub Secrets Setup

GitHub Actions needs three secrets to deploy your application to Hetzner.

### Required Secrets

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `HETZNER_HOST` | `123.45.67.89` | Server IP address or hostname |
| `HETZNER_USER` | `root` | SSH username |
| `HETZNER_SSH_KEY` | `-----BEGIN...` | Private SSH key (full content) |

### Step 1: Get Your Server Information

**Find Server IP/Hostname:**

```bash
# Option 1: Use hostname from ~/.ssh/config
cat ~/.ssh/config | grep -A 2 "sosquishy-server"

# Option 2: Get IP from Hetzner Cloud Console
# Go to: https://console.hetzner.cloud → Select server → Copy IP

# Option 3: Get IP via hcloud CLI
hcloud server ip sosquishy-server
```

**Find SSH User:**

```bash
# Test SSH connection
ssh root@sosquishy-server whoami
# Should output: root
```

### Step 2: Get Your SSH Private Key

```bash
# Display your private key
cat ~/.ssh/id_rsa
# OR
cat ~/.ssh/id_ed25519
```

**Expected output:**

```text
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
... (many more lines) ...
-----END OPENSSH PRIVATE KEY-----
```

**IMPORTANT:**

- Copy the **ENTIRE** key including `-----BEGIN` and `-----END` lines
- Include all newlines (the key is multiple lines)
- This is your **private key**, not the `.pub` file

### Step 3: Verify SSH Key Works

```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa root@sosquishy-server "echo 'SSH works!'"

# If you get "Permission denied", add the public key to server:
ssh-copy-id -i ~/.ssh/id_rsa.pub root@sosquishy-server
```

### Step 4: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/image-optimizer`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each:

**HETZNER_HOST:**

- Name: `HETZNER_HOST`
- Value: Your server IP or hostname (e.g., `123.45.67.89`)

**HETZNER_USER:**

- Name: `HETZNER_USER`
- Value: `root` (or your SSH username)

**HETZNER_SSH_KEY:**

- Name: `HETZNER_SSH_KEY`
- Value: Paste your entire private key (include BEGIN and END lines)

### Step 5: Test the Setup

**Option A: Manual workflow trigger:**

1. Go to **Actions** tab
2. Select **"Deploy API to Hetzner (Docker)"**
3. Click **"Run workflow"** → Select branch: `main` → **"Run workflow"**

**Option B: Push to main:**

```bash
git add .
git commit -m "test: trigger deployment"
git push origin main
```

### Troubleshooting GitHub Secrets

**"Permission denied (publickey)"**

- Verify you copied the correct private key (not the `.pub` file)
- Ensure the corresponding public key is in server's `~/.ssh/authorized_keys`

**"Could not resolve hostname"**

- Use the server's IP address instead of hostname in `HETZNER_HOST`

**"Connection timed out"**

- Ensure UFW allows SSH: `sudo ufw allow 22/tcp`

## Quick Start

### Option 1: GitHub Actions (Recommended)

1. Complete the [Pre-Deployment Checklist](#pre-deployment-checklist) above
2. Push to main branch:

   ```bash
   git add .
   git commit -m "deploy: update API"
   git push origin main
   ```

3. Monitor deployment:
   - Go to GitHub → Actions tab
   - Watch the deployment progress
   - Check for success ✅ or failure ❌

### Option 2: Manual Deployment Script

```bash
# From your local machine
cd /Users/keif/projects/git/image-optimizer

# Set server address (optional, defaults to sosquishy-server)
export HETZNER_SERVER="root@sosquishy-server"

# Deploy
./deploy-docker-hetzner.sh
```

## First-Time Setup

If you're migrating from the binary deployment to Docker:

### Step 1: Run Migration Script

```bash
# From local machine - run migration on server
ssh sosquishy-server 'bash -s' < migrate-to-docker.sh
```

This will:

- Install Docker and docker-compose
- Create `/opt/image-optimizer-docker/` directory
- Migrate database from `/opt/image-optimizer/data/` to Docker volume
- Stop old systemd service
- Prepare environment for Docker

### Step 2: Deploy with Docker

Choose GitHub Actions or manual deployment (see Quick Start above).

### Step 3: Verify

```bash
# Check health endpoint
curl https://api.sosquishy.io/health

# Expected response:
# {"status":"ok","version":"v0.1.0","commit":"abc123",...}

# SSH to server and check Docker
ssh sosquishy-server
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml ps

# Expected:
# NAME         STATUS       PORTS
# squish-api   Up (healthy) 127.0.0.1:8080->8080/tcp
```

## Configuration

### Environment Variables

Located in `docker-compose.prod.yml`:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | 8080 | Internal API port |
| `DB_PATH` | /app/data/api_keys.db | SQLite database path in container |
| `RATE_LIMIT_ENABLED` | true | Enable rate limiting |
| `RATE_LIMIT_MAX` | 100 | Max requests per window |
| `RATE_LIMIT_WINDOW` | 1m | Rate limit time window |
| `API_KEY_AUTH_ENABLED` | true | Require API keys |
| `PUBLIC_OPTIMIZATION_ENABLED` | true | Allow public /optimize access |
| `TRUSTED_ORIGINS` | <https://sosquishy.io>,... | CORS allowed origins |
| `ALLOWED_DOMAINS` | cloudinary.com,... | Domains for URL fetching |

To update environment variables:

1. Edit `docker-compose.prod.yml`
2. Redeploy (push to GitHub or run `./deploy-docker-hetzner.sh`)

### Resource Limits

Configured in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'      # Max 2 CPUs
      memory: 3G       # Max 3GB RAM
    reservations:
      cpus: '0.5'      # Minimum 0.5 CPU
      memory: 512M     # Minimum 512MB RAM
```

### Docker Volume

Database is persisted in:

- **Host path**: `/opt/image-optimizer-docker/data/`
- **Container path**: `/app/data/`
- **File**: `api_keys.db`

## Caddy Configuration

Caddy should already be configured to reverse proxy to `localhost:8080`. Verify:

```bash
# SSH to server
ssh sosquishy-server

# Check Caddy config
cat /etc/caddy/Caddyfile
```

Expected configuration:

```caddy
api.sosquishy.io {
    reverse_proxy localhost:8080 {
        health_uri /health
        health_interval 30s
        health_timeout 5s
    }
    encode gzip
    log {
        output file /var/log/caddy/api.sosquishy.io.log
        format json
    }
}
```

**Note**: The Caddy configuration is the same for both binary and Docker deployments since both expose the API on `localhost:8080`.

## GitHub Actions Workflow

Located at `.github/workflows/deploy-api-hetzner.yml`

**Triggers**:

- Push to `main` branch
- Changes in `api/**` directory
- Changes in `docker-compose.prod.yml`
- Manual trigger via GitHub UI

**Steps**:

1. Checkout code
2. Get version info from git
3. Setup SSH to Hetzner
4. SSH into server and:
   - Clone/pull latest code to `/opt/image-optimizer-docker/`
   - Build Docker image with version tags
   - Deploy with `docker-compose up -d`
   - Wait for health check
5. Verify deployment via HTTPS health endpoint

**Secrets Required**:

- `HETZNER_HOST`: Server IP or hostname (e.g., `123.45.67.89` or `sosquishy-server`)
- `HETZNER_USER`: SSH username (usually `root`)
- `HETZNER_SSH_KEY`: Private SSH key (full content including `-----BEGIN` and `-----END`)

## Management Commands

### View Logs

```bash
# SSH to server
ssh sosquishy-server

# Follow logs in real-time
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml logs -f

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100

# View logs for specific time
docker-compose -f docker-compose.prod.yml logs --since 1h
```

### Restart Service

```bash
# SSH to server
ssh sosquishy-server
cd /opt/image-optimizer-docker

# Restart container
docker-compose -f docker-compose.prod.yml restart

# Full rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Check Status

```bash
# Container status
docker-compose -f docker-compose.prod.yml ps

# Container resource usage
docker stats squish-api

# Health check
curl http://localhost:8080/health
curl https://api.sosquishy.io/health
```

### Access Container Shell

```bash
# SSH to server
ssh sosquishy-server
cd /opt/image-optimizer-docker

# Open shell in running container
docker-compose -f docker-compose.prod.yml exec api sh

# Inside container:
ls -la /app
ls -la /app/data
```

### Database Management

```bash
# Backup database
ssh sosquishy-server
cd /opt/image-optimizer-docker/data
cp api_keys.db api_keys.db.backup-$(date +%Y%m%d)

# Download database to local machine
scp sosquishy-server:/opt/image-optimizer-docker/data/api_keys.db ./api_keys.db.backup

# Restore database (if needed)
ssh sosquishy-server
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml down
cp data/api_keys.db.backup-20250122 data/api_keys.db
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Health Checks

Docker has built-in health checks configured:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Check health status:

```bash
docker inspect squish-api | jq '.[0].State.Health'
```

### Resource Monitoring

```bash
# Real-time resource usage
docker stats squish-api

# Container logs for errors
docker logs squish-api | grep -i error

# System resources
ssh sosquishy-server
htop
df -h
free -h
```

### Automated Monitoring Script

Set up a simple monitoring script:

```bash
# On Hetzner server
cat > /usr/local/bin/monitor-docker-api.sh <<'EOF'
#!/bin/bash

# Check if container is running
if ! docker ps | grep -q squish-api; then
    echo "CRITICAL: squish-api container is not running"
    exit 1
fi

# Check health
HEALTH=$(docker inspect squish-api | jq -r '.[0].State.Health.Status')
if [ "$HEALTH" != "healthy" ]; then
    echo "WARNING: Container health is $HEALTH"
    exit 1
fi

# Check external endpoint
if ! curl -f -s https://api.sosquishy.io/health > /dev/null; then
    echo "CRITICAL: External health check failed"
    exit 1
fi

echo "OK: All checks passed"
EOF

chmod +x /usr/local/bin/monitor-docker-api.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-docker-api.sh >> /var/log/docker-api-monitor.log 2>&1") | crontab -
```

## Post-Deployment Verification

### Service Health Checks

```bash
# Frontend (if deployed)
curl https://sosquishy.io

# API Health
curl https://api.sosquishy.io/health
# Expected: {"status":"ok","version":"..."}

# API Swagger
open https://api.sosquishy.io/swagger/index.html
```

### Docker Container Status

```bash
ssh sosquishy-server
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME         STATUS       PORTS
# squish-api   Up (healthy) 127.0.0.1:8080->8080/tcp
```

### SSL Certificates

```bash
# Check API certificate
openssl s_client -connect api.sosquishy.io:443 -servername api.sosquishy.io < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Should show Let's Encrypt certificate with ~90 days validity
```

### Functional Testing

- [ ] API health endpoint responds
- [ ] Image optimization works
- [ ] API documentation (Swagger) loads
- [ ] No errors in logs

### Logs Review

```bash
# SSH to server
ssh sosquishy-server
cd /opt/image-optimizer-docker

# Check API logs
docker logs squish-api --tail=50

# Check Caddy logs
sudo tail -f /var/log/caddy/api.sosquishy.io.log

# Look for any errors or warnings
```

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker logs squish-api

# Check docker-compose logs
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml logs

# Common issues:
# 1. Port already in use
ss -tlnp | grep 8080
# 2. Permission issues with data directory
ls -la /opt/image-optimizer-docker/data/
chown -R $(id -u):$(id -g) /opt/image-optimizer-docker/data/
# 3. Database locked
rm /opt/image-optimizer-docker/data/api_keys.db-shm
rm /opt/image-optimizer-docker/data/api_keys.db-wal
```

### Build Failures

```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild from scratch
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml build --no-cache

# Check disk space
df -h
docker system df
docker system prune -a  # WARNING: Removes all unused images
```

### Health Check Failing

```bash
# Test health endpoint from inside container
docker exec squish-api wget -qO- http://localhost:8080/health

# Test from host
curl http://localhost:8080/health

# Check application logs
docker logs squish-api --tail=100
```

### GitHub Actions Failing

Common issues:

1. **SSH Connection Failed**
   - Verify `HETZNER_HOST` is correct
   - Verify `HETZNER_SSH_KEY` contains full private key
   - Check server firewall allows SSH from GitHub IPs

2. **Permission Denied**
   - Verify `HETZNER_USER` has sudo/root access
   - Check SSH key matches authorized_keys on server

3. **Build Failed**
   - Check GitHub Actions logs for specific error
   - May need to clear Docker cache on server
   - Ensure server has enough disk space

### DNS Not Resolving

```bash
# Verify DNS
dig sosquishy.io A +short
dig api.sosquishy.io A +short

# Should both show your Hetzner server IP
# If not, wait longer or check DNS provider dashboard
```

### SSL Certificate Fails

```bash
# Check Caddy logs
ssh sosquishy-server
sudo journalctl -u caddy -n 100

# Common issues:
# - DNS not propagated yet
# - Ports 80/443 blocked
# - Cloudflare proxy enabled (disable for Let's Encrypt)
```

### 502 Bad Gateway

```bash
# Check if containers are healthy
docker ps

# Check if ports are listening
ss -tlnp | grep -E '(3000|8080)'

# Restart Caddy
sudo systemctl restart caddy
```

## Rollback Procedure

If deployment fails or causes issues:

### Option 1: Rollback to Previous Docker Version

```bash
# SSH to server
ssh sosquishy-server
cd /opt/image-optimizer-docker

# Stop current containers
docker-compose -f docker-compose.prod.yml down

# List available images
docker images | grep squish-api

# Tag specific version to 'latest' (or update docker-compose.yml)
docker tag squish-api:v0.1.0 squish-api:latest

# Start containers
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Rollback to Binary Deployment

```bash
# SSH to server
ssh sosquishy-server

# Stop Docker containers
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml down

# Start systemd service
systemctl start image-optimizer
systemctl enable image-optimizer

# Verify
curl http://localhost:8080/health
```

### Option 3: Rollback via GitHub

```bash
# From local machine
git log  # Find previous good commit

# Revert to previous commit
git revert HEAD  # Or git reset --hard <commit-hash>

# Push (triggers deployment)
git push origin main
```

## Security Considerations

### Container Security

- Container runs as non-root user (`appuser`)
- Read-only file system except for `/app/data`
- Resource limits prevent DoS
- No privileged mode
- Security scanning with Docker Scout (optional)

### Network Security

- API only exposed to localhost (127.0.0.1:8080)
- Caddy handles external traffic with HTTPS
- Firewall (UFW) blocks direct access to port 8080
- Rate limiting protects against abuse

### Secrets Management

- No secrets in Docker image
- Environment variables in docker-compose file
- GitHub Secrets for SSH keys
- Database file permissions: 600 (owner read/write only)

### SSH Key Best Practices

**Use dedicated SSH key for GitHub Actions (recommended):**

```bash
# Generate new key
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_hetzner -C "github-actions"

# Add public key to server
ssh-copy-id -i ~/.ssh/github_actions_hetzner.pub root@sosquishy-server

# Use this key in HETZNER_SSH_KEY secret
cat ~/.ssh/github_actions_hetzner
```

Benefits:

- Can revoke without affecting personal SSH access
- Easier to audit
- Can restrict permissions for this specific key

**Rotate keys regularly:**

- Good practice: Rotate SSH keys every 6-12 months

## Performance Tuning

### Increase Resource Limits

Edit `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'      # Increase from 2.0
      memory: 6G       # Increase from 3G
```

### Enable Docker BuildKit

Faster builds with caching:

```bash
# On server
echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
source ~/.bashrc
```

### Optimize Image Size

Currently using multi-stage builds:

- Build stage: golang:1.24-alpine
- Runtime stage: alpine:latest
- Final image size: ~50MB

## Cost Comparison

| Deployment | Monthly Cost | RAM | CPU | Notes |
|------------|-------------|-----|-----|-------|
| Fly.io (previous) | $12 | 2GB | 1 vCPU | OOM errors |
| Hetzner Binary | $6.50 | 4GB | 2 vCPU | No OOM |
| Hetzner Docker | $6.50 | 4GB | 2 vCPU | Same server, better isolation |

Docker deployment has no additional cost - runs on same server.

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check logs periodically
   - Verify no errors
   - Test all functionality

2. **Set up automated backups**
   - Database backups (automated)
   - Configuration backups
   - Use monitoring script above

3. **Performance monitoring**
   - Check response times
   - Monitor resource usage
   - Optimize if needed

4. **Update documentation**
   - Document any custom changes
   - Note any issues encountered

## Quick Reference Commands

```bash
# View logs
ssh sosquishy-server 'docker logs -f squish-api'

# Restart services
ssh sosquishy-server 'cd /opt/image-optimizer-docker && docker-compose -f docker-compose.prod.yml restart'

# Check status
ssh sosquishy-server 'cd /opt/image-optimizer-docker && docker-compose -f docker-compose.prod.yml ps'

# Rebuild and redeploy
./deploy-docker-hetzner.sh

# View Caddy logs
ssh sosquishy-server 'sudo journalctl -u caddy -f'
```

## Support

For issues:

1. Check logs: `docker logs squish-api`
2. Check GitHub Actions: repo → Actions tab
3. Review this documentation
4. Check HETZNER_MIGRATION.md for additional context

## Useful Links

- **Production API**: <https://api.sosquishy.io>
- **API Docs**: <https://api.sosquishy.io/swagger/index.html>
- **Frontend**: <https://sosquishy.io>
- **GitHub Actions**: <https://github.com/keif/image-optimizer/actions>
- **Hetzner Console**: <https://console.hetzner.cloud>

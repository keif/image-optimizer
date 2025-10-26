# Full Stack Docker Deployment Checklist

Complete checklist for deploying sosquishy.io full stack to Hetzner with Docker.

## Pre-Deployment Checklist

### 1. Server Setup ✅ (Already Done)

- [x] Hetzner Cloud server provisioned
- [x] SSH access configured
- [x] Caddy installed
- [x] Firewall (UFW) configured (ports 22, 80, 443)

### 2. DNS Configuration (MUST DO BEFORE DEPLOYMENT)

**Read:** [DNS_SETUP.md](DNS_SETUP.md)

- [ ] Get Hetzner server IP address
- [ ] Update DNS records:
  - [ ] `sosquishy.io` A record → Hetzner IP
  - [ ] `www.sosquishy.io` A record → Hetzner IP
  - [ ] `api.sosquishy.io` A record → Hetzner IP
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify DNS with `dig sosquishy.io A +short`

### 3. GitHub Secrets Configuration (For Automated Deployment)

**Read:** [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)

- [ ] Get Hetzner server IP or hostname
- [ ] Get SSH private key (`cat ~/.ssh/id_rsa`)
- [ ] Add GitHub Secrets:
  - [ ] `HETZNER_HOST` = Server IP
  - [ ] `HETZNER_USER` = `root`
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

# Check if old systemd service is running (we'll stop it during deployment)
systemctl status image-optimizer || echo "No old service found"
```

### 5. Migrate Existing Database (If Applicable)

If you have an existing database from binary deployment:

```bash
# On server
ssh sosquishy-server

# Check if old database exists
ls -la /opt/image-optimizer/data/api_keys.db

# If it exists, it will be automatically migrated during first deployment
# Or manually copy now:
sudo cp /opt/image-optimizer/data/api_keys.db /opt/image-optimizer-docker/data/
sudo chown -R $USER:$USER /opt/image-optimizer-docker/data
```

## Deployment Options

### Option A: Automated Deployment (GitHub Actions)

**Best for:** Production deployments, ongoing updates

1. Ensure all pre-deployment checklist items are complete
2. Commit and push changes:

```bash
cd /Users/keif/projects/git/image-optimizer

# Verify changes
git status
git diff

# Commit
git add .
git commit -m "feat: enable full stack Docker deployment on Hetzner"
git push origin main
```

1. Monitor deployment:
   - Go to GitHub → Actions tab
   - Watch "Deploy Full Stack to Hetzner (Docker)" workflow
   - Check for ✅ success or ❌ failure

2. Verify deployment (after workflow completes):

```bash
# Check frontend
curl -I https://sosquishy.io
# Expected: HTTP/2 200

# Check API
curl https://api.sosquishy.io/health
# Expected: {"status":"ok",...}

# Check ads.txt redirect
curl -I https://sosquishy.io/ads.txt
# Expected: HTTP/2 301 → Location: https://srv.adstxtmanager.com/...
```

### Option B: Manual Deployment

**Best for:** First deployment, testing, troubleshooting

1. Ensure all pre-deployment checklist items are complete
2. Run deployment script:

```bash
cd /Users/keif/projects/git/image-optimizer

# Run deployment
./deploy-docker-hetzner.sh

# The script will:
# - Sync code to server
# - Build Docker images
# - Update Caddyfile
# - Start containers
# - Run health checks
# - Verify deployment
```

## Post-Deployment Verification

### 1. Service Health Checks

```bash
# Frontend
curl https://sosquishy.io
# Should load the homepage

# API Health
curl https://api.sosquishy.io/health
# Expected: {"status":"ok","version":"..."}

# API Swagger
open https://api.sosquishy.io/swagger/index.html

# ads.txt Redirect
curl -I https://sosquishy.io/ads.txt
# Expected: HTTP/2 301
```

### 2. Docker Container Status

```bash
ssh sosquishy-server
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME         STATUS       PORTS
# squish-api   Up (healthy) 127.0.0.1:8080->8080/tcp
# squish-web   Up (healthy) 127.0.0.1:3000->3000/tcp
```

### 3. SSL Certificates

```bash
# Check main domain certificate
openssl s_client -connect sosquishy.io:443 -servername sosquishy.io < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Check API certificate
openssl s_client -connect api.sosquishy.io:443 -servername api.sosquishy.io < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Both should show Let's Encrypt certificates with ~90 days validity
```

### 4. Functional Testing

- [ ] Visit <https://sosquishy.io> - homepage loads
- [ ] Upload an image - optimization works
- [ ] Check before/after comparison - displays correctly
- [ ] Test sprite sheet packer - works correctly
- [ ] Check <https://api.sosquishy.io/swagger> - API docs load
- [ ] Test API directly with curl
- [ ] Verify social media icons in footer
- [ ] Check /learn page content

### 5. Logs Review

```bash
# SSH to server
ssh sosquishy-server
cd /opt/image-optimizer-docker

# Check API logs
docker logs squish-api --tail=50

# Check frontend logs
docker logs squish-web --tail=50

# Check Caddy logs
sudo tail -f /var/log/caddy/sosquishy.io.log
sudo tail -f /var/log/caddy/api.sosquishy.io.log

# Look for any errors or warnings
```

## Troubleshooting

### Issue: DNS Not Resolving

```bash
# Verify DNS
dig sosquishy.io A +short
dig api.sosquishy.io A +short

# Should both show your Hetzner server IP
# If not, wait longer or check DNS provider dashboard
```

### Issue: SSL Certificate Fails

```bash
# Check Caddy logs
ssh sosquishy-server
sudo journalctl -u caddy -n 100

# Common issues:
# - DNS not propagated yet
# - Ports 80/443 blocked
# - Cloudflare proxy enabled (disable for Let's Encrypt)
```

### Issue: Containers Not Starting

```bash
ssh sosquishy-server
cd /opt/image-optimizer-docker

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker logs squish-api
docker logs squish-web

# Restart containers
docker-compose -f docker-compose.prod.yml restart
```

### Issue: 502 Bad Gateway

```bash
# Check if containers are healthy
docker ps

# Check if ports are listening
ss -tlnp | grep -E '(3000|8080)'

# Restart Caddy
sudo systemctl restart caddy
```

## Rollback Procedure

If deployment fails, you can rollback:

### Option 1: Rollback DNS (Keep Old GitHub Pages)

```bash
# In DNS provider, change:
# sosquishy.io A record → 185.199.108.153 (GitHub Pages IP)
# Wait for propagation

# Keep api.sosquishy.io on Hetzner (already working)
```

### Option 2: Rollback to Binary Deployment (API Only)

```bash
ssh sosquishy-server

# Stop Docker containers
cd /opt/image-optimizer-docker
docker-compose -f docker-compose.prod.yml down

# Start old systemd service
sudo systemctl start image-optimizer
sudo systemctl enable image-optimizer

# Frontend stays on GitHub Pages
```

## Monitoring

### Set Up Basic Monitoring

```bash
# On server, create monitoring script
ssh sosquishy-server

cat > /usr/local/bin/monitor-stack.sh <<'EOF'
#!/bin/bash
cd /opt/image-optimizer-docker

# Check containers
if ! docker ps | grep -q "squish-api.*healthy"; then
    echo "CRITICAL: API container unhealthy"
    exit 1
fi

if ! docker ps | grep -q "squish-web.*healthy"; then
    echo "CRITICAL: Web container unhealthy"
    exit 1
fi

# Check external endpoints
if ! curl -f -s https://api.sosquishy.io/health > /dev/null; then
    echo "CRITICAL: API health check failed"
    exit 1
fi

if ! curl -f -s https://sosquishy.io > /dev/null; then
    echo "CRITICAL: Frontend check failed"
    exit 1
fi

echo "OK: All services healthy"
EOF

chmod +x /usr/local/bin/monitor-stack.sh

# Test it
/usr/local/bin/monitor-stack.sh

# Add to cron (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-stack.sh >> /var/log/stack-monitor.log 2>&1") | crontab -
```

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check logs periodically
   - Verify no errors
   - Test all functionality

2. **Disable GitHub Pages** (optional)
   - GitHub repo → Settings → Pages → Source: None
   - Saves GitHub Actions minutes

3. **Update Documentation**
   - Update README.md deployment section
   - Document any custom changes
   - Note any issues encountered

4. **Set Up Backups**
   - Database backups (automated)
   - Configuration backups
   - See monitoring script above

5. **Performance Monitoring**
   - Check response times
   - Monitor resource usage
   - Optimize if needed

## Quick Reference Commands

```bash
# View logs
ssh sosquishy-server 'docker logs -f squish-api'
ssh sosquishy-server 'docker logs -f squish-web'

# Restart services
ssh sosquishy-server 'cd /opt/image-optimizer-docker && docker-compose -f docker-compose.prod.yml restart'

# Check status
ssh sosquishy-server 'cd /opt/image-optimizer-docker && docker-compose -f docker-compose.prod.yml ps'

# Rebuild and redeploy
./deploy-docker-hetzner.sh

# View Caddy logs
ssh sosquishy-server 'sudo journalctl -u caddy -f'
```

## Support Resources

- **DOCKER_DEPLOYMENT.md** - Detailed deployment guide
- **DNS_SETUP.md** - DNS configuration instructions
- **GITHUB_SECRETS_SETUP.md** - GitHub Actions setup
- **CADDY_CONFIG_UPDATE.md** - Caddy configuration details
- **Hetzner Console** - <https://console.hetzner.cloud>
- **GitHub Actions** - Check workflow runs in Actions tab

## Success Criteria

Deployment is successful when:

- ✅ <https://sosquishy.io> loads frontend
- ✅ <https://api.sosquishy.io/health> returns OK
- ✅ <https://sosquishy.io/ads.txt> redirects (301)
- ✅ SSL certificates are valid (Let's Encrypt)
- ✅ Docker containers are healthy
- ✅ No errors in logs
- ✅ All functionality works (image optimization, sprite packer, etc.)

Once all criteria are met, deployment is complete! 🎉

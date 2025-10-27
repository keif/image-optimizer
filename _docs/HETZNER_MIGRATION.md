# Hetzner Cloud Migration Guide

Complete guide for migrating the Image Optimizer API from Fly.io to Hetzner Cloud VPS.

## Migration Context

**Reason for migration:** Memory limitations on Fly.io (2GB VM) causing OOM (Out of Memory) errors during large image processing operations, particularly with:

- Large sprites (10766×9913 pixels)
- Auto-resize operations with padding calculations
- Multiple concurrent optimization requests

**Target infrastructure:** Hetzner Cloud CX22 VPS (2 vCPU / 4GB RAM / 40GB SSD) running Ubuntu 22.04

---

## Table of Contents

1. [Server Provisioning](#1-server-provisioning)
2. [Initial Server Setup](#2-initial-server-setup)
3. [App Deployment - Go Binary](#3-app-deployment---go-binary)
4. [Reverse Proxy & HTTPS with Caddy](#4-reverse-proxy--https-with-caddy)
5. [Environment Variables](#5-environment-variables)
6. [Logs & Monitoring](#6-logs--monitoring)
7. [Alternative: Docker Deployment](#7-alternative-docker-deployment)
8. [Migration Verification](#8-migration-verification)
9. [Rollback Plan](#9-rollback-plan)

---

## 1. Server Provisioning

### 1.1. Create Hetzner Cloud Server

**Via Hetzner Cloud Console:**

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Select your project or create a new one
3. Click "Add Server"
4. Configure server:
   - **Location**: Choose closest to your users (e.g., Nuremberg, Germany or Ashburn, USA)
   - **Image**: Ubuntu 22.04
   - **Type**: CX22 (2 vCPU / 4GB RAM / 40GB SSD) - €5.83/month
   - **Networking**:
     - ✅ Enable IPv4
     - ✅ Enable IPv6 (optional)
   - **SSH Keys**: Add your public SSH key
   - **Name**: `image-optimizer-api` (or your preferred name)
5. Click "Create & Buy Now"

**Via Hetzner CLI (hcloud):**

```bash
# Install hcloud CLI
brew install hcloud  # macOS
# or: wget https://github.com/hetznercloud/cli/releases/download/v1.42.0/hcloud-linux-amd64.tar.gz

# Authenticate
hcloud context create so-squishy

# Create SSH key (if not already added)
hcloud ssh-key create --name my-ssh-key --public-key-from-file ~/.ssh/id_rsa.pub

# Create server
hcloud server create \
  --name image-optimizer-api \
  --type cx22 \
  --image ubuntu-22.04 \
  --ssh-key my-ssh-key \
  --location nbg1

# Get server IP
hcloud server ip image-optimizer-api
```

**Expected output:**

```text
Server ID: 12345678
Server IP: 123.45.67.89
```

**Save the IP address** - you'll need it for DNS and SSH access.

---

## 2. Initial Server Setup

### 2.1. SSH Access

```bash
# SSH into your server (replace with your server IP)
ssh root@123.45.67.89

OR

ssh sosquishy-server

# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git ufw fail2ban htop
```

### 2.2. Create Non-Root User

```bash
# Create dedicated user for the app
useradd -m -s /bin/bash appuser

# Add to sudo group (optional, for maintenance)
usermod -aG sudo appuser

# Set password (optional)
passwd appuser

# Create SSH directory for appuser
mkdir -p /home/appuser/.ssh
cp /root/.ssh/authorized_keys /home/appuser/.ssh/
chown -R appuser:appuser /home/appuser/.ssh
chmod 700 /home/appuser/.ssh
chmod 600 /home/appuser/.ssh/authorized_keys
```

### 2.3. Firewall Configuration (UFW)

```bash
# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (IMPORTANT: do this before enabling UFW!)
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS (for Caddy)
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
ufw enable

# Verify status
ufw status verbose
```

**Expected output:**

```text
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere                  # SSH
80/tcp                     ALLOW       Anywhere                  # HTTP
443/tcp                    ALLOW       Anywhere                  # HTTPS
```

### 2.4. Install Fail2Ban (SSH Protection)

```bash
# Install fail2ban
apt install -y fail2ban

# Create local configuration
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

# Start and enable fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Check status
fail2ban-client status sshd
```

### 2.5. Install libvips (Required for Image Processing)

```bash
# Install libvips and dependencies
apt install -y libvips-dev libvips-tools

# Verify installation
vips --version
```

**Expected output:**

```text
vips-8.12.2-Fri Jan 28 15:38:40 UTC 2022
```

---

## 3. App Deployment - Go Binary

### 3.1. Install Go on Server

The app uses `bimg` (libvips wrapper) which requires CGO, so we'll build directly on the server to avoid cross-compilation complexity.

```bash
# SSH into server
ssh root@sosquishy-server

# Download and install Go 1.22
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
rm -rf /usr/local/go
tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz

# Add Go to PATH permanently
echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
export PATH=$PATH:/usr/local/go/bin

# Verify installation
go version

# Expected output: go version go1.22.0 linux/amd64

# Clean up
rm go1.22.0.linux-amd64.tar.gz
```

**Note:** libvips-dev was already installed in Section 2.5.

### 3.2. Build Binary on Server

**Important:** The app uses `bimg` which requires CGO (C bindings to libvips). You **must** build on the Linux server, not on your local Mac. Cross-compilation with CGO is complex and error-prone.

#### Option A: Copy source and build (Recommended)

```bash
# On local machine - copy source to server
cd /Users/keif/projects/git/image-optimizer
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='web' \
  ./api/ root@sosquishy-server:/tmp/api-build/

# On server - build
ssh root@sosquishy-server
cd /tmp/api-build

# Build with version info
go build -v \
  -ldflags "-X main.version=$(git describe --tags --always 2>/dev/null || echo 'v0.1.0') -X main.commit=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown') -X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -o image-optimizer \
  main.go

# IMPORTANT: Verify it's a Linux binary (not macOS)
file image-optimizer
# Must show: "ELF 64-bit LSB executable, x86-64"
# If it shows "Mach-O", you built on Mac by mistake - rebuild on server!

# Test the binary
./image-optimizer &
sleep 2
curl http://localhost:8080/health
pkill image-optimizer

# Move to /usr/local/bin
mv image-optimizer /usr/local/bin/image-optimizer
chmod +x /usr/local/bin/image-optimizer

# Clean up build directory
cd ~
rm -rf /tmp/api-build

# Verify binary works
/usr/local/bin/image-optimizer &
sleep 2
curl http://localhost:8080/health
pkill image-optimizer
```

#### Option B: Clone from Git and build

```bash
# On server
ssh root@sosquishy-server

# Install git if not already installed
apt install -y git

# Clone repository
git clone https://github.com/YOUR_USERNAME/image-optimizer.git /tmp/api-build
cd /tmp/api-build/api

# Build
go build -v \
  -ldflags "-X main.version=$(git describe --tags --always) -X main.commit=$(git rev-parse --short HEAD) -X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -o image-optimizer \
  main.go

# Verify it's a Linux binary
file image-optimizer
# Must show: "ELF 64-bit LSB executable, x86-64"

# Move to /usr/local/bin
mv image-optimizer /usr/local/bin/image-optimizer
chmod +x /usr/local/bin/image-optimizer

# Clean up
cd ~
rm -rf /tmp/api-build
```

**Build Notes:**

- The ldflags set three variables in main.go: `version`, `commit`, and `buildTime`
- These variables must be declared in main.go (they are as of the latest commit)
- Always use lowercase: `-X main.version` not `-X main.Version` or `-X main.AppVersion`
- The `-v` flag shows verbose build output, useful for debugging

### 3.3. Create Application Directory Structure

```bash
# Create directories
mkdir -p /opt/image-optimizer/data
chown -R appuser:appuser /opt/image-optimizer

# Create log directory
mkdir -p /var/log/image-optimizer
chown -R appuser:appuser /var/log/image-optimizer
```

### 3.4. Create Systemd Service

Create `/etc/systemd/system/image-optimizer.service`:

```bash
cat > /etc/systemd/system/image-optimizer.service <<'EOF'
[Unit]
Description=Image Optimizer API Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/image-optimizer
ExecStart=/usr/local/bin/image-optimizer
EnvironmentFile=/opt/image-optimizer/.env
Restart=always
RestartSec=5s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=image-optimizer

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/image-optimizer/data /var/log/image-optimizer

# Resource limits
LimitNOFILE=65536
MemoryMax=3G
MemoryHigh=2.5G

[Install]
WantedBy=multi-user.target
EOF
```

**Key configuration notes:**

- `User=appuser`: Runs as non-root user
- `EnvironmentFile`: Loads environment variables from `.env`
- `Restart=always`: Auto-restart on failure
- `MemoryMax=3G`: Prevent runaway memory usage (adjust as needed)
- `ProtectSystem=strict`: Enhanced security isolation

### 3.5. Enable and Start Service

```bash
# Reload systemd
systemctl daemon-reload

# Enable service (start on boot)
systemctl enable image-optimizer

# DON'T start yet - we need to create .env file first
```

---

## 4. Reverse Proxy & HTTPS with Caddy

### 4.1. Install Caddy

```bash
# Install Caddy (official repository method)
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

# Verify installation
caddy version
```

### 4.2. Configure DNS

Before configuring Caddy, **update your DNS** to point to the server:

**DNS Records for sosquishy.io:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | api | 123.45.67.89 | 3600 |

**Verify DNS propagation:**

```bash
# Check from your local machine
dig api.sosquishy.io A

# Expected output should show your server IP
# api.sosquishy.io.  3600  IN  A  123.45.67.89
```

**Wait for DNS propagation** (5-30 minutes typically) before proceeding to Caddy configuration.

### 4.3. Configure Caddy

Create `/etc/caddy/Caddyfile`:

```bash
cat > /etc/caddy/Caddyfile <<'EOF'
# Image Optimizer API
api.sosquishy.io {
    # Automatic HTTPS with Let's Encrypt
    # Caddy will automatically obtain and renew SSL certificates

    # Reverse proxy to Go API on localhost:8080
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
    }

    # Security headers
    header {
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # XSS protection
        X-Content-Type-Options "nosniff"
        # Enable HSTS (1 year)
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }

    # Rate limiting (basic)
    # Note: Your app has its own rate limiting, this is additional protection
    @ratelimit {
        not path /health
    }
}

# Optional: Redirect www to non-www
www.api.sosquishy.io {
    redir https://api.sosquishy.io{uri} permanent
}
EOF
```

### 4.4. Create Log Directory

Before starting Caddy, create the log directory with proper permissions:

```bash
# Create log directory
mkdir -p /var/log/caddy

# Set ownership to caddy user
chown -R caddy:caddy /var/log/caddy

# Set permissions
chmod 755 /var/log/caddy

# Verify
ls -ld /var/log/caddy
# Should show: drwxr-xr-x caddy caddy
```

### 4.5. Test and Start Caddy

```bash
# Test Caddy configuration
caddy validate --config /etc/caddy/Caddyfile

# If validation passes, reload Caddy
systemctl reload caddy

# Check Caddy status
systemctl status caddy

# View Caddy logs (to see certificate issuance)
journalctl -u caddy -f
```

**Expected log output:**

```text
certificate obtained successfully
serving HTTPS on :443
```

**Note:** Let's Encrypt requires ports 80 and 443 to be accessible from the internet. Ensure your firewall (UFW) allows these ports.

---

## 5. Environment Variables

### 5.1. Migrate Secrets from Fly.io

**On your local machine**, retrieve current Fly.io secrets:

```bash
# List Fly.io secrets
cd /path/to/image-optimizer/api
flyctl secrets list

# Example output:
# NAME                     DIGEST          CREATED AT
# API_KEY_AUTH_ENABLED     xxxxx           2025-01-10
# ALLOWED_DOMAINS          xxxxx           2025-01-10
# CORS_ORIGINS             xxxxx           2025-01-10
# DB_PATH                  xxxxx           2025-01-10
# PORT                     xxxxx           2025-01-10
# RATE_LIMIT_ENABLED       xxxxx           2025-01-10
```

**Note:** Fly.io doesn't show secret values. Use your local `.env` file or `fly.toml` as reference.

### 5.2. Create .env File on Server

**SSH into server** and create the environment file:

```bash
# Create .env file
cat > /opt/image-optimizer/.env <<'EOF'
# Server Configuration
PORT=8080

# CORS Origins (Frontend domain)
CORS_ORIGINS=https://sosquishy.io,https://www.sosquishy.io,http://localhost:3000

# Database
DB_PATH=/opt/image-optimizer/data/api_keys.db

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m

# API Key Authentication
API_KEY_AUTH_ENABLED=true
PUBLIC_OPTIMIZATION_ENABLED=true

# URL Fetching - Allowed Domains
ALLOWED_DOMAINS=cloudinary.com,imgur.com,unsplash.com,pexels.com,localhost,127.0.0.1

# Build Info (optional - set during build or deployment)
APP_VERSION=v0.1.0
GIT_COMMIT=abc123
BUILD_TIME=2025-01-15T10:30:00Z
EOF

# Set proper permissions
chown appuser:appuser /opt/image-optimizer/.env
chmod 600 /opt/image-optimizer/.env

# Verify contents (as appuser)
sudo -u appuser cat /opt/image-optimizer/.env
```

### 5.3. Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | API server port (internal) |
| `CORS_ORIGINS` | - | Comma-separated list of allowed origins |
| `DB_PATH` | ./data/api_keys.db | SQLite database path |
| `RATE_LIMIT_ENABLED` | true | Enable/disable rate limiting |
| `RATE_LIMIT_MAX` | 100 | Max requests per window |
| `RATE_LIMIT_WINDOW` | 1m | Rate limit time window |
| `API_KEY_AUTH_ENABLED` | true | Enable API key authentication |
| `PUBLIC_OPTIMIZATION_ENABLED` | false | Allow public access to /optimize endpoints |
| `ALLOWED_DOMAINS` | (see default list) | Domains allowed for URL fetching |

---

## 6. Logs & Monitoring

### 6.1. Start the Application

```bash
# Start the service
systemctl start image-optimizer

# Check status
systemctl status image-optimizer

# View logs
journalctl -u image-optimizer -f
```

**Expected output:**

```text
● image-optimizer.service - Image Optimizer API Server
     Loaded: loaded (/etc/systemd/system/image-optimizer.service; enabled)
     Active: active (running) since Wed 2025-01-15 10:30:00 UTC; 5s ago
   Main PID: 12345 (image-optimizer)
      Tasks: 8 (limit: 4915)
     Memory: 45.2M
        CPU: 123ms
     CGroup: /system.slice/image-optimizer.service
             └─12345 /usr/local/bin/image-optimizer

Jan 15 10:30:00 image-optimizer-api systemd[1]: Started Image Optimizer API Server.
Jan 15 10:30:00 image-optimizer-api image-optimizer[12345]: Server starting on :8080
```

### 6.2. Log Management

**View logs in real-time:**

```bash
# Follow application logs
journalctl -u image-optimizer -f

# Follow Caddy logs
journalctl -u caddy -f

# View last 100 lines
journalctl -u image-optimizer -n 100

# View logs from specific time
journalctl -u image-optimizer --since "1 hour ago"

# View logs with priority
journalctl -u image-optimizer -p err
```

**Log rotation (journald handles this automatically):**

```bash
# Check journal disk usage
journalctl --disk-usage

# Configure retention (optional)
cat >> /etc/systemd/journald.conf <<'EOF'
SystemMaxUse=500M
SystemMaxFileSize=50M
MaxRetentionSec=7day
EOF

# Restart journald
systemctl restart systemd-journald
```

**Caddy logs location:**

```bash
# View Caddy access logs
tail -f /var/log/caddy/api.sosquishy.io.log

# Rotate Caddy logs (via logrotate)
cat > /etc/logrotate.d/caddy <<'EOF'
/var/log/caddy/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifesempty
    create 0644 caddy caddy
    sharedscripts
    postrotate
        systemctl reload caddy > /dev/null 2>&1
    endscript
}
EOF
```

### 6.3. Monitoring Commands

**System resources:**

```bash
# Real-time system monitor
htop

# Memory usage
free -h

# Disk usage
df -h

# Process-specific memory
ps aux | grep image-optimizer

# Detailed process stats
systemd-cgtop
```

**Application health:**

```bash
# Health check (internal)
curl http://localhost:8080/health

# Health check (external via Caddy)
curl https://api.sosquishy.io/health

# Expected response:
# {"status":"ok","version":"v0.1.0","commit":"abc123","buildTime":"2025-01-15T10:30:00Z"}
```

### 6.4. Simple Monitoring Script

Create `/usr/local/bin/monitor-image-optimizer.sh`:

```bash
cat > /usr/local/bin/monitor-image-optimizer.sh <<'EOF'
#!/bin/bash

# Health check
HEALTH=$(curl -s http://localhost:8080/health)
if [[ $? -ne 0 ]]; then
    echo "CRITICAL: API health check failed"
    systemctl status image-optimizer
    exit 1
fi

# Memory check
MEM_USAGE=$(ps -C image-optimizer -o %mem --no-headers | awk '{print $1}')
if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
    echo "WARNING: Memory usage at ${MEM_USAGE}%"
fi

# Disk check
DISK_USAGE=$(df -h /opt/image-optimizer | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $DISK_USAGE -gt 80 ]]; then
    echo "WARNING: Disk usage at ${DISK_USAGE}%"
fi

echo "OK: All checks passed at $(date)"
EOF

chmod +x /usr/local/bin/monitor-image-optimizer.sh

# Test the script
/usr/local/bin/monitor-image-optimizer.sh

# Add to crontab (run every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-image-optimizer.sh >> /var/log/image-optimizer/monitor.log 2>&1") | crontab -
```

---

## 7. Alternative: Docker Deployment

If you prefer containerization, use this Docker-based approach instead of the binary deployment.

### 7.1. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add appuser to docker group
usermod -aG docker appuser

# Install Docker Compose
apt install -y docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 7.2. Create Docker Deployment Directory

```bash
# Create deployment directory
mkdir -p /opt/image-optimizer-docker
cd /opt/image-optimizer-docker
```

### 7.3. Create Dockerfile

Create `/opt/image-optimizer-docker/Dockerfile`:

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git vips-dev build-base

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary with version info
ARG APP_VERSION=dev
ARG GIT_COMMIT=none
ARG BUILD_TIME=unknown

RUN CGO_ENABLED=1 GOOS=linux go build \
    -ldflags "-X main.AppVersion=${APP_VERSION} -X main.GitCommit=${GIT_COMMIT} -X main.BuildTime=${BUILD_TIME}" \
    -o image-optimizer \
    main.go

# Runtime stage
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache vips ca-certificates

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Create data directory
RUN mkdir -p /app/data && chown -R appuser:appuser /app

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/image-optimizer .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run
CMD ["./image-optimizer"]
```

### 7.4. Create docker-compose.yml

Create `/opt/image-optimizer-docker/docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        APP_VERSION: "${APP_VERSION:-v0.1.0}"
        GIT_COMMIT: "${GIT_COMMIT:-unknown}"
        BUILD_TIME: "${BUILD_TIME:-unknown}"
    container_name: image-optimizer-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"  # Only expose to localhost (Caddy reverse proxy)
    env_file:
      - .env
    volumes:
      - ./data:/app/data:rw
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          memory: 3G
        reservations:
          memory: 512M

networks:
  default:
    name: image-optimizer-network
```

### 7.5. Create .env File

```bash
# Create .env file (same as binary deployment)
cat > /opt/image-optimizer-docker/.env <<'EOF'
PORT=8080
CORS_ORIGINS=https://sosquishy.io,https://www.sosquishy.io,http://localhost:3000
DB_PATH=/app/data/api_keys.db
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m
API_KEY_AUTH_ENABLED=true
PUBLIC_OPTIMIZATION_ENABLED=true
ALLOWED_DOMAINS=cloudinary.com,imgur.com,unsplash.com,pexels.com,localhost,127.0.0.1
EOF

chmod 600 /opt/image-optimizer-docker/.env
chown -R appuser:appuser /opt/image-optimizer-docker
```

### 7.6. Deploy with Docker Compose

#### Option 1: Build from source on server

```bash
# Copy source code to server
rsync -avz --exclude='node_modules' --exclude='.git' \
  /path/to/image-optimizer/api/ \
  root@123.45.67.89:/opt/image-optimizer-docker/

# SSH into server
ssh root@123.45.67.89
cd /opt/image-optimizer-docker

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

#### Option 2: Build locally and push image

```bash
# On local machine - build image
cd /path/to/image-optimizer/api
docker build -t image-optimizer:latest .

# Save image
docker save image-optimizer:latest | gzip > image-optimizer.tar.gz

# Copy to server
scp image-optimizer.tar.gz root@123.45.67.89:/tmp/

# On server - load image
ssh root@123.45.67.89
docker load < /tmp/image-optimizer.tar.gz

# Update docker-compose.yml to use pre-built image
cd /opt/image-optimizer-docker
cat > docker-compose.yml <<'EOF'
version: '3.8'
services:
  api:
    image: image-optimizer:latest
    # ... rest of the config same as above
EOF

# Start container
docker-compose up -d
```

### 7.7. Docker Management Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View logs
docker-compose logs -f api

# Execute commands in container
docker-compose exec api sh

# Check resource usage
docker stats image-optimizer-api

# Update and redeploy
docker-compose down
docker-compose pull  # if using remote image
docker-compose up -d --build

# Clean up old images
docker image prune -a
```

### 7.8. Caddy Configuration for Docker

Caddy configuration remains the same - it proxies to `localhost:8080` whether the app runs as a binary or in Docker.

---

## 8. Migration Verification

### 8.1. Pre-Migration Checklist

Before switching DNS/traffic to the new server:

- [ ] Server provisioned and accessible via SSH
- [ ] Firewall (UFW) configured and enabled
- [ ] Application running (binary or Docker)
- [ ] Caddy installed and configured
- [ ] DNS updated to point to new server IP
- [ ] DNS propagation complete (verify with `dig api.sosquishy.io`)
- [ ] SSL certificate obtained from Let's Encrypt
- [ ] Environment variables configured correctly
- [ ] Database directory created and writable

### 8.2. Health Check Tests

Run these tests from your **local machine**:

```bash
# Test 1: Health endpoint (HTTPS)
curl -v https://api.sosquishy.io/health

# Expected:
# HTTP/2 200
# {"status":"ok","version":"v0.1.0",...}

# Test 2: HTTPS redirect
curl -I http://api.sosquishy.io/health

# Expected:
# HTTP/1.1 308 Permanent Redirect
# Location: https://api.sosquishy.io/health

# Test 3: SSL certificate
openssl s_client -connect api.sosquishy.io:443 -servername api.sosquishy.io < /dev/null 2>/dev/null | openssl x509 -noout -issuer -subject -dates

# Expected:
# issuer=C = US, O = Let's Encrypt, CN = R3
# subject=CN = api.sosquishy.io
# notBefore=...
# notAfter=... (should be ~90 days in future)

# Test 4: CORS headers
curl -H "Origin: https://sosquishy.io" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     -I https://api.sosquishy.io/optimize

# Expected:
# Access-Control-Allow-Origin: https://sosquishy.io
# Access-Control-Allow-Methods: ...

# Test 5: Optimize endpoint (small test)
curl -X POST "https://api.sosquishy.io/optimize?format=webp&quality=80" \
     -F "url=https://via.placeholder.com/150" \
     | jq

# Expected:
# {"originalSize":...,"optimizedSize":...,"format":"webp",...}
```

### 8.3. Functional Tests

**Test image optimization:**

```bash
# Create a test image
curl -o test.jpg https://via.placeholder.com/800x600.jpg

# Test basic optimization
curl -X POST "https://api.sosquishy.io/optimize?format=webp&quality=85" \
     -F "image=@test.jpg" \
     | jq

# Test with returnImage
curl -X POST "https://api.sosquishy.io/optimize?format=webp&quality=85&returnImage=true" \
     -F "image=@test.jpg" \
     --output optimized.webp

# Verify output
file optimized.webp
ls -lh test.jpg optimized.webp
```

**Test rate limiting:**

```bash
# Rapid-fire 150 requests (should hit rate limit)
for i in {1..150}; do
    curl -s -o /dev/null -w "%{http_code}\n" "https://api.sosquishy.io/health"
done | sort | uniq -c

# Expected output:
# 100 200  (successful requests)
#  50 429  (rate limited)
```

**Test large image (memory stress test):**

```bash
# Test with a large image (simulate the issue that caused migration)
# Use a ~10MB image
curl -X POST "https://api.sosquishy.io/optimize?format=webp&quality=80" \
     -F "url=https://picsum.photos/4000/3000" \
     --max-time 60 \
     | jq

# Expected: Should complete successfully without OOM errors
# Monitor server memory: ssh root@123.45.67.89 "htop"
```

### 8.4. Performance Comparison

**Fly.io baseline (before migration):**

```bash
# Test response time
time curl -s https://api.sosquishy.io/health

# Test optimization time
time curl -X POST "https://api.sosquishy.io/optimize?format=webp" \
     -F "url=https://via.placeholder.com/800x600" \
     -o /dev/null
```

**Hetzner (after migration):**

```bash
# Same tests - compare timings
# Expected: Similar or better performance with 4GB RAM vs 2GB
```

### 8.5. Monitoring Verification

**Check logs for errors:**

```bash
# SSH into server
ssh root@123.45.67.89

# Check for errors in last 100 log entries
journalctl -u image-optimizer -n 100 -p err

# Check Caddy errors
journalctl -u caddy -n 100 -p err

# Expected: No critical errors
```

**Memory usage:**

```bash
# Check current memory usage
free -h
ps aux | grep image-optimizer

# Expected: Memory usage should be reasonable (<1GB for idle app)
```

### 8.6. Frontend Integration Test

**Update frontend to use new API (if needed):**

The frontend is already configured to use `https://api.sosquishy.io`, so no changes should be needed. Test the full stack:

1. Visit <https://sosquishy.io>
2. Upload a test image
3. Click "Optimize"
4. Verify results display correctly
5. Check browser console for errors

### 8.7. Final Verification Checklist

- [ ] Health endpoint returns 200 OK
- [ ] HTTPS certificate is valid (Let's Encrypt)
- [ ] HTTP redirects to HTTPS
- [ ] CORS headers present for sosquishy.io origin
- [ ] Image optimization works (basic test)
- [ ] Large image optimization completes without errors
- [ ] Rate limiting triggers after 100 requests
- [ ] No errors in application logs
- [ ] No errors in Caddy logs
- [ ] Memory usage is stable
- [ ] Frontend integration works end-to-end
- [ ] API keys can be created and used
- [ ] Swagger docs accessible at /swagger/index.html

---

## 9. Rollback Plan

If issues arise during or after migration, follow this rollback procedure.

### 9.1. Immediate Rollback (DNS)

**Fastest rollback - revert DNS:**

```bash
# On local machine - update DNS back to Fly.io IP
# Get Fly.io IP
cd /path/to/image-optimizer/api
flyctl ips list

# Update DNS A record for api.sosquishy.io to point back to Fly.io IP
# DNS propagation: 5-30 minutes
```

### 9.2. Restart Fly.io App

If Fly.io app was stopped/scaled down:

```bash
# Scale up
flyctl scale count 1

# Or restart
flyctl restart

# Verify
flyctl status
curl https://api.sosquishy.io/health
```

### 9.3. Partial Rollback (Test Both)

Run both Fly.io and Hetzner simultaneously:

- Keep Fly.io at `api.sosquishy.io` (production)
- Point Hetzner to `api-new.sosquishy.io` (testing)
- Gradually migrate traffic

### 9.4. Data Migration (API Keys)

If you created API keys on Hetzner and need to preserve them:

```bash
# On Hetzner server
cd /opt/image-optimizer/data
tar czf api_keys_backup.tar.gz api_keys.db

# Copy to local machine
scp root@123.45.67.89:/opt/image-optimizer/data/api_keys_backup.tar.gz .

# If rolling back to Fly.io with new keys, import database
# (Fly.io uses persistent volume at /app/data)
```

---

## 10. Post-Migration Tasks

### 10.1. Update Documentation

- [ ] Update DEPLOYMENT.md with Hetzner details
- [ ] Update README.md deployment section
- [ ] Document any environment variable changes
- [ ] Update monitoring/alerting configurations

### 10.2. Cleanup Fly.io (After Successful Migration)

**Wait at least 1 week** before destroying Fly.io resources to ensure stability.

```bash
# Scale down Fly.io (keep as backup)
cd /path/to/image-optimizer/api
flyctl scale count 0

# After 1 week of stable Hetzner operation, destroy Fly.io app
flyctl apps destroy image-optimizer-billowing-waterfall-5108

# Or keep it scaled to 0 for emergency rollback capability
```

### 10.3. Cost Comparison

**Fly.io (previous):**

- VM: 2GB RAM, 1 vCPU
- Cost: ~$12/month
- Limitation: OOM errors with large images

**Hetzner Cloud CX22 (new):**

- VM: 4GB RAM, 2 vCPU, 40GB SSD
- Cost: €5.83/month (~$6.50)
- Benefit: 2x RAM, no OOM errors
- **Savings: ~$5.50/month (45% cost reduction)**

### 10.4. Set Up Automated Backups

**Database backup script:**

```bash
cat > /usr/local/bin/backup-image-optimizer.sh <<'EOF'
#!/bin/bash

BACKUP_DIR="/opt/image-optimizer/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/opt/image-optimizer/data/api_keys.db"

mkdir -p "$BACKUP_DIR"

# Backup database
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_DIR/api_keys_${DATE}.db"
    gzip "$BACKUP_DIR/api_keys_${DATE}.db"

    # Keep only last 7 days of backups
    find "$BACKUP_DIR" -name "api_keys_*.db.gz" -mtime +7 -delete

    echo "Backup completed: api_keys_${DATE}.db.gz"
else
    echo "Database not found at $DB_PATH"
fi
EOF

chmod +x /usr/local/bin/backup-image-optimizer.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-image-optimizer.sh >> /var/log/image-optimizer/backup.log 2>&1") | crontab -
```

### 10.5. Security Hardening (Optional)

**SSH key-only authentication:**

```bash
# Disable password authentication
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
```

**Change SSH port (security through obscurity):**

```bash
# Edit SSH config
sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Update UFW
ufw allow 2222/tcp comment 'SSH (custom port)'
ufw delete allow 22/tcp

# Restart SSH
systemctl restart sshd

# Update your SSH config (~/.ssh/config) on local machine
cat >> ~/.ssh/config <<'EOF'
Host image-optimizer
    HostName 123.45.67.89
    Port 2222
    User root
EOF
```

---

## 11. Troubleshooting

### Common Issues and Solutions

#### Issue: "Connection refused" when accessing API

**Diagnosis:**

```bash
# Check if app is running
systemctl status image-optimizer

# Check if port is listening
ss -tlnp | grep 8080

# Check Caddy
systemctl status caddy
```

**Solution:**

```bash
# Restart services
systemctl restart image-optimizer
systemctl restart caddy

# Check logs
journalctl -u image-optimizer -n 50
```

#### Issue: "cannot execute binary file: Exec format error"

**Cause:** Binary was built on macOS instead of Linux server

**Diagnosis:**

```bash
# Check binary format
file /usr/local/bin/image-optimizer

# If it shows "Mach-O" → Built on Mac (WRONG)
# Should show "ELF 64-bit LSB executable, x86-64" → Built on Linux (CORRECT)

# Check server architecture
uname -m
# Should show: x86_64
```

**Solution:**

```bash
# Remove wrong binary
rm /usr/local/bin/image-optimizer

# Copy source from Mac
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='web' \
  ./api/ root@sosquishy-server:/tmp/api-build/

# Build ON THE SERVER (not on Mac!)
ssh sosquishy-server
cd /tmp/api-build
go build -v -ldflags "-X main.version=v0.1.0" -o image-optimizer main.go

# Verify it's Linux binary
file image-optimizer
# Must show "ELF 64-bit LSB executable, x86-64"

# Deploy
mv image-optimizer /usr/local/bin/image-optimizer
chmod +x /usr/local/bin/image-optimizer
```

#### Issue: Caddy reload hangs or fails with "permission denied"

**Cause:** Log directory doesn't exist or has wrong permissions

**Diagnosis:**

```bash
# Check if log directory exists
ls -ld /var/log/caddy

# Check Caddy logs for permission errors
journalctl -u caddy -n 50 | grep -i "permission denied"
```

**Solution:**

```bash
# Stop Caddy if it's stuck
systemctl stop caddy

# Create log directory with proper ownership
mkdir -p /var/log/caddy
chown -R caddy:caddy /var/log/caddy
chmod 755 /var/log/caddy

# Start Caddy
systemctl start caddy
systemctl status caddy
```

#### Issue: SSL certificate not issued

**Diagnosis:**

```bash
journalctl -u caddy | grep -i "certificate\|acme\|error"
```

**Common causes:**

- DNS not propagated yet (wait 30 minutes)
- Port 80/443 blocked by firewall
- Domain not pointing to server

**Solution:**

```bash
# Verify DNS
dig api.sosquishy.io

# Verify ports
curl -I http://api.sosquishy.io

# Check UFW
ufw status

# Force certificate renewal
caddy reload --config /etc/caddy/Caddyfile
```

#### Issue: High memory usage

**Diagnosis:**

```bash
# Check memory
free -h
ps aux --sort=-%mem | head

# Check app memory
systemctl status image-optimizer
```

**Solution:**

```bash
# Adjust memory limits in systemd service
# Edit /etc/systemd/system/image-optimizer.service
# Change: MemoryMax=3G to MemoryMax=2G

systemctl daemon-reload
systemctl restart image-optimizer
```

#### Issue: Rate limiting too aggressive

**Diagnosis:**

```bash
# Check logs for 429 errors
journalctl -u image-optimizer | grep "429\|rate limit"
```

**Solution:**

```bash
# Adjust rate limits in .env
sed -i 's/RATE_LIMIT_MAX=100/RATE_LIMIT_MAX=200/' /opt/image-optimizer/.env

# Restart app
systemctl restart image-optimizer
```

---

## 12. Deployment Script (Automated)

For streamlined deployments, use this automated script:

```bash
cat > /usr/local/bin/deploy-image-optimizer.sh <<'EOF'
#!/bin/bash
set -e

echo "=== Image Optimizer Deployment Script ==="

# Variables
BINARY_PATH="/usr/local/bin/image-optimizer"
SERVICE_NAME="image-optimizer"
TEMP_BINARY="/tmp/image-optimizer-new"

# Check if new binary provided
if [ ! -f "$TEMP_BINARY" ]; then
    echo "Error: Place new binary at $TEMP_BINARY"
    exit 1
fi

# Backup current binary
echo "Backing up current binary..."
cp "$BINARY_PATH" "${BINARY_PATH}.backup"

# Stop service
echo "Stopping service..."
systemctl stop "$SERVICE_NAME"

# Replace binary
echo "Installing new binary..."
mv "$TEMP_BINARY" "$BINARY_PATH"
chmod +x "$BINARY_PATH"

# Start service
echo "Starting service..."
systemctl start "$SERVICE_NAME"

# Wait for health check
echo "Waiting for health check..."
sleep 3

# Verify health
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✓ Deployment successful!"
    echo "✓ Service is healthy"

    # Remove backup
    rm "${BINARY_PATH}.backup"
else
    echo "✗ Health check failed - rolling back"

    # Rollback
    systemctl stop "$SERVICE_NAME"
    mv "${BINARY_PATH}.backup" "$BINARY_PATH"
    systemctl start "$SERVICE_NAME"

    echo "✗ Rollback complete"
    exit 1
fi

# Show status
systemctl status "$SERVICE_NAME" --no-pager
EOF

chmod +x /usr/local/bin/deploy-image-optimizer.sh
```

**Usage:**

```bash
# On local machine - copy source
cd /Users/keif/projects/git/image-optimizer
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='web' \
  ./api/ root@sosquishy-server:/tmp/api-build-new/

# On server - build and deploy
ssh sosquishy-server
cd /tmp/api-build-new
go build -o /tmp/image-optimizer-new main.go
/usr/local/bin/deploy-image-optimizer.sh
rm -rf /tmp/api-build-new
```

---

## Summary

This migration guide provides two deployment options:

1. **Go Binary** (recommended for simplicity)
   - Lightweight, fast startup
   - Easy to update
   - Lower resource usage

2. **Docker** (recommended for consistency)
   - Containerized environment
   - Easier dependency management
   - Better isolation

**Key benefits of Hetzner migration:**

- ✅ 2x memory (4GB vs 2GB) - resolves OOM errors
- ✅ Lower cost (~$6.50/month vs ~$12/month)
- ✅ More control over infrastructure
- ✅ Easier debugging and monitoring

**Next steps:**

1. Complete server provisioning
2. Deploy application (binary or Docker)
3. Configure Caddy and SSL
4. Run verification tests
5. Monitor for 1 week before cleaning up Fly.io

For questions or issues, refer to the troubleshooting section or check application logs.

# DNS Setup for Full Stack Hetzner Deployment

## Overview

You need to update DNS records to point both `sosquishy.io` and `api.sosquishy.io` to your Hetzner server.

## Get Your Hetzner Server IP

```bash
# Option 1: From SSH config
grep -A 2 "sosquishy-server" ~/.ssh/config

# Option 2: Via hcloud CLI
hcloud server ip sosquishy-server

# Option 3: From Hetzner Console
# https://console.hetzner.cloud → Select server → Copy IP
```

Example IP: `123.45.67.89`

## DNS Records to Create/Update

| Type | Name | Value | TTL | Priority | Notes |
|------|------|-------|-----|----------|-------|
| A | `@` (root) | `123.45.67.89` | 3600 | - | Main domain (sosquishy.io) |
| A | `www` | `123.45.67.89` | 3600 | - | www subdomain (redirects to root) |
| A | `api` | `123.45.67.89` | 3600 | - | API subdomain |
| AAAA | `@` (root) | `2001:db8::1` | 3600 | - | IPv6 (optional) |
| AAAA | `api` | `2001:db8::1` | 3600 | - | IPv6 for API (optional) |

**Replace `123.45.67.89` with your actual Hetzner server IP**

## DNS Provider Instructions

### Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select `sosquishy.io` domain
3. Go to **DNS** → **Records**
4. Update/Add records:

```
Type: A
Name: @
Content: 123.45.67.89
Proxy status: Proxied (orange cloud) or DNS only (gray cloud)
TTL: Auto

Type: A
Name: www
Content: 123.45.67.89
Proxy status: Proxied or DNS only
TTL: Auto

Type: A
Name: api
Content: 123.45.67.89
Proxy status: DNS only (IMPORTANT: Must be gray cloud for Let's Encrypt)
TTL: Auto
```

**Important Cloudflare Notes:**
- For `api.sosquishy.io`: **Disable proxy (gray cloud)** to allow Let's Encrypt certificate verification
- For `sosquishy.io` and `www`: Can use proxy (orange cloud) for CDN benefits, OR disable proxy for direct connection
- If using Cloudflare proxy, you may need to adjust SSL/TLS settings

### Namecheap

1. Log in to [Namecheap](https://www.namecheap.com)
2. Go to **Domain List** → Click **Manage** next to sosquishy.io
3. Go to **Advanced DNS** tab
4. Add/Update records:

```
Type: A Record
Host: @
Value: 123.45.67.89
TTL: Automatic

Type: A Record
Host: www
Value: 123.45.67.89
TTL: Automatic

Type: A Record
Host: api
Value: 123.45.67.89
TTL: Automatic
```

### Google Domains

1. Log in to [Google Domains](https://domains.google.com)
2. Select `sosquishy.io`
3. Go to **DNS** tab
4. Under **Custom resource records**, add:

```
Name: @
Type: A
TTL: 1H
Data: 123.45.67.89

Name: www
Type: A
TTL: 1H
Data: 123.45.67.89

Name: api
Type: A
TTL: 1H
Data: 123.45.67.89
```

### Route 53 (AWS)

1. Log in to [AWS Console](https://console.aws.amazon.com/route53)
2. Go to **Hosted zones** → Select `sosquishy.io`
3. Click **Create record**
4. Add records:

```
Record name: (leave empty for root)
Record type: A
Value: 123.45.67.89
TTL: 300
Routing policy: Simple

Record name: www
Record type: A
Value: 123.45.67.89
TTL: 300
Routing policy: Simple

Record name: api
Record type: A
Value: 123.45.67.89
TTL: 300
Routing policy: Simple
```

## Verify DNS Propagation

After updating DNS, wait 5-30 minutes for propagation, then verify:

```bash
# Check root domain
dig sosquishy.io A +short
# Expected: 123.45.67.89

# Check www subdomain
dig www.sosquishy.io A +short
# Expected: 123.45.67.89

# Check API subdomain
dig api.sosquishy.io A +short
# Expected: 123.45.67.89

# Check from multiple locations
curl https://dnschecker.org/all-dns-records-of-domain.php?query=sosquishy.io
```

**Online tools:**
- https://dnschecker.org
- https://www.whatsmydns.net
- https://mxtoolbox.com/SuperTool.aspx

## Before Deploying

**IMPORTANT:** Only deploy after DNS has propagated!

1. ✅ DNS records updated to point to Hetzner IP
2. ✅ DNS propagation verified (dig shows correct IP)
3. ✅ Server has Caddy installed
4. ✅ Firewall allows ports 80 and 443

Then run deployment:

```bash
# Option 1: GitHub Actions
git push origin main

# Option 2: Manual deployment
./deploy-docker-hetzner.sh
```

## SSL Certificate Verification

After deployment, Caddy will automatically obtain Let's Encrypt certificates. Verify:

```bash
# Check certificate for main domain
openssl s_client -connect sosquishy.io:443 -servername sosquishy.io < /dev/null 2>/dev/null | openssl x509 -noout -issuer -subject -dates

# Expected:
# issuer=C = US, O = Let's Encrypt, CN = R3
# subject=CN = sosquishy.io
# notBefore=...
# notAfter=... (should be ~90 days in future)

# Check certificate for API
openssl s_client -connect api.sosquishy.io:443 -servername api.sosquishy.io < /dev/null 2>/dev/null | openssl x509 -noout -issuer -subject -dates

# Expected:
# issuer=C = US, O = Let's Encrypt, CN = R3
# subject=CN = api.sosquishy.io
```

## Troubleshooting

### DNS Not Propagating

**Problem:** DNS still shows old IP after 1 hour

**Solution:**
1. Clear local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Linux
   sudo systemd-resolve --flush-caches

   # Windows
   ipconfig /flushdns
   ```

2. Check TTL on old records (may need to wait for old TTL to expire)
3. Verify DNS records in provider dashboard

### SSL Certificate Fails

**Problem:** Caddy can't obtain Let's Encrypt certificate

**Common causes:**
1. Port 80/443 blocked by firewall
2. DNS not propagated yet
3. Cloudflare proxy enabled (for API subdomain)

**Solution:**
```bash
# SSH to server
ssh sosquishy-server

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check Caddy logs
sudo journalctl -u caddy -n 100

# Test Let's Encrypt challenge
curl http://sosquishy.io/.well-known/acme-challenge/test

# Disable Cloudflare proxy if enabled (must be gray cloud for Let's Encrypt)
```

### Wrong IP Showing

**Problem:** dig shows wrong IP address

**Solution:**
1. Double-check DNS records in provider dashboard
2. Ensure you're updating the right domain
3. Check if there's a CNAME record conflicting with A record (remove CNAME)
4. Wait longer for propagation (can take up to 48 hours in rare cases)

## Migration from GitHub Pages

If you're migrating from GitHub Pages:

1. **Before changing DNS:**
   - Deploy to Hetzner
   - Verify it works via IP: `http://123.45.67.89`
   - Ensure Caddyfile is correct

2. **Update DNS:**
   - Change A records to point to Hetzner
   - Wait for propagation

3. **After DNS propagates:**
   - Verify HTTPS works
   - Check frontend and API
   - Disable GitHub Pages (optional):
     - GitHub repo → Settings → Pages → Source: None

4. **Rollback if needed:**
   - Revert DNS to GitHub Pages IP: `185.199.108.153`
   - May need to re-enable GitHub Pages

## Current DNS Status

To check what's currently configured:

```bash
# Get all DNS records
dig sosquishy.io ANY +noall +answer

# Get specific A records
dig sosquishy.io A +short
dig www.sosquishy.io A +short
dig api.sosquishy.io A +short

# Get nameservers
dig sosquishy.io NS +short
```

## Next Steps

After DNS is configured and propagated:

1. Deploy with `./deploy-docker-hetzner.sh` or GitHub Actions
2. Verify services:
   - https://sosquishy.io (frontend)
   - https://api.sosquishy.io/health (API)
   - https://sosquishy.io/ads.txt (should 301 redirect)
3. Monitor Caddy logs for SSL certificate issuance
4. Test all functionality

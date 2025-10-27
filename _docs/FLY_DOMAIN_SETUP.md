# Custom Domain Setup for Fly.io

## Connecting api.sosquishy.io to Your Image Optimizer API

---

## Overview

This guide walks through connecting your custom domain `api.sosquishy.io` to your Fly.io application.

**What You'll Get:**

- ✅ HTTPS automatically enabled with Let's Encrypt certificates
- ✅ Auto-renewal of certificates (every 90 days)
- ✅ HTTP → HTTPS redirects
- ✅ IPv4 and IPv6 support
- ✅ No additional cost (certificates are free)

---

## Prerequisites

- [x] Fly.io app deployed and running (`flyctl status` shows healthy)
- [x] Access to DNS settings for `sosquishy.io`
- [x] Domain registrar login (where you bought sosquishy.io)

---

## Step 1: Add Certificate to Fly.io

```bash
flyctl certs add api.sosquishy.io
```

**Expected output:**

```text
Your certificate for api.sosquishy.io is being issued.

Add the following DNS records to your domain:

CNAME record:
  Name: api
  Target: image-optimizer.fly.dev
```

**What this does:**

- Requests a TLS certificate from Let's Encrypt
- Provides DNS configuration needed to verify domain ownership
- Starts certificate issuance process (takes 1-5 minutes after DNS is configured)

---

## Step 2: Configure DNS

You have **two options** for DNS configuration:

### Option A: CNAME Record (Recommended)

**Pros:**

- ✅ Automatically follows if Fly IPs change
- ✅ Easier to manage
- ✅ Standard for subdomains

**Cons:**

- ❌ Won't work for apex domain (sosquishy.io without subdomain)
- ❌ May not work with some CDNs (like Cloudflare Proxy)

**Configuration:**

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Name** | `api` (or `api.sosquishy.io` depending on provider) |
| **Target** | `image-optimizer.fly.dev` |
| **TTL** | Auto or 300 |
| **Proxy** | ⚠️ **OFF** (disable Cloudflare proxy if applicable) |

### Option B: A and AAAA Records

**Pros:**

- ✅ Works with Cloudflare proxy
- ✅ More control

**Cons:**

- ❌ Must update if Fly IPs change
- ❌ Two records to manage

**Get Fly.io IPs:**

```bash
flyctl ips list
```

**Example output:**

```text
VERSION IP                      TYPE    REGION  CREATED AT
v6      2a09:8280:1::3:abcd     public  global  2025-10-19T00:00:00Z
v4      66.241.125.123          public  global  2025-10-19T00:00:00Z
```

**Configuration:**

| Field | Value |
|-------|-------|
| **Type** | A |
| **Name** | `api` |
| **Target** | `66.241.125.123` (your actual IPv4) |
| **TTL** | 300 |

| Field | Value |
|-------|-------|
| **Type** | AAAA |
| **Name** | `api` |
| **Target** | `2a09:8280:1::3:abcd` (your actual IPv6) |
| **TTL** | 300 |

---

## Step 3: Add DNS Records (Provider-Specific)

### Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select `sosquishy.io` domain
3. Go to **DNS** tab
4. Click **Add record**

**For CNAME:**

```text
Type: CNAME
Name: api
Target: image-optimizer.fly.dev
Proxy status: DNS only (click the orange cloud to turn it gray)
TTL: Auto
```

**For A/AAAA:**

```text
Type: A
Name: api
IPv4 address: <from flyctl ips list>
Proxy status: DNS only or Proxied (your choice)
TTL: Auto
```

Click **Save**

### Namecheap

1. Log in to [Namecheap](https://www.namecheap.com/)
2. Go to **Domain List** → Select `sosquishy.io`
3. Click **Manage** → **Advanced DNS** tab

**For CNAME:**

```text
Type: CNAME Record
Host: api
Value: image-optimizer.fly.dev
TTL: Automatic
```

**For A/AAAA:**

```text
Type: A Record
Host: api
Value: <IPv4 from flyctl ips list>
TTL: Automatic
```

Click **Save All Changes**

### Route53 (AWS)

1. Log in to [AWS Console](https://console.aws.amazon.com/route53/)
2. Go to **Hosted zones** → Select `sosquishy.io`
3. Click **Create record**

**For CNAME:**

```text
Record name: api
Record type: CNAME
Value: image-optimizer.fly.dev
TTL: 300
Routing policy: Simple routing
```

**For A/AAAA:**

```text
Record name: api
Record type: A
Value: <IPv4 from flyctl ips list>
TTL: 300
```

Click **Create records**

### Google Domains / Google Cloud DNS

1. Go to [Google Domains](https://domains.google.com/) or [Cloud DNS](https://console.cloud.google.com/net-services/dns)
2. Select `sosquishy.io`
3. Click **DNS** or **Manage**

**For CNAME:**

```text
Resource type: CNAME
Name: api.sosquishy.io.
Data: image-optimizer.fly.dev.
TTL: 5 minutes
```

**For A/AAAA:**

```text
Resource type: A
Name: api.sosquishy.io.
Data: <IPv4>
TTL: 5 minutes
```

### Other DNS Providers

General format:

```text
Type: CNAME
Name/Host: api
Value/Points to: image-optimizer.fly.dev
TTL: 300-600 seconds
```

---

## Step 4: Verify DNS Propagation

**Check DNS configuration:**

```bash
# Using dig (macOS/Linux)
dig api.sosquishy.io

# Using nslookup (Windows/macOS/Linux)
nslookup api.sosquishy.io

# Expected output (CNAME):
api.sosquishy.io.  300  IN  CNAME  image-optimizer.fly.dev.

# Expected output (A record):
api.sosquishy.io.  300  IN  A  66.241.125.123
```

**Online DNS checkers:**

- <https://dnschecker.org/>
- <https://mxtoolbox.com/DNSLookup.aspx>
- <https://www.whatsmydns.net/>

**Wait for propagation:**

- Usually: 5-10 minutes
- Maximum: 24-48 hours (rare)
- TTL determines cache duration

---

## Step 5: Verify Certificate Status

```bash
flyctl certs show api.sosquishy.io
```

**Status progression:**

1. `Pending` → DNS not configured yet
2. `Validating` → DNS configured, waiting for Let's Encrypt
3. `Issued` → Certificate ready! ✅

**Troubleshooting statuses:**

- `Failed` → Check DNS configuration
- `Timeout` → DNS not propagating, wait longer

**Force certificate refresh:**

```bash
flyctl certs remove api.sosquishy.io
flyctl certs add api.sosquishy.io
```

---

## Step 6: Test HTTPS

```bash
# Test health endpoint
curl https://api.sosquishy.io/health

# Expected response:
{"status":"ok"}

# Test with verbose output
curl -v https://api.sosquishy.io/health

# Check for:
# * SSL connection using TLSv1.3
# * Server certificate:
# *  subject: CN=api.sosquishy.io
# *  issuer: C=US; O=Let's Encrypt; CN=R3
```

**Test in browser:**

```text
https://api.sosquishy.io/swagger/index.html
```

Should show:

- ✅ Padlock icon in address bar
- ✅ "Connection is secure"
- ✅ Certificate valid for api.sosquishy.io

---

## Step 7: Update CORS Origins (If Needed)

If your frontend needs to call the API from the custom domain:

```bash
flyctl secrets set CORS_ORIGINS="https://sosquishy.io,https://www.sosquishy.io,https://api.sosquishy.io,https://keif.github.io"
```

This will restart the app automatically.

---

## Step 8: Update Frontend Configuration

Update your frontend to use the new domain:

**Before:**

```javascript
const API_URL = "https://image-optimizer.fly.dev";
```

**After:**

```javascript
const API_URL = "https://api.sosquishy.io";
```

Or use environment variables:

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.sosquishy.io
```

---

## Verification Checklist

- [ ] DNS resolves to correct target

  ```bash
  dig api.sosquishy.io
  ```

- [ ] Certificate issued

  ```bash
  flyctl certs show api.sosquishy.io | grep "issued"
  ```

- [ ] HTTPS works

  ```bash
  curl https://api.sosquishy.io/health
  ```

- [ ] HTTP redirects to HTTPS

  ```bash
  curl -I http://api.sosquishy.io/health
  # Should show: Location: https://api.sosquishy.io/health
  ```

- [ ] CORS headers present

  ```bash
  curl -H "Origin: https://sosquishy.io" -I https://api.sosquishy.io/health
  # Should show: Access-Control-Allow-Origin: https://sosquishy.io
  ```

- [ ] Swagger docs accessible

  ```bash
  open https://api.sosquishy.io/swagger/index.html
  ```

- [ ] API endpoints work

  ```bash
  curl -X POST https://api.sosquishy.io/optimize \
    -F "image=@test.jpg" \
    -F "format=webp" \
    --output test.webp
  ```

---

## Certificate Management

### Auto-Renewal

Let's Encrypt certificates expire after **90 days**.

**Fly.io automatically renews certificates** before expiration.

You don't need to do anything!

### View Certificate Details

```bash
# Show certificate info
flyctl certs show api.sosquishy.io

# Check expiration date
flyctl certs show api.sosquishy.io | grep -i expires

# List all certificates
flyctl certs list
```

### Manual Certificate Operations

```bash
# Force certificate refresh
flyctl certs remove api.sosquishy.io
flyctl certs add api.sosquishy.io

# Check certificate renewal logs
flyctl logs --grep certificate
```

---

## Multiple Domains (Optional)

Want to support multiple domains? Add them all:

```bash
flyctl certs add api.sosquishy.io
flyctl certs add www.api.sosquishy.io  # If needed
flyctl certs add api-backup.sosquishy.io  # Backup domain
```

Then update DNS for each domain.

---

## Troubleshooting

### Issue: "DNS verification failed"

**Check:**

```bash
dig api.sosquishy.io
nslookup api.sosquishy.io
```

**Solutions:**

1. Wait for DNS propagation (up to 48h, usually 5-10 min)
2. Verify DNS record is correct
3. If using Cloudflare, disable proxy (orange cloud → gray cloud)
4. Check for typos in domain name

### Issue: "Certificate stuck in pending"

**Solution:**

```bash
# Remove and re-add
flyctl certs remove api.sosquishy.io
flyctl certs add api.sosquishy.io

# Check DNS again
dig api.sosquishy.io

# Wait 5 minutes, then check
flyctl certs show api.sosquishy.io
```

### Issue: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**Cause:** Certificate not issued yet

**Solution:**

```bash
flyctl certs show api.sosquishy.io
# If status is not "issued", wait for completion
```

### Issue: CORS errors from frontend

**Check CORS origins:**

```bash
flyctl secrets list | grep CORS
```

**Update if needed:**

```bash
flyctl secrets set CORS_ORIGINS="https://sosquishy.io,https://api.sosquishy.io"
```

### Issue: "Too many redirects"

**Cause:** Cloudflare proxy + Fly.io both forcing HTTPS

**Solutions:**

1. Disable Cloudflare proxy (recommended for API)
2. Or set Cloudflare SSL mode to "Full (strict)"

### Issue: DNS not propagating

**Check TTL:**

```bash
dig api.sosquishy.io | grep TTL
```

High TTL (e.g., 86400 = 24 hours) means slow propagation.

**Solutions:**

1. Lower TTL before making changes (e.g., 300 = 5 minutes)
2. Wait for old TTL to expire
3. Flush DNS cache:

   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Windows
   ipconfig /flushdns

   # Linux
   sudo systemd-resolve --flush-caches
   ```

---

## Rollback / Remove Domain

```bash
# Remove certificate and domain
flyctl certs remove api.sosquishy.io

# Remove DNS records from your DNS provider

# App will still work at:
https://image-optimizer.fly.dev
```

---

## Cost

**All of this is FREE:**

- ✅ HTTPS certificates (Let's Encrypt)
- ✅ Auto-renewal
- ✅ Unlimited domains
- ✅ IPv4 + IPv6
- ✅ Certificate management

You only pay for:

- VM runtime (~$5-10/month for 2GB)
- Bandwidth (generous free tier)
- Persistent storage (~$0.15/GB/month)

---

## Reference Links

- Fly.io Custom Domains: <https://fly.io/docs/networking/custom-domain/>
- Let's Encrypt: <https://letsencrypt.org/>
- DNS Checker: <https://dnschecker.org/>
- SSL Test: <https://www.ssllabs.com/ssltest/>

---

## Quick Reference Commands

```bash
# Add certificate
flyctl certs add api.sosquishy.io

# Check status
flyctl certs show api.sosquishy.io

# List all certs
flyctl certs list

# Remove cert
flyctl certs remove api.sosquishy.io

# Get Fly IPs
flyctl ips list

# Test DNS
dig api.sosquishy.io

# Test HTTPS
curl https://api.sosquishy.io/health

# Update CORS
flyctl secrets set CORS_ORIGINS="https://sosquishy.io,https://api.sosquishy.io"
```

---

**Setup Date:** _______________________

**Domain:** api.sosquishy.io

**Status:** [ ] Pending [ ] In Progress [ ] Complete

**Notes:**

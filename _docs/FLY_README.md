# Fly.io Migration Package
## Complete Guide for Moving Image Optimizer API from Render to Fly.io

---

## 📦 What's Included

This migration package contains everything you need to migrate your image optimization API from Render to Fly.io:

1. **FLY_MIGRATION_GUIDE.md** - Complete step-by-step migration plan
2. **FLY_COMMANDS_CHEATSHEET.md** - Copy-paste ready CLI commands
3. **FLY_DOMAIN_SETUP.md** - Custom domain configuration guide
4. **api/fly.toml** - Fly.io configuration file (ready to deploy)

---

## 🎯 Migration Goals

- ✅ Increase memory from 512 MB → **2 GB**
- ✅ Reduce monthly cost by ~$5-15
- ✅ Maintain custom domain `api.sosquishy.io`
- ✅ Zero downtime migration strategy
- ✅ Keep SQLite database data
- ✅ Preserve all API functionality

---

## ⚡ Quick Start (15 Minutes)

For experienced users who want to migrate quickly:

```bash
# 1. Install Fly CLI
brew install flyctl

# 2. Login
flyctl auth login

# 3. Navigate to API directory
cd /Users/keif/projects/git/image-optimizer/api

# 4. Initialize app
flyctl launch --no-deploy

# 5. Create volume
flyctl volumes create image_optimizer_data --region iad --size 1

# 6. Set secrets
flyctl secrets set \
  CORS_ORIGINS="https://sosquishy.io,https://www.sosquishy.io,https://keif.github.io" \
  PUBLIC_OPTIMIZATION_ENABLED=true \
  API_KEY_AUTH_ENABLED=true \
  RATE_LIMIT_ENABLED=true \
  RATE_LIMIT_MAX=100 \
  RATE_LIMIT_WINDOW=1m \
  DB_PATH=/app/data/api_keys.db

# 7. Deploy
flyctl deploy

# 8. Scale memory
flyctl scale memory 2048

# 9. Add domain
flyctl certs add api.sosquishy.io

# 10. Configure DNS (see FLY_DOMAIN_SETUP.md)
# Add CNAME: api → image-optimizer.fly.dev

# 11. Verify
curl https://api.sosquishy.io/health
```

**Done!** Your API is now running on Fly.io with 2GB of RAM.

---

## 📚 Detailed Documentation

### 1. FLY_MIGRATION_GUIDE.md

**Full migration plan with:**
- Phase-by-phase breakdown
- Estimated time for each step
- Troubleshooting common issues
- Rollback procedures
- Post-migration checklist
- Cost comparison

**👉 Start here if:** You want a comprehensive understanding of the migration process.

### 2. FLY_COMMANDS_CHEATSHEET.md

**Quick reference with:**
- Copy-paste ready commands
- Common management operations
- Testing commands
- Emergency procedures
- One-line deployment

**👉 Use this if:** You need quick command lookup during migration.

### 3. FLY_DOMAIN_SETUP.md

**Custom domain guide with:**
- DNS configuration for all major providers
- Certificate management
- HTTPS setup
- Troubleshooting DNS issues
- CORS configuration

**👉 Refer to this for:** Setting up `api.sosquishy.io` after deployment.

### 4. api/fly.toml

**Production-ready configuration:**
- 2GB RAM pre-configured
- Health checks enabled
- Persistent volume mounted
- Timeouts set to 60 seconds
- Auto-rollback on failed deployments

**👉 Already included:** No edits needed unless you want to customize region or resources.

---

## 🔧 Technical Stack

**Application:**
- **Language:** Go 1.24
- **Framework:** Fiber v2
- **Image Processing:** libvips, libheif
- **Optimization:** oxipng
- **Database:** SQLite
- **API Docs:** Swagger/OpenAPI

**Infrastructure:**
- **Platform:** Fly.io
- **Regions:** US East (IAD) by default, customizable
- **Memory:** 2 GB
- **CPU:** 1 shared vCPU
- **Storage:** 1 GB persistent volume
- **HTTPS:** Let's Encrypt (auto-managed)

---

## 📊 Before vs After

| Metric | Render (Current) | Fly.io (New) |
|--------|------------------|--------------|
| **Memory** | 512 MB | **2 GB** (4x increase) |
| **CPU** | Shared | Shared (similar) |
| **Cost** | ~$15-25/month | **~$5-10/month** |
| **Timeout Issues** | ✅ Fixed (already 60s) | ✅ Maintained |
| **Custom Domain** | api.sosquishy.io | api.sosquishy.io (same) |
| **HTTPS** | Automatic | Automatic |
| **Database** | SQLite | SQLite (migrated) |
| **Deploy Time** | ~3-5 min | **~1-2 min** |
| **Regions** | US only | Global (your choice) |
| **Auto-scaling** | Limited | Available |

---

## 🚀 Deployment Strategy

### Zero-Downtime Migration

1. **Deploy to Fly.io** without changing DNS
2. **Test at** `https://image-optimizer.fly.dev`
3. **Verify all endpoints** work correctly
4. **Update DNS** to point to Fly.io
5. **Wait for propagation** (5-10 minutes)
6. **Monitor logs** for any issues
7. **Keep Render running** for 24-48 hours as backup
8. **Delete Render service** once confident

### Rollback Plan

If issues occur:
```bash
# Option 1: Quick rollback to previous version
flyctl releases
flyctl rollback v<VERSION>

# Option 2: Revert DNS to Render
# (Keep Render running during initial testing)
```

---

## 🔐 Environment Variables

All secrets are managed via Fly.io secrets (encrypted):

| Variable | Production Value | Purpose |
|----------|------------------|---------|
| `CORS_ORIGINS` | `https://sosquishy.io,https://www.sosquishy.io,https://keif.github.io` | Frontend origins |
| `PUBLIC_OPTIMIZATION_ENABLED` | `true` | Public API access |
| `API_KEY_AUTH_ENABLED` | `true` | API key system |
| `RATE_LIMIT_ENABLED` | `true` | Rate limiting |
| `RATE_LIMIT_MAX` | `100` | Max requests/minute |
| `RATE_LIMIT_WINDOW` | `1m` | Rate limit window |
| `DB_PATH` | `/app/data/api_keys.db` | Database location |

**View secrets:**
```bash
flyctl secrets list
```

**Update a secret:**
```bash
flyctl secrets set VARIABLE_NAME=value
```

---

## 🧪 Testing After Migration

### Health Check
```bash
curl https://api.sosquishy.io/health
# Expected: {"status":"ok"}
```

### Image Optimization
```bash
curl -X POST https://api.sosquishy.io/optimize \
  -F "image=@test.jpg" \
  -F "format=webp" \
  -F "quality=80" \
  --output optimized.webp
```

### Spritesheet Packing
```bash
curl -X POST https://api.sosquishy.io/pack-sprites \
  -F "sprites=@sprite1.png" \
  -F "sprites=@sprite2.png" \
  -F "maxWidth=2048" \
  --output spritesheet.zip
```

### API Documentation
```bash
open https://api.sosquishy.io/swagger/index.html
```

### CORS Test (from browser console)
```javascript
fetch('https://api.sosquishy.io/health')
  .then(r => r.json())
  .then(console.log);
```

---

## 📈 Monitoring & Metrics

### View Logs
```bash
# Real-time logs
flyctl logs --follow

# Recent logs
flyctl logs

# Filter logs
flyctl logs --grep error
```

### Check Status
```bash
# App status
flyctl status

# Metrics
flyctl metrics

# Resource usage
flyctl vm status
```

### SSH Access
```bash
# SSH into running container
flyctl ssh console

# Run command
flyctl ssh console -C "ls -lah /app/data"
```

---

## 💰 Cost Breakdown

**Monthly costs on Fly.io:**

| Resource | Usage | Cost |
|----------|-------|------|
| **Compute** | 2GB RAM, 1 CPU | ~$5-8/month |
| **Storage** | 1GB volume | ~$0.15/month |
| **Bandwidth** | ~10GB (free tier) | $0 |
| **HTTPS Certs** | Unlimited | $0 |
| **Total** | | **~$5-10/month** |

**Compare to Render:**
- Render Starter: $7/month (512MB)
- Render Standard: $25/month (2GB)

**Savings:** $5-15/month with Fly.io

---

## 🆘 Getting Help

### Documentation
- **Fly.io Docs:** https://fly.io/docs/
- **Fly.io Guides:** https://fly.io/docs/hands-on/
- **API Reference:** https://fly.io/docs/flyctl/

### Community & Support
- **Community Forum:** https://community.fly.io/
- **Discord:** https://fly.io/discord
- **Status Page:** https://status.fly.io/
- **GitHub Issues:** https://github.com/keif/image-optimizer/issues

### Common Issues
Check `FLY_MIGRATION_GUIDE.md` → Troubleshooting section for:
- Build failures
- Volume mounting issues
- CORS errors
- Certificate problems
- DNS configuration issues

---

## 🔄 Post-Migration Tasks

### Immediate (First 24 Hours)
- [ ] Monitor logs for errors
- [ ] Test all API endpoints
- [ ] Verify frontend integration
- [ ] Check database persistence (restart app, verify data)
- [ ] Monitor memory usage

### Short-term (First Week)
- [ ] Update frontend to use new domain
- [ ] Update documentation with new URLs
- [ ] Remove Render from DNS (after DNS TTL expires)
- [ ] Delete Render service (stop billing)
- [ ] Set up external monitoring (optional: UptimeRobot, Pingdom)

### Long-term (Ongoing)
- [ ] Review metrics monthly
- [ ] Scale if traffic increases
- [ ] Backup SQLite database periodically
- [ ] Update dependencies (go mod, vips, etc.)
- [ ] Monitor Fly.io status page for maintenance

---

## 🎓 Learning Resources

**New to Fly.io?**
- [Fly.io Speedrun](https://fly.io/docs/speedrun/) - 5-minute introduction
- [Fly.io Launch Guide](https://fly.io/docs/hands-on/launch-app/) - Deploy your first app
- [Fly.io Volumes](https://fly.io/docs/volumes/) - Persistent storage guide

**Advanced Topics:**
- [Auto-scaling](https://fly.io/docs/reference/scaling/) - Scale based on metrics
- [Multi-region](https://fly.io/docs/reference/regions/) - Deploy globally
- [Fly Postgres](https://fly.io/docs/postgres/) - If you outgrow SQLite
- [Fly Secrets](https://fly.io/docs/reference/secrets/) - Manage environment variables

---

## 📝 Checklist

Print this out and check off as you go:

### Pre-Migration
- [ ] Install Fly CLI
- [ ] Create Fly.io account
- [ ] Review current Render configuration
- [ ] Backup SQLite database (if exists)

### Migration
- [ ] Run `flyctl launch --no-deploy`
- [ ] Create persistent volume
- [ ] Set all environment secrets
- [ ] Deploy application
- [ ] Scale memory to 2GB
- [ ] Test at `.fly.dev` URL

### Domain Setup
- [ ] Add certificate with `flyctl certs add`
- [ ] Configure DNS (CNAME or A/AAAA)
- [ ] Wait for DNS propagation
- [ ] Verify certificate issued
- [ ] Test at custom domain

### Post-Migration
- [ ] Update CORS origins
- [ ] Test all endpoints
- [ ] Monitor logs for 24h
- [ ] Update frontend configuration
- [ ] Delete Render service

---

## 🎉 Success Criteria

Migration is successful when:

✅ **Health check responds:** `https://api.sosquishy.io/health` returns `{"status":"ok"}`

✅ **Memory increased:** `flyctl status` shows 2048 MB

✅ **HTTPS working:** Padlock icon in browser, Let's Encrypt certificate

✅ **API endpoints functional:** Image optimization, spritesheet packing, Swagger docs all work

✅ **CORS configured:** Frontend can make cross-origin requests

✅ **Database persists:** SQLite data survives app restarts

✅ **No errors in logs:** `flyctl logs` shows clean operation

✅ **Cost reduced:** Fly.io dashboard shows ~$5-10/month

---

## 📞 Migration Support

If you run into issues during migration:

1. **Check the guides:**
   - FLY_MIGRATION_GUIDE.md (troubleshooting section)
   - FLY_COMMANDS_CHEATSHEET.md (quick fixes)
   - FLY_DOMAIN_SETUP.md (DNS/cert issues)

2. **Check Fly.io status:**
   - https://status.fly.io/

3. **Ask the community:**
   - https://community.fly.io/

4. **Contact support:**
   - https://fly.io/support (for paid plans)

---

## 🔖 Quick Links

- **Fly.io Dashboard:** https://fly.io/dashboard
- **App URL:** https://image-optimizer.fly.dev
- **Custom Domain:** https://api.sosquishy.io
- **Swagger Docs:** https://api.sosquishy.io/swagger/index.html
- **GitHub Repo:** https://github.com/keif/image-optimizer

---

**Migration Package Version:** 1.0

**Created:** 2025-10-19

**For:** Image Optimizer API (Render → Fly.io)

**Estimated Migration Time:** 30-45 minutes

**Difficulty:** ⭐⭐ (Intermediate)

---

Good luck with your migration! 🚀

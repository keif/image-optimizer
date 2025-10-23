# Ezoic Integration Setup Guide

This document outlines the configuration required to complete the Ezoic ad integration for sosquishy.io.

## Current Status

✅ **Code-side Setup Complete**
- CSP headers configured to allow Ezoic domains
- Ezoic scripts integrated in production layout
- Consent management platform (CMP) scripts added
- Favicon created and deployed

## Required Ezoic Dashboard Configuration

### 1. Site Registration
**Action**: Register `sosquishy.io` in your Ezoic account

**Steps**:
1. Log in to [Ezoic Dashboard](https://www.ezoic.com)
2. Go to **Settings** → **Websites**
3. Add `sosquishy.io` as a new site
4. Complete the site verification process

**Current Issue**: The error `g.ezoic.net/detroitchicago/ezconfig` suggests the site may not be properly registered or is using a default/example configuration.

---

### 2. Domain Verification
**Action**: Verify domain ownership

**Methods**:
- DNS verification (recommended)
- Meta tag verification (already added: `<meta name="ezoic-site-verification" content="sosquishy.io" />`)
- File upload verification

**Status**: Meta tag added to `web/app/layout.tsx` (line 26)

---

### 3. Cookie Domain Configuration
**Action**: Configure cookie domain settings

**Steps**:
1. Go to **Privacy** → **Consent Management**
2. Set cookie domain to `.sosquishy.io` (with leading dot for subdomain support)
3. Ensure cookie settings match the domain structure

**Current Issue**: Browser error `Cookie "ezCMPCookieConsent" has been rejected for invalid domain`

---

### 4. Integration Type Configuration
**Action**: Verify integration method is set to "Standalone"

**Steps**:
1. Go to **Integration** → **Settings**
2. Select **Standalone** integration (not Cloudflare or WordPress)
3. Save configuration

**Code Reference**: We're using `ezstandalone` API in `web/app/layout.tsx`

---

### 5. Ad Placements Setup
**Action**: Create ad placements if using AdBanner component

**Steps**:
1. Go to **Ad Settings** → **Ad Placements**
2. Create placeholder IDs (e.g., 101, 102, 103)
3. Configure placement types (banner, sidebar, etc.)

**Code Reference**: See `web/components/AdBanner.tsx` for implementation

**Current Usage**: AdBanner is used in articles but not on `/learn` page

---

### 6. CORS Configuration
**Action**: Whitelist `sosquishy.io` for API calls

**Steps**:
1. Contact Ezoic support or check **Integration** → **Advanced Settings**
2. Ensure `sosquishy.io` is whitelisted for CORS requests
3. Verify allowed origins include both `www.sosquishy.io` and `sosquishy.io`

**Current Issue**: CORS error on `g.ezoic.net/detroitchicago/ezconfig`

---

### 7. Content Security Policy Acknowledgment
**Action**: Review and acknowledge CSP settings

**Configured Domains**:
- `*.ezojs.com` - Main Ezoic scripts
- `*.ezoic.net` - Config and ad serving
- `*.gatekeeperconsent.com` - Consent management
- `*.id5-sync.com` - Identity solution
- `gc.zgo.at`, `goatcounter.com` - Analytics

**Status**: ✅ CSP configured in `web/app/layout.tsx` and `web/next.config.mjs`

---

## Testing After Configuration

Once Ezoic dashboard is configured, test the following:

### 1. Console Verification
Open browser console on https://sosquishy.io and verify:
```javascript
// Should exist and not throw errors
window.ezstandalone
ezstandalone.cmd
```

### 2. Network Requests
Check Network tab for successful loads:
- ✅ `cmp.gatekeeperconsent.com/min.js`
- ✅ `the.gatekeeperconsent.com/cmp.min.js`
- ✅ `www.ezojs.com/ezoic/sa.min.js`
- ✅ `g.ezoic.net/{site-config}/ezconfig` (should return valid config, not 404)

### 3. Cookie Verification
Check Application → Cookies for:
- `ezCMPCookieConsent` - Should be set without errors
- Domain should be `.sosquishy.io`

### 4. Ad Placement Testing
Visit pages with AdBanner components:
- `/` (home page)
- `/articles/*` (article pages)

Verify ads load in placeholder divs with IDs: `ezoic-pub-ad-placeholder-{ID}`

---

## Troubleshooting

### Error: "detroitchicago" in config URL
**Cause**: Site not properly registered or using default configuration
**Fix**: Complete step 1 (Site Registration)

### Error: Cookie domain invalid
**Cause**: Cookie domain mismatch
**Fix**: Complete step 3 (Cookie Domain Configuration)

### Error: CORS blocked
**Cause**: Domain not whitelisted
**Fix**: Complete step 6 (CORS Configuration)

### Error: Scripts fail to load
**Cause**: Ad blocker or browser extension
**Expected**: AdBlockerFallback component will display donation message

---

## Environment Variables (Optional)

Currently, no environment variables are required for Ezoic integration. All configuration is done via:
1. Ezoic Dashboard
2. `web/app/layout.tsx` (production-only scripts)
3. `web/next.config.mjs` (CSP headers)

If you want to make Ezoic integration configurable:

```bash
# Add to .env.local
NEXT_PUBLIC_EZOIC_ENABLED=true
NEXT_PUBLIC_EZOIC_SITE_ID=your-site-id
```

Then update `layout.tsx`:
```typescript
const isEzoicEnabled = process.env.NEXT_PUBLIC_EZOIC_ENABLED === 'true';
```

---

## Support

If issues persist after completing dashboard configuration:

1. **Ezoic Support**: https://support.ezoic.com
2. **Ezoic Community**: https://community.ezoic.com
3. **Check Status**: https://status.ezoic.com

---

## Files Modified

- `web/app/layout.tsx` - Ezoic scripts and CSP meta tags
- `web/next.config.mjs` - CSP headers configuration
- `web/app/icon.png` - Favicon (32x32)
- `web/app/favicon.ico` - Multi-resolution favicon
- `web/app/apple-icon.png` - iOS icon (180x180)
- `web/components/AdBanner.tsx` - Ad placement component (already existed)

---

**Last Updated**: October 22, 2025
**Next Review**: After Ezoic dashboard configuration is complete

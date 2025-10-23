# Ezoic Ad Integration Setup Guide

## Overview

This guide explains the Ezoic ad integration with ad blocker detection and donation fallback implemented in the image optimizer.

---

## Implementation Summary

### Files Created/Modified

**New Files:**
- `web/hooks/useAdBlockDetection.ts` - Detects ad blockers
- `web/components/AdBanner.tsx` - Main ad component with Ezoic integration
- `web/components/AdBlockerFallback.tsx` - Donation message for ad blocker users

**Modified Files:**
- `web/app/layout.tsx` - Added Ezoic privacy and header scripts
- `web/app/page.tsx` - Added ad placements (top banner + sidebar)

---

## Ad Placements

### 1. Top Banner Ad (Placeholder ID: 101)
- **Location:** Below header, above main content
- **Type:** Horizontal banner (728x90 or responsive)
- **Visibility:** All devices (mobile + desktop)
- **Fallback:** Donation banner when ads blocked

### 2. Sidebar Ad (Placeholder ID: 102)
- **Location:** Right sidebar, between "How it Works" and "Privacy First" boxes
- **Type:** Vertical sidebar (300x250 or 300x600)
- **Visibility:** Desktop only (hidden on mobile)
- **Fallback:** Compact donation card when ads blocked

---

## Ezoic Dashboard Setup

### Step 1: Add Ad Placeholders

1. Log into your Ezoic dashboard
2. Go to **"Ad Placements"** section
3. Create two new ad placeholders:

**Placeholder 101 (Top Banner):**
- Type: Display Ad
- Size: Responsive (or 728x90 leaderboard)
- Location: Below header

**Placeholder 102 (Sidebar):**
- Type: Display Ad
- Size: Medium Rectangle (300x250) or Half Page (300x600)
- Location: Sidebar

### Step 2: Configure Ad Settings

1. Enable **GDPR/Privacy Consent** (already integrated via privacy scripts)
2. Set up **Ad Tester** to preview ads
3. Configure **Ad Balance** (recommended: Medium or Aggressive for new sites)

### Step 3: Integration Testing

1. Use Ezoic's Chrome extension to preview ads
2. Test with ad blocker enabled → should show donation message
3. Test on mobile → should only show top banner
4. Test on desktop → should show both placements

---

## How It Works

### Ad Loading Flow

```
User visits page
    ↓
Ezoic privacy scripts load (GDPR compliance)
    ↓
Ezoic header script initializes
    ↓
AdBanner components mount
    ↓
Ad blocker detection runs
    ↓
┌─────────────┬─────────────┐
│ Ads Blocked │ Ads Allowed │
└─────────────┴─────────────┘
       ↓              ↓
  Show Donation   Show Ezoic Ad
  Fallback        (placeholder-101/102)
```

### Ad Blocker Detection

The `useAdBlockDetection` hook:
1. Creates a "bait" element with ad-like class names
2. Checks if ad blockers hide/remove it
3. Returns `true` if blocked, `false` if allowed
4. Triggers fallback component when blocked

### Fallback Behavior

**When ads are blocked:**
- Top banner → Shows purple/pink gradient banner with donation CTAs
- Sidebar → Shows compact card with donation buttons
- Both link to Buy Me a Coffee and GitHub Sponsors

---

## Revenue Estimates

### Ezoic CPM (Conservative Estimates)

| Monthly Pageviews | Est. Revenue/Month | Notes |
|-------------------|-------------------|-------|
| 10,000 | $5-15 | Early stage, low traffic |
| 50,000 | $50-150 | Moderate traffic, better CPMs |
| 100,000 | $150-400 | Good traffic, optimized placements |
| 500,000 | $1,000-2,500 | High traffic, premium CPMs |

**Factors affecting CPM:**
- Geographic location (US/EU = higher)
- Ad placement quality
- User engagement
- Niche (developer tools typically $2-5 CPM)

### Optimization Tips

1. **First 30 days:** Keep 100% revenue (Ezoic takes no cut)
2. **Ad Balance:** Start with "Medium", adjust based on user feedback
3. **Placements:** Monitor which performs better (top vs sidebar)
4. **A/B Testing:** Let Ezoic test different ad sizes automatically

---

## Testing Instructions

### Local Testing

```bash
cd web
pnpm run dev
```

**Important:** Ezoic scripts are disabled in development to avoid CORS errors. You'll see placeholder boxes instead.

**What to test:**

1. **Development mode (localhost):**
   - Load http://localhost:3000
   - Should see blue/purple dashed boxes with "Development Mode - Ad Placeholder"
   - This is normal! Ads only work in production.

2. **Ad blocker detection (test in production build):**
   ```bash
   pnpm run build
   pnpm run start  # Production mode locally
   ```
   - Enable uBlock Origin or AdBlock Plus
   - Should see donation banners instead of ads
   - Check both top banner and sidebar

3. **Mobile responsiveness:**
   - Open DevTools, switch to mobile view
   - Should only see top banner (sidebar hidden)
   - Placeholder/fallback should be mobile-friendly

### Production Testing

After deploying to GitHub Pages:

1. **Visit with Ezoic Chrome extension:**
   - Install Ezoic's Chrome extension
   - Enable "Test Mode"
   - Should see test ads in both placements

2. **GDPR Consent:**
   - First visit from EU → Should see consent popup
   - Accept/reject → Ads should respect choice

3. **Performance:**
   - Check page load speed (Lighthouse)
   - Ezoic scripts should load async (non-blocking)
   - Fallback should appear instantly when needed

---

## Troubleshooting

### Ads Not Showing

**Problem:** Placeholder divs visible but no ads appear

**Solutions:**
1. Check Ezoic dashboard → Ensure site is activated
2. Verify placeholder IDs match (101, 102)
3. Wait 24-48 hours after setup for ads to start serving
4. Use Ezoic Chrome extension to test

### Ad Blocker Detection Not Working

**Problem:** Ads blocked but fallback doesn't show

**Solutions:**
1. Check browser console for errors
2. Ensure `useAdBlockDetection` hook is running
3. Test with different ad blockers (uBlock, AdBlock Plus)
4. Clear browser cache and reload

### Hydration Errors

**Problem:** Console shows hydration mismatch errors

**Solutions:**
1. The `isMounted` check should prevent this
2. If errors persist, check Next.js dev server logs
3. Ensure `'use client'` is at top of components

### GDPR Consent Issues

**Problem:** Consent popup not appearing in EU

**Solutions:**
1. Verify privacy scripts load first (check Network tab)
2. Check `data-cfasync="false"` is set
3. Test from actual EU location (not VPN)

---

## Next Steps

### Immediate (Before Launch)

1. ✅ Code implementation (complete)
2. ⏳ **Configure Ezoic placeholders** (do this in Ezoic dashboard)
3. ⏳ **Test with Ezoic Chrome extension**
4. ⏳ **Deploy to production**
5. ⏳ **Monitor first 24 hours**

### Short-term (First Week)

1. Track donation rate vs. ad revenue
2. Monitor user feedback (any complaints about ads?)
3. A/B test: Ads vs. donations only
4. Optimize ad placements based on Ezoic analytics

### Long-term (First Month)

1. Analyze Ezoic revenue dashboard
2. Adjust ad balance (more/fewer ads)
3. Consider additional placements if traffic grows
4. Re-evaluate: Keep Ezoic vs. try EthicalAds (when you hit 50k+ pageviews)

---

## Configuration Reference

### Ezoic Placeholder Format

```tsx
<AdBanner
  placeholderId={101}  // Maps to: ezoic-pub-ad-placeholder-101
  variant="banner"     // or "sidebar"
/>
```

### Environment Variables (Optional)

If you want to disable ads in development:

```env
# .env.local
NEXT_PUBLIC_ENABLE_ADS=false
```

Then update `AdBanner.tsx`:

```tsx
if (process.env.NEXT_PUBLIC_ENABLE_ADS === 'false') {
  return <AdBlockerFallback variant={variant} />;
}
```

---

## Support & Resources

- **Ezoic Support:** https://support.ezoic.com/
- **Ezoic Dashboard:** https://www.ezoic.com/dashboard/
- **Chrome Extension:** https://www.ezoic.com/publishers/integrations/chrome-extension/
- **Privacy Scripts:** Already integrated (GatekeeperConsent)

---

## Success Metrics to Track

1. **Ad Fill Rate:** % of ad requests filled (target: >90%)
2. **EPMV:** Earnings per 1000 visitors (track in Ezoic dashboard)
3. **Ad Blocker Rate:** % of users blocking ads (industry avg: 25-40%)
4. **Donation Rate:** % of ad blocker users who donate
5. **Bounce Rate:** Ensure ads don't hurt UX (monitor in GoatCounter)

---

**Status:** ✅ Implementation complete, ready for Ezoic dashboard configuration!

/**
 * AdSense configuration.
 *
 * Slot IDs are 10-digit identifiers assigned by Google when you create an ad
 * unit in the AdSense dashboard (https://www.google.com/adsense → Ads → By ad
 * unit → New ad unit). Each placement below maps to one ad unit.
 *
 * To finish wiring up real ads:
 *  1. In the AdSense dashboard, create an ad unit for each placement listed
 *     in ADSENSE_SLOTS (one for the homepage tool footer, one for the article
 *     mid-content slot).
 *  2. Copy the 10-digit "Ad slot" number into the corresponding entry below.
 *  3. Commit + deploy. Ads start rendering on the next build.
 *
 * Until the placeholder IDs are replaced, the <ins class="adsbygoogle"> tags
 * will still render but AdSense will silently skip them (it ignores unknown
 * slot IDs rather than throwing). No user-visible impact.
 */
export const ADSENSE_PUBLISHER_ID = 'ca-pub-2266405283226544' as const;

export const ADSENSE_SLOTS = {
  /** Below the optimizer tool on the homepage. */
  homepageBottom: '0000000001',
  /** Mid-content inside each article page. */
  articleMidContent: '0000000002',
} as const;

/**
 * AdSense configuration.
 *
 * Slot IDs are 10-digit identifiers assigned by Google when you create an ad
 * unit in the AdSense dashboard (https://www.google.com/adsense → Ads → By ad
 * unit). Each entry below maps to one ad unit created there.
 */
export const ADSENSE_PUBLISHER_ID = 'ca-pub-2266405283226544' as const;

export const ADSENSE_SLOTS = {
  /** Below the optimizer tool on the homepage. Display, format=auto. */
  homepageBottom: '2425124990',
  /** Mid-content inside each article page. In-article, format=fluid. */
  articleMidContent: '3469623678',
} as const;

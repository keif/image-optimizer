'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_PUBLISHER_ID } from '@/lib/adsense';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdFormat = 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

interface AdSlotProps {
  /** 10-digit slot ID from the AdSense dashboard. */
  slot: string;
  /** AdSense ad format. Defaults to 'auto' (responsive). */
  format?: AdFormat;
  /** Whether to allow full-width responsive sizing. Defaults to true. */
  responsive?: boolean;
  /** AdSense layout hint. Use 'in-article' for prose-flow ads. */
  layout?: 'in-article';
  /** Extra classes applied alongside the required `adsbygoogle` class. */
  className?: string;
  /** Inline style overrides. A min-height is set by default to reserve space
   *  and prevent CLS while AdSense initializes. */
  style?: React.CSSProperties;
}

/**
 * Renders a Google AdSense ad unit and triggers the push call after mount.
 *
 * Strict Mode mounts effects twice in dev; the `pushed` ref ensures we only
 * push once per slot regardless. The loader script is added globally in
 * app/layout.tsx.
 */
export function AdSlot({
  slot,
  format = 'auto',
  responsive = true,
  layout,
  className,
  style,
}: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch (err) {
      console.error('[AdSlot] adsbygoogle.push failed', err);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className ?? ''}`.trim()}
      style={{ display: 'block', minHeight: 280, ...style }}
      data-ad-client={ADSENSE_PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}

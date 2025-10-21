'use client';

import { useState, useEffect } from 'react';

/**
 * Detects if an ad blocker is active by attempting to load a bait element
 * Returns true if ads are blocked, false otherwise
 */
export function useAdBlockDetection(): boolean {
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  useEffect(() => {
    // Create a bait element that ad blockers typically hide
    const bait = document.createElement('div');
    bait.className = 'ad-container ad-banner advertising ads';
    bait.style.cssText = 'height: 1px; width: 1px; position: absolute; left: -9999px;';

    document.body.appendChild(bait);

    // Check after a brief delay to allow ad blockers to process
    const timeoutId = setTimeout(() => {
      // If the element is hidden or removed, an ad blocker is likely active
      const isBlocked =
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        window.getComputedStyle(bait).display === 'none' ||
        window.getComputedStyle(bait).visibility === 'hidden';

      setIsAdBlocked(isBlocked);

      // Clean up
      document.body.removeChild(bait);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (document.body.contains(bait)) {
        document.body.removeChild(bait);
      }
    };
  }, []);

  return isAdBlocked;
}

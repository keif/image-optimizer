'use client';

import { useEffect, useState } from 'react';
import { useAdBlockDetection } from '@/hooks/useAdBlockDetection';
import AdBlockerFallback from './AdBlockerFallback';

interface AdBannerProps {
  /**
   * Ezoic placeholder ID number
   * Example: 101 for top banner, 102 for sidebar
   * Get these from your Ezoic dashboard under "Ad Placements"
   */
  placeholderId: number;

  /**
   * Ad variant: banner (horizontal) or sidebar (vertical)
   */
  variant?: 'banner' | 'sidebar';

  /**
   * Custom class name for styling
   */
  className?: string;
}

export default function AdBanner({ placeholderId, variant = 'banner', className = '' }: AdBannerProps) {
  const isAdBlocked = useAdBlockDetection();
  const [isMounted, setIsMounted] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    setIsMounted(true);

    // Skip Ezoic check in development
    if (isDevelopment) {
      return;
    }

    // Check if Ezoic script has loaded
    const checkEzoic = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).ezstandalone) {
        setAdLoaded(true);
        clearInterval(checkEzoic);
      }
    }, 100);

    // Cleanup after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkEzoic);
    }, 5000);

    return () => {
      clearInterval(checkEzoic);
      clearTimeout(timeout);
    };
  }, [isDevelopment]);

  // Don't render until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null;
  }

  // Development mode: Show placeholder
  if (isDevelopment) {
    return (
      <div className={className}>
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6">
          <div className="text-center space-y-2">
            <div className="text-2xl">📢</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Development Mode - Ad Placeholder
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Ezoic Ad #{placeholderId} ({variant})
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Ads only load in production. Deploy to see real ads.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If ads are blocked, show the fallback donation message
  if (isAdBlocked) {
    return <AdBlockerFallback variant={variant} />;
  }

  // Ezoic placeholder ID format: ezoic-pub-ad-placeholder-{ID}
  const ezPlaceholderId = `ezoic-pub-ad-placeholder-${placeholderId}`;

  // Render Ezoic ad placeholder
  return (
    <div className={className}>
      {/* Ezoic placeholder div - Ezoic will automatically inject ads here */}
      <div id={ezPlaceholderId}>
        {/* Fallback content while ad loads */}
        {!adLoaded && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" style={{
            height: variant === 'banner' ? '90px' : '250px',
            width: '100%',
          }}>
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Loading ad...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

export default function SupportBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-4 z-50">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-white/80 hover:text-white text-xl leading-none"
        aria-label="Close"
      >
        ×
      </button>

      <div className="flex items-start gap-3">
        <Heart className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" />
        <div>
          <h3 className="font-semibold text-lg mb-1">Enjoying Image Optimizer?</h3>
          <p className="text-sm text-white/90 mb-3">
            This free tool costs money to run. Support development and hosting!
          </p>
          <div className="flex gap-2 flex-wrap">
            <a
              href="https://buymeacoffee.com/keif"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-white text-purple-600 rounded-md font-medium hover:bg-white/90 transition-colors"
            >
              Buy Me a Coffee
            </a>
            <a
              href="https://github.com/sponsors/keif"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-md font-medium hover:bg-white/30 transition-colors"
            >
              GitHub Sponsors
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

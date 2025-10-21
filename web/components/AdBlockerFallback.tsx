'use client';

import { Heart, Coffee } from 'lucide-react';

interface AdBlockerFallbackProps {
  variant?: 'banner' | 'sidebar';
}

export default function AdBlockerFallback({ variant = 'banner' }: AdBlockerFallbackProps) {
  if (variant === 'sidebar') {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Ad blocker detected!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              No worries! If you find this tool useful, consider supporting development:
            </p>
          </div>

          <div className="space-y-2">
            <a
              href="https://buymeacoffee.com/keif"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
            >
              <Coffee className="w-4 h-4" />
              Buy Me a Coffee
            </a>
            <a
              href="https://github.com/sponsors/keif"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
            >
              <Heart className="w-4 h-4" />
              GitHub Sponsors
            </a>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
            Your support keeps this free & privacy-first! 🔒
          </p>
        </div>
      </div>
    );
  }

  // Banner variant
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-center md:text-left">
          <Heart className="w-6 h-6 mt-1 flex-shrink-0 hidden md:block" fill="currentColor" />
          <div>
            <h3 className="font-bold text-lg mb-1">
              🎨 Ads blocked? No problem!
            </h3>
            <p className="text-sm text-white/90">
              If you find this tool useful, consider supporting development and hosting costs.
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <a
            href="https://buymeacoffee.com/keif"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 text-sm font-medium rounded-lg hover:bg-white/90 transition-colors shadow-md"
          >
            <Coffee className="w-4 h-4" />
            <span className="hidden sm:inline">Buy Me a Coffee</span>
            <span className="sm:hidden">Coffee</span>
          </a>
          <a
            href="https://github.com/sponsors/keif"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Sponsor</span>
          </a>
        </div>
      </div>
    </div>
  );
}

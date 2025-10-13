'use client';

import { OptimizationOptions } from '@/lib/types';

interface OptimizationControlsProps {
  options: OptimizationOptions;
  onChange: (options: OptimizationOptions) => void;
  disabled?: boolean;
}

export default function OptimizationControls({
  options,
  onChange,
  disabled,
}: OptimizationControlsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Optimization Settings
      </h3>

      {/* Quality Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quality: {options.quality || 80}
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={options.quality || 80}
          onChange={(e) =>
            onChange({ ...options, quality: parseInt(e.target.value) })
          }
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Smaller file</span>
          <span>Better quality</span>
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Output Format
        </label>
        <select
          value={options.format || ''}
          onChange={(e) =>
            onChange({
              ...options,
              format: e.target.value as OptimizationOptions['format'],
            })
          }
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Keep original</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
          <option value="gif">GIF</option>
        </select>
      </div>

      {/* Resize Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Width (px)
          </label>
          <input
            type="number"
            placeholder="Auto"
            value={options.width || ''}
            onChange={(e) =>
              onChange({
                ...options,
                width: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height (px)
          </label>
          <input
            type="number"
            placeholder="Auto"
            value={options.height || ''}
            onChange={(e) =>
              onChange({
                ...options,
                height: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Leave dimensions empty to maintain original size. Aspect ratio is preserved.
      </p>

      {/* Color Space Options */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.forceSRGB || false}
            onChange={(e) =>
              onChange({ ...options, forceSRGB: e.target.checked })
            }
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Force sRGB Conversion
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Convert wide-gamut colors to standard sRGB for maximum compatibility
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}

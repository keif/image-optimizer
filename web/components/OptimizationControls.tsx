'use client';

import { useState } from 'react';
import { OptimizationOptions } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OptimizationControlsProps {
  options: OptimizationOptions;
  onChange: (options: OptimizationOptions) => void;
  disabled?: boolean;
  originalFormat?: 'jpeg' | 'png' | 'webp' | 'gif';
}

export default function OptimizationControls({
  options,
  onChange,
  disabled,
  originalFormat,
}: OptimizationControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Determine which format's advanced controls to show
  // Priority: selected format > original format
  const effectiveFormat = options.format || originalFormat;

  const showJpegOptions = effectiveFormat === 'jpeg';
  const showPngOptions = effectiveFormat === 'png';
  const showWebpOptions = effectiveFormat === 'webp';

  // Show advanced section if any format-specific options are available
  const hasAdvancedOptions = showJpegOptions || showPngOptions || showWebpOptions;

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

      {/* Advanced Options Section */}
      {hasAdvancedOptions && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-left text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            disabled={disabled}
          >
            <span>Advanced Compression Options</span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              {/* JPEG Advanced Options */}
              {showJpegOptions && (
                <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    JPEG Options
                  </h4>

                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={options.progressive || false}
                      onChange={(e) =>
                        onChange({ ...options, progressive: e.target.checked })
                      }
                      disabled={disabled}
                      className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        Progressive encoding
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Image loads gradually (top to bottom)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={options.optimizeCoding || false}
                      onChange={(e) =>
                        onChange({ ...options, optimizeCoding: e.target.checked })
                      }
                      disabled={disabled}
                      className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        Optimize Huffman tables
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Better compression (slightly slower)
                      </div>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm text-gray-900 dark:text-gray-200 mb-1">
                      Chroma subsampling
                    </label>
                    <select
                      value={options.subsample || 0}
                      onChange={(e) =>
                        onChange({
                          ...options,
                          subsample: parseInt(e.target.value),
                        })
                      }
                      disabled={disabled}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="0">Auto</option>
                      <option value="1">4:4:4 (Best quality)</option>
                      <option value="2">4:2:2 (Balanced)</option>
                      <option value="3">4:2:0 (Smallest file)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-900 dark:text-gray-200 mb-1">
                      Smoothing: {options.smooth || 0}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={options.smooth || 0}
                      onChange={(e) =>
                        onChange({ ...options, smooth: parseInt(e.target.value) })
                      }
                      disabled={disabled}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Blur to improve compression
                    </div>
                  </div>
                </div>
              )}

              {/* PNG Advanced Options */}
              {showPngOptions && (
                <div className="space-y-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300">
                    PNG Options
                  </h4>

                  <div>
                    <label className="block text-sm text-gray-900 dark:text-gray-200 mb-1">
                      Compression level: {options.compression || 6}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="9"
                      value={options.compression || 6}
                      onChange={(e) =>
                        onChange({
                          ...options,
                          compression: parseInt(e.target.value),
                        })
                      }
                      disabled={disabled}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>Faster</span>
                      <span>Better compression</span>
                    </div>
                  </div>

                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={options.interlace || false}
                      onChange={(e) =>
                        onChange({ ...options, interlace: e.target.checked })
                      }
                      disabled={disabled}
                      className="mt-0.5 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        Interlaced (Progressive)
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Image loads gradually
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={options.palette || false}
                      onChange={(e) =>
                        onChange({ ...options, palette: e.target.checked })
                      }
                      disabled={disabled}
                      className="mt-0.5 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        Palette mode (quantize to 256 colors)
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Reduce colors for smaller file size
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {/* WebP Advanced Options */}
              {showWebpOptions && (
                <div className="space-y-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-300">
                    WebP Options
                  </h4>

                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={options.lossless || false}
                      onChange={(e) =>
                        onChange({ ...options, lossless: e.target.checked })
                      }
                      disabled={disabled}
                      className="mt-0.5 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        Lossless mode
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Perfect quality (larger file)
                      </div>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm text-gray-900 dark:text-gray-200 mb-1">
                      Compression effort: {options.effort || 4}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      value={options.effort || 4}
                      onChange={(e) =>
                        onChange({ ...options, effort: parseInt(e.target.value) })
                      }
                      disabled={disabled}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>Faster</span>
                      <span>Better compression</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-900 dark:text-gray-200 mb-1">
                      Encoding method: {options.webpMethod || 4}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      value={options.webpMethod || 4}
                      onChange={(e) =>
                        onChange({
                          ...options,
                          webpMethod: parseInt(e.target.value),
                        })
                      }
                      disabled={disabled}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Higher = better compression (slower)
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                💡 Tip: Advanced options fine-tune compression. Experiment to find the best balance for your needs!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

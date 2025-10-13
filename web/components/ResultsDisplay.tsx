'use client';

import { useMemo } from 'react';
import { OptimizationResult } from '@/lib/types';
import { Download, CheckCircle, Share2 } from 'lucide-react';
import BeforeAfterComparison from './BeforeAfterComparison';

interface ResultsDisplayProps {
  result: OptimizationResult;
  originalFile: File;
  optimizedBlob?: Blob;
  onDownload?: () => void;
}

export default function ResultsDisplay({
  result,
  originalFile,
  optimizedBlob,
  onDownload,
}: ResultsDisplayProps) {
  const originalUrl = useMemo(() => URL.createObjectURL(originalFile), [originalFile]);
  const optimizedUrl = useMemo(
    () => (optimizedBlob ? URL.createObjectURL(optimizedBlob) : ''),
    [optimizedBlob]
  );

  // Parse savings percentage for conditional suggestions
  const savingsPercent = parseFloat(result.savings.replace('%', ''));
  const isLowCompression = savingsPercent < 10 && !result.alreadyOptimized;

  const handleShare = async () => {
    const shareData = {
      title: 'Image Optimization Results',
      text: `I optimized my image and saved ${result.savings}! Original: ${(result.originalSize / 1024).toFixed(2)} KB → Optimized: ${(result.optimizedSize / 1024).toFixed(2)} KB`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n\nTry it yourself at: ${shareData.url}`
        );
        alert('Results copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Optimization Complete!</h3>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Results
          </button>
        </div>

        {/* Already Optimized Warning */}
        {result.alreadyOptimized && result.message && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 dark:text-yellow-400">ℹ️</div>
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                  Already Well-Optimized
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {result.message}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  💡 <strong>Tip:</strong> Try converting to WebP format for better compression, or lower the quality setting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Low Compression Suggestions */}
        {isLowCompression && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400">💡</div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Low Compression Detected ({result.savings})
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  The file is already well-compressed. Here are some ways to achieve better results:
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1.5 list-disc list-inside">
                  {result.format.toLowerCase() === 'png' && (
                    <>
                      <li><strong>Try WebP format:</strong> WebP typically achieves 25-35% better compression than PNG while maintaining quality</li>
                      <li><strong>Try JPEG format:</strong> If this is a photo (no transparency needed), JPEG at quality 80-85 will be much smaller</li>
                      <li><strong>PNG is optimized:</strong> PNG uses lossless compression - if it&apos;s a logo or graphic, this may be the best you can achieve</li>
                    </>
                  )}
                  {result.format.toLowerCase() === 'jpeg' && (
                    <>
                      <li><strong>Try WebP format:</strong> WebP offers better compression than JPEG with similar quality</li>
                      <li><strong>Lower quality setting:</strong> Try quality 70-75 for more aggressive compression (may reduce visual quality)</li>
                      <li><strong>Already compressed:</strong> JPEG files are often pre-optimized by cameras and editing software</li>
                    </>
                  )}
                  {result.format.toLowerCase() === 'webp' && (
                    <>
                      <li><strong>Lower quality setting:</strong> Try reducing quality to 70-80 for more compression</li>
                      <li><strong>Already optimal:</strong> WebP is already one of the most efficient formats available</li>
                    </>
                  )}
                  {result.format.toLowerCase() === 'gif' && (
                    <>
                      <li><strong>Try WebP format:</strong> WebP supports animation and transparency with much better compression than GIF</li>
                      <li><strong>Try PNG:</strong> If this is a static image, PNG will provide better quality</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Wide Gamut Warning */}
        {result.wideGamut && (
          <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-purple-600 dark:text-purple-400">🎨</div>
              <div>
                <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-1">
                  Wide Color Gamut Detected
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  This image contains colors beyond the standard sRGB range. It was originally in <strong>{result.originalColorSpace}</strong>.
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  ⚠️ <strong>Note:</strong> Some colors may not display correctly on all monitors. Enable &quot;Force sRGB Conversion&quot; for maximum compatibility.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Before/After Comparison */}
        {optimizedBlob && (
          <BeforeAfterComparison
            originalUrl={originalUrl}
            optimizedUrl={optimizedUrl}
            result={result}
            originalFile={originalFile}
          />
        )}

        {/* Download Button */}
        {optimizedBlob && onDownload && (
          <button
            onClick={onDownload}
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download Optimized Image
          </button>
        )}
      </div>
    </div>
  );
}

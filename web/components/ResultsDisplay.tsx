'use client';

import { OptimizationResult } from '@/lib/types';
import { Download, CheckCircle, TrendingDown, Clock } from 'lucide-react';

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
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <CheckCircle className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Optimization Complete!</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Original Size
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatBytes(result.originalSize)}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Optimized Size
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatBytes(result.optimizedSize)}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            Savings
          </div>
          <div className="text-xl font-semibold text-green-600 dark:text-green-400">
            {result.savings}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Time
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            {result.processingTime}
          </div>
        </div>
      </div>

      {/* Image Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Format:</span>
          <span className="ml-2 font-medium text-gray-900 dark:text-white">
            {result.format.toUpperCase()}
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
          <span className="ml-2 font-medium text-gray-900 dark:text-white">
            {result.width} × {result.height}
          </span>
        </div>
      </div>

      {/* Download Button */}
      {optimizedBlob && onDownload && (
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Optimized Image
        </button>
      )}
    </div>
  );
}

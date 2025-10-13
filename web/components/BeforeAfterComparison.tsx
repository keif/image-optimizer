'use client';

import { useState } from 'react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  SplitSquareHorizontal,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  TrendingDown,
  File,
  Clock,
  Info,
} from 'lucide-react';
import { OptimizationResult } from '@/lib/types';

interface BeforeAfterComparisonProps {
  originalUrl: string;
  optimizedUrl: string;
  result: OptimizationResult;
  originalFile: File;
}

type ViewMode = 'slider' | 'side-by-side';

export default function BeforeAfterComparison({
  originalUrl,
  optimizedUrl,
  result,
  originalFile,
}: BeforeAfterComparisonProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [showMetrics, setShowMetrics] = useState(true);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const absBytes = Math.abs(bytes);
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(absBytes) / Math.log(k));
    const value = parseFloat((absBytes / Math.pow(k, i)).toFixed(2));
    const sign = bytes < 0 ? '+' : '-'; // + means increase, - means decrease
    return `${sign}${value} ${sizes[i]}`;
  };

  const sizeDiff = result.originalSize - result.optimizedSize;
  const isLarger = sizeDiff < 0;
  const savingsPercentage = parseFloat(result.savings.replace('%', ''));
  const savingsColor = isLarger
    ? 'text-red-600 dark:text-red-400'
    : savingsPercentage > 50
    ? 'text-green-600 dark:text-green-400'
    : savingsPercentage > 25
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-orange-600 dark:text-orange-400';

  return (
    <div className="space-y-4">
      {/* View Mode Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('slider')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${
                viewMode === 'slider'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Slider
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${
                viewMode === 'side-by-side'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <LayoutGrid className="w-4 h-4" />
            Side by Side
          </button>
        </div>

        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Info className="w-4 h-4" />
          {showMetrics ? 'Hide' : 'Show'} Metrics
        </button>
      </div>

      {/* Metrics Overlay */}
      {showMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isLarger ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
              <TrendingDown className={`w-5 h-5 ${isLarger ? 'text-red-600 dark:text-red-400 rotate-180' : savingsColor}`} />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {isLarger ? 'Size Increase' : 'Savings'}
              </div>
              <div className={`text-lg font-bold ${savingsColor}`}>
                {isLarger ? `+${Math.abs(((result.optimizedSize - result.originalSize) / result.originalSize * 100)).toFixed(2)}%` : result.savings}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isLarger ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
              <File className={`w-5 h-5 ${isLarger ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {isLarger ? 'Size Change' : 'Size Reduction'}
              </div>
              <div className={`text-lg font-bold ${isLarger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {formatBytes(sizeDiff)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Processing Time</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {result.processingTime}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <File className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Dimensions</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {result.width}×{result.height}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {viewMode === 'slider' ? (
          <div className="relative">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Zoom Controls */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button
                      onClick={() => zoomIn()}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  <TransformComponent
                    wrapperStyle={{ width: '100%', height: '600px' }}
                    contentStyle={{ width: '100%', height: '100%' }}
                  >
                    <div className="w-full h-full">
                      <ReactCompareSlider
                        itemOne={
                          <div className="relative w-full h-full">
                            <ReactCompareSliderImage
                              src={originalUrl}
                              alt="Original"
                              style={{ objectFit: 'contain' }}
                            />
                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                              Original - {formatBytes(result.originalSize)}
                            </div>
                          </div>
                        }
                        itemTwo={
                          <div className="relative w-full h-full">
                            <ReactCompareSliderImage
                              src={optimizedUrl}
                              alt="Optimized"
                              style={{ objectFit: 'contain' }}
                            />
                            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                              Optimized - {formatBytes(result.optimizedSize)}
                            </div>
                          </div>
                        }
                        style={{ height: '600px' }}
                      />
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>

            {/* Slider Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium z-10">
              Drag the slider to compare • Scroll to zoom • Drag to pan
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-0 divide-x divide-gray-200 dark:divide-gray-700">
            {/* Original Image */}
            <div className="relative">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button
                        onClick={() => zoomIn()}
                        className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => zoomOut()}
                        className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => resetTransform()}
                        className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                      Original - {formatBytes(result.originalSize)}
                    </div>

                    <TransformComponent
                      wrapperStyle={{ width: '100%', height: '600px' }}
                      contentStyle={{ width: '100%', height: '100%' }}
                    >
                      <img
                        src={originalUrl}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>

            {/* Optimized Image */}
            <div className="relative">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button
                        onClick={() => zoomIn()}
                        className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => zoomOut()}
                        className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => resetTransform()}
                        className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4 z-10 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                      Optimized - {formatBytes(result.optimizedSize)}
                    </div>

                    <TransformComponent
                      wrapperStyle={{ width: '100%', height: '600px' }}
                      contentStyle={{ width: '100%', height: '100%' }}
                    >
                      <img
                        src={optimizedUrl}
                        alt="Optimized"
                        className="w-full h-full object-contain"
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
        )}
      </div>

      {/* Technical Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <span className="text-gray-600 dark:text-gray-400">Format:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
            {result.format.toUpperCase()}
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <span className="text-gray-600 dark:text-gray-400">Original Size:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
            {formatBytes(result.originalSize)}
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <span className="text-gray-600 dark:text-gray-400">Optimized Size:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
            {formatBytes(result.optimizedSize)}
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
            {result.width} × {result.height}
          </span>
        </div>
      </div>
    </div>
  );
}

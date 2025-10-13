'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/ImageUploader';
import OptimizationControls from '@/components/OptimizationControls';
import ResultsDisplay from '@/components/ResultsDisplay';
import { apiClient } from '@/lib/api';
import { OptimizationOptions, OptimizationResult } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [options, setOptions] = useState<OptimizationOptions>({ quality: 80 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [optimizedBlob, setOptimizedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setOptimizedBlob(null);
    setError('');
  };

  const handleOptimize = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      // First get the metadata
      const metadata = await apiClient.optimizeImage(selectedFile, options);
      setResult(metadata);

      // Then get the optimized image
      const blob = await apiClient.optimizeImageAndDownload(selectedFile, options);
      setOptimizedBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize image');
      console.error('Optimization error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!optimizedBlob || !selectedFile) return;

    const url = URL.createObjectURL(optimizedBlob);
    const a = document.createElement('a');
    a.href = url;
    const extension = options.format || selectedFile.name.split('.').pop() || 'jpg';
    const basename = selectedFile.name.replace(/\.[^/.]+$/, '');
    a.download = `${basename}-optimized.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setOptimizedBlob(null);
    setError('');
    setOptions({ quality: 80 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Optimize Your Images
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Compress, resize, and convert images with high-performance libvips processing.
          Reduce file sizes while maintaining quality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <ImageUploader
            onImageSelected={handleImageSelected}
            disabled={isProcessing}
          />

          {selectedFile && (
            <>
              {/* Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview
                </h3>
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-200">
                      Optimization Failed
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && optimizedBlob && (
                <ResultsDisplay
                  result={result}
                  originalFile={selectedFile}
                  optimizedBlob={optimizedBlob}
                  onDownload={handleDownload}
                />
              )}
            </>
          )}
        </div>

        {/* Right Column - Controls */}
        <div className="space-y-6">
          <OptimizationControls
            options={options}
            onChange={setOptions}
            disabled={isProcessing || !selectedFile}
          />

          {/* Action Buttons */}
          {selectedFile && (
            <div className="space-y-3">
              <button
                onClick={handleOptimize}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  'Optimize Image'
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Upload New Image
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              How it works
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Upload any image (JPEG, PNG, WebP, GIF)</li>
              <li>• Adjust quality and format settings</li>
              <li>• Resize to custom dimensions (optional)</li>
              <li>• Download your optimized image</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, Download, Image as ImageIcon, Package } from 'lucide-react';
import SpritesUploader from '@/components/SpritesUploader';
import SpritesheetControls from '@/components/SpritesheetControls';
import SpritesheetResults from '@/components/SpritesheetResults';
import { packSprites } from '@/lib/api';
import { PackingOptions, PackingResult } from '@/lib/types';

export default function SpritesheetPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<PackingOptions>({
    padding: 2,
    powerOfTwo: false,
    trimTransparency: false,
    maxWidth: 2048,
    maxHeight: 2048,
    outputFormats: ['json'],
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PackingResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setResult(null);
    setError('');
  };

  const handlePack = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setError('');

    try {
      const packingResult = await packSprites(selectedFiles, options);
      setResult(packingResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pack sprites');
      console.error('Packing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setResult(null);
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Package className="w-10 h-10 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Spritesheet Packer
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Pack multiple sprites into optimized spritesheets with support for multiple output formats.
          Perfect for game development, web animation, and UI sprite optimization.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Upload Sprites
            </h2>
            <SpritesUploader onFilesSelected={handleFilesSelected} />
            {selectedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  {selectedFiles.length} sprite{selectedFiles.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Packing Options</h2>
            <SpritesheetControls options={options} onChange={setOptions} />

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handlePack}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Packing...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Pack Sprites
                  </>
                )}
              </button>

              {(selectedFiles.length > 0 || result) && (
                <button
                  onClick={clearAll}
                  disabled={isProcessing}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Packing Failed
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result ? (
            <SpritesheetResults result={result} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Sprites Packed Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload sprite images and configure packing options, then click &quot;Pack Sprites&quot; to create your spritesheet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">MaxRects Algorithm</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Uses the industry-standard MaxRects bin packing algorithm with Best Short Side Fit heuristic for optimal space efficiency.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">Multiple Formats</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export sprite coordinates in JSON, CSS, CSV, XML, Unity, or Godot formats - all from a single pack operation.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">Atlas Splitting</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatically splits large sprite sets into multiple sheets when they exceed max dimensions.
          </p>
        </div>
      </div>
    </div>
  );
}

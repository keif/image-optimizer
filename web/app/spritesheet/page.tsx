'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, Download, Image as ImageIcon, Package, FileStack } from 'lucide-react';
import SpritesUploader from '@/components/SpritesUploader';
import SpritesheetImporter from '@/components/SpritesheetImporter';
import SpritesheetControls from '@/components/SpritesheetControls';
import SpritesheetResults from '@/components/SpritesheetResults';
import { packSprites, optimizeSpritesheet } from '@/lib/api';
import { PackingOptions, PackingResult, SpritesheetOptimizationOptions } from '@/lib/types';

type Mode = 'pack' | 'import';

export default function SpritesheetPage() {
  const [mode, setMode] = useState<Mode>('pack');

  // Pack mode state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Import mode state
  const [spritesheetFile, setSpritesheetFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [deduplicate, setDeduplicate] = useState(true);

  // Shared state
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

  const handleImportFilesSelected = (spritesheet: File | null, xml: File | null) => {
    setSpritesheetFile(spritesheet);
    setXmlFile(xml);
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

  const handleOptimize = async () => {
    if (!spritesheetFile || !xmlFile) return;

    setIsProcessing(true);
    setError('');

    try {
      const optimizationOptions: SpritesheetOptimizationOptions = {
        ...options,
        deduplicate,
      };
      const optimizationResult = await optimizeSpritesheet(spritesheetFile, xmlFile, optimizationOptions);
      setResult(optimizationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize spritesheet');
      console.error('Optimization error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setSpritesheetFile(null);
    setXmlFile(null);
    setResult(null);
    setError('');
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    clearAll();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Package className="w-10 h-10 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Spritesheet Tools
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Pack sprites or optimize existing spritesheets with deduplication and repacking.
          Perfect for game development, web animation, and UI sprite optimization.
        </p>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handleModeChange('pack')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              mode === 'pack'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Package className="w-5 h-5" />
            Pack Sprites
          </button>
          <button
            onClick={() => handleModeChange('import')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              mode === 'import'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FileStack className="w-5 h-5" />
            Import & Optimize
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              {mode === 'pack' ? 'Upload Sprites' : 'Import Spritesheet'}
            </h2>

            {mode === 'pack' ? (
              <>
                <SpritesUploader onFilesSelected={handleFilesSelected} />
                {selectedFiles.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      {selectedFiles.length} sprite{selectedFiles.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </>
            ) : (
              <SpritesheetImporter onFilesSelected={handleImportFilesSelected} />
            )}
          </div>

          {/* Controls Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {mode === 'pack' ? 'Packing Options' : 'Optimization Options'}
            </h2>

            {mode === 'import' && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deduplicate}
                    onChange={(e) => setDeduplicate(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Deduplicate Sprites
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">
                      Remove duplicate frames (70-75% reduction typical)
                    </div>
                  </div>
                </label>
              </div>
            )}

            <SpritesheetControls options={options} onChange={setOptions} />

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={mode === 'pack' ? handlePack : handleOptimize}
                disabled={
                  (mode === 'pack' && selectedFiles.length === 0) ||
                  (mode === 'import' && (!spritesheetFile || !xmlFile)) ||
                  isProcessing
                }
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {mode === 'pack' ? 'Packing...' : 'Optimizing...'}
                  </>
                ) : mode === 'pack' ? (
                  <>
                    <Package className="w-5 h-5" />
                    Pack Sprites
                  </>
                ) : (
                  <>
                    <FileStack className="w-5 h-5" />
                    Optimize Spritesheet
                  </>
                )}
              </button>

              {(selectedFiles.length > 0 || spritesheetFile || result) && (
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
              {mode === 'pack' ? (
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              ) : (
                <FileStack className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {mode === 'pack' ? 'No Sprites Packed Yet' : 'No Spritesheet Optimized Yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {mode === 'pack'
                  ? 'Upload sprite images and configure packing options, then click "Pack Sprites" to create your spritesheet.'
                  : 'Upload a spritesheet PNG and its XML metadata, then click "Optimize Spritesheet" to extract, deduplicate, and repack.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">MaxRects Algorithm</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Uses the industry-standard MaxRects bin packing algorithm with Best Short Side Fit heuristic for optimal space efficiency (85-95%).
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">Sprite Deduplication</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pixel-perfect duplicate detection removes identical frames from existing spritesheets, achieving 70-75% reduction on typical game sprites.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">Multiple Formats</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export sprite coordinates in JSON, Sparrow XML, CSS, Unity, Godot, Cocos2d formats - all from a single operation.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">Atlas Splitting</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatically splits large sprite sets into multiple sheets when they exceed max dimensions, with full metadata support.
          </p>
        </div>
      </div>
    </div>
  );
}

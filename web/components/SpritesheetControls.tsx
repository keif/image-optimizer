import { PackingOptions } from '@/lib/types';

interface SpritesheetControlsProps {
  options: PackingOptions;
  onChange: (options: PackingOptions) => void;
}

export default function SpritesheetControls({ options, onChange }: SpritesheetControlsProps) {
  const MIN_DIMENSION = 256;
  const MAX_DIMENSION = 12288;

  const outputFormatOptions = [
    { value: 'json', label: 'JSON', description: 'Generic JSON format' },
    { value: 'css', label: 'CSS', description: 'CSS sprite classes' },
    { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { value: 'xml', label: 'XML', description: 'Generic XML format' },
    { value: 'sparrow', label: 'Sparrow', description: 'Sparrow/Starling (HaxeFlixel, FNF)' },
    { value: 'texturepacker', label: 'TexturePacker', description: 'TexturePacker Generic XML' },
    { value: 'cocos2d', label: 'Cocos2d', description: 'Cocos2d plist format' },
    { value: 'unity', label: 'Unity', description: 'Unity TextureImporter' },
    { value: 'godot', label: 'Godot', description: 'Godot AtlasTexture' },
  ];

  const toggleFormat = (format: string) => {
    const newFormats = options.outputFormats.includes(format)
      ? options.outputFormats.filter(f => f !== format)
      : [...options.outputFormats, format];

    // Ensure at least one format is selected
    if (newFormats.length > 0) {
      onChange({ ...options, outputFormats: newFormats });
    }
  };

  const handleDimensionChange = (field: 'maxWidth' | 'maxHeight', value: string) => {
    const numValue = parseInt(value);

    // Allow empty input for better UX while typing
    if (value === '') {
      onChange({ ...options, [field]: '' as any });
      return;
    }

    // Clamp value between min and max
    const clampedValue = Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, numValue || MIN_DIMENSION));
    onChange({ ...options, [field]: clampedValue });
  };

  const isValidDimension = (value: number) => {
    return value >= MIN_DIMENSION && value <= MAX_DIMENSION;
  };

  return (
    <div className="space-y-4">
      {/* Padding Control */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Padding: {options.padding}px
        </label>
        <input
          type="range"
          min="0"
          max="32"
          value={options.padding}
          onChange={(e) => onChange({ ...options, padding: parseInt(e.target.value) })}
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Space between sprites (prevents bleeding)
        </p>
      </div>

      {/* Max Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Max Width
          </label>
          <input
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            step="256"
            value={options.maxWidth}
            onChange={(e) => handleDimensionChange('maxWidth', e.target.value)}
            onBlur={(e) => {
              // Ensure valid value on blur
              if (!e.target.value || !isValidDimension(parseInt(e.target.value))) {
                handleDimensionChange('maxWidth', String(MIN_DIMENSION));
              }
            }}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-sm ${
              options.maxWidth && !isValidDimension(options.maxWidth)
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {options.maxWidth && !isValidDimension(options.maxWidth) && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              Must be between {MIN_DIMENSION} and {MAX_DIMENSION}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Max Height
          </label>
          <input
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            step="256"
            value={options.maxHeight}
            onChange={(e) => handleDimensionChange('maxHeight', e.target.value)}
            onBlur={(e) => {
              // Ensure valid value on blur
              if (!e.target.value || !isValidDimension(parseInt(e.target.value))) {
                handleDimensionChange('maxHeight', String(MIN_DIMENSION));
              }
            }}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-sm ${
              options.maxHeight && !isValidDimension(options.maxHeight)
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {options.maxHeight && !isValidDimension(options.maxHeight) && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              Must be between {MIN_DIMENSION} and {MAX_DIMENSION}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Valid range: {MIN_DIMENSION}–{MAX_DIMENSION} pixels
      </p>

      {/* Effective Max Size Indicator */}
      {options.padding > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 text-xs">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Effective Max Sprite Size
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                With {options.padding}px padding, maximum sprite dimensions are:{' '}
                <span className="font-mono font-semibold">
                  {options.maxWidth - (options.padding * 2)}×{options.maxHeight - (options.padding * 2)}
                </span>
                {' '}pixels
              </p>
              <p className="text-blue-600 dark:text-blue-400 mt-1">
                (Padding adds {options.padding}px on each side)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.powerOfTwo}
            onChange={(e) => onChange({ ...options, powerOfTwo: e.target.checked })}
            className="w-4 h-4"
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Power of 2 Dimensions</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Force 256, 512, 1024, 2048, etc. (GPU optimal)
            </div>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.trimTransparency}
            onChange={(e) => onChange({ ...options, trimTransparency: e.target.checked })}
            className="w-4 h-4"
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Trim Transparency</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Remove transparent borders from sprites
            </div>
          </div>
        </label>
      </div>

      {/* Selective Trimming - Only show when trimTransparency is enabled */}
      {options.trimTransparency && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-1">
                Selective Frame Trimming
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Use glob patterns to control which animations get trimmed. Leave empty to trim all frames.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-900 dark:text-purple-100 mb-1">
              Trim Only (comma-separated patterns)
            </label>
            <input
              type="text"
              value={options.trimOnly || ''}
              onChange={(e) => onChange({ ...options, trimOnly: e.target.value })}
              placeholder="e.g., *walk*,*run*"
              className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Only trim frames matching these patterns (e.g., <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">*walk*,*run*</code>)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-900 dark:text-purple-100 mb-1">
              Trim Except (comma-separated patterns)
            </label>
            <input
              type="text"
              value={options.trimExcept || ''}
              onChange={(e) => onChange({ ...options, trimExcept: e.target.value })}
              placeholder="e.g., *idle*,*attack*"
              disabled={!!options.trimOnly}
              className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Trim all frames EXCEPT those matching these patterns (e.g., <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">*idle*,*attack*</code>)
              {options.trimOnly && <span className="block mt-1 text-orange-600 dark:text-orange-400">⚠️ Disabled when "Trim Only" is specified</span>}
            </p>
          </div>

          <div className="bg-purple-100 dark:bg-purple-900/40 rounded p-2">
            <p className="text-xs text-purple-800 dark:text-purple-200">
              <strong>Example use case:</strong> Some animations use frameY offsets (benefit from trimming), while others have large hitboxes without frameY (should not be trimmed).
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.autoResize || false}
            onChange={(e) => onChange({ ...options, autoResize: e.target.checked })}
            className="w-4 h-4"
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Auto-Resize Oversized Sprites</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Automatically resize sprites exceeding 8192×8192 pixels
            </div>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.preserveFrameOrder || false}
            onChange={(e) => onChange({ ...options, preserveFrameOrder: e.target.checked })}
            className="w-4 h-4"
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Preserve Frame Order</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Maintain original sprite order for animations (recommended for imported spritesheets)
            </div>
          </div>
        </label>
      </div>

      {/* Compression Quality */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Compression Quality
        </label>
        <select
          value={options.compressionQuality || 'balanced'}
          onChange={(e) => onChange({ ...options, compressionQuality: e.target.value as 'fast' | 'balanced' | 'best' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
        >
          <option value="fast">Fast - Quick processing, larger file size</option>
          <option value="balanced">Balanced - Good compromise (recommended)</option>
          <option value="best">Best - Slowest, smallest file size</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Higher quality = smaller files but slower processing
        </p>
      </div>

      {/* Output Formats */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Output Formats
        </label>
        <div className="space-y-2">
          {outputFormatOptions.map((format) => (
            <label
              key={format.value}
              className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <input
                type="checkbox"
                checked={options.outputFormats.includes(format.value)}
                onChange={() => toggleFormat(format.value)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{format.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {format.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

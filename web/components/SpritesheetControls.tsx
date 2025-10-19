import { PackingOptions } from '@/lib/types';

interface SpritesheetControlsProps {
  options: PackingOptions;
  onChange: (options: PackingOptions) => void;
}

export default function SpritesheetControls({ options, onChange }: SpritesheetControlsProps) {
  const MIN_DIMENSION = 256;
  const MAX_DIMENSION = 8192;

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

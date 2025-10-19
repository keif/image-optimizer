import { Download, FileText, Image as ImageIcon, Layers } from 'lucide-react';
import { PackingResult } from '@/lib/types';

interface SpritesheetResultsProps {
  result: PackingResult;
}

export default function SpritesheetResults({ result }: SpritesheetResultsProps) {
  const downloadSheet = (sheetIndex: number) => {
    const base64Data = result.sheets[sheetIndex];
    const blob = base64ToBlob(base64Data, 'image/png');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spritesheet_${sheetIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllSheets = () => {
    result.sheets.forEach((_, index) => {
      setTimeout(() => downloadSheet(index), index * 100);
    });
  };

  const downloadFormat = (formatName: string, content: string) => {
    const extensions: { [key: string]: string } = {
      json: 'json',
      css: 'css',
      csv: 'csv',
      xml: 'xml',
      unity: 'meta',
      godot: 'tres',
    };

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spritesheet.${extensions[formatName] || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFormats = () => {
    Object.entries(result.outputFiles).forEach(([format, content], index) => {
      setTimeout(() => downloadFormat(format, content), index * 100);
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-6 h-6 text-purple-600" />
          {result.duplicatesRemoved !== undefined ? 'Optimization Complete' : 'Packing Complete'}
        </h2>

        {/* Deduplication Stats (if applicable) */}
        {result.duplicatesRemoved !== undefined && result.originalCount !== undefined && result.duplicatesRemoved > 0 && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Deduplication Success
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Removed {result.duplicatesRemoved} duplicate sprite{result.duplicatesRemoved !== 1 ? 's' : ''} ({Math.round(result.duplicatesRemoved / result.originalCount * 100)}% reduction)
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{result.originalCount} → {result.totalSprites}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">frames</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {result.totalSprites}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sprites Packed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {result.sheets.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sheet{result.sheets.length !== 1 ? 's' : ''} Created</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {(result.metadata.reduce((sum, m) => sum + m.efficiency, 0) / result.metadata.length * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Efficiency</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(result.outputFiles).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Output Formats</div>
          </div>
        </div>
      </div>

      {/* Spritesheets Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Spritesheets
          </h3>
          {result.sheets.length > 1 && (
            <button
              onClick={downloadAllSheets}
              className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download All Sheets
            </button>
          )}
        </div>

        <div className="space-y-4">
          {result.sheets.map((sheetBase64, index) => {
            const metadata = result.metadata[index];
            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">
                      Sheet {index + 1}
                      {result.sheets.length > 1 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({metadata.spriteCount} sprite{metadata.spriteCount !== 1 ? 's' : ''})
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {metadata.width} × {metadata.height}px • {(metadata.efficiency * 100).toFixed(1)}% efficient
                    </p>
                  </div>
                  <button
                    onClick={() => downloadSheet(index)}
                    className="bg-purple-500 text-white px-3 py-1.5 rounded-md hover:bg-purple-600 flex items-center gap-1 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                </div>

                {/* Sheet Preview */}
                <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4 flex items-center justify-center">
                  <img
                    src={`data:image/png;base64,${sheetBase64}`}
                    alt={`Spritesheet ${index + 1}`}
                    className="max-w-full h-auto"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output Files */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Coordinate Data
          </h3>
          {Object.keys(result.outputFiles).length > 1 && (
            <button
              onClick={downloadAllFormats}
              className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download All Formats
            </button>
          )}
        </div>

        <div className="space-y-3">
          {Object.entries(result.outputFiles).map(([format, content]) => (
            <div
              key={format}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium uppercase">{format}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {content.length.toLocaleString()} characters
                  </p>
                </div>
                <button
                  onClick={() => downloadFormat(format, content)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              {/* Preview (truncated) */}
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto max-h-32 overflow-y-auto">
                {content.substring(0, 500)}
                {content.length > 500 && '\n...'}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

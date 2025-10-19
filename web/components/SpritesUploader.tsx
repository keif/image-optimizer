import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface SpritesUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function SpritesUploader({ onFilesSelected }: SpritesUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{file: File; url: string}[]>([]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }

    // Create previews
    const newPreviews = imageFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setSelectedFiles(imageFiles);
    setPreviews(prev => {
      // Cleanup old previews
      prev.forEach(p => URL.revokeObjectURL(p.url));
      return newPreviews;
    });
    onFilesSelected(imageFiles);
  }, [onFilesSelected]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      const newFiles = newPreviews.map(p => p.file);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
      return newPreviews;
    });
  }, [onFilesSelected]);

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          id="sprites-upload"
        />
        <label htmlFor="sprites-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Drop sprite images here or click to browse
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supports PNG, JPEG, WebP, GIF (multiple files)
          </p>
        </label>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden"
            >
              <img
                src={preview.url}
                alt={preview.file.name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                {preview.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

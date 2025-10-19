'use client';

import { useCallback, useState } from 'react';
import { Upload, FileImage, FileCode } from 'lucide-react';

interface SpritesheetImporterProps {
  onFilesSelected: (spritesheetFile: File | null, xmlFile: File | null) => void;
}

export default function SpritesheetImporter({ onFilesSelected }: SpritesheetImporterProps) {
  const [spritesheetFile, setSpritesheetFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSpritesheetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSpritesheetFile(file);
    onFilesSelected(file, xmlFile);
  }, [xmlFile, onFilesSelected]);

  const handleXmlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setXmlFile(file);
    onFilesSelected(spritesheetFile, file);
  }, [spritesheetFile, onFilesSelected]);

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

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(f => f.type.startsWith('image/'));
    const xmlFileFound = files.find(f => f.name.endsWith('.xml'));

    if (imageFile) {
      setSpritesheetFile(imageFile);
    }
    if (xmlFileFound) {
      setXmlFile(xmlFileFound);
    }
    onFilesSelected(imageFile || spritesheetFile, xmlFileFound || xmlFile);
  }, [spritesheetFile, xmlFile, onFilesSelected]);

  return (
    <div className="space-y-4">
      {/* Spritesheet PNG Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Spritesheet PNG</label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : spritesheetFile
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('spritesheet-input')?.click()}
        >
          <input
            id="spritesheet-input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleSpritesheetChange}
            className="hidden"
          />
          <FileImage className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          {spritesheetFile ? (
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {spritesheetFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(spritesheetFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click or drag spritesheet image here
            </p>
          )}
        </div>
      </div>

      {/* XML Metadata Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Spritesheet XML (Sparrow format)</label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            xmlFile
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
          }`}
          onClick={() => document.getElementById('xml-input')?.click()}
        >
          <input
            id="xml-input"
            type="file"
            accept=".xml"
            onChange={handleXmlChange}
            className="hidden"
          />
          <FileCode className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          {xmlFile ? (
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {xmlFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(xmlFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click to select XML metadata file
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <strong>Tip:</strong> Upload an existing spritesheet and its XML metadata to extract frames,
          deduplicate identical sprites, and repack optimally.
        </p>
      </div>
    </div>
  );
}

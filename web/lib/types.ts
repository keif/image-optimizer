// API Response Types
export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  format: string;
  width: number;
  height: number;
  savings: string;
  processingTime: string;
  alreadyOptimized?: boolean;
  message?: string;
  colorSpace: string;
  originalColorSpace: string;
  wideGamut: boolean;
}

export interface OptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'gif' | 'avif';
  returnImage?: boolean;
  forceSRGB?: boolean;

  // Lossless mode - perfect quality preservation
  losslessMode?: boolean;
  interpolator?: 'nearest' | 'bilinear' | 'bicubic' | 'nohalo';

  // Advanced JPEG options
  progressive?: boolean;
  optimizeCoding?: boolean;
  subsample?: number;
  smooth?: number;

  // Advanced PNG options
  compression?: number;
  interlace?: boolean;
  palette?: boolean;

  // Advanced WebP options
  lossless?: boolean;
  effort?: number;
  webpMethod?: number;

  // Advanced PNG optimization with OxiPNG
  oxipngLevel?: number;
}

export interface APIKey {
  id: number;
  key?: string;
  name: string;
  created_at: string;
  revoked_at?: string | null;
}

export interface APIError {
  error: string;
  details?: string;
}

// Local Storage Types
export interface OptimizationHistory {
  id: string;
  timestamp: number;
  fileName: string;
  result: OptimizationResult;
  options: OptimizationOptions;
}

// Spritesheet Packing Types
export interface PackingOptions {
  padding: number;
  powerOfTwo: boolean;
  trimTransparency: boolean;
  trimOnly?: string;        // Comma-separated glob patterns: only trim matching frames
  trimExcept?: string;      // Comma-separated glob patterns: trim all except matching frames
  maxWidth: number;
  maxHeight: number;
  outputFormats: string[];
  autoResize?: boolean;
  preserveFrameOrder?: boolean;
  compressionQuality?: 'fast' | 'balanced' | 'best';
}

export interface ResizeInfo {
  spriteName: string;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
}

export interface SheetMetadata {
  index: number;
  width: number;
  height: number;
  spriteCount: number;
  efficiency: number;
}

export interface PackingResult {
  sheets: string[];         // Base64-encoded PNG images
  metadata: SheetMetadata[];
  outputFiles: { [key: string]: string };  // Format name -> file content
  totalSprites: number;
  resizedSprites?: ResizeInfo[];  // Info about auto-resized sprites
  originalCount?: number;         // For optimize-spritesheet: original sprite count
  duplicatesRemoved?: number;     // For optimize-spritesheet: number of duplicates removed
  nameMapping?: { [key: string]: string }; // For optimize-spritesheet: duplicate name mapping
}

export interface SpritesheetOptimizationOptions extends PackingOptions {
  deduplicate?: boolean;
}

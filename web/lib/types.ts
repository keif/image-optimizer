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
}

export interface OptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'gif';
  returnImage?: boolean;
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

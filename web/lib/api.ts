import { OptimizationOptions, OptimizationResult, APIKey, APIError, PackingOptions, PackingResult, SpritesheetOptimizationOptions } from './types';

class ApiClient {
  private baseUrl: string;
  private apiKey: string | null;
  private configLoaded: boolean = false;

  constructor() {
    // Start with default, will be updated by loadConfig
    // Empty string means same-origin (for standalone binary)
    this.baseUrl = '';
    this.apiKey = typeof window !== 'undefined'
      ? localStorage.getItem('apiKey')
      : null;

    // Load runtime config on client side
    if (typeof window !== 'undefined') {
      console.log('[ApiClient] Constructor - Initial baseUrl:', this.baseUrl);
      this.loadConfig();
    }
  }

  private async loadConfig() {
    if (this.configLoaded) return;

    try {
      console.log('[ApiClient] Loading config from /api/config...');
      const response = await fetch('/api/config');
      const config = await response.json();
      console.log('[ApiClient] Config loaded:', config);
      if (config.apiUrl !== undefined) {
        // apiUrl can be empty string for same-origin (standalone)
        this.baseUrl = config.apiUrl;
        this.configLoaded = true;
        console.log('[ApiClient] Updated baseUrl to:', this.baseUrl || '(same-origin)');
      } else {
        console.warn('[ApiClient] No apiUrl in config, using default');
      }
    } catch (error) {
      console.error('[ApiClient] Failed to load runtime config:', error);
      console.warn('[ApiClient] Using default API URL:', this.baseUrl || '(same-origin)');
    }
  }

  private async ensureConfigLoaded() {
    if (!this.configLoaded && typeof window !== 'undefined') {
      await this.loadConfig();
    }
  }

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiKey', key);
    }
  }

  clearApiKey() {
    this.apiKey = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('apiKey');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async optimizeImage(
    file: File,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    await this.ensureConfigLoaded();

    const formData = new FormData();
    formData.append('image', file);

    const params = new URLSearchParams();
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.format) params.append('format', options.format);
    if (options.returnImage !== undefined) {
      params.append('returnImage', options.returnImage.toString());
    }
    if (options.forceSRGB) params.append('forceSRGB', 'true');

    // Lossless mode and interpolation
    if (options.losslessMode) params.append('losslessMode', 'true');
    if (options.interpolator) params.append('interpolator', options.interpolator);

    // Advanced JPEG options
    if (options.progressive) params.append('progressive', 'true');
    if (options.optimizeCoding) params.append('optimizeCoding', 'true');
    if (options.subsample !== undefined) params.append('subsample', options.subsample.toString());
    if (options.smooth !== undefined) params.append('smooth', options.smooth.toString());

    // Advanced PNG options
    if (options.compression !== undefined) params.append('compression', options.compression.toString());
    if (options.interlace) params.append('interlace', 'true');
    if (options.palette) params.append('palette', 'true');

    // Advanced WebP options
    if (options.lossless) params.append('lossless', 'true');
    if (options.effort !== undefined) params.append('effort', options.effort.toString());
    if (options.webpMethod !== undefined) params.append('webpMethod', options.webpMethod.toString());

    const url = `${this.baseUrl}/optimize${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[ApiClient] optimizeImage - Calling URL:', url);

    // 7 minute timeout for long-running optimizations (large spritesheets can take 1+ min)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7 * 60 * 1000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.error || 'Failed to optimize image');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 7 minutes. Try reducing image size or quality settings.');
      }
      throw error;
    }
  }

  async optimizeImageAndDownload(
    file: File,
    options: OptimizationOptions = {}
  ): Promise<Blob> {
    await this.ensureConfigLoaded();

    const formData = new FormData();
    formData.append('image', file);

    const params = new URLSearchParams();
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.format) params.append('format', options.format);
    if (options.forceSRGB) params.append('forceSRGB', 'true');

    // Lossless mode and interpolation
    if (options.losslessMode) params.append('losslessMode', 'true');
    if (options.interpolator) params.append('interpolator', options.interpolator);

    // Advanced JPEG options
    if (options.progressive) params.append('progressive', 'true');
    if (options.optimizeCoding) params.append('optimizeCoding', 'true');
    if (options.subsample !== undefined) params.append('subsample', options.subsample.toString());
    if (options.smooth !== undefined) params.append('smooth', options.smooth.toString());

    // Advanced PNG options
    if (options.compression !== undefined) params.append('compression', options.compression.toString());
    if (options.interlace) params.append('interlace', 'true');
    if (options.palette) params.append('palette', 'true');

    // Advanced WebP options
    if (options.lossless) params.append('lossless', 'true');
    if (options.effort !== undefined) params.append('effort', options.effort.toString());
    if (options.webpMethod !== undefined) params.append('webpMethod', options.webpMethod.toString());

    params.append('returnImage', 'true');

    const url = `${this.baseUrl}/optimize?${params.toString()}`;

    // 7 minute timeout for long-running optimizations (large spritesheets can take 1+ min)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7 * 60 * 1000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        try {
          const error: APIError = JSON.parse(text);
          throw new Error(error.error || 'Failed to optimize image');
        } catch {
          throw new Error('Failed to optimize image');
        }
      }

      return response.blob();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 7 minutes. Try reducing image size or quality settings.');
      }
      throw error;
    }
  }

  async createApiKey(name: string): Promise<APIKey> {
    await this.ensureConfigLoaded();

    const response = await fetch(`${this.baseUrl}/api/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.error || 'Failed to create API key');
    }

    return response.json();
  }

  async listApiKeys(): Promise<APIKey[]> {
    await this.ensureConfigLoaded();

    const response = await fetch(`${this.baseUrl}/api/keys`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.error || 'Failed to list API keys');
    }

    return response.json();
  }

  async revokeApiKey(id: number): Promise<void> {
    await this.ensureConfigLoaded();

    const response = await fetch(`${this.baseUrl}/api/keys/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.error || 'Failed to revoke API key');
    }
  }

  async packSprites(
    files: File[],
    options: PackingOptions
  ): Promise<PackingResult> {
    await this.ensureConfigLoaded();

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const params = new URLSearchParams();
    params.append('padding', options.padding.toString());
    params.append('powerOfTwo', options.powerOfTwo.toString());
    params.append('trimTransparency', options.trimTransparency.toString());
    params.append('maxWidth', options.maxWidth.toString());
    params.append('maxHeight', options.maxHeight.toString());
    params.append('outputFormats', options.outputFormats.join(','));
    if (options.autoResize) {
      params.append('autoResize', 'true');
    }

    const url = `${this.baseUrl}/pack-sprites?${params.toString()}`;
    console.log('[ApiClient] packSprites - Calling URL:', url);

    // 7 minute timeout for packing large sprite collections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.error || 'Failed to pack sprites');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 7 minutes. Try with fewer sprites or smaller images.');
      }
      throw error;
    }
  }

  async optimizeSpritesheet(
    spritesheetFile: File,
    xmlFile: File,
    options: SpritesheetOptimizationOptions
  ): Promise<PackingResult> {
    await this.ensureConfigLoaded();

    const formData = new FormData();
    formData.append('spritesheet', spritesheetFile);
    formData.append('xml', xmlFile);

    const params = new URLSearchParams();
    params.append('deduplicate', (options.deduplicate ?? false).toString());
    params.append('padding', options.padding.toString());
    params.append('powerOfTwo', options.powerOfTwo.toString());
    params.append('trimTransparency', options.trimTransparency.toString());
    params.append('maxWidth', options.maxWidth.toString());
    params.append('maxHeight', options.maxHeight.toString());
    params.append('outputFormats', options.outputFormats.join(','));

    const url = `${this.baseUrl}/optimize-spritesheet?${params.toString()}`;
    console.log('[ApiClient] optimizeSpritesheet - Calling URL:', url);

    // 7 minute timeout for spritesheet optimization
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.error || 'Failed to optimize spritesheet');
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 7 minutes. Try with a smaller spritesheet.');
      }
      throw error;
    }
  }

  async checkHealth(): Promise<{ status: string }> {
    await this.ensureConfigLoaded();

    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();

// Export convenient functions
export const packSprites = (files: File[], options: PackingOptions) =>
  apiClient.packSprites(files, options);

export const optimizeSpritesheet = (spritesheetFile: File, xmlFile: File, options: SpritesheetOptimizationOptions) =>
  apiClient.optimizeSpritesheet(spritesheetFile, xmlFile, options);

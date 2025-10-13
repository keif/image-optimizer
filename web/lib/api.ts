import { OptimizationOptions, OptimizationResult, APIKey, APIError } from './types';

class ApiClient {
  private baseUrl: string;
  private apiKey: string | null;
  private configLoaded: boolean = false;

  constructor() {
    // Start with default, will be updated by loadConfig
    this.baseUrl = 'http://localhost:8080';
    this.apiKey = typeof window !== 'undefined'
      ? localStorage.getItem('apiKey')
      : null;

    // Load runtime config on client side
    if (typeof window !== 'undefined') {
      this.loadConfig();
    }
  }

  private async loadConfig() {
    if (this.configLoaded) return;

    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      if (config.apiUrl) {
        this.baseUrl = config.apiUrl;
        this.configLoaded = true;
      }
    } catch (error) {
      console.warn('Failed to load runtime config, using default API URL');
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

    const url = `${this.baseUrl}/optimize${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.error || 'Failed to optimize image');
    }

    return response.json();
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
    params.append('returnImage', 'true');

    const url = `${this.baseUrl}/optimize?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

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

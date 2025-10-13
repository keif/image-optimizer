import { OptimizationOptions, OptimizationResult, APIKey, APIError } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private baseUrl: string;
  private apiKey: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = typeof window !== 'undefined'
      ? localStorage.getItem('apiKey')
      : null;
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
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();

// API client for connecting frontend to Railway backend
import { config } from '@/config/environment';
import { logger } from '@/lib/logger';

const API_BASE_URL = config.api.baseUrl;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();
    
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(config.api.timeout),
      ...options,
    };

    logger.debug(`API Request: ${options.method || 'GET'} ${url}`, {
      endpoint,
      headers: requestConfig.headers,
    });

    try {
      const response = await fetch(url, requestConfig);
      const duration = Date.now() - startTime;
      
      logger.debug(`API Response: ${response.status} in ${duration}ms`, {
        endpoint,
        status: response.status,
        duration,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        logger.error(`API request failed: ${options.method || 'GET'} ${endpoint}`, error, {
          status: response.status,
          statusText: response.statusText,
          responseText: errorText,
          duration,
        });
        
        throw error;
      }
      
      const data = await response.json();
      logger.info(`API request successful: ${options.method || 'GET'} ${endpoint}`, {
        duration,
        dataSize: JSON.stringify(data).length,
      });
      
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof Error) {
        logger.error(`API request failed: ${options.method || 'GET'} ${endpoint}`, error, {
          duration,
          url,
        });
      }
      
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // User management
  async getUser(id: number) {
    return this.request(`/api/users/${id}`);
  }

  async createUser(userData: { username: string; password: string }) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // API info
  async getApiInfo() {
    return this.request('/api');
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  // Generic POST request
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Generic PUT request
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

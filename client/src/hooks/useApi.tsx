import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

// Custom hook for API health check and connection status
export function useApiHealth() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setIsLoading(true);
        await apiClient.healthCheck();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Failed to connect to API');
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { isConnected, isLoading, error };
}

// Generic API hook for data fetching
export function useApiData<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await apiClient.get<T>(endpoint);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.get<T>(endpoint);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
}

// Hook for API mutations (POST, PUT, DELETE)
export function useApiMutation<T, U = any>(
  mutationFn: (data: U) => Promise<T>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (payload: U) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await mutationFn(payload);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Mutation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
}

import { useApiHealth } from '@/hooks/useApi';

export function ApiStatus() {
  const { isConnected, isLoading, error } = useApiHealth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        Connecting to API...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        API Offline
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        API Connected
      </div>
    );
  }

  return null;
}

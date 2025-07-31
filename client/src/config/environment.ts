// Environment configuration management
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL_PRODUCTION || 
             import.meta.env.VITE_API_URL || 
             'http://localhost:5000',
    timeout: 10000, // 10 seconds
    retries: 3,
  },
  
  // App Configuration
  app: {
    name: 'Dental Helper Dashboard',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },
  
  // Feature Flags
  features: {
    enableApiHealthCheck: true,
    enableErrorReporting: import.meta.env.PROD,
    enableDebugMode: import.meta.env.DEV,
    enableOfflineMode: false,
  },
  
  // Database/Storage
  storage: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // UI Configuration
  ui: {
    theme: 'system', // 'light' | 'dark' | 'system'
    animations: true,
    compactMode: false,
  },
} as const;

// Type-safe environment variable access
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
};

// Validate required environment variables
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_API_URL_PRODUCTION',
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0 && config.app.isProduction) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

export default config;

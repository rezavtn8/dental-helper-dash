// Centralized Supabase configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || "https://jnbdhtlmdxtanwlubyis.supabase.co",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYmRodGxtZHh0YW53bHVieWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjUxODIsImV4cCI6MjA2OTA0MTE4Mn0.HzehRNCS1dIpp-J1kLFxXPQ5dGLkLsv3ZJ93_KkvK6s",
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY, // Only for edge functions
};

// Validate required environment variables
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  throw new Error('Missing required Supabase environment variables. Please check your .env file.');
}
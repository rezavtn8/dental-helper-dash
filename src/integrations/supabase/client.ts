import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/config/supabase';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
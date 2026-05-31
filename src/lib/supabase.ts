import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './supabase-config';

// Create Supabase client with correct project keys
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseUrl !== 'your-supabase-url' && 
         supabaseAnonKey !== '' && supabaseAnonKey !== 'your-supabase-anon-key';
};

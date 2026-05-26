import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 如果没有配置，返回一个空客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// 检查是否已配置Supabase
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseUrl !== 'your-supabase-url' && 
         supabaseAnonKey !== '' && supabaseAnonKey !== 'your-supabase-anon-key';
};

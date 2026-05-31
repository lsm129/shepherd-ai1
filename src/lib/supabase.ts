import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';

// 如果没有配置，返回一个空客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// 检查是否已配置Supabase
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseUrl !== 'your-supabase-url' && 
         supabaseAnonKey !== '' && supabaseAnonKey !== 'your-supabase-anon-key';
};

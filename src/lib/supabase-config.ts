// Supabase configuration with correct project keys
// These are public (anon) keys, safe to expose in client-side code
// The fallback logic checks if the env var points to the OLD project and overrides it

const CORRECT_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const CORRECT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';

const OLD_URL = 'https://ruwttvhetgfmnrcrxwtx.supabase.co';

export function getSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!envUrl || envUrl === OLD_URL || envUrl.includes('ruwttvhetgfmnrcrxwtx')) {
    return CORRECT_URL;
  }
  return envUrl;
}

export function getSupabaseAnonKey(): string {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // If the key contains the old project ref, use the correct one
  if (envKey && envKey.includes('ruwttvhetgfmnrcrxwtx')) {
    return CORRECT_ANON_KEY;
  }
  if (!envKey) {
    return CORRECT_ANON_KEY;
  }
  return envKey;
}

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();

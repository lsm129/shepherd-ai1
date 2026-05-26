import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export function isSupabaseConfigured() {
  return supabaseUrl !== '' && supabaseUrl !== 'your-supabase-url' && 
         supabaseAnonKey !== '' && supabaseAnonKey !== 'your-supabase-anon-key';
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signUp(email: string, password: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getChurchSettings(userId: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from('church_settings').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') return null;
  return data;
}

export async function saveChurchSettings(settings: any) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const existing = await getChurchSettings(settings.user_id);
  if (existing) {
    const { data, error } = await supabase.from('church_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('user_id', settings.user_id).select().single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.from('church_settings').insert({ ...settings, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    return data;
  }
}

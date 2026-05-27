// Server-side auth helper to get user from request cookies
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // Try to get user from Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data } = await supabase.auth.getUser(token);
    return data.user?.id || null;
  }
  
  // Try to get from x-user-id header (set by frontend)
  const userId = request.headers.get('x-user-id');
  if (userId) return userId;
  
  return null;
}

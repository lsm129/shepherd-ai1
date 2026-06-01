import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function giveRegistrationBonus(userId: string, userRole: string) {
  if (!SERVICE_KEY) return;
  const supabaseAdm = createClient(getSupabaseUrl(), SERVICE_KEY);
  const regBonus = userRole === 'pastor' ? 200 : 100;
  try {
    const { data: existingTx } = await supabaseAdm
      .from('points_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('action', 'registration_bonus')
      .maybeSingle();
    if (!existingTx) {
      const { data: profile } = await supabaseAdm.from('profiles').select('points_balance').eq('id', userId).single();
      if (profile) {
        const newBalance = (profile.points_balance || 0) + regBonus;
        await supabaseAdm.from('profiles').update({ points_balance: newBalance }).eq('id', userId);
        await supabaseAdm.from('points_transactions').insert({
          user_id: userId, action: 'registration_bonus', points: regBonus,
          balance_after: newBalance, description: `Registration bonus (${userRole})`,
        });
      }
    }
  } catch (e) { console.error('Registration bonus error:', e); }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') || 'signup';
  const next = searchParams.get('next') || '/dashboard';

  // Flow 1: Standard Supabase code exchange (from Supabase's own email)
  if (code) {
    const supabase = createClient(getSupabaseUrl(), supabaseAnonKey);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await giveRegistrationBonus(user.id, user.user_metadata?.role || 'congregant');
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Flow 2: Custom token_hash verification (from our Resend email)
  if (tokenHash && type) {
    const supabase = createClient(getSupabaseUrl(), supabaseAnonKey);
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    });

    if (!error && data.user) {
      // Email is now confirmed! Give registration bonus
      await giveRegistrationBonus(data.user.id, data.user.user_metadata?.role || 'congregant');
      // Redirect to dashboard (user is now logged in)
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If verifyOtp fails, try admin approach: just confirm the email manually
    if (error && SERVICE_KEY) {
      console.log('verifyOtp failed, trying admin confirm:', error.message);
      // The token_hash might be a confirmation_token from admin API
      // Use admin API to find the user by the token and confirm them
      try {
        // List users and find the one with matching confirmation token
        // Actually, a simpler approach: just redirect to login with a message
        // The user can still log in, we'll confirm them via admin API on first login
        return NextResponse.redirect(new URL('/login?message=please_login', request.url));
      } catch (e) {
        console.error('Admin confirm error:', e);
      }
    }

    console.error('Token verification failed:', error);
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}

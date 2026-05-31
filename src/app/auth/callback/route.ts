import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createClient(getSupabaseUrl(), supabaseAnonKey);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user to give registration bonus points
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Give registration bonus points using service_role
        const supabaseAdm = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY!);
        
        // Determine role and bonus amount
        const userRole = user.user_metadata?.role || 'congregant';
        const regBonus = userRole === 'pastor' ? 200 : 100;
        
        try {
          // Check if this user already got registration bonus (prevent double-credit)
          const { data: existingTx } = await supabaseAdm
            .from('points_transactions')
            .select('id')
            .eq('user_id', user.id)
            .eq('action', 'registration_bonus')
            .maybeSingle();

          if (!existingTx) {
            // Get current balance
            const { data: profile } = await supabaseAdm
              .from('profiles')
              .select('points_balance')
              .eq('id', user.id)
              .single();

            if (profile) {
              const newBalance = (profile.points_balance || 0) + regBonus;
              await supabaseAdm.from('profiles').update({ points_balance: newBalance }).eq('id', user.id);
              await supabaseAdm.from('points_transactions').insert({
                user_id: user.id,
                action: 'registration_bonus',
                points: regBonus,
                balance_after: newBalance,
                description: `Registration bonus (${userRole})`,
              });
            }
          }
        } catch (e) {
          console.error('Failed to give registration bonus:', e);
        }
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Return to error page if code is missing or exchange failed
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}

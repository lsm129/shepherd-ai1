import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, metadata } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.shepherdaitech.com'}/auth/callback`,
          data: { role: role || 'congregant', ...metadata },
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    const signupData = await signupRes.json();

    if (!signupRes.ok) {
      const errMsg = signupData.msg || signupData.error_description || signupData.message || 'Registration failed';
      return NextResponse.json({ error: errMsg }, { status: signupRes.status });
    }

    const user = signupData.user;
    const userId = user?.id;

    if (user?.identities?.length === 0) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 409 });
    }

    if (role === 'pastor' && userId && metadata && SUPABASE_SERVICE_KEY) {
      try {
        const fullAddress = [metadata.address_city, metadata.address_state, metadata.address_zip].filter(Boolean).join(', ');
        await fetch(`${SUPABASE_URL}/rest/v1/church_settings`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ user_id: userId, church_name: metadata.church_name, pastor_name: metadata.pastor_name, denomination: metadata.denomination, congregation_size: metadata.congregation_size, worship_style: metadata.worship_style, address: fullAddress }),
        });
      } catch (e) { console.error('church_settings error:', e); }
    }

    if (metadata?.referred_by && userId && SUPABASE_SERVICE_KEY) {
      try {
        const refRes = await fetch(`${SUPABASE_URL}/rest/v1/referrals?referral_code=eq.${metadata.referred_by}&select=referrer_id`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        });
        const referrers = await refRes.json();
        if (referrers?.length > 0) {
          const BONUS = 50;
          await fetch(`${SUPABASE_URL}/rest/v1/referrals?referral_code=eq.${metadata.referred_by}&referred_id=is.null`, {
            method: 'PATCH', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ referred_email: email, referred_id: userId, status: 'completed' }),
          });
          // Bonus logic (best-effort)
          for (const uid of [referrers[0].referrer_id, userId]) {
            try {
              const pRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=points_balance`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
              });
              const pData = await pRes.json();
              if (pData?.length > 0) {
                const nb = (pData[0].points_balance || 0) + BONUS;
                await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`, {
                  method: 'PATCH', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                  body: JSON.stringify({ points_balance: nb }),
                });
                const desc = uid === referrers[0].referrer_id ? 'Referral bonus: friend signed up' : 'Referral bonus: signed up via referral';
                await fetch(`${SUPABASE_URL}/rest/v1/points_transactions`, {
                  method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                  body: JSON.stringify({ user_id: uid, action: 'referral_bonus', points: BONUS, balance_after: nb, description: desc }),
                });
              }
            } catch (e) { console.error('Bonus error:', e); }
          }
        }
      } catch (e) { console.error('Referral error:', e); }
    }

    return NextResponse.json({ success: true, user: { id: userId, email: user?.email }, message: 'Account created! Please check your email to confirm.' });

  } catch (err: any) {
    console.error('Register API error:', err);
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return NextResponse.json({ error: 'Registration timed out. The confirmation email may be slow. Please check your inbox in a few minutes.' }, { status: 504 });
    }
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}

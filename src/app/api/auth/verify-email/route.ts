import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';
// Use the same hardcoded key as register route to ensure HMAC matches
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shepherdaitech.com';

function verifyToken(token: string, maxAgeMs: number = 24 * 60 * 60 * 1000): { userId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    console.log('verify-email: decoded token length:', decoded.length);
    const parts = decoded.split(':');
    if (parts.length !== 5) {
      console.log('verify-email: invalid parts count:', parts.length);
      return null;
    }
    const [userId, email, timestampStr, random, sig] = parts;
    const timestamp = parseInt(timestampStr, 10);
    const age = Date.now() - timestamp;
    console.log('verify-email: token age (hours):', (age / 3600000).toFixed(2));
    if (age > maxAgeMs) {
      console.log('verify-email: token expired');
      return null;
    }
    // Must use exact same secret as register route
    const secret = SUPABASE_SERVICE_KEY;
    const payload = `${userId}:${email}:${timestamp}:${random}`;
    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');
    console.log('verify-email: sig match:', sig === expectedSig);
    if (sig !== expectedSig) {
      console.log('verify-email: HMAC mismatch. sig length:', sig.length, 'expected length:', expectedSig.length);
      return null;
    }
    return { userId, email };
  } catch (e) {
    console.error('verify-email: token parse error:', e);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  console.log('verify-email: request received, token present:', !!token);

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=no_token', request.url));
  }

  const parsed = verifyToken(token);
  if (!parsed) {
    console.log('verify-email: token verification failed');
    return NextResponse.redirect(new URL('/login?error=invalid_or_expired_token', request.url));
  }

  console.log('verify-email: token verified for user:', parsed.userId, 'email:', parsed.email);

  // Confirm the user's email via admin API
  try {
    // Try using the GoTrue admin update endpoint
    const confirmRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${parsed.userId}`, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_confirm: true }),
      signal: AbortSignal.timeout(15000),
    });

    console.log('verify-email: admin PUT status:', confirmRes.status);
    const resText = await confirmRes.text();
    console.log('verify-email: admin PUT response:', resText.substring(0, 500));

    if (!confirmRes.ok) {
      console.error('verify-email: email confirm failed with status:', confirmRes.status);
      // Try PATCH as fallback
      console.log('verify-email: trying PATCH as fallback...');
      const patchRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${parsed.userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_confirm: true }),
        signal: AbortSignal.timeout(15000),
      });
      console.log('verify-email: admin PATCH status:', patchRes.status);
      const patchText = await patchRes.text();
      console.log('verify-email: admin PATCH response:', patchText.substring(0, 500));

      if (!patchRes.ok) {
        console.error('verify-email: both PUT and PATCH failed');
        return NextResponse.redirect(new URL('/login?error=confirm_failed', request.url));
      }
    }
  } catch (e) {
    console.error('verify-email: admin API error:', e);
    return NextResponse.redirect(new URL('/login?error=confirm_failed', request.url));
  }

  console.log('verify-email: email confirmed successfully!');

  // Give registration bonus points
  try {
    const supabaseHeaders: Record<string, string> = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${parsed.userId}`, {
      headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const userData = await userRes.json();
    const userRole = userData?.user_metadata?.role || 'congregant';
    const regBonus = userRole === 'pastor' ? 200 : 100;
    console.log('verify-email: user role:', userRole, 'bonus:', regBonus);

    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/points_transactions?user_id=eq.${parsed.userId}&action=eq.registration_bonus&select=id`, {
      headers: supabaseHeaders,
    });
    const existingTx = await txRes.json();

    if (!existingTx?.length) {
      const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${parsed.userId}&select=points_balance`, {
        headers: supabaseHeaders,
      });
      const profiles = await profileRes.json();
      if (profiles?.length > 0) {
        const newBalance = (profiles[0].points_balance || 0) + regBonus;
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${parsed.userId}`, {
          method: 'PATCH', headers: { ...supabaseHeaders, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ points_balance: newBalance }),
        });
        await fetch(`${SUPABASE_URL}/rest/v1/points_transactions`, {
          method: 'POST', headers: { ...supabaseHeaders, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: parsed.userId, action: 'registration_bonus', points: regBonus,
            balance_after: newBalance, description: `Registration bonus (${userRole})`,
          }),
        });
        console.log('verify-email: registration bonus awarded:', regBonus);
      }
    } else {
      console.log('verify-email: registration bonus already exists, skipping');
    }
  } catch (e) {
    console.error('verify-email: registration bonus error:', e);
  }

  return NextResponse.redirect(new URL('/login?verified=true', request.url));
}

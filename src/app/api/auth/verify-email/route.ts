import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shepherdaitech.com';

function verifyToken(token: string, maxAgeMs: number = 24 * 60 * 60 * 1000): { userId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 5) return null;
    const [userId, email, timestampStr, random, sig] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > maxAgeMs) return null;
    const secret = SUPABASE_SERVICE_KEY || 'shepherdai_verify_secret';
    const payload = `${userId}:${email}:${timestamp}:${random}`;
    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');
    if (sig !== expectedSig) return null;
    return { userId, email };
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=no_token', request.url));
  }

  const parsed = verifyToken(token);
  if (!parsed) {
    return NextResponse.redirect(new URL('/login?error=invalid_or_expired_token', request.url));
  }

  if (!SUPABASE_SERVICE_KEY) {
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }

  // Confirm the user's email via admin API
  const confirmRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${parsed.userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_confirm: true }),
    signal: AbortSignal.timeout(15000),
  });

  if (!confirmRes.ok) {
    console.error('Email confirm failed:', await confirmRes.text());
    return NextResponse.redirect(new URL('/login?error=confirm_failed', request.url));
  }

  // Give registration bonus points
  try {
    const supabaseHeaders = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    // Get user metadata to determine role/bonus
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${parsed.userId}`, {
      headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const userData = await userRes.json();
    const userRole = userData?.user_metadata?.role || 'congregant';
    const regBonus = userRole === 'pastor' ? 200 : 100;

    // Check if already got registration bonus
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
      }
    }
  } catch (e) {
    console.error('Registration bonus error:', e);
  }

  // Redirect to login with success message
  return NextResponse.redirect(new URL('/login?verified=true', request.url));
}

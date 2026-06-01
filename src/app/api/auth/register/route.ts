import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shepherdaitech.com';

// Generate a secure verification token
function generateVerifyToken(userId: string, email: string): string {
  const secret = SUPABASE_SERVICE_KEY || 'shepherdai_verify_secret';
  const timestamp = Date.now();
  const random = randomBytes(16).toString('hex');
  const payload = `${userId}:${email}:${timestamp}:${random}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

// Verify the token
function verifyToken(token: string, maxAgeMs: number = 24 * 60 * 60 * 1000): { userId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 5) return null;
    const [userId, email, timestampStr, random, sig] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > maxAgeMs) return null; // expired
    const secret = SUPABASE_SERVICE_KEY || 'shepherdai_verify_secret';
    const payload = `${userId}:${email}:${timestamp}:${random}`;
    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');
    if (sig !== expectedSig) return null; // invalid signature
    return { userId, email };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, metadata } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const adminHeaders = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    // Create user with email_confirm=FALSE - must verify email first
    const createUserRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email,
        password,
        email_confirm: false, // NOT auto-confirmed - must verify
        user_metadata: { role: role || 'congregant', ...metadata },
      }),
      signal: AbortSignal.timeout(30000),
    });

    const createUserData = await createUserRes.json();

    if (!createUserRes.ok) {
      const errMsg = createUserData.msg || createUserData.error_description || createUserData.message || 'Registration failed';
      if (errMsg.includes('already been registered') || errMsg.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: errMsg }, { status: createUserRes.status });
    }

    const userId = createUserData.id;

    // Create profile
    if (userId) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ id: userId, email, points_balance: 0, plan: 'free' }),
        });
      } catch (e) { console.error('Profile create error:', e); }
    }

    // If pastor, create church_settings + referral code
    if (role === 'pastor' && userId && metadata) {
      try {
        const fullAddress = [metadata.address_city, metadata.address_state, metadata.address_zip].filter(Boolean).join(', ');
        await fetch(`${SUPABASE_URL}/rest/v1/church_settings`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: userId, church_name: metadata.church_name, pastor_name: metadata.pastor_name,
            denomination: metadata.denomination, congregation_size: metadata.congregation_size,
            worship_style: metadata.worship_style, address: fullAddress,
          }),
        });
        const refCode = metadata.church_name?.substring(0, 2).toUpperCase() + userId.substring(0, 6).toUpperCase();
        await fetch(`${SUPABASE_URL}/rest/v1/referrals`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ referrer_id: userId, referral_code: refCode, status: 'active' }),
        });
      } catch (e) { console.error('church_settings/referral error:', e); }
    }

    // Handle referral code (congregant joining a church)
    if (metadata?.referred_by && userId) {
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

    // Generate verification token and send email via Resend
    const verifyToken = generateVerifyToken(userId, email);
    const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${verifyToken}`;

    try {
      const name = metadata?.pastor_name || metadata?.full_name || '';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'ShepherdAI <hello@shepherdaitech.com>',
          to: email,
          subject: 'Confirm your ShepherdAI account',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
              <div style="text-align:center;margin-bottom:24px;">
                <h1 style="color:#1e3a5f;">ShepherdAI</h1>
              </div>
              <div style="background:#f9f9f9;border-radius:12px;padding:24px;">
                <h2 style="color:#333;">Welcome${name ? ', ' + name : ''}!</h2>
                <p style="color:#666;">Please confirm your email address to activate your account.</p>
                <a href="${verifyUrl}" style="display:inline-block;background:#1e3a5f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;font-size:16px;">Confirm My Email</a>
                <p style="color:#999;font-size:12px;margin-top:16px;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
              </div>
            </div>`,
        }),
        signal: AbortSignal.timeout(15000),
      });
      console.log('Verification email sent via Resend to:', email);
    } catch (emailErr) {
      console.error('Resend email error:', emailErr);
    }

    return NextResponse.json({
      success: true,
      user: { id: userId, email },
      message: 'Account created! Please check your email to confirm your account.',
    });

  } catch (err: any) {
    console.error('Register API error:', err);
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return NextResponse.json({ error: 'Registration timed out. Please try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}

// Export verifyToken for use in verify-email route
export { verifyToken as _verifyToken };

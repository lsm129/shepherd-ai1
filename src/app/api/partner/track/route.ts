import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referral_code, user_id, email, church_name } = body;

    if (!referral_code || !email) {
      return NextResponse.json({ error: 'Referral code and email are required' }, { status: 400 });
    }

    const adminHeaders = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    // Find the partner by referral code
    const partnerRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?referral_code=eq.${encodeURIComponent(referral_code)}&select=id,status`,
      { headers: adminHeaders }
    );
    const partners = await partnerRes.json();
    if (!partners?.length) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }
    const partner = partners[0];
    if (partner.status !== 'active') {
      return NextResponse.json({ error: 'Partner account not active' }, { status: 403 });
    }

    // Check if this user was already tracked
    if (user_id) {
      const existingRes = await fetch(
        `${SUPABASE_URL}/rest/v1/partner_referrals?partner_id=eq.${partner.id}&referred_user_id=eq.${user_id}&select=id`,
        { headers: adminHeaders }
      );
      const existing = await existingRes.json();
      if (existing?.length > 0) {
        return NextResponse.json({ message: 'Referral already tracked', tracked: true });
      }
    }

    // Also check by email
    const existingEmailRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partner_referrals?partner_id=eq.${partner.id}&referred_email=eq.${encodeURIComponent(email)}&select=id`,
      { headers: adminHeaders }
    );
    const existingEmail = await existingEmailRes.json();
    if (existingEmail?.length > 0) {
      return NextResponse.json({ message: 'Referral already tracked', tracked: true });
    }

    // Create partner_referrals record
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/partner_referrals`, {
      method: 'POST',
      headers: { ...adminHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        partner_id: partner.id,
        referred_user_id: user_id || null,
        referred_email: email,
        referred_church: church_name || null,
        status: 'trial',
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      console.error('Partner track error:', err);
      return NextResponse.json({ error: 'Failed to track referral' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Referral tracked successfully' });
  } catch (err: any) {
    console.error('Partner track error:', err);
    return NextResponse.json({ error: err.message || 'Failed to track referral' }, { status: 500 });
  }
}

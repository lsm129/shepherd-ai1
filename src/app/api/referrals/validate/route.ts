import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 });
  }

  try {
    const headers = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    };

    // Look up referral code
    const refRes = await fetch(`${SUPABASE_URL}/rest/v1/referrals?referral_code=eq.${code.trim()}&select=referrer_id,referral_code,status`, { headers });
    const referrals = await refRes.json();

    if (!referrals || referrals.length === 0) {
      return NextResponse.json({ valid: false });
    }

    const referral = referrals[0];

    // Get church name
    let churchName = '';
    try {
      const churchRes = await fetch(`${SUPABASE_URL}/rest/v1/church_settings?user_id=eq.${referral.referrer_id}&select=church_name`, { headers });
      const churchData = await churchRes.json();
      churchName = churchData?.[0]?.church_name || '';
    } catch {}

    return NextResponse.json({
      valid: true,
      churchName,
      referralCode: referral.referral_code,
    });
  } catch (e) {
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}

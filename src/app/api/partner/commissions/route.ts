import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const adminHeaders = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    };

    // Verify partner
    const partnerRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?referral_code=eq.${encodeURIComponent(code)}&select=id,status`,
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

    // Get all commissions with referral info
    const commissionsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partner_commissions?partner_id=eq.${partner.id}&select=*,partner_referrals(referred_email,referred_church,plan)&order=created_at.desc`,
      { headers: adminHeaders }
    );
    const commissions = await commissionsRes.json();

    // If the join doesn't work (depends on Supabase config), fall back to separate queries
    let result = commissions || [];

    // Try to get referral info separately if join didn't work
    if (result.length > 0 && !result[0].partner_referrals) {
      const referralIds = [...new Set(result.map((c: any) => c.referral_id))];
      const referralsMap: Record<string, any> = {};

      for (const rid of referralIds) {
        const refRes = await fetch(
          `${SUPABASE_URL}/rest/v1/partner_referrals?id=eq.${rid}&select=id,referred_email,referred_church,plan`,
          { headers: adminHeaders }
        );
        const refs = await refRes.json();
        if (refs?.[0]) {
          referralsMap[rid] = refs[0];
        }
      }

      result = result.map((c: any) => ({
        ...c,
        referral: referralsMap[c.referral_id] || null,
      }));
    } else if (result.length > 0 && result[0].partner_referrals) {
      // Normalize the joined data
      result = result.map((c: any) => ({
        id: c.id,
        referral_id: c.referral_id,
        month_number: c.month_number,
        commission_rate: c.commission_rate,
        plan_price: c.plan_price,
        amount: c.amount,
        status: c.status,
        settled_at: c.settled_at,
        created_at: c.created_at,
        referral: c.partner_referrals,
      }));
    }

    return NextResponse.json({ commissions: result });
  } catch (err: any) {
    console.error('Partner commissions error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load commissions' }, { status: 500 });
  }
}

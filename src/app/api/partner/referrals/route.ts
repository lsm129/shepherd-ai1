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

    // Get referrals with commission summary
    const referralsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partner_referrals?partner_id=eq.${partner.id}&select=*&order=created_at.desc`,
      { headers: adminHeaders }
    );
    const referrals = await referralsRes.json();

    // Get commissions for each referral
    const enrichedReferrals = await Promise.all(
      (referrals || []).map(async (ref: any) => {
        const commRes = await fetch(
          `${SUPABASE_URL}/rest/v1/partner_commissions?referral_id=eq.${ref.id}&select=amount,status,month_number`,
          { headers: adminHeaders }
        );
        const commissions = await commRes.json();
        const totalCommission = commissions?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;

        return {
          id: ref.id,
          referred_email: ref.referred_email,
          referred_church: ref.referred_church,
          plan: ref.plan,
          billing_type: ref.billing_type,
          status: ref.status,
          first_payment_date: ref.first_payment_date,
          last_payment_date: ref.last_payment_date,
          created_at: ref.created_at,
          total_commission: Number(totalCommission.toFixed(2)),
          commission_months: commissions?.length || 0,
        };
      })
    );

    return NextResponse.json({ referrals: enrichedReferrals });
  } catch (err: any) {
    console.error('Partner referrals error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load referrals' }, { status: 500 });
  }
}

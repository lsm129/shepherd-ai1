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

    // Get partner by referral code
    const partnerRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?referral_code=eq.${encodeURIComponent(code)}&select=*`,
      { headers: adminHeaders }
    );
    const partners = await partnerRes.json();
    if (!partners?.length) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }
    const partner = partners[0];

    if (partner.status !== 'active') {
      return NextResponse.json({
        error: partner.status === 'pending'
          ? 'Your application is still pending review.'
          : 'Your partner account has been suspended.',
      }, { status: 403 });
    }

    // Get referrals count
    const referralsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partner_referrals?partner_id=eq.${partner.id}&select=id,status`,
      { headers: adminHeaders }
    );
    const referrals = await referralsRes.json();

    const totalReferrals = referrals?.length || 0;
    const activeClients = referrals?.filter((r: any) => r.status === 'active').length || 0;

    // Get commissions
    const commissionsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partner_commissions?partner_id=eq.${partner.id}&select=amount,status`,
      { headers: adminHeaders }
    );
    const commissions = await commissionsRes.json();

    const totalEarnings = commissions?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;
    const pendingEarnings = commissions?.filter((c: any) => c.status === 'pending').reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;
    const paidEarnings = commissions?.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;

    // Current month earnings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthCommissionsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partner_commissions?partner_id=eq.${partner.id}&created_at=gte.${monthStart}&select=amount`,
      { headers: adminHeaders }
    );
    const monthCommissions = await monthCommissionsRes.json();
    const thisMonthEarnings = monthCommissions?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;

    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        company: partner.company,
        referral_code: partner.referral_code,
        payment_email: partner.paypal_email,
        churches_served: partner.churches_served,
        services_description: partner.services_description,
        status: partner.status,
        created_at: partner.created_at,
      },
      stats: {
        totalReferrals,
        activeClients,
        thisMonthEarnings: Number(thisMonthEarnings.toFixed(2)),
        totalEarnings: Number(totalEarnings.toFixed(2)),
        pendingEarnings: Number(pendingEarnings.toFixed(2)),
        paidEarnings: Number(paidEarnings.toFixed(2)),
      },
      referral_link: `https://www.shepherdaitech.com/register?ref=${partner.referral_code}`,
    });
  } catch (err: any) {
    console.error('Partner dashboard error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load dashboard' }, { status: 500 });
  }
}

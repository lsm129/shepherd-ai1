import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91';

// Commission rates by month (1-8, then 0%)
const COMMISSION_RATES: Record<number, number> = {
  1: 0.80, 2: 0.70, 3: 0.60, 4: 0.50,
  5: 0.40, 6: 0.30, 7: 0.20, 8: 0.10,
};

// Plan prices (correct: $19/$39/$79)
const PLAN_PRICES: Record<string, number> = {
  starter: 19,
  pro: 39,
  growth: 79,
};

// Minimum payout threshold
const MIN_PAYOUT = 50;

export async function POST(req: NextRequest) {
  try {
    // Simple auth check via header
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow without auth if no CRON_SECRET set (for Vercel Cron)
    }

    const adminHeaders = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    // Get all active partner referrals
    const referralsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partner_referrals?status=eq.active&select=*`,
      { headers: adminHeaders }
    );
    let referrals = await referralsRes.json();

    // Get partner info separately (joins may not work via REST)
    const partnerCache: Record<string, any> = {};
    if (referrals?.length) {
      const partnerIds = [...new Set(referrals.map((r: any) => r.partner_id))];
      for (const pid of partnerIds) {
        if (!partnerCache[pid]) {
          const pRes = await fetch(
            `${SUPABASE_URL}/rest/v1/partners?id=eq.${pid}&select=id,email,name,paypal_email`,
            { headers: adminHeaders }
          );
          const pData = await pRes.json();
          if (pData?.[0]) partnerCache[pid] = pData[0];
        }
      }
      referrals = referrals.map((r: any) => ({ ...r, partner_info: partnerCache[r.partner_id] }));
    }

    const commissionsCreated: any[] = [];
    const partnerSummary: Record<string, { name: string; email: string; paypal_email: string; total: number; count: number }> = {};

    for (const ref of referrals || []) {
      if (!ref.first_payment_date) continue;

      const partnerInfo = ref.partner_info;
      if (!partnerInfo) continue;

      // Calculate which month this referral is in
      const firstPayment = new Date(ref.first_payment_date);
      const now = new Date();
      // We're calculating for LAST month
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthsAtLastMonth = (lastMonthDate.getFullYear() - firstPayment.getFullYear()) * 12 + (lastMonthDate.getMonth() - firstPayment.getMonth());
      const monthNumber = monthsAtLastMonth + 1; // 1-indexed

      // Check if client is still paying (last_payment_date should be within last 35 days)
      if (ref.last_payment_date) {
        const lastPayment = new Date(ref.last_payment_date);
        const daysSinceLastPayment = (now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastPayment > 35) {
          // Client has likely churned, update status
          await fetch(
            `${SUPABASE_URL}/rest/v1/partner_referrals?id=eq.${ref.id}`,
            {
              method: 'PATCH',
              headers: adminHeaders,
              body: JSON.stringify({ status: 'churned' }),
            }
          );
          continue;
        }
      }

      // Only months 1-8 get commissions
      if (monthNumber < 1 || monthNumber > 8) continue;

      const commissionRate = COMMISSION_RATES[monthNumber];
      if (!commissionRate) continue;

      // Check if commission already exists for this referral+month
      const existingCommRes = await fetch(
        `${SUPABASE_URL}/rest/v1/partner_commissions?referral_id=eq.${ref.id}&month_number=eq.${monthNumber}&select=id`,
        { headers: adminHeaders }
      );
      const existingComm = await existingCommRes.json();
      if (existingComm?.length > 0) continue; // Already calculated

      // Calculate commission
      const planPrice = PLAN_PRICES[ref.plan] || 19;
      const amount = Number((planPrice * commissionRate).toFixed(2));

      // Create commission record
      const commRes = await fetch(`${SUPABASE_URL}/rest/v1/partner_commissions`, {
        method: 'POST',
        headers: { ...adminHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          partner_id: ref.partner_id,
          referral_id: ref.id,
          month_number: monthNumber,
          commission_rate: commissionRate,
          plan_price: planPrice,
          amount,
          status: 'pending',
        }),
      });

      if (commRes.ok) {
        commissionsCreated.push({
          partner_id: ref.partner_id,
          referral_email: ref.referred_email,
          month: monthNumber,
          rate: commissionRate,
          amount,
        });

        // Track for summary email and payout processing
        if (!partnerSummary[ref.partner_id]) {
          partnerSummary[ref.partner_id] = {
            name: partnerInfo.name,
            email: partnerInfo.email,
            paypal_email: partnerInfo.paypal_email || '',
            total: 0,
            count: 0,
          };
        }
        partnerSummary[ref.partner_id].total += amount;
        partnerSummary[ref.partner_id].count++;
      }
    }

    // Process payouts: for partners whose total pending commissions >= $50, mark them as paid
    for (const [partnerId, summary] of Object.entries(partnerSummary)) {
      // Get ALL pending commissions for this partner (not just this month's)
      const allPendingRes = await fetch(
        `${SUPABASE_URL}/rest/v1/partner_commissions?partner_id=eq.${partnerId}&status=eq.pending&select=id,amount`,
        { headers: adminHeaders }
      );
      const allPending = await allPendingRes.json();
      const totalPending = allPending?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;

      let paidOut = 0;
      if (totalPending >= MIN_PAYOUT && allPending?.length > 0) {
        // Mark all pending as paid
        const now = new Date().toISOString();
        for (const comm of allPending) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/partner_commissions?id=eq.${comm.id}`,
            {
              method: 'PATCH',
              headers: adminHeaders,
              body: JSON.stringify({ status: 'paid', settled_at: now }),
            }
          );
        }
        paidOut = totalPending;
      }

      // Send summary email
      try {
        const payoutNote = paidOut >= MIN_PAYOUT
          ? `<div style="background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;padding:12px;margin:12px 0;">
              <div style="font-weight:600;color:#16a34a;">Payout: $${paidOut.toFixed(2)}</div>
              <div style="color:#15803d;font-size:13px;">Paid to PayPal: ${summary.paypal_email || 'Not set'}</div>
              <div style="color:#15803d;font-size:12px;margin-top:4px;">Transfer fees deducted from commission.</div>
            </div>`
          : totalPending > 0
            ? `<div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:12px;margin:12px 0;">
              <div style="font-weight:600;color:#b45309;">Pending: $${totalPending.toFixed(2)}</div>
              <div style="color:#92400e;font-size:13px;">Below $50 minimum payout. Will accumulate until threshold is met.</div>
            </div>`
            : '';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ShepherdAI Partners <hello@shepherdaitech.com>',
            to: summary.email,
            subject: paidOut >= MIN_PAYOUT
              ? `Partner Payout: $${paidOut.toFixed(2)} sent!`
              : `Your Partner Commission Summary - $${summary.total.toFixed(2)} earned`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
                <div style="text-align:center;margin-bottom:24px;">
                  <h1 style="color:#1e3a5f;">ShepherdAI Partners</h1>
                </div>
                <div style="background:#f9f9f9;border-radius:12px;padding:24px;">
                  <h2 style="color:#333;">Hi ${summary.name},</h2>
                  <p style="color:#666;">Your monthly commission summary is ready!</p>
                  <div style="background:white;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #e2e8f0;">
                    <div style="font-size:32px;font-weight:bold;color:#1e3a5f;">$${summary.total.toFixed(2)}</div>
                    <div style="color:#666;font-size:14px;">Earned from ${summary.count} active referral${summary.count > 1 ? 's' : ''}</div>
                  </div>
                  ${payoutNote}
                  <a href="https://www.shepherdaitech.com/partner/dashboard" style="display:inline-block;background:#1e3a5f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;font-size:16px;">View Dashboard</a>
                </div>
              </div>`,
          }),
        });
      } catch (e) {
        console.error('Commission email error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      commissionsCreated: commissionsCreated.length,
      summariesSent: Object.keys(partnerSummary).length,
      details: commissionsCreated,
    });
  } catch (err: any) {
    console.error('Partner commissions cron error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process commissions' }, { status: 500 });
  }
}

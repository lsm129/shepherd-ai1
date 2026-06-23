import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91';
const ADMIN_SECRET = 'shepherdai_partner_admin_2026';

const adminHeaders = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

// GET - list all partners
export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?select=*&order=created_at.desc`,
      { headers: adminHeaders }
    );
    const partners = await res.json();
    return NextResponse.json({ partners });
  } catch (err: any) {
    console.error('Partner admin list error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - approve a partner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partner_id, secret } = body;
    
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!partner_id) {
      return NextResponse.json({ error: 'partner_id required' }, { status: 400 });
    }

    // Get partner info
    const getRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?id=eq.${partner_id}&select=*`,
      { headers: adminHeaders }
    );
    const partners = await getRes.json();
    if (!partners?.length) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    const partner = partners[0];
    if (partner.status === 'active') {
      return NextResponse.json({ error: 'Already approved' }, { status: 400 });
    }

    // Update status to active
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?id=eq.${partner_id}`,
      {
        method: 'PATCH',
        headers: { ...adminHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify({ status: 'active' }),
      }
    );
    if (!updateRes.ok) {
      const err = await updateRes.json();
      console.error('Partner approve error:', err);
      return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
    }

    // Send approval email with referral code and dashboard link
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ShepherdAI Partners <hello@shepherdaitech.com>',
          to: partner.email,
          subject: 'You\'re Approved! Welcome to the ShepherdAI Partner Program',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px;">
              <div style="text-align:center;margin-bottom:24px;">
                <h1 style="color:#1e3a5f;">ShepherdAI Partners</h1>
              </div>
              <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:24px;margin-bottom:20px;">
                <h2 style="color:#166534;margin:0 0 12px 0;">🎉 You're Approved!</h2>
                <p style="color:#333;margin:0;">Hi ${partner.name}, your partner application has been approved. You can start earning commissions right away!</p>
              </div>
              <div style="background:#f9f9f9;border-radius:12px;padding:24px;">
                <h3 style="color:#1e3a5f;margin:0 0 16px 0;">Your Partner Details</h3>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px 0;color:#666;">Referral Code:</td><td style="padding:8px 0;font-weight:bold;color:#1e3a5f;font-size:18px;">${partner.referral_code}</td></tr>
                  <tr><td style="padding:8px 0;color:#666;">Referral Link:</td><td style="padding:8px 0;"><a href="https://www.shepherdaitech.com/register?ref=${partner.referral_code}" style="color:#2563eb;word-break:break-all;">shepherdaitech.com/register?ref=${partner.referral_code}</a></td></tr>
                  <tr><td style="padding:8px 0;color:#666;">Dashboard:</td><td style="padding:8px 0;"><a href="https://www.shepherdaitech.com/partner/dashboard" style="color:#2563eb;">shepherdaitech.com/partner/dashboard</a></td></tr>
                </table>
                <div style="margin-top:20px;padding:16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
                  <h4 style="margin:0 0 8px 0;color:#333;">How It Works</h4>
                  <ol style="margin:0;padding-left:20px;color:#555;line-height:1.8;">
                    <li>Share your referral link with churches you serve</li>
                    <li>When they sign up and subscribe, you earn commissions</li>
                    <li>First month: <strong>80% commission</strong>, then tapering over 8 months</li>
                    <li>Monthly payouts with $50 minimum threshold</li>
                    <li>Track everything in your partner dashboard</li>
                  </ol>
                </div>
              </div>
              <p style="text-align:center;margin-top:24px;">
                <a href="https://www.shepherdaitech.com/partner/dashboard" style="display:inline-block;background:#1e3a5f;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Go to Dashboard</a>
              </p>
              <p style="color:#999;font-size:12px;text-align:center;margin-top:16px;">If you have any questions, reply to this email.</p>
            </div>`,
        }),
      });
    } catch (e) {
      console.error('Partner approval email error:', e);
    }

    return NextResponse.json({ success: true, message: `Partner ${partner.name} approved! Approval email sent.` });
  } catch (err: any) {
    console.error('Partner admin approve error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - reject a partner
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { partner_id, secret } = body;
    
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!partner_id) {
      return NextResponse.json({ error: 'partner_id required' }, { status: 400 });
    }

    // Get partner info first for rejection email
    const getRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?id=eq.${partner_id}&select=*`,
      { headers: adminHeaders }
    );
    const partners = await getRes.json();
    const partner = partners?.[0];

    // Delete the partner record
    const deleteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?id=eq.${partner_id}`,
      {
        method: 'DELETE',
        headers: adminHeaders,
      }
    );
    if (!deleteRes.ok) {
      return NextResponse.json({ error: 'Failed to reject' }, { status: 500 });
    }

    // Send rejection email
    if (partner) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ShepherdAI Partners <hello@shepherdaitech.com>',
            to: partner.email,
            subject: 'Update on Your ShepherdAI Partner Application',
            html: `
              <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
                <div style="text-align:center;margin-bottom:24px;">
                  <h1 style="color:#1e3a5f;">ShepherdAI Partners</h1>
                </div>
                <div style="background:#f9f9f9;border-radius:12px;padding:24px;">
                  <h2 style="color:#333;">Hi ${partner.name},</h2>
                  <p style="color:#666;">Thank you for your interest in the ShepherdAI Partner Program. After review, we're unable to approve your application at this time.</p>
                  <p style="color:#666;">This doesn't mean you can't apply again in the future. If your circumstances change, we'd be happy to reconsider.</p>
                  <p style="color:#666;">Thank you for understanding.</p>
                  <p style="color:#666;">Best,<br>ShepherdAI Team</p>
                </div>
              </div>`,
          }),
        });
      } catch (e) {
        console.error('Partner rejection email error:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Partner rejected and removed.' });
  } catch (err: any) {
    console.error('Partner admin reject error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

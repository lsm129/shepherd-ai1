import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, phone, payment_email, churches_served, services_description } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!name?.trim()) missing.push('Full Name');
    if (!email?.trim()) missing.push('Email');
    if (!company?.trim()) missing.push('Company/Organization');
    if (!phone?.trim()) missing.push('Phone');
    if (!payment_email?.trim()) missing.push('Payment Email');

    if (missing.length > 0) {
      return NextResponse.json({ error: `Required fields missing: ${missing.join(', ')}` }, { status: 400 });
    }

    const adminHeaders = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    // Check if email already exists
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?email=eq.${encodeURIComponent(email.trim())}&select=id,status`,
      { headers: adminHeaders }
    );
    const existing = await checkRes.json();
    if (existing?.length > 0) {
      const status = existing[0].status;
      if (status === 'active') {
        return NextResponse.json({ error: 'You already have an active partner account.' }, { status: 409 });
      }
      if (status === 'pending') {
        return NextResponse.json({ error: 'Your application is already pending review.' }, { status: 409 });
      }
      if (status === 'suspended') {
        return NextResponse.json({ error: 'Your partner account has been suspended. Please contact support.' }, { status: 403 });
      }
    }

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const codeCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/partners?referral_code=eq.${referralCode}&select=id`,
        { headers: adminHeaders }
      );
      const codeExists = await codeCheck.json();
      if (!codeExists?.length) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    // Create partner with pending status
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/partners`, {
      method: 'POST',
      headers: { ...adminHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        phone: phone.trim(),
        paypal_email: payment_email.trim(),
        churches_served: churches_served ? parseInt(churches_served) : null,
        services_description: services_description?.trim() || null,
        referral_code: referralCode,
        status: 'pending',
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      console.error('Partner creation error:', err);
      return NextResponse.json({ error: 'Failed to submit application. Please try again.' }, { status: 500 });
    }

    // Send confirmation email
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ShepherdAI Partners <hello@shepherdaitech.com>',
          to: email.trim(),
          subject: 'Your ShepherdAI Partner Application Received',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
              <div style="text-align:center;margin-bottom:24px;">
                <h1 style="color:#1e3a5f;">ShepherdAI Partners</h1>
              </div>
              <div style="background:#f9f9f9;border-radius:12px;padding:24px;">
                <h2 style="color:#333;">Hi ${name.trim()},</h2>
                <p style="color:#666;">Thank you for applying to the ShepherdAI Partner Program!</p>
                <p style="color:#666;">We've received your application and will review it within 24 hours. Once approved, you'll receive your unique referral code and access to your partner dashboard.</p>
                <p style="color:#666;">Your referral code will be: <strong style="color:#1e3a5f;">${referralCode}</strong></p>
                <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:12px;margin:16px 0;">
                  <p style="color:#92400e;font-size:13px;margin:0;"><strong>Payout Info:</strong> Commissions are paid monthly via Wise or PayPal to <strong>${payment_email.trim()}</strong>. Minimum payout threshold is $50.</p>
                </div>
                <p style="color:#999;font-size:12px;margin-top:16px;">If you didn't apply for this program, please ignore this email.</p>
              </div>
            </div>`,
        }),
      });
    } catch (e) {
      console.error('Partner application email error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Application received! We will review it within 24 hours.',
      referral_code: referralCode,
    });
  } catch (err: any) {
    console.error('Partner apply error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit application' }, { status: 500 });
  }
}

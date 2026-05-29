import { NextRequest, NextResponse } from 'next/server';
import { isBrevoConfigured, sendNewsletter } from '@/lib/brevo';

export async function POST(request: NextRequest) {
  try {
    if (!isBrevoConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. BREVO_API_KEY is missing.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { subject, htmlContent, recipients, fromName } = body;

    if (!subject || !htmlContent || !recipients || !recipients.length) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, htmlContent, recipients' },
        { status: 400 }
      );
    }

    // Wrap content in newsletter template
    const fullHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #1e3a5f; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${fromName || 'Our Church'}</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Weekly Newsletter</p>
        </div>
        <div style="padding: 24px; border: 1px solid #eee; border-top: none;">
          ${htmlContent.replace(/\n/g, '<br/>')}
        </div>
        <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">Sent with ShepherdAI</p>
        </div>
      </div>
    `;

    const result = await sendNewsletter({
      subject,
      htmlContent: fullHtml,
      recipients,
      fromName,
    });

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error: any) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}

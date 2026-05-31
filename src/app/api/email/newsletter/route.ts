import { NextRequest, NextResponse } from 'next/server';
import { isResendConfigured, sendNewsletter } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. RESEND_API_KEY is missing.' },
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

    const result = await sendNewsletter({
      subject,
      htmlContent,
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

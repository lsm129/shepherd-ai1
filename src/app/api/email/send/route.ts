import { NextRequest, NextResponse } from 'next/server';
import { isResendConfigured, sendEmailSequence } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


export async function POST(request: NextRequest) {
  try {
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. RESEND_API_KEY is missing.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { emails, recipientEmail, recipientName, fromName, startDate, userId } = body;

    if (!emails || !emails.length || !recipientEmail || !recipientName) {
      return NextResponse.json(
        { error: 'Missing required fields: emails, recipientEmail, recipientName' },
        { status: 400 }
      );
    }

    const results = await sendEmailSequence({
      emails,
      recipientEmail,
      recipientName,
      fromName,
    });

    // Save to scheduled_emails table for tracking
    try {
      const supabase = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8');

      for (const result of results) {
        const emailData = emails.find((e: any) => e.week === result.week);
        // Build HTML content for the email body (same as sendEmailSequence generates)
        const fullBody = ''
          + '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">'
          + '<p style="font-size: 16px;">Hi ' + recipientName + ',</p>'
          + '<p style="font-size: 16px; line-height: 1.6;">' + (emailData?.body || '') + '</p>'
          + '<p style="font-size: 16px;">God bless,<br/>' + (fromName || 'Your Church') + '</p>'
          + '<hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />'
          + '<p style="font-size: 12px; color: #999;">Sent with ShepherdAI</p>'
          + '</div>';

        await supabase.from('scheduled_emails').insert({
          user_id: userId || null,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          week: String(result.week),
          subject: emailData?.subject || '',
          content: fullBody,
          scheduled_for: result.scheduledFor,
          status: result.status,
        });
      }
    } catch (dbErr) {
      console.error('Failed to save scheduled emails to DB:', dbErr);
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    const scheduledCount = results.filter(r => r.status === 'scheduled').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      sent: sentCount,
      scheduled: scheduledCount,
      failed: failedCount,
      results,
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send emails' },
      { status: 500 }
    );
  }
}

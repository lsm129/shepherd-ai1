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
      const supabase = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY!);

      for (const result of results) {
        await supabase.from('scheduled_emails').insert({
          user_id: userId || null,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          week: result.week,
          subject: emails.find((e: any) => e.week === result.week)?.subject || '',
          body: emails.find((e: any) => e.week === result.week)?.body || '',
          scheduled_for: result.scheduledFor,
          status: result.status,
          brevo_message_id: result.messageId || null,
          created_at: new Date().toISOString(),
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

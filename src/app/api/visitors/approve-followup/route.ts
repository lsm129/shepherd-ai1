import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { sendEmail, isResendConfigured } from '@/lib/resend';

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
}

export async function POST(request: NextRequest) {
  try {
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { visitorId, emails, recipientEmail, recipientName, fromName, fromEmail, userId } = body;

    if (!visitorId || !emails || !emails.length || !recipientEmail || !recipientName) {
      return NextResponse.json(
        { error: 'Missing required fields: visitorId, emails, recipientEmail, recipientName' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, getServiceRoleKey());

    // Verify the visitor exists
    const { data: visitor, error: visitorErr } = await supabase
      .from('visitor_followups')
      .select('id, visitor_email, visitor_name, notes')
      .eq('id', visitorId)
      .single();

    if (visitorErr || !visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
    }

    const results: Array<{ week: number; messageId: string | null; scheduledFor: string; status: string }> = [];
    let week1Status = 'sent';

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (email.week - 1) * 7);

      // Build complete HTML - convert AI plain text to styled HTML
      // AI body already includes personal greeting and signoff
      const bodyLines = (email.body || '').split('\n');
      const htmlParagraphs = bodyLines.map((line: string) => {
        if (line.trim() === '') return '<br/>';
        return '<p style="margin: 0 0 12px 0; font-size: 16px;">' + line + '</p>';
      }).join('');

      const fullHtml = ''
        + '<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.7;">'
        + '<div style="padding: 24px;">'
        + htmlParagraphs
        + '</div>'
        + '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />'
        + '<p style="font-size: 11px; color: #999; text-align: center;">Sent with ❤️ via ShepherdAI</p>'
        + '</div>';

      const isFirstEmail = email.week === 1;
      const senderFrom = fromName
        ? fromName + ' <hello@shepherdaitech.com>'
        : 'ShepherdAI <hello@shepherdaitech.com>';

      let emailStatus = 'scheduled';

      if (isFirstEmail) {
        // Send week 1 immediately
        try {
          const data = await sendEmail({
            to: recipientEmail,
            subject: email.subject,
            html: fullHtml,
            from: senderFrom,
            replyTo: fromEmail || undefined,
          });

          emailStatus = 'sent';
          results.push({
            week: email.week,
            messageId: data?.id || null,
            scheduledFor: scheduledDate.toISOString(),
            status: 'sent',
          });
        } catch (err) {
          console.error('Failed to send week 1 email:', err);
          emailStatus = 'failed';
          week1Status = 'failed';
          results.push({
            week: email.week,
            messageId: null,
            scheduledFor: scheduledDate.toISOString(),
            status: 'failed',
          });
        }
      } else {
        results.push({
          week: email.week,
          messageId: null,
          scheduledFor: scheduledDate.toISOString(),
          status: 'scheduled',
        });
      }

      // Save ALL emails to scheduled_emails for tracking
      try {
        await supabase.from('scheduled_emails').insert({
          user_id: userId || null,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          week: String(email.week),
          subject: email.subject,
          content: fullHtml,
          scheduled_for: scheduledDate.toISOString(),
          status: emailStatus,
        });
      } catch (dbErr) {
        console.error('Failed to save scheduled email:', dbErr);
      }

      // Rate limit
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Update visitor record - mark emails as approved/scheduled
    let parsedNotes: any = {};
    try {
      parsedNotes = JSON.parse(visitor.notes || '{}');
    } catch {
      parsedNotes = {};
    }

    const updatedNotes = JSON.stringify({
      how_heard: parsedNotes.how_heard || '',
      interests: parsedNotes.interests || '',
      ai_emails: emails,
      emails_status: 'approved',
    });

    const { error: updateErr } = await supabase
      .from('visitor_followups')
      .update({
        notes: updatedNotes,
        followup_status: 'contacted',
        email_sequence_started: true,
        email_sequence_id: visitorId,
      })
      .eq('id', visitorId);

    if (updateErr) {
      console.error('Failed to update visitor record:', updateErr);
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
    console.error('Approve followup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve and send follow-up emails' },
      { status: 500 }
    );
  }
}

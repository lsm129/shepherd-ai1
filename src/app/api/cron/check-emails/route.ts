import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { sendEmail, isResendConfigured } from '@/lib/resend';

// Vercel Cron: runs daily to check and send scheduled emails
export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron call
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const cronSecret = process.env.CRON_SECRET || 'shepherdai_cron_2026_secret';
  
  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}` && url.searchParams.get('secret') !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    if (!isResendConfigured()) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();
    
    // Find emails that are 'scheduled' and past their scheduled time
    const { data: dueEmails, error } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'scheduled')
      .lt('scheduled_for', now);

    if (error) {
      console.error('Failed to query scheduled emails:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    // Actually send the due emails
    let sent = 0;
    let failed = 0;

    if (dueEmails && dueEmails.length > 0) {
      for (const email of dueEmails) {
        try {
          // Check if the email has personalized HTML content in 'content' field
          // If so, use it directly without wrapping in template
          // If not (legacy), use the old template wrapper with 'body' logic
          let htmlToSend: string;

          if (email.content && email.content.includes('<div') && email.content.includes('font-family')) {
            // AI-generated personalized email — already has complete HTML with styling
            htmlToSend = email.content;
          } else if (email.content) {
            // Has content but not full HTML — wrap in simple styling
            htmlToSend = ''
              + '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">'
              + '<p style="font-size: 16px;">Hi ' + (email.recipient_name || 'there') + ',</p>'
              + '<p style="font-size: 16px; line-height: 1.6;">' + email.content + '</p>'
              + '<p style="font-size: 16px;">God bless,<br/>Your Church</p>'
              + '<hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />'
              + '<p style="font-size: 12px; color: #999;">Sent with ShepherdAI</p>'
              + '</div>';
          } else {
            // Legacy: no content field, skip
            console.warn(`Email ${email.id} has no content, skipping`);
            continue;
          }

          await sendEmail({
            to: email.recipient_email,
            subject: email.subject,
            html: htmlToSend,
          });

          // Mark as sent
          await supabase
            .from('scheduled_emails')
            .update({ 
              status: 'sent', 
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString() 
            })
            .eq('id', email.id);

          sent++;
        } catch (err) {
          console.error(`Failed to send scheduled email ${email.id}:`, err);
          
          // Mark as failed
          await supabase
            .from('scheduled_emails')
            .update({ 
              status: 'failed', 
              updated_at: new Date().toISOString() 
            })
            .eq('id', email.id);
          
          failed++;
        }

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Also find any 'failed' emails from the last 24 hours and retry
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: failedEmails } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'failed')
      .gt('created_at', yesterday);

    let retried = 0;
    if (failedEmails && failedEmails.length > 0) {
      for (const email of failedEmails) {
        await supabase
          .from('scheduled_emails')
          .update({ status: 'scheduled', updated_at: new Date().toISOString() })
          .eq('id', email.id);
        retried++;
      }
    }

    return NextResponse.json({
      checked: true,
      dueEmails: dueEmails?.length || 0,
      sent,
      failed,
      retried,
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

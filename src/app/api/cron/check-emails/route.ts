import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


// Vercel Cron: runs daily to check scheduled email status
// This endpoint is called by Vercel's cron scheduler
export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron call
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find emails that are 'scheduled' and past their scheduled time
    // These should have been sent by Brevo already, mark them as sent
    const now = new Date().toISOString();
    
    const { data: dueEmails, error } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'scheduled')
      .lt('scheduled_for', now);

    if (error) {
      console.error('Failed to query scheduled emails:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    // Mark past-due scheduled emails as sent (Brevo handles the actual delivery)
    let updated = 0;
    if (dueEmails && dueEmails.length > 0) {
      for (const email of dueEmails) {
        const { error: updateError } = await supabase
          .from('scheduled_emails')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq('id', email.id);
        
        if (!updateError) updated++;
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
        // Reset to pending so it can be picked up next time
        await supabase
          .from('scheduled_emails')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('id', email.id);
        retried++;
      }
    }

    return NextResponse.json({
      checked: true,
      dueEmails: dueEmails?.length || 0,
      updated,
      retried,
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

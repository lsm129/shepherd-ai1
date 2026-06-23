import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { sendEmail, isResendConfigured } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. RESEND_API_KEY is missing.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { pastorUserId, title, content, fromName } = body;

    if (!pastorUserId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: pastorUserId, title, content' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8');

    // Find all members who joined this pastor's church
    const { data: { users } } = await supabase.auth.admin.listUsers();
    
    if (!users || users.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No users found' });
    }

    // Filter members who have this pastor in their joined_churches
    const churchMembers = users.filter((user: any) => {
      const joined = user.user_metadata?.joined_churches || [];
      return joined.includes(pastorUserId);
    });

    if (churchMembers.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No church members found. Share your church link so members can join!' });
    }

    // Get church profile for from name
    const { data: churchSettings } = await supabase
      .from('church_settings')
      .select('church_name, pastor_name')
      .eq('user_id', pastorUserId)
      .single();

    const effectiveFromName = fromName || churchSettings?.church_name || 'Your Church';
    const pastorName = churchSettings?.pastor_name || 'Pastor';

    let sent = 0;
    let failed = 0;
    const results: Array<{ email: string; status: string }> = [];

    for (const member of churchMembers) {
      try {
        const memberName = (member as any).user_metadata?.full_name?.split(' ')[0] || 'Member';
        
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">${effectiveFromName}</p>
            </div>
            <div style="padding: 32px; background: white; border: 1px solid #e5e7eb;">
              <p style="font-size: 16px;">Hi ${memberName},</p>
              <div style="font-size: 16px; line-height: 1.8;">${content}</div>
              <p style="font-size: 16px; margin-top: 24px;">God bless,<br/>${pastorName}</p>
            </div>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 12px 12px;">
              <p>Sent with ❤️ by ShepherdAI</p>
              <p style="margin-top: 8px;">
                <a href="https://www.shepherdaitech.com/member/dashboard" style="color: #2563eb;">Visit Your Dashboard</a>
              </p>
            </div>
          </div>
        `;

        await sendEmail({
          to: (member as any).email!,
          subject: title,
          html,
        });

        results.push({ email: (member as any).email!, status: 'sent' });
        sent++;
      } catch (err) {
        console.error(`Failed to send newsletter to ${(member as any).email}:`, err);
        results.push({ email: (member as any).email!, status: 'failed' });
        failed++;
      }

      // Rate limit: 500ms between emails
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save newsletter record
    await supabase.from('newsletters').insert({
      user_id: pastorUserId,
      title,
      content,
      recipients_count: sent,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sent,
      failed,
      totalMembers: churchMembers.length,
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send newsletter';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

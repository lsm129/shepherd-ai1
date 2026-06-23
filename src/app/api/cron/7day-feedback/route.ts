import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { sendEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow via query param
      const url = new URL(request.url);
      if (url.searchParams.get('secret') !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8');
    
    // Find users registered 7+ days ago who haven't received the feedback email
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    // Get users from auth who registered 7 days ago
    const { data: { users } } = await supabase.auth.admin.listUsers();
    
    if (!users || users.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No users found' });
    }

    const eligibleUsers = users.filter(user => {
      const createdAt = new Date(user.created_at);
      return (
        createdAt <= sevenDaysAgo &&
        createdAt >= eightDaysAgo &&
        !(user as any).feedback_email_sent
      );
    });

    // Also check profiles table for feedback_email_sent flag
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, feedback_email_sent')
      .eq('feedback_email_sent', false);

    const profileIds = new Set((profiles || []).map((p: any) => p.id));

    const usersToEmail = eligibleUsers.filter(u => profileIds.has(u.id));

    let sent = 0;
    let failed = 0;

    for (const user of usersToEmail) {
      try {
        const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'there';
        
        await sendEmail({
          to: user.email!,
          subject: `${firstName}, how's your ShepherdAI experience? 🎉`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">How's ShepherdAI Working for You?</h1>
              </div>
              <div style="padding: 32px; background: white; border: 1px solid #e5e7eb;">
                <p style="font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
                <p style="font-size: 16px; line-height: 1.6;">It's been a week since you joined ShepherdAI! We'd love to hear how things are going.</p>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="margin: 0 0 12px 0; color: #1e3a5f;">🎯 Did you know? Your points can unlock:</h3>
                  <ul style="margin: 0; padding-left: 20px; line-height: 2;">
                    <li><strong>📌 Prayer Wall Pin</strong> — 50 points = Pin your prayer for 7 days</li>
                    <li><strong>🏅 Community Badge</strong> — 100 points = Unlock a special badge</li>
                    <li><strong>📖 Personal Devotional</strong> — 200 points = AI personalized devotional plan</li>
                    <li><strong>💌 Blessing Card</strong> — 100 points = Create a blessing card to share</li>
                    <li><strong>🎯 Extra AI Generations</strong> — 500 points = 10 extra generations</li>
                    <li><strong>💰 Subscription Discount</strong> — 1000 points = $10 off your next renewal</li>
                  </ul>
                </div>

                <p style="font-size: 16px; line-height: 1.6;">We'd really appreciate it if you could take a moment to share your thoughts. As a thank you, <strong>you'll earn 100 bonus points</strong> for completing our short feedback form!</p>
                
                <div style="text-align: center; margin: 24px 0;">
                  <a href="https://www.shepherdaitech.com/feedback" style="background: linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Share Your Feedback →</a>
                </div>
                
                <p style="font-size: 14px; color: #666; line-height: 1.6;">The form takes less than 2 minutes and your input directly shapes what we build next.</p>
              </div>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 12px 12px;">
                <p>Sent with ❤️ by ShepherdAI</p>
              </div>
            </div>
          `,
        });

        // Mark email as sent
        await supabase
          .from('profiles')
          .update({ feedback_email_sent: true })
          .eq('id', user.id);

        sent++;
      } catch (err) {
        console.error(`Failed to send feedback email to ${user.email}:`, err);
        failed++;
      }

      // Rate limit: 500ms between emails
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      totalEligible: usersToEmail.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process feedback emails';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

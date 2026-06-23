import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { sendEmail, isResendConfigured } from '@/lib/resend';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';

function getAIConfig() {
  if (DEEPSEEK_KEY && DEEPSEEK_KEY !== 'your-deepseek-api-key') {
    return { apiKey: DEEPSEEK_KEY, baseURL: 'https://api.deepseek.com', model: 'deepseek-chat' };
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey !== 'your-openai-api-key') {
    return { apiKey: openaiKey, baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
  }
  return { apiKey: '', baseURL: '', model: '' };
}

async function generateWeeklyDigest(
  churchName: string,
  pastorName: string,
  sermons: string[],
  devotionals: string[],
  announcements: string[],
  prayers: string[]
) {
  const { apiKey, baseURL, model } = getAIConfig();
  if (!apiKey) throw new Error('AI API key not configured');

  const contentSummary = [
    sermons.length > 0 ? `This week's sermons: ${sermons.join('; ')}` : '',
    devotionals.length > 0 ? `This week's devotionals: ${devotionals.join('; ')}` : '',
    announcements.length > 0 ? `Announcements: ${announcements.join('; ')}` : '',
    prayers.length > 0 ? `Prayer requests: ${prayers.join('; ')}` : '',
  ].filter(Boolean).join('\n');

  if (!contentSummary) {
    return null;
  }

  const systemPrompt = `You are an AI assistant helping ${churchName || 'our church'} create a weekly digest email for congregants. The pastor is ${pastorName || 'Pastor'}. Write warm, engaging, and spiritually uplifting content.`;

  const userPrompt = `Create a weekly church digest based on this content:
${contentSummary}

Format as JSON with these sections:
{
  "greeting": "A warm weekly greeting (1-2 sentences)",
  "sermon_summary": "Summary of this week's sermon highlights (2-3 sentences, or 'No sermon this week' if none)",
  "devotional_highlight": "A highlight from this week's devotionals (2-3 sentences, or 'No devotional this week' if none)",
  "announcements": "Key announcements for the congregation (as a single paragraph, or 'No announcements this week' if none)",
  "prayer_focus": "Prayer focus based on the prayer requests (2-3 sentences, or 'Continue to keep each other in prayer' if none)",
  "upcoming": "A hopeful note about next week (1-2 sentences)",
  "closing_prayer": "A short closing prayer (1-2 sentences)"
}`;

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `AI API failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content || '{}');
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const cronSecret = process.env.CRON_SECRET || 'shepherdai_cron_2026_secret';

  if (authHeader !== `Bearer ${cronSecret}` && url.searchParams.get('secret') !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isResendConfigured()) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Get all churches with weekly digest enabled - with fallback
    let churchSettings: any[] = [];
    const { data: csFiltered } = await supabase
      .from('church_settings')
      .select('user_id, church_name, pastor_name')
      .eq('weekly_digest_enabled', true);
    
    if (csFiltered && csFiltered.length > 0) {
      churchSettings = csFiltered;
    } else {
      // Column may not exist yet - get all churches
      const { data: csAll } = await supabase
        .from('church_settings')
        .select('user_id, church_name, pastor_name');
      churchSettings = csAll || [];
    }

    if (churchSettings.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No churches with weekly digest enabled' });
    }

    // Calculate date range: past 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    let totalSent = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const church of churchSettings) {
      try {
        // Gather this week's content for the church
        const { data: posts } = await supabase
          .from('church_community_posts')
          .select('title, body, category, created_at')
          .eq('church_user_id', church.user_id)
          .gte('created_at', oneWeekAgoISO)
          .order('created_at', { ascending: false });

        const sermons = (posts || []).filter(p => p.category === 'sermon').map(p => p.title + ': ' + (p.body || '').substring(0, 200));
        const devotionals = (posts || []).filter(p => p.category === 'devotional').map(p => p.title + ': ' + (p.body || '').substring(0, 200));
        const announcements = (posts || []).filter(p => p.category === 'announcement').map(p => p.title + ': ' + (p.body || '').substring(0, 200));
        const prayers = (posts || []).filter(p => p.category === 'prayer').map(p => p.title);

        // Generate weekly digest
        const digest = await generateWeeklyDigest(
          church.church_name || '',
          church.pastor_name || '',
          sermons,
          devotionals,
          announcements,
          prayers
        );

        if (!digest) {
          totalSkipped++;
          continue;
        }

        // Find congregants of this church
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const congregants = (users || []).filter(u => {
          const meta = u.user_metadata || {};
          if (meta.role !== 'congregant') return false;
          const joined: string[] = meta.joined_churches || [];
          return joined.includes(church.user_id);
        });

        if (congregants.length === 0) {
          totalSkipped++;
          continue;
        }

        // Build email HTML
        const weekRange = `${oneWeekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📰 Weekly Digest</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">${church.church_name || 'Your Church'} • ${weekRange}</p>
            </div>

            <div style="padding: 32px; background: white; border: 1px solid #e5e7eb;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">${digest.greeting || 'Dear Church Family,'}</p>

              <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #1e3a5f;">
                <h3 style="color: #1e3a5f; margin: 0 0 8px 0; font-size: 16px;">⛪ Sermon Summary</h3>
                <p style="margin: 0; line-height: 1.6; color: #555;">${digest.sermon_summary || 'No sermon this week.'}</p>
              </div>

              <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #4a90a4;">
                <h3 style="color: #1e3a5f; margin: 0 0 8px 0; font-size: 16px;">📖 Devotional Highlight</h3>
                <p style="margin: 0; line-height: 1.6; color: #555;">${digest.devotional_highlight || 'No devotional this week.'}</p>
              </div>

              <div style="margin: 24px 0; padding: 16px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h3 style="color: #1e3a5f; margin: 0 0 8px 0; font-size: 16px;">📢 Announcements</h3>
                <p style="margin: 0; line-height: 1.6; color: #555;">${digest.announcements || 'No announcements this week.'}</p>
              </div>

              <div style="margin: 24px 0; padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h3 style="color: #1e3a5f; margin: 0 0 8px 0; font-size: 16px;">🙏 Prayer Focus</h3>
                <p style="margin: 0; line-height: 1.6; color: #555;">${digest.prayer_focus || 'Continue to keep each other in prayer.'}</p>
              </div>

              <div style="margin: 24px 0; padding: 16px; background: #faf5ff; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                <h3 style="color: #1e3a5f; margin: 0 0 8px 0; font-size: 16px;">📅 Looking Ahead</h3>
                <p style="margin: 0; line-height: 1.6; color: #555;">${digest.upcoming || 'We look forward to seeing you this week!'}</p>
              </div>

              <div style="margin: 24px 0; padding: 16px; background: rgba(30, 58, 95, 0.05); border-radius: 8px; text-align: center;">
                <p style="font-style: italic; color: #555; margin: 0;">${digest.closing_prayer || 'May God bless you richly this week.'}</p>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="https://www.shepherdaitech.com/church-community" style="background: linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Visit Church Community →</a>
              </div>
            </div>

            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 8px 0;">Blessings from ${church.pastor_name || 'your pastor'} & ${church.church_name || 'your church'}</p>
              <p style="margin: 0;">Sent with ❤️ by ShepherdAI</p>
            </div>
          </div>
        `;

        // Send to each congregant
        for (const recipient of congregants) {
          try {
            await sendEmail({
              to: recipient.email!,
              subject: `📰 ${church.church_name || 'Church'} Weekly Digest — ${weekRange}`,
              html: emailHtml,
            });
            totalSent++;
          } catch (err) {
            console.error(`Failed to send weekly digest to ${recipient.email}:`, err);
            totalFailed++;
          }
          await new Promise(resolve => setTimeout(resolve, 300));
        }

      } catch (err) {
        console.error(`Failed to process church ${church.church_name}:`, err);
        totalFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      skipped: totalSkipped,
      churchesProcessed: churchSettings.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cron job failed';
    console.error('Weekly digest cron error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

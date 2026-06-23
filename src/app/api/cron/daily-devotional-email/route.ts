import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { sendEmail, isResendConfigured } from '@/lib/resend';
import { getChurchProfile, getUserHabits, buildAISystemPrompt } from '@/lib/ai-with-profile';

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

async function generatePersonalizedDevotional(
  pastorUserId: string,
  churchName: string,
  pastorName: string
) {
  const { apiKey, baseURL, model } = getAIConfig();
  if (!apiKey) throw new Error('AI API key not configured');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get pastor's style profile for personalization
  const [churchProfile, habitsContext] = await Promise.all([
    getChurchProfile(pastorUserId).catch(() => null),
    getUserHabits(pastorUserId).catch(() => ''),
  ]);

  const basePrompt = `You are a pastoral AI assistant creating a daily devotional for ${churchName || 'our church'}, led by ${pastorName || 'our pastor'}. Write warm, encouraging, Bible-based content that feels personal and authentic.`;

  const systemPrompt = buildAISystemPrompt(basePrompt, churchProfile, habitsContext);

  const userPrompt = `Create a daily devotional for ${today}.

Include:
- A title that captures the theme
- A scripture verse with reference (choose a verse that's thematically relevant)
- A meditation/reflection (2-3 paragraphs of thoughtful, encouraging content)
- A reflection question (one thought-provoking question for the reader to ponder)
- A short prayer for today

Return ONLY valid JSON:
{
  "title": "...",
  "verse": { "reference": "...", "text": "..." },
  "meditation": "...",
  "reflection_question": "...",
  "prayer": "..."
}`;

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `AI API failed with status ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content || '{}');
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const cronSecret = process.env.CRON_SECRET || 'shepherdai_cron_2026_secret';

  if (
    authHeader !== `Bearer ${cronSecret}` &&
    url.searchParams.get('secret') !== cronSecret
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Get all church settings
    const { data: churchSettings } = await supabase
      .from('church_settings')
      .select('user_id, church_name, pastor_name, daily_devotional_enabled');

    // Filter churches where pastor has enabled daily devotional emails
    const { data: { users: allPastors } } = await supabase.auth.admin.listUsers();
    const pastorMeta: Record<string, any> = {};
    for (const u of (allPastors || [])) {
      if (u.user_metadata?.role !== 'congregant') {
        pastorMeta[u.id] = u.user_metadata || {};
      }
    }
    // Only process churches where pastor explicitly enabled daily devotional
    const enabledChurches = churchSettings.filter(ch => {
      const meta = pastorMeta[ch.user_id] || {};
      return meta.daily_devotional_enabled === true;
    });

    if (!enabledChurches || enabledChurches.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No churches with daily devotional enabled' });
    }

    let totalSent = 0;
    let totalFailed = 0;
    const processedChurches: string[] = [];

    for (const church of enabledChurches) {
      try {
        // Find all congregants who belong to this church and have an email
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const congregants = (users || []).filter((u) => {
          const meta = u.user_metadata || {};
          if (meta.role !== 'congregant') return false;
          if (!u.email) return false;
          const joined: string[] = meta.joined_churches || [];
          return joined.includes(church.user_id);
        });

        if (congregants.length === 0) continue;

        // Check email_subscriptions - try profiles table first, then user_metadata
        const congregantIds = congregants.map((c) => c.id);
        const recipients: typeof congregants = [];

        // Try profiles.email_subscriptions
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('id, email_subscriptions')
          .in('id', congregantIds);

        if (!profileErr && profiles) {
          // Column exists - use it
          for (const c of congregants) {
            const profile = profiles.find((p) => p.id === c.id);
            const subs = profile?.email_subscriptions;
            // Subscribed by default (null/undefined/true = subscribed, explicit false = unsubscribed)
            if (subs?.daily_devotional !== false) {
              recipients.push(c);
            }
          }
        } else {
          // Column doesn't exist yet - check user_metadata fallback
          for (const c of congregants) {
            const meta = c.user_metadata || {};
            const subs = meta.email_subscriptions;
            if (!subs || subs.daily_devotional !== false) {
              recipients.push(c);
            }
          }
        }

        if (recipients.length === 0) continue;

        // Generate personalized devotional using pastor's style profile
        const devotional = await generatePersonalizedDevotional(
          church.user_id,
          church.church_name || '',
          church.pastor_name || ''
        );

        const today = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });

        // Build email HTML with required structure
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📖 ${devotional.title || 'Daily Devotional'}</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">${today} • ${church.church_name || 'Your Church'}</p>
            </div>

            <div style="padding: 32px; background: white; border: 1px solid #e5e7eb;">
              <!-- Scripture Verse -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 0 0 24px 0; border-left: 4px solid #1e3a5f;">
                <div style="font-weight: bold; color: #1e3a5f; margin-bottom: 8px;">📖 ${devotional.verse?.reference || ''}</div>
                <p style="font-style: italic; font-size: 17px; line-height: 1.8; color: #444; margin: 0;">
                  "${devotional.verse?.text || ''}"
                </p>
              </div>

              <!-- Meditation / Devotional Body (2-3 paragraphs) -->
              <div style="margin: 0 0 24px 0;">
                <h3 style="color: #1e3a5f; font-size: 18px; margin-bottom: 12px;">💭 Today's Reflection</h3>
                <p style="line-height: 1.8; color: #555;">${devotional.meditation || ''}</p>
              </div>

              <!-- Reflection Question -->
              <div style="background: #fffbeb; border-radius: 8px; padding: 20px; margin: 0 0 24px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; font-size: 16px; margin: 0 0 8px 0;">🤔 Reflection Question</h3>
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0; font-style: italic;">${devotional.reflection_question || ''}</p>
              </div>

              <!-- Today's Prayer -->
              <div style="background: rgba(30, 58, 95, 0.05); border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
                <h3 style="color: #1e3a5f; font-size: 18px; margin-bottom: 12px;">🙏 Today's Prayer</h3>
                <p style="font-style: italic; line-height: 1.8; color: #555;">${devotional.prayer || ''}</p>
              </div>
            </div>

            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 8px 0;">Blessings from ${church.pastor_name || 'your pastor'} & ${church.church_name || 'your church'}</p>
              <p style="margin: 0 0 8px 0;">Sent with ❤️ by ShepherdAI</p>
              <p style="margin: 0 0 8px 0;"><a href="https://www.shepherdaitech.com/daily-devotional" style="color: #4a90a4;">📖 Read More Devotionals</a></p>
              <p style="margin: 0;"><a href="https://www.shepherdaitech.com/daily-devotional?unsubscribe=true" style="color: #999;">Unsubscribe from daily emails</a></p>
            </div>
          </div>
        `;

        // Send to each recipient with 1-second delay to avoid rate limits
        for (const recipient of recipients) {
          try {
            await sendEmail({
              to: recipient.email!,
              subject: `Your Daily Devotional - ${today}`,
              html: emailHtml,
            });
            totalSent++;
          } catch (err) {
            console.error(
              `Failed to send devotional to ${recipient.email}:`,
              err
            );
            totalFailed++;
          }
          // 1-second delay between emails to avoid rate limit
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        processedChurches.push(church.church_name || church.user_id);
      } catch (err) {
        console.error(`Failed to process church ${church.church_name}:`, err);
        totalFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      churchesProcessed: processedChurches.length,
      churches: processedChurches,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cron job failed';
    console.error('Daily devotional email cron error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

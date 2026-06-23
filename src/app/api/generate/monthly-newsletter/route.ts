import { recordGeneration } from '@/lib/quota';
import { requireAuthAndQuota } from '@/lib/auth-middleware';
import { earnPoints } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';
import { getChurchProfile, buildAISystemPrompt, getUserHabits } from '@/lib/ai-with-profile';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91';

function getAIConfig() {
  const deepseekKey = DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (deepseekKey && deepseekKey !== 'your-deepseek-api-key') {
    return { apiKey: deepseekKey, baseURL: 'https://api.deepseek.com', model: 'deepseek-chat' };
  }
  if (openaiKey && openaiKey !== 'your-openai-api-key') {
    return { apiKey: openaiKey, baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
  }
  return { apiKey: '', baseURL: '', model: '' };
}

const TONE_MAP: Record<string, string> = {
  warm: 'warm, personal, and inviting — like a letter from a caring friend',
  formal: 'formal, dignified, and traditional — befitting a respected institution',
  celebratory: 'celebratory, energetic, and uplifting — full of joy and excitement',
  reflective: 'reflective, thoughtful, and meditative — encouraging deep consideration',
};

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseURL, model } = getAIConfig();
    if (!apiKey) return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });

    const body = await request.json();
    const { month, highlights, upcomingEvents, ministryUpdates, prayerRequests, specialAnnouncements, tone, userId, churchName } = body;

    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user) return NextResponse.json({ error: 'Invalid user' }, { status: 401 });

    const userRole = user.user_metadata?.role || 'pastor';
    if (userRole === 'congregant') {
      return NextResponse.json({ error: 'Only pastors can access this feature' }, { status: 403 });
    }

    const auth = await requireAuthAndQuota(request, userId);
    if (auth.error) return auth.error;

    const churchProfile = userId ? await getChurchProfile(userId) : null;
    const habitsContext = userId ? await getUserHabits(userId) : '';

    const basePrompt = `You are an expert church communications AI assistant. You write engaging, spiritually uplifting monthly newsletters that keep congregations connected and informed.`;
    const systemPrompt = buildAISystemPrompt(basePrompt, churchProfile, habitsContext);

    const toneDesc = TONE_MAP[tone] || TONE_MAP.warm;

    const userPrompt = `Create a complete monthly church newsletter with these details:

**Church Name:** ${churchName || 'Our Church'}
**Month:** ${month}
**Tone:** ${toneDesc}
**Highlights:** ${highlights || 'Generate appropriate highlights for a typical month'}
**Upcoming Events:** ${upcomingEvents || 'Generate typical upcoming church events'}
**Ministry Updates:** ${ministryUpdates || 'Generate typical ministry updates'}
**Prayer Requests:** ${prayerRequests || 'Generate appropriate prayer needs'}
**Special Announcements:** ${specialAnnouncements || 'None'}

Generate the newsletter in this JSON format:
{
  "month_title": "${month} Newsletter — ${churchName || 'Our Church'}",
  "greeting": "A warm opening greeting to the congregation",
  "pastor_message": "A 2-3 paragraph pastoral message reflecting on the season/month, offering spiritual encouragement. Include a relevant scripture reference.",
  "highlights": [
    {"title": "Highlight title", "description": "Brief description"}
  ],
  "upcoming_events": [
    {"name": "Event name", "date": "Date/time", "description": "Brief description"}
  ],
  "ministry_updates": [
    {"ministry": "Ministry name", "update": "What's happening"}
  ],
  "prayer_focus": ["Prayer point 1", "Prayer point 2", "Prayer point 3"],
  "member_spotlight": "A brief encouraging note about congregational community",
  "giving_update": {
    "summary": "General update on church financial stewardship",
    "needs": ["Current need 1", "Current need 2"]
  },
  "closing": "A warm closing with blessing and contact information reminder"
}

Make it engaging, spiritually grounded, and practical. The newsletter should feel like a genuine letter from the church family, not a corporate communication.`;

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    if (userId) {
      await recordGeneration(userId, 'monthly_newsletter', `Monthly Newsletter: ${month}`);
      await earnPoints(userId, 'generate_sermon').catch(e => console.error('Points error:', e));
    }

    return NextResponse.json({ success: true, nearLimit: auth.nearLimit, newsletter: parsed });
  } catch (error: any) {
    console.error('Monthly Newsletter Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate newsletter' }, { status: 500 });
  }
}

// PUT: Send newsletter to congregation via email
export async function PUT(request: NextRequest) {
  try {
    const { newsletter, userId, churchName, month } = await request.json();
    if (!userId || !newsletter) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get congregants
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, church_id')
      .eq('id', userId)
      .single();

    if (!profiles?.church_id) {
      return NextResponse.json({ error: 'No church found' }, { status: 400 });
    }

    // Get church members
    const { data: members } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('church_id', profiles.church_id)
      .eq('role', 'congregant');

    if (!members || members.length === 0) {
      return NextResponse.json({ error: 'No congregation members found' }, { status: 400 });
    }

    // Get user emails
    const memberIds = members.map((m: any) => m.id);
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();

    const emails = users
      .filter((u: any) => memberIds.includes(u.id) && u.email)
      .map((u: any) => u.email);

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No member emails found' }, { status: 400 });
    }

    // Build email HTML
    const highlightsHtml = (newsletter.highlights || []).map((h: any) =>
      `<div style="padding:8px 12px;background:#f0f9ff;border-radius:6px;margin-bottom:6px"><strong>${h.title}</strong> — ${h.description}</div>`
    ).join('');

    const eventsHtml = (newsletter.upcoming_events || []).map((e: any) =>
      `<div style="padding:8px 12px;background:#fef3c7;border-radius:6px;margin-bottom:6px"><strong>${e.name}</strong> · ${e.date} — ${e.description}</div>`
    ).join('');

    const prayerHtml = (newsletter.prayer_focus || []).map((p: string) => `<li>${p}</li>`).join('');

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
        <div style="text-align:center;padding:24px 0;border-bottom:2px solid #2563eb">
          <h1 style="margin:0;font-size:24px">${churchName || 'Our Church'}</h1>
          <h2 style="margin:4px 0 0;color:#2563eb;font-size:18px">${newsletter.month_title}</h2>
        </div>
        <div style="padding:16px 0">
          <p>${newsletter.greeting}</p>
          <h3 style="color:#2563eb">📖 Pastor's Message</h3>
          <p style="white-space:pre-wrap">${newsletter.pastor_message}</p>
          ${highlightsHtml ? `<h3 style="color:#2563eb">⭐ Monthly Highlights</h3>${highlightsHtml}` : ''}
          ${eventsHtml ? `<h3 style="color:#2563eb">📅 Upcoming Events</h3>${eventsHtml}` : ''}
          ${prayerHtml ? `<h3 style="color:#2563eb">🙏 Prayer Focus</h3><ul>${prayerHtml}</ul>` : ''}
          <p style="text-align:center;padding-top:16px;border-top:1px solid #eee">${newsletter.closing}</p>
        </div>
      </div>`;

    // Send via Resend (batch, max 100/day)
    const sendPromises = emails.slice(0, 95).map((email: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${churchName || 'ShepherdAI'} <support@shepherdaitech.com>`,
          to: [email],
          subject: `${month} Newsletter — ${churchName || 'Our Church'}`,
          html,
        }),
      })
    );

    const results = await Promise.allSettled(sendPromises);
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: succeeded,
      failed,
      total: emails.length,
    });
  } catch (error: any) {
    console.error('Send Newsletter Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send newsletter' }, { status: 500 });
  }
}

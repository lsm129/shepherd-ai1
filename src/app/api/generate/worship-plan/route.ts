import { recordGeneration } from '@/lib/quota';
import { requireAuthAndQuota } from '@/lib/auth-middleware';
import { earnPoints } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';
import { getChurchProfile, buildAISystemPrompt, getUserHabits } from '@/lib/ai-with-profile';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';

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

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseURL, model } = getAIConfig();
    if (!apiKey) return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });

    const body = await request.json();
    const { theme, tradition, duration, season, sermonTopic, specialOccasion, userId } = body;

    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!theme && !sermonTopic) return NextResponse.json({ error: 'Theme or sermon topic required' }, { status: 400 });

    // Verify user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user) return NextResponse.json({ error: 'Invalid user' }, { status: 401 });

    const userRole = user.user_metadata?.role || 'pastor';
    if (userRole === 'congregant') {
      return NextResponse.json({ error: 'Only pastors can access this feature' }, { status: 403 });
    }

    // Check quota
    const auth = await requireAuthAndQuota(request, userId);
    if (auth.error) return auth.error;

    // Get church profile
    const churchProfile = userId ? await getChurchProfile(userId) : null;
    const habitsContext = userId ? await getUserHabits(userId) : '';

    const traditionLabels: Record<string, string> = {
      baptist: 'Baptist', methodist: 'Methodist', presbyterian: 'Presbyterian',
      lutheran: 'Lutheran', pentecostal: 'Pentecostal', non_denominational: 'Non-Denominational',
      anglican: 'Anglican/Episcopal', catholic: 'Catholic', other: 'Christian',
    };
    const seasonLabels: Record<string, string> = {
      ordinary: 'Ordinary Time', advent: 'Advent', christmas: 'Christmas',
      lent: 'Lent', easter: 'Easter', pentecost: 'Pentecost',
    };

    const basePrompt = `You are an expert worship planning AI assistant for churches. You create comprehensive, spiritually rich, and well-organized Sunday worship service plans that follow the traditions and practices of the specified denomination.`;
    const systemPrompt = buildAISystemPrompt(basePrompt, churchProfile, habitsContext);

    const userPrompt = `Create a complete Sunday worship service plan with the following details:

**Sermon Topic:** ${sermonTopic || 'Not specified'}
**Service Theme:** ${theme || 'Aligned with sermon topic'}
**Church Tradition:** ${traditionLabels[tradition] || 'Non-Denominational'}
**Total Duration:** ${duration} minutes
**Liturgical Season:** ${seasonLabels[season] || 'Ordinary Time'}
**Special Occasion:** ${specialOccasion || 'None'}

Generate a COMPLETE worship plan in this JSON format:
{
  "title": "Descriptive title for this service",
  "theme": "Core theme",
  "total_duration": ${duration},
  "tradition": "${traditionLabels[tradition] || 'Non-Denominational'}",
  "segments": [
    {"name": "Prelude", "duration": 3, "leader": "Organist/Pianist", "notes": "Opening music", "scripture_ref": ""},
    {"name": "Call to Worship", "duration": 2, "leader": "Pastor", "notes": "Opening words", "scripture_ref": "Psalm 100:1-2"},
    {"name": "Opening Hymn", "duration": 4, "leader": "Congregation", "notes": "Song selection", "scripture_ref": ""},
    {"name": "Invocation", "duration": 2, "leader": "Pastor", "notes": "Opening prayer", "scripture_ref": ""},
    {"name": "Scripture Reading", "duration": 3, "leader": "Lay Reader", "notes": "Old Testament reading", "scripture_ref": ""},
    {"name": "Congregational Prayer", "duration": 5, "leader": "Pastor/Congregation", "notes": "Pastoral prayer time", "scripture_ref": ""},
    {"name": "Special Music", "duration": 4, "leader": "Choir/Soloist", "notes": "Anthem or special song", "scripture_ref": ""},
    {"name": "Scripture Reading", "duration": 3, "leader": "Lay Reader", "notes": "New Testament reading", "scripture_ref": ""},
    {"name": "Sermon", "duration": 25, "leader": "Pastor", "notes": "Main message", "scripture_ref": ""},
    {"name": "Response Hymn", "duration": 3, "leader": "Congregation", "notes": "Response to sermon", "scripture_ref": ""},
    {"name": "Offertory", "duration": 3, "leader": "Deacon/Usher", "notes": "Tithes and offerings", "scripture_ref": ""},
    {"name": "Doxology", "duration": 1, "leader": "Congregation", "notes": "Praise God from whom all blessings flow", "scripture_ref": ""},
    {"name": "Benediction", "duration": 2, "leader": "Pastor", "notes": "Closing blessing", "scripture_ref": ""},
    {"name": "Postlude", "duration": 2, "leader": "Organist/Pianist", "notes": "Closing music", "scripture_ref": ""}
  ],
  "pastoral_notes": "Notes for the pastor about flow, transitions, and special considerations",
  "scripture_readings": ["Reading 1 reference with brief description", "Reading 2 reference", "Reading 3 reference"],
  "hymn_suggestions": ["Hymn 1 — reason for selection", "Hymn 2 — reason", "Hymn 3 — reason", "Hymn 4 — reason"],
  "prayer_points": ["Prayer focus 1", "Prayer focus 2", "Prayer focus 3", "Prayer focus 4"]
}

IMPORTANT: 
- Adjust the number and type of segments to match the church tradition (e.g., Catholic includes Liturgy of the Eucharist, Pentecostal includes extended worship/prayer time)
- Total duration of all segments MUST add up to approximately ${duration} minutes
- Include appropriate scripture references for a ${seasonLabels[season] || 'Ordinary Time'} service
- Make hymn/song suggestions appropriate to the tradition (hymns for liturgical, contemporary for non-denominational, etc.)
- If special occasion is specified, incorporate it naturally into the service flow`;

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

    // Save generation record
    if (userId) {
      await recordGeneration(userId, 'worship_plan', `Worship Plan: ${theme || sermonTopic}`);
      await earnPoints(userId, 'generate_sermon').catch(e => console.error('Points error:', e));
    }

    // Save to worship_plans table
    try {
      await supabaseAdmin.from('worship_plans').insert({
        user_id: userId,
        title: parsed.title,
        theme: parsed.theme,
        tradition: tradition,
        total_duration: parsed.total_duration || duration,
        segments: parsed.segments,
        pastoral_notes: parsed.pastoral_notes,
        scripture_readings: parsed.scripture_readings,
        hymn_suggestions: parsed.hymn_suggestions,
        prayer_points: parsed.prayer_points,
        is_template: false,
      }).then(() => {}).catch(() => {});
    } catch (e) {}

    return NextResponse.json({ success: true, nearLimit: auth.nearLimit, plan: parsed });
  } catch (error: any) {
    console.error('Worship Plan Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate worship plan' }, { status: 500 });
  }
}

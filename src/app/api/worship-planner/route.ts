import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';

const TRADITION_LABELS: Record<string, string> = {
  'baptist': 'Baptist',
  'methodist': 'Methodist (United Methodist)',
  'presbyterian': 'Presbyterian (PCUSA)',
  'lutheran': 'Lutheran (ELCA)',
  'anglican': 'Anglican/Episcopal',
  'pentecostal': 'Pentecostal/Assemblies of God',
  'non-denominational': 'Non-Denominational/Evangelical',
  'catholic': 'Roman Catholic',
  'orthodox': 'Eastern Orthodox',
  'reformed': 'Reformed (CRC/PCA)',
  'nazarene': 'Church of the Nazarene',
  'adventist': 'Seventh-day Adventist',
  'charismatic': 'Charismatic',
  'other': 'Other Christian tradition',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme, tradition, duration, action, planId, planData, userId } = body;

    // Handle different actions
    if (action === 'save') {
      return await savePlan(planData, userId);
    }
    if (action === 'load') {
      return await loadPlans(userId);
    }
    if (action === 'update') {
      return await updatePlan(planId, planData, userId);
    }
    if (action === 'delete') {
      return await deletePlan(planId, userId);
    }

    // Default: Generate worship plan with AI
    if (!theme) {
      return NextResponse.json({ error: 'Sermon theme is required' }, { status: 400 });
    }

    const traditionLabel = TRADITION_LABELS[tradition] || tradition || 'Non-Denominational/Evangelical';
    const totalMinutes = duration || 75;

    const systemPrompt = `You are an expert worship planner and liturgist with deep knowledge of Christian worship traditions across denominations. You create detailed, meaningful worship service orders that are biblically grounded, theologically sound, and culturally sensitive. You must respond with valid JSON only, no markdown, no code blocks.`;

    const userPrompt = `Generate a complete Sunday worship service order for the following:

- Sermon/Message Theme: ${theme}
- Church Tradition: ${traditionLabel}
- Total Service Duration: ${totalMinutes} minutes

Requirements:
1. Create a worship service flow appropriate for the ${traditionLabel} tradition
2. All segment durations must add up to exactly ${totalMinutes} minutes
3. Include segments that are typical for this tradition (e.g., ${tradition === 'catholic' || tradition === 'anglican' || tradition === 'orthodox' ? 'liturgical elements like Kyrie, Gloria, Sanctus, Eucharist' : 'call to worship, hymns, pastoral prayer, Scripture reading, sermon, offering, benediction'})
4. Each segment should have a meaningful name, realistic duration, appropriate leader role, and helpful notes (including Scripture references where applicable)
5. The flow should feel natural and spiritually cohesive around the theme "${theme}"

Return a JSON object with exactly this structure:
{
  "title": "A descriptive title for this worship service",
  "segments": [
    {
      "name": "Segment name (e.g., Call to Worship, Opening Hymn, etc.)",
      "duration": number (minutes, must be positive integer),
      "leader": "Role of the person leading this segment (e.g., Pastor, Worship Leader, Elder, Congregation, Choir, Liturgist)",
      "notes": "Helpful notes including Scripture references, hymn suggestions, or liturgical guidance specific to the theme and tradition"
    }
  ]
}

Ensure:
- Segments flow logically from gathering → praise → confession/repentance → Word → response → sending
- The sermon/message segment gets the largest time allocation (typically 25-35 minutes)
- Music segments are appropriately timed for the tradition
- ${tradition === 'catholic' || tradition === 'anglican' ? 'Include Eucharist/Communion as a significant segment' : 'Include offering and announcements if typical for this tradition'}
- Notes are specific and actionable, not generic`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek error:', response.status, err);
      return NextResponse.json({ error: 'Failed to generate worship plan' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ plan: result });
  } catch (error) {
    console.error('Worship planner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function savePlan(planData: any, userId: string) {
  if (!userId || !planData) {
    return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/worship_plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        title: planData.title,
        theme: planData.theme,
        tradition: planData.tradition,
        total_duration: planData.total_duration,
        segments: planData.segments,
        is_template: planData.is_template || false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase save error:', err);
      return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 });
    }

    const saved = await res.json();
    return NextResponse.json({ success: true, plan: saved[0] });
  } catch (error) {
    console.error('Save plan error:', error);
    return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 });
  }
}

async function loadPlans(userId: string) {
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/worship_plans?user_id=eq.${userId}&order=created_at.desc&limit=50`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase load error:', err);
      return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 });
    }

    const plans = await res.json();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Load plans error:', error);
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 });
  }
}

async function updatePlan(planId: string, planData: any, userId: string) {
  if (!planId || !userId || !planData) {
    return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/worship_plans?id=eq.${planId}&user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        title: planData.title,
        theme: planData.theme,
        tradition: planData.tradition,
        total_duration: planData.total_duration,
        segments: planData.segments,
        is_template: planData.is_template,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase update error:', err);
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    const updated = await res.json();
    return NextResponse.json({ success: true, plan: updated[0] });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

async function deletePlan(planId: string, userId: string) {
  if (!planId || !userId) {
    return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/worship_plans?id=eq.${planId}&user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase delete error:', err);
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}

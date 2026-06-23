import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { requireAuthAndQuota } from '@/lib/auth-middleware';
import { recordGeneration } from '@/lib/quota';

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
}

function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';
  return { apiKey, baseURL: 'https://api.deepseek.com', model: 'deepseek-chat' };
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseURL, model } = getDeepSeekConfig();
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API key is not configured.' }, { status: 500 });
    }

    const body = await request.json();
    const { scripture, theme, tradition, focus, userId, action, planId, planData } = body;

    // Handle save/load actions (use worship_plans table with type='sermon')
    if (action === 'save') return await saveSermon(planData, userId);
    if (action === 'load') return await loadSermons(userId);

    // Auth + Quota check
    const auth = await requireAuthAndQuota(request, userId);
    if (auth.error) return auth.error;

    const effectiveUserId = auth.userId || userId;
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 });
    }

    if (!scripture && !theme) {
      return NextResponse.json({ error: 'Scripture passage or sermon theme is required' }, { status: 400 });
    }

    const traditionLabel = tradition || 'Non-Denominational/Evangelical';

    const systemPrompt = `You are an expert sermon preparation assistant with deep biblical scholarship, theological training, and pastoral experience across all Christian traditions. You help pastors craft biblically faithful, engaging, and applicable sermons. You must respond with valid JSON only, no markdown, no code blocks.`;

    const userPrompt = `Generate a comprehensive sermon preparation package for the following:

- Scripture Passage: ${scripture || 'To be determined based on theme'}
- Sermon Theme: ${theme || 'Derived from the scripture passage'}
- Church Tradition: ${traditionLabel}
- Congregation Focus: ${focus || 'General congregation'}

Please generate a complete sermon prep package with ALL of the following sections:

1. SCRIPTURE ANALYSIS - Historical/cultural context, 2-3 key Greek/Hebrew word studies, 3-4 cross-references
2. SERMON OUTLINE - One clear main point, 3-4 main points with sub-points, transitions
3. ILLUSTRATIONS & STORIES - 2 modern, 1 historical, personal story suggestions
4. APPLICATION POINTS - 3 for general congregation, 1 for leaders, 1 for new believers
5. PRAYER FOCUS - Opening prayer themes and pastoral prayer suggestions

Return JSON: {"title":"...","mainPoint":"...","scriptureAnalysis":{"context":"...","wordStudies":[{"word":"...","transliteration":"...","meaning":"...","significance":"..."}],"crossReferences":[{"reference":"...","connection":"..."}]},"outline":[{"point":"...","subpoints":["..."],"transition":"..."}],"illustrations":[{"type":"modern/historical/personal","title":"...","story":"...","connection":"..."}],"applications":[{"audience":"...","action":"...","scriptureTie":"..."}],"prayerFocus":{"opening":"...","pastoral":"..."}}`;

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek error:', response.status, err);
      return NextResponse.json({ error: 'Failed to generate sermon preparation' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content.substring(0, 500));
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    await recordGeneration(effectiveUserId, 'sermon-prep', `${scripture || theme} - ${traditionLabel}`);

    return NextResponse.json({ sermon: result });
  } catch (error) {
    console.error('Sermon prep error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Save/load using worship_plans table with sermon data in segments field
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';

async function saveSermon(planData: any, userId: string) {
  if (!userId || !planData) return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
  try {
    const supabase = createClient(supabaseUrl, getServiceRoleKey());
    // Store in sermon_preps table if it exists, otherwise in worship_plans
    const { data, error } = await supabase.from('sermon_preps').insert({
      user_id: userId,
      title: planData.title,
      scripture: planData.scripture,
      theme: planData.theme,
      tradition: planData.tradition,
      sermon_data: planData.sermon_data,
    }).select('id').single();

    if (error) {
      // Fallback: store in worship_plans with segments containing sermon data
      const { data: wpData, error: wpError } = await supabase.from('worship_plans').insert({
        user_id: userId,
        title: `[Sermon] ${planData.title}`,
        theme: planData.scripture || planData.theme,
        tradition: planData.tradition,
        total_duration: 0,
        segments: planData.sermon_data,
        is_template: false,
      }).select('id').single();
      if (wpError) throw wpError;
      return NextResponse.json({ success: true, id: wpData.id });
    }
    return NextResponse.json({ success: true, id: data.id });
  } catch (e: any) {
    console.error('Save sermon error:', e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

async function loadSermons(userId: string) {
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  try {
    const supabase = createClient(supabaseUrl, getServiceRoleKey());
    // Try sermon_preps first
    const { data, error } = await supabase.from('sermon_preps')
      .select('id, title, scripture, theme, tradition, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // Fallback: load from worship_plans with [Sermon] prefix
      const { data: wpData, error: wpError } = await supabase.from('worship_plans')
        .select('id, title, theme, tradition, created_at')
        .eq('user_id', userId)
        .like('title', '[Sermon]%')
        .order('created_at', { ascending: false })
        .limit(50);
      if (wpError) throw wpError;
      const sermons = (wpData || []).map((wp: any) => ({
        id: wp.id,
        title: wp.title.replace('[Sermon] ', ''),
        scripture: wp.theme,
        theme: wp.theme,
        tradition: wp.tradition,
        created_at: wp.created_at,
      }));
      return NextResponse.json({ sermons });
    }
    return NextResponse.json({ sermons: data || [] });
  } catch (e: any) {
    console.error('Load sermons error:', e);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

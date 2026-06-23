import { recordGeneration, checkQuota } from '@/lib/quota';
import { requireAuthAndQuota } from '@/lib/auth-middleware';
import { earnPoints } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';
import { getChurchProfile, buildAISystemPrompt, getUserHabits } from '@/lib/ai-with-profile';
import { supabaseUrl } from '@/lib/supabase-config';

function getAIConfig() {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (deepseekKey && deepseekKey !== 'your-deepseek-api-key') {
    return {
      apiKey: deepseekKey,
      baseURL: 'https://api.deepseek.com',
      model: 'deepseek-chat',
    };
  }

  if (openaiKey && openaiKey !== 'your-openai-api-key') {
    return {
      apiKey: openaiKey,
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    };
  }

  return { apiKey: '', baseURL: '', model: '' };
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseURL, model } = getAIConfig();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API key is not configured. Please add DEEPSEEK_API_KEY or OPENAI_API_KEY.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { topic, custom_topic, userId, forCongregant } = body;

    const actualTopic = custom_topic || topic || 'Faith';

    // Auth + Quota check
    // For congregants: use their pastor's userId for quota check (pastor pays for AI)
    let auth;
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8');
    
    // Look up the user to determine role
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Invalid user. Please log in again.' }, { status: 401 });
    }
    
    const userRole = user.user_metadata?.role || 'pastor';
    const isCongregant = userRole === 'congregant';
    
    if (isCongregant) {
      // Congregant — find their pastor's ID and use pastor's quota
      const joinedChurches: string[] = user.user_metadata?.joined_churches || [];
      if (joinedChurches.length === 0) {
        return NextResponse.json({ error: 'Please join a church first to use devotional.' }, { status: 403 });
      }
      const pastorId = joinedChurches[0];
      const quotaResult = await checkQuota(pastorId);
      if (!quotaResult.allowed) {
        return NextResponse.json({ error: 'AI generation limit reached for this church.', message: 'Your church has used all monthly AI generations. Ask your pastor to upgrade.', remaining: 0 }, { status: 429 });
      }
      auth = { authenticated: true, userId: pastorId, allowed: true, remaining: quotaResult.remaining, plan: quotaResult.plan, used: quotaResult.used, limit: quotaResult.limit, nearLimit: quotaResult.nearLimit };
    } else {
      // Pastor — use normal auth
      auth = await requireAuthAndQuota(request, userId);
      if (auth.error) return auth.error;
    }

    // Get church profile for personalized AI
    const churchProfile = userId ? await getChurchProfile(userId) : null;
    const habitsContext = userId ? await getUserHabits(userId) : '';

    const basePrompt = `You are an AI assistant helping a church pastor create a daily devotional.`;
    const systemPrompt = buildAISystemPrompt(basePrompt, churchProfile, habitsContext);

    const userPrompt = `Create a daily devotional on the topic: ${actualTopic}
Include a title, scripture verse, meditation, prayer, and practical application.
Return ONLY valid JSON: {"title": "...", "verse": {"reference": "...", "text": "..."}, "meditation": "...", "prayer": "...", "application": "..."}`;

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    // Record generation (free for congregants, no points deducted from pastor)
    if (auth.userId) {
      await recordGeneration(auth.userId, 'devotional', 'generated');
      // Only earn/deduct points for pastors, congregants use devotional for free
      if (!isCongregant) {
        await earnPoints(auth.userId, 'generate_prayer').catch(e => console.error('Points error:', e));
      }
    }

    return NextResponse.json({
      success: true,
      nearLimit: auth.nearLimit,
      title: parsed.title || '',
      verse: parsed.verse || { reference: '', text: '' },
      meditation: parsed.meditation || '',
      prayer: parsed.prayer || '',
      application: parsed.application || '',
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate devotional' }, { status: 500 });
  }
}

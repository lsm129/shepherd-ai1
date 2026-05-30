import { recordGeneration } from '@/lib/quota';
import { requireAuthAndQuota } from '@/lib/auth-middleware';
import { earnPoints } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';
import { getChurchProfile, buildAISystemPrompt, getUserHabits } from '@/lib/ai-with-profile';

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
    const { highlights, church_name, pastor_name, upcoming_events, prayer_requests, userId } = body;

    if (!highlights) {
      return NextResponse.json({ error: 'Highlights are required' }, { status: 400 });
    }

    // Auth + Quota check
    const auth = await requireAuthAndQuota(request, userId);
    if (auth.error) return auth.error;

    // Get church profile for personalized AI
    const churchProfile = userId ? await getChurchProfile(userId) : null;
    const habitsContext = userId ? await getUserHabits(userId) : '';

    const basePrompt = `You are an AI assistant helping a church pastor create a weekly newsletter.`;
    const systemPrompt = buildAISystemPrompt(basePrompt, churchProfile, habitsContext);

    const userPrompt = `Create a weekly newsletter based on these highlights: ${highlights}.${upcoming_events ? ` Upcoming events: ${upcoming_events}.` : ''}${prayer_requests ? ` Prayer requests: ${prayer_requests}.` : ''}
Include sections for: Welcome message, Highlights, Upcoming Events, Prayer Requests, Closing.
Return ONLY valid JSON.`;

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
    const newsletter = JSON.parse(content || '{}').newsletter || {};

    // Record generation and earn points
    if (auth.userId) {
      await recordGeneration(auth.userId, 'newsletter', JSON.stringify({ highlights }).substring(0, 200));
      await earnPoints(auth.userId, 'generate_other').catch(e => console.error('Points error:', e));
    }

    return NextResponse.json({ success: true, newsletter });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate newsletter' }, { status: 500 });
  }
}

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
    const { sermon_notes, church_name, userId } = body;

    if (!sermon_notes) {
      return NextResponse.json({ error: 'Sermon notes are required' }, { status: 400 });
    }

    // Auth + Quota check
    const auth = await requireAuthAndQuota(request, userId);
    if (auth.error) return auth.error;

    // Get church profile + user habits for personalized AI
    const churchProfile = userId ? await getChurchProfile(userId) : null;
    const habitsContext = userId ? await getUserHabits(userId) : '';

    const basePrompt = `You are an AI assistant helping a church pastor turn sermon notes into social media content.`;
    const systemPrompt = buildAISystemPrompt(basePrompt, churchProfile, habitsContext);

    const userPrompt = `Turn these sermon notes into social media content: ${sermon_notes}
Create posts for Facebook, Instagram, and Twitter/X.
Return ONLY valid JSON: {"facebook": {"post": "..."}, "instagram": {"caption": "...", "hashtags": "..."}, "twitter": {"tweet": "..."}}`;

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

    // Record generation and earn points
    if (auth.userId) {
      await recordGeneration(auth.userId, 'sermon_social', sermon_notes.substring(0, 200));
      await earnPoints(auth.userId, 'generate_sermon').catch(e => console.error('Points error:', e));
    }

    return NextResponse.json({
      success: true,
      facebook: parsed.facebook || { post: '' },
      instagram: parsed.instagram || { caption: '', hashtags: '' },
      twitter: parsed.twitter || { tweet: '' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate social media content' }, { status: 500 });
  }
}

import { checkQuota, recordGeneration } from '@/lib/quota';
import { earnPoints } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';

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
    const { name, request: prayerRequest, anonymous, userId } = body;

    if (!prayerRequest) {
      return NextResponse.json({ error: 'Prayer request content is required' }, { status: 400 });
    }

    const systemPrompt = `You are a compassionate Christian pastoral assistant. When someone submits a prayer request, you generate a warm, empathetic prayer response that includes a relevant Bible verse. Be encouraging and uplifting. Return as JSON: {"response": "prayer text", "verse": {"reference": "Book Chapter:Verse", "text": "verse text"}}`;

    const userPrompt = `Generate a warm prayer response for this prayer request${!anonymous && name ? ` from ${name}` : ''}: "${prayerRequest}". Include a relevant Bible verse that speaks to their situation. Return ONLY valid JSON.`;

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
    if (userId) {
      await recordGeneration(userId, 'prayer_response', prayerRequest.substring(0, 200));
      await earnPoints(userId, 'generate_prayer').catch(e => console.error('Points error:', e));
    }

    return NextResponse.json({
      success: true,
      response: parsed.response || '',
      verse: parsed.verse || { reference: '', text: '' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate prayer response' }, { status: 500 });
  }
}

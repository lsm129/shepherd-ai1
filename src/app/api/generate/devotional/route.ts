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
    const { topic, custom_topic, userId } = body;

    // Server-side quota check
    if (userId) {
      const quota = await checkQuota(userId);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            error: 'AI generation limit reached',
            message: `You have used all ${quota.limit} AI generations for this month on the ${quota.plan} plan. Upgrade your plan for more.`,
            upgradeUrl: '/settings#billing',
            remaining: quota.remaining,
          },
          { status: 429 }
        );
      }
    }


    const actualTopic = custom_topic || topic || 'Faith';

    const systemPrompt = `You are a devotional content creator for a Christian church. Create a daily devotional that includes a Bible verse, a meditation/reflection, and a closing prayer. Be spiritually enriching and practical. Return as JSON: {"title": "devotional title", "verse": {"reference": "Book Chapter:Verse", "text": "full verse text"}, "meditation": "meditation/reflection text", "prayer": "closing prayer", "application": "practical application for today"}`;

    const userPrompt = `Create a daily devotional on the topic of "${actualTopic}". Include: 1) A relevant Bible verse with its reference, 2) A thoughtful meditation on the verse and topic, 3) A practical application, 4) A closing prayer. Return ONLY valid JSON.`;

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
      await recordGeneration(userId, 'devotional', actualTopic.substring(0, 200));
      await earnPoints(userId, 'generate_prayer').catch(e => console.error('Points error:', e));
    }

    return NextResponse.json({
      success: true,
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

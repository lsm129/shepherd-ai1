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
    const { highlights, church_name, pastor_name, upcoming_events, prayer_requests, userId } = body;

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


    if (!highlights) {
      return NextResponse.json({ error: 'Highlights are required' }, { status: 400 });
    }

    const systemPrompt = `You are an AI assistant helping a church pastor create a weekly newsletter. 
The church name is ${church_name || 'our church'} and the pastor is ${pastor_name || 'our pastor'}.
Create a warm, engaging newsletter that feels personal and community-focused.
Return as JSON: {"newsletter": {"title": "Newsletter Title", "content": "Full newsletter content with sections"}}`;

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
    if (userId) {
      await recordGeneration(userId, 'newsletter', JSON.stringify({ highlights }).substring(0, 200));
      await earnPoints(userId, 'generate_other').catch(e => console.error('Points error:', e));
    }

    return NextResponse.json({ success: true, newsletter });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate newsletter' }, { status: 500 });
  }
}

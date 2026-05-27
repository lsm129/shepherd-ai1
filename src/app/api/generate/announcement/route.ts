import { checkQuota, recordGeneration } from '@/lib/quota';
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
    const { key_points, announcement_type, church_name } = body;

    if (!key_points) {
      return NextResponse.json({ error: 'Key points are required' }, { status: 400 });
    }

    const typeLabels: Record<string, string> = {
      sunday: 'Sunday Service Announcement',
      special: 'Special Event Announcement',
      urgent: 'Urgent Notice',
    };

    const typeName = typeLabels[announcement_type] || 'Church Announcement';

    const systemPrompt = `You are a church communications assistant. Create formal, clear, and welcoming church announcements. The tone should be warm but professional. Return as JSON: {"title": "announcement title", "content": "full announcement text", "summary": "brief one-line summary"}`;

    const userPrompt = `Create a ${typeName} for ${church_name || 'our church'} based on these key points: "${key_points}". The announcement type is: ${typeName}. Make it clear, welcoming, and appropriate for church communications. Return ONLY valid JSON.`;

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

    return NextResponse.json({
      success: true,
      title: parsed.title || '',
      content: parsed.content || '',
      summary: parsed.summary || '',
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate announcement' }, { status: 500 });
  }
}

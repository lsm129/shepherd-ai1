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
    const { sermon_notes, church_name } = body;

    if (!sermon_notes) {
      return NextResponse.json({ error: 'Sermon notes are required' }, { status: 400 });
    }

    const systemPrompt = `You are a social media content creator for a church. Transform sermon notes into engaging social media posts. Return as JSON: {"facebook": {"post": "full facebook post text"}, "instagram": {"caption": "instagram caption with emojis", "hashtags": "#tag1 #tag2 #tag3"}, "twitter": {"tweet": "tweet within 280 characters"}}`;

    const userPrompt = `Transform these sermon notes into social media content for ${church_name || 'our church'}: "${sermon_notes}". Create: 1) A Facebook post (engaging, community-focused), 2) An Instagram caption with relevant hashtags, 3) A Twitter/X tweet (under 280 chars). Return ONLY valid JSON.`;

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
      facebook: parsed.facebook || { post: '' },
      instagram: parsed.instagram || { caption: '', hashtags: '' },
      twitter: parsed.twitter || { tweet: '' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate social media content' }, { status: 500 });
  }
}

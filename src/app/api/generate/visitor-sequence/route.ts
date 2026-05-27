import { NextRequest, NextResponse } from 'next/server';

function getAIConfig() {
  // Prefer DeepSeek (cheaper), fallback to OpenAI
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
    const { name, first_visit_date, how_heard, interests, church_name, pastor_name } = body;

    if (!name || !first_visit_date) {
      return NextResponse.json({ error: 'Name and first visit date are required' }, { status: 400 });
    }

    const systemPrompt = `You are an AI assistant helping a church pastor create personalized email sequences for new visitors. 
The church name is ${church_name || 'our church'} and the pastor is ${pastor_name || 'our pastor'}.
Generate a 6-week email sequence. Each email should be warm, welcoming, and include the visitor's name.
Return as JSON: {"emails": [{"week": 1, "subject": "Subject", "body": "Body"}...6 emails]}`;

    const userPrompt = `Create a 6-week follow-up email sequence for ${name}, first visit: ${first_visit_date}.${how_heard ? ` How they heard: ${how_heard}.` : ''}${interests ? ` Interests: ${interests}.` : ''}
Week 1: Welcome immediately, Week 2: Check-in, Week 3: Community story, Week 4: Event invite, Week 5: Testimony, Week 6: Personal invite.
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
    const emails = JSON.parse(content || '{"emails": []}').emails || [];

    return NextResponse.json({ success: true, emails, visitor: { name, first_visit_date, how_heard, interests } });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate email sequence' }, { status: 500 });
  }
}

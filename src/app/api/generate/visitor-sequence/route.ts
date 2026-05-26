import { NextRequest, NextResponse } from 'next/server';

function isOpenAIConfigured() {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key';
}

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    // 动态导入以避免构建时错误
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    const emails = JSON.parse(content || '{"emails": []}').emails || [];

    return NextResponse.json({ success: true, emails, visitor: { name, first_visit_date, how_heard, interests } });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate email sequence' }, { status: 500 });
  }
}

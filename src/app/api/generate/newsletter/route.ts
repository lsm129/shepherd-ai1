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
    const { week_date, sermon_title, sermon_notes, upcoming_events, prayer_requests, announcements, other_notes, church_name } = body;

    if (!week_date) {
      return NextResponse.json({ error: 'Week date is required' }, { status: 400 });
    }

    const systemPrompt = `You are an AI assistant helping a church pastor create weekly newsletters.
Create professional, warm newsletters. The church name is ${church_name || 'our church'}.
Include: warm greeting, sermon summary, upcoming events, prayer requests, announcements, and warm closing.`;

    const userPrompt = `Create a weekly church newsletter for week of ${week_date}.
${sermon_title ? `Sermon Title: ${sermon_title}` : ''}
${sermon_notes ? `Sermon Notes: ${sermon_notes}` : ''}
${upcoming_events ? `Events: ${upcoming_events}` : ''}
${prayer_requests ? `Prayer Requests: ${prayer_requests}` : ''}
${announcements ? `Announcements: ${announcements}` : ''}
${other_notes ? `Other: ${other_notes}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '';

    return NextResponse.json({ success: true, content, input: { week_date, sermon_title, sermon_notes, upcoming_events, prayer_requests, announcements, other_notes } });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate newsletter' }, { status: 500 });
  }
}

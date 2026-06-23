import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { actions, churchName, visitorName } = await req.json();

    if (!actions || actions.length === 0) {
      return NextResponse.json({ error: 'No actions selected' }, { status: 400 });
    }

    const prompt = `You are a church ministry consultant. Create a personalized visitor follow-up plan for "${churchName}".

The visitor's name is "${visitorName}".

The pastor has selected these follow-up actions:
${actions.map((a: string) => `- ${a}`).join('\n')}

Create a practical, step-by-step follow-up plan that includes:

1. **Timeline Overview** — When each action should happen (specific days/weeks)
2. **Email Templates** — Write 2-3 ready-to-send email templates for the most important touchpoints. Use [Visitor Name] and [Church Name] as placeholders.
3. **Phone Call Scripts** — Brief talking points for any phone calls
4. **Tips** — 2-3 practical tips for making the follow-up feel genuine, not salesy

Keep it warm, personal, and practical. The tone should be caring and pastoral, not corporate. Write in clear, simple English. Keep the total response under 800 words.`;

    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek error:', err);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No result generated.';

    return NextResponse.json({ content });
  } catch (e) {
    console.error('free-visitor-plan error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

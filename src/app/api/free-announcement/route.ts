import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';
const DEEPSEEK_API_KEY = 'sk-71801031b9fe4089ace9b695e5787d3f';

export async function POST(req: NextRequest) {
  try {
    const { eventName, eventDate, eventDescription, tone } = await req.json();

    if (!eventName || !eventDate) {
      return NextResponse.json({ error: 'Event name and date are required' }, { status: 400 });
    }

    const toneMap: Record<string, string> = {
      formal: 'formal and reverent',
      casual: 'warm and friendly',
      enthusiastic: 'enthusiastic and uplifting',
      inspirational: 'inspirational and encouraging'
    };
    const toneDesc = toneMap[tone] || 'warm and welcoming';

    const prompt = `You are a professional church communications assistant. Write a church announcement for the following event:

Event Name: ${eventName}
Event Date: ${eventDate}
Description: ${eventDescription || 'No additional details provided'}
Tone: ${toneDesc}

Requirements:
- Write 2 versions: one short (2-3 sentences, for bulletin) and one long (1 paragraph, for newsletter/website)
- Include a warm invitation that makes newcomers feel welcome
- Keep it authentic and genuine, not generic
- Do not use emoji
- End with a brief encouragement or blessing

Format your response as:
SHORT:
[short version]

LONG:
[long version]`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek error:', err);
      return NextResponse.json({ error: 'Failed to generate announcement' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Track usage in Supabase (anonymous, just for analytics)
    try {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await fetch(`${SUPABASE_URL}/rest/v1/free_tool_usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          tool_type: 'announcement',
          ip_address: ip,
          created_at: new Date().toISOString()
        })
      });
    } catch {}

    return NextResponse.json({ result: content });
  } catch (error) {
    console.error('Free announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

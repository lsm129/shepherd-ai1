import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';
const DEEPSEEK_API_KEY = 'sk-71801031b9fe4089ace9b695e5787d3f';

export async function POST(req: NextRequest) {
  try {
    const { churchName, serviceDate, sermonTitle, scripture, announcements } = await req.json();

    if (!churchName || !serviceDate) {
      return NextResponse.json({ error: 'Church name and service date are required' }, { status: 400 });
    }

    const formattedDate = new Date(serviceDate + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const prompt = `You are a professional church communications director. Create a beautifully formatted, print-ready weekly church bulletin for the following service:

Church Name: ${churchName}
Service Date: ${formattedDate}
Sermon Title: ${sermonTitle || 'To Be Announced'}
Scripture Reading: ${scripture || 'To Be Announced'}
Announcements & Events: ${announcements || 'No announcements this week'}

Requirements:
- Format this as a complete, print-ready Sunday bulletin
- Include a warm welcome message at the top (2-3 sentences)
- Include an Order of Service section with typical elements: Call to Worship, Hymns, Prayer, Scripture Reading, Sermon, Offering, Closing Hymn, Benediction
- If sermon title and scripture are provided, incorporate them naturally into the order of service
- Include an Announcements section formatting the provided announcements nicely (add bullet points, dates, times)
- If no announcements provided, include a gentle "Stay Connected" section instead with placeholders for small groups, prayer requests, and contact info
- Add a brief closing thought or weekly verse (pick something encouraging if no scripture was provided)
- Use clean formatting with clear section headers using lines or dividers
- Do not use emoji
- Keep the tone warm, welcoming, and reverent
- Format for easy reading and printing (consider half-page or full-page layout)`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek error:', err);
      return NextResponse.json({ error: 'Failed to generate bulletin' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Track usage in Supabase
    try {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await fetch(`${SUPABASE_URL}/rest/v1/free_tool_usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          tool_type: 'bulletin',
          ip_address: ip,
          created_at: new Date().toISOString(),
        }),
      });
    } catch {}

    return NextResponse.json({ result: content });
  } catch (error) {
    console.error('Free bulletin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

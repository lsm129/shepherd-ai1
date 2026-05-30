import { recordGeneration } from '@/lib/quota';
import { requireAuthAndQuota } from '@/lib/auth-middleware';
import { earnPoints } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';
import { getChurchProfile, buildAISystemPrompt } from '@/lib/ai-with-profile';

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
    const { name, first_visit_date, how_heard, interests, church_name, pastor_name, userId } = body;

    if (!name || !first_visit_date) {
      return NextResponse.json({ error: 'Name and first visit date are required' }, { status: 400 });
    }

    // Auth + Quota check
    const auth = await requireAuthAndQuota(request, userId);
    if (auth.error) return auth.error;

    // Get church profile for personalized AI
    const churchProfile = userId ? await getChurchProfile(userId) : null;

    const basePrompt = `You are an AI assistant helping a church pastor create personalized email sequences for new visitors.`;
    const systemPrompt = buildAISystemPrompt(basePrompt, churchProfile);

    // Supplement church_name and pastor_name from profile if not provided
    const effectiveChurchName = church_name || churchProfile?.church_name || 'our church';
    const effectivePastorName = pastor_name || churchProfile?.pastor_name || 'our pastor';

    const userPrompt = `Create a 6-week follow-up email sequence for ${name}, first visit: ${first_visit_date}.${how_heard ? ` How they heard: ${how_heard}.` : ''}${interests ? ` Interests: ${interests}.` : ''} The church name is ${effectiveChurchName} and the pastor is ${effectivePastorName}.
Week 1: Welcome immediately, Week 2: Check-in, Week 3: Community story, Week 4: Event invite, Week 5: Testimony, Week 6: Personal invite.
Return ONLY valid JSON: {"emails": [{"week": 1, "subject": "Subject", "body": "Body"}...6 emails]}`;

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

    // Record generation and earn points
    if (auth.userId) {
      await recordGeneration(auth.userId, 'visitor_followup', JSON.stringify({ name, first_visit_date }).substring(0, 200));
      await earnPoints(auth.userId, 'generate_other').catch(e => console.error('Points error:', e));
    }

    return NextResponse.json({ success: true, emails, visitor: { name, first_visit_date, how_heard, interests } });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate email sequence' }, { status: 500 });
  }
}

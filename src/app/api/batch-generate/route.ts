import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkQuota, recordGeneration } from '@/lib/quota';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


const supabaseUrl = (supabaseUrl);
const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sermonNotes, platforms, count = 5, tone, language } = body;

    if (!userId || !sermonNotes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check quota
    const quotaResult = await checkQuota(userId);
    if (!quotaResult.allowed) {
      return NextResponse.json({
        error: 'AI generation limit reached',
        message: `You have used all ${quotaResult.limit} AI generations this month. Upgrade your plan for more.`,
        remaining: 0,
      }, { status: 429 });
    }

    // Get user habits for personalized content
    const { data: habits } = await supabaseAdmin
      .from('ai_habits')
      .select('habit_type, habit_value, frequency')
      .eq('user_id', userId)
      .order('frequency', { ascending: false })
      .limit(10);

    const habitContext = habits && habits.length > 0
      ? `\nUser preferences based on past behavior: ${habits.map((h: any) => `${h.habit_type}: ${h.habit_value}`).join(', ')}`
      : '';

    const platformList = platforms?.join(', ') || 'Facebook, Instagram, Twitter/X, Email';
    const lang = language === 'zh' ? 'Chinese' : 'English';

    const prompt = `You are a church content creator. Based on the sermon notes below, generate ${count} social media posts for these platforms: ${platformList}.

Sermon Notes:
${sermonNotes}

${habitContext}

Tone: ${tone || 'warm, encouraging, pastoral'}
Language: ${lang}

For each post, provide:
- platform: the target platform
- content: the post text (respect platform limits: Twitter 280 chars, Instagram 2200, Facebook 300, Email 5000)
- hashtags: relevant hashtags (3-5)

Return a JSON array of objects. Example:
[{"platform":"Twitter","content":"...","hashtags":["#faith","#church"]}]

Only return the JSON array, no other text.`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error: ${errText}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '[]';

    // Parse JSON from AI response
    let posts: any[] = [];
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      posts = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      posts = [{ platform: 'General', content: aiContent, hashtags: [] }];
    }

    // Record generation (1 deduction per batch)
    await recordGeneration(userId, 'batch_content', `Batch: ${posts.length} posts from sermon`);

    return NextResponse.json({
      success: true,
      posts,
      remaining: quotaResult.remaining,
    });
  } catch (error: any) {
    console.error('Batch generation error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAIConfig() {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (deepseekKey && deepseekKey !== 'your-deepseek-api-key') {
    return { apiKey: deepseekKey, baseURL: 'https://api.deepseek.com', model: 'deepseek-chat' };
  }
  if (openaiKey && openaiKey !== 'your-openai-api-key') {
    return { apiKey: openaiKey, baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
  }
  return { apiKey: '', baseURL: '', model: '' };
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseURL, model } = getAIConfig();
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    const body = await request.json();
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const supabaseUrl = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gather user activity data
    const [genResult, chatResult, profileResult] = await Promise.all([
      supabase.from('generations').select('tool_type, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('chat_messages').select('role, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.auth.admin.getUserById(userId),
    ]);

    const generations = genResult.data || [];
    const chatMessages = chatResult.data || [];
    const userMeta = profileResult.data?.user?.user_metadata || {};

    // Count usage by tool
    const toolCounts: Record<string, number> = {};
    generations.forEach((g: any) => {
      toolCounts[g.tool_type] = (toolCounts[g.tool_type] || 0) + 1;
    });

    // Build context for AI
    const usageSummary = Object.entries(toolCounts).map(([k, v]) => `${k}: ${v} times`).join(', ');
    const recentActivity = generations.slice(0, 5).map((g: any) => `${g.tool_type} on ${new Date(g.created_at).toLocaleDateString()}`).join('; ');
    const denomLabel = userMeta.denomination || 'unknown';
    const sizeLabel = userMeta.congregation_size || 'unknown';

    const systemPrompt = 'You are a proactive church AI advisor. Based on usage patterns, you suggest what the church should do next. Respond with valid JSON only.';

    const userPrompt = `Based on this church's activity:
- Denomination: ${denomLabel}, Size: ${sizeLabel}
- Tool usage: ${usageSummary || 'No usage yet'}
- Recent activity: ${recentActivity || 'No recent activity'}
- Chat messages: ${chatMessages.length} messages

Generate 3 personalized proactive suggestions. Return JSON:
{
  "suggestions": [
    {
      "type": "action" | "tip" | "insight",
      "icon": "single emoji",
      "title": "short title (5-8 words)",
      "description": "1-2 sentences specific to their usage pattern",
      "actionUrl": "/visitor-followup" or "/sermon-social" etc,
      "priority": "high" | "medium" | "low"
    }
  ]
}

Rules: If they haven't used a tool, suggest trying it. If they use one tool a lot, suggest complementary tools. Be specific to their denomination and size.`;

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) return NextResponse.json({ error: 'AI failed' }, { status: 500 });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      return NextResponse.json({ suggestions: [] });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

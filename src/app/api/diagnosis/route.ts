import { NextRequest, NextResponse } from 'next/server';

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

const DENOMINATION_LABELS: Record<string, string> = {
  'baptist': 'Baptist', 'methodist': 'Methodist', 'lutheran': 'Lutheran',
  'presbyterian': 'Presbyterian', 'pentecostal': 'Pentecostal/Assemblies of God',
  'catholic': 'Roman Catholic', 'anglican': 'Anglican/Episcopal',
  'non-denominational': 'Non-Denominational', 'orthodox': 'Eastern Orthodox',
  'adventist': 'Seventh-day Adventist', 'reformed': 'Reformed',
  'nazarene': 'Church of the Nazarene', 'other': 'Other',
};
const SIZE_LABELS: Record<string, string> = {
  'small': 'Small (under 50)', 'medium': 'Medium (50-200)',
  'large': 'Large (200-500)', 'mega': 'Mega (500+)',
};
const STYLE_LABELS: Record<string, string> = {
  'traditional': 'Traditional', 'contemporary': 'Contemporary',
  'blended': 'Blended', 'charismatic': 'Charismatic', 'high-church': 'High Church',
};

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseURL, model } = getAIConfig();
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    const body = await request.json();
    const { denomination, congregation_size, worship_style } = body;
    if (!denomination || !congregation_size || !worship_style)
      return NextResponse.json({ error: 'Missing profile data' }, { status: 400 });

    const denomLabel = DENOMINATION_LABELS[denomination] || denomination;
    const sizeLabel = SIZE_LABELS[congregation_size] || congregation_size;
    const styleLabel = STYLE_LABELS[worship_style] || worship_style;

    const systemPrompt = 'You are an expert church consultant and AI strategist. You analyze church profiles and generate personalized diagnostic reports. You must respond with valid JSON only, no markdown, no code blocks.';

    const userPrompt = `Generate a church AI diagnostic report for this profile:
- Denomination: ${denomLabel}
- Congregation Size: ${sizeLabel}
- Worship Style: ${styleLabel}

Return a JSON object with exactly this structure:
{
  "summary": "A 2-3 sentence personalized assessment of how AI can transform this church",
  "scores": {
    "visitor_engagement": number 1-10,
    "communication": number 1-10,
    "worship_planning": number 1-10,
    "community_outreach": number 1-10,
    "pastoral_care": number 1-10,
    "admin_efficiency": number 1-10
  },
  "modules": [
    {
      "id": "visitor-followup",
      "title": "Visitor Follow-up System",
      "icon": "handshake",
      "status": "free",
      "score": number 1-10,
      "finding": "1-2 sentence diagnosis specific to this denomination and size",
      "recommendation": "1-2 sentence specific action plan"
    },
    {
      "id": "sermon-social",
      "title": "Sermon to Social Media",
      "icon": "megaphone",
      "status": "free",
      "score": number 1-10,
      "finding": "...",
      "recommendation": "..."
    },
    {
      "id": "weekly-newsletter",
      "title": "Weekly Newsletter",
      "icon": "mail",
      "status": "locked",
      "score": number 1-10,
      "finding": "...",
      "recommendation": "..."
    },
    {
      "id": "daily-devotional",
      "title": "Daily Devotionals",
      "icon": "book",
      "status": "locked",
      "score": number 1-10,
      "finding": "...",
      "recommendation": "..."
    },
    {
      "id": "prayer-requests",
      "title": "Prayer Request Manager",
      "icon": "pray",
      "status": "locked",
      "score": number 1-10,
      "finding": "...",
      "recommendation": "..."
    },
    {
      "id": "community-outreach",
      "title": "Community Outreach Planner",
      "icon": "globe",
      "status": "locked",
      "score": number 1-10,
      "finding": "...",
      "recommendation": "..."
    }
  ],
  "overallScore": number 1-100,
  "quickWins": ["3 specific quick-win actions this church can take immediately"],
  "denominationInsight": "1-2 sentence unique insight about how this denomination specifically benefits from AI"
}

Make all findings and recommendations SPECIFIC to ${denomLabel} churches with ${sizeLabel} congregations and ${styleLabel} worship. Do NOT use generic advice. Scores should reflect realistic assessments - smaller churches typically score lower on admin efficiency but higher on pastoral care, etc.`;

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('AI error:', response.status, err);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    let report;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      report = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

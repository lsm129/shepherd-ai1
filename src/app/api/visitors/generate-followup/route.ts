import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { requireAuthAndQuota } from '@/lib/auth-middleware';
import { recordGeneration } from '@/lib/quota';
import { earnPoints } from '@/lib/points';

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
}

function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';
  return {
    apiKey,
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  };
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseURL, model } = getDeepSeekConfig();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API key is not configured.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, phone, first_visit_date, how_heard, interests, church_name, pastor_name, userId } = body;

    if (!name || !email || !first_visit_date) {
      return NextResponse.json({ error: 'Name, email, and first visit date are required' }, { status: 400 });
    }

    // Auth + Quota check
    const auth = await requireAuthAndQuota(request, userId);
    if (auth.error) return auth.error;

    const effectiveUserId = auth.userId || userId;
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 });
    }

    // Save visitor to visitor_followups table
    const supabase = createClient(supabaseUrl, getServiceRoleKey());
    
    const visitorNotes = JSON.stringify({
      how_heard: how_heard || '',
      interests: interests || '',
    });

    const { data: visitorRecord, error: visitorError } = await supabase
      .from('visitor_followups')
      .insert({
        user_id: effectiveUserId,
        visitor_name: name,
        visitor_email: email,
        visitor_phone: phone || null,
        visit_date: first_visit_date,
        notes: visitorNotes,
        followup_status: 'pending',
        email_sequence_started: false,
      })
      .select('id')
      .single();

    if (visitorError) {
      console.error('Failed to save visitor:', visitorError);
      return NextResponse.json({ error: 'Failed to save visitor information: ' + visitorError.message }, { status: 500 });
    }

    const visitorId = visitorRecord.id;

    // Build AI prompt for truly personalized emails
    const effectiveChurchName = church_name || 'our church';
    const effectivePastorName = pastor_name || 'Pastor';

    const systemPrompt = `You are a warm, caring church pastor writing personal follow-up emails to a new visitor. Your writing style should be:
- Warm and personal, like writing to a friend
- Natural and conversational, NOT formal or religious-sounding
- Specific — reference the visitor's actual details (how they found the church, their interests)
- Genuine — no generic church platitudes, no "we'd love to have you" clichés
- Brief but heartfelt — each email 100-180 words
- Written as if the pastor personally typed each one

The church is "${effectiveChurchName}" and the pastor's name is "${effectivePastorName}".`;

    const personalizationParts: string[] = [];
    personalizationParts.push(`Visitor's name: ${name}`);
    personalizationParts.push(`First visited: ${first_visit_date}`);
    if (how_heard) personalizationParts.push(`How they heard about the church: ${how_heard}`);
    if (interests) personalizationParts.push(`Their interests/needs: ${interests}`);

    const userPrompt = `Write 6 personalized follow-up emails for this visitor:
${personalizationParts.join('\n')}

IMPORTANT: Each email MUST reference something specific about THIS visitor. Do NOT write generic emails that could apply to anyone.

Week 1 (Welcome): Warmly welcome them. Reference their specific visit details — how they found the church, who brought them, etc.
Week 2 (Check-in): Ask how they're doing. Reference something they mentioned or experienced.
Week 3 (Community): Share about a group or activity that matches their interests. Be specific.
Week 4 (Invite): Invite them to something relevant to them. Not a generic invitation.
Week 5 (Story): Share a brief story from your church community that connects to their situation.
Week 6 (Personal): A personal note from the pastor. Reference your journey together so far.

Each email should feel like the pastor sat down and wrote it just for this person. Include a natural greeting using their name and sign off as "${effectivePastorName}".

Return ONLY valid JSON:
{
  "emails": [
    {"week": 1, "subject": "Subject line", "body": "Full email body as plain text"},
    ...6 emails total
  ]
}`;

    // Call DeepSeek AI
    const aiResponse = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errData = await aiResponse.json().catch(() => ({}));
      throw new Error(errData.error?.message || `AI API request failed with status ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    const parsedEmails = JSON.parse(aiContent || '{"emails": []}');
    const emails = parsedEmails.emails || [];

    if (emails.length === 0) {
      throw new Error('AI generated no emails. Please try again.');
    }

    // Save AI-generated emails to visitor record's notes
    const updatedNotes = JSON.stringify({
      how_heard: how_heard || '',
      interests: interests || '',
      ai_emails: emails,
      emails_status: 'draft',
    });

    await supabase
      .from('visitor_followups')
      .update({ notes: updatedNotes })
      .eq('id', visitorId);

    // Record generation and earn points
    if (auth.userId) {
      await recordGeneration(auth.userId, 'visitor_sequence', 'generated');
      await earnPoints(auth.userId, 'generate_other').catch(e => console.error('Points error:', e));
    }

    return NextResponse.json({
      success: true,
      visitorId,
      emails,
      visitor: { name, email, phone, first_visit_date, how_heard, interests },
    });
  } catch (error: any) {
    console.error('Generate followup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate personalized follow-up emails' },
      { status: 500 }
    );
  }
}

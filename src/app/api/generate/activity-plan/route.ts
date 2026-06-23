import { recordGeneration } from '@/lib/quota';
import { requireAuthAndQuota } from '@/lib/auth-middleware';
import { earnPoints } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';
import { getChurchProfile, buildAISystemPrompt, getUserHabits } from '@/lib/ai-with-profile';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';

// Activity planner specific quota limits
const ACTIVITY_PLAN_QUOTA: Record<string, number> = {
  free: 3,
  starter: 15,
  pro: 50,
  growth: -1, // unlimited
};

async function checkActivityPlanQuota(userId: string): Promise<{ allowed: boolean; remaining: number | string; used: number; limit: number | string; plan: string }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();
  
  const plan = (profile?.plan as string) || 'free';
  const quota = ACTIVITY_PLAN_QUOTA[plan] ?? 3;
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const { count } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tool_type', 'activity_plan')
    .gte('created_at', startOfMonth);
  
  const used = count || 0;
  const limit = quota === -1 ? 'Unlimited' : quota;
  const remaining = quota === -1 ? 'Unlimited' : Math.max(0, quota - used);
  const allowed = quota === -1 ? true : used < quota;
  
  return { allowed, remaining, used, limit, plan };
}

function getAIConfig() {
  const deepseekKey = DEEPSEEK_API_KEY;
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
    const {
      activityType,
      activityName,
      expectedAttendees,
      targetAudience,
      budgetRange,
      dateRange,
      denomination,
      specialRequirements,
      userId,
    } = body;

    if (!activityType || !activityName) {
      return NextResponse.json({ error: 'Activity type and name are required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 });
    }

    // Verify user exists
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid user. Please log in again.' }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json({ error: 'Please verify your email before using AI features.' }, { status: 403 });
    }

    // Check congregant role
    const userRole = user.user_metadata?.role || 'pastor';
    if (userRole === 'congregant') {
      return NextResponse.json(
        { error: 'Church members cannot access AI generation features. Only pastors have access.' },
        { status: 403 }
      );
    }

    // Check activity plan specific quota
    const quotaResult = await checkActivityPlanQuota(userId);
    if (!quotaResult.allowed) {
      return NextResponse.json(
        {
          error: 'Activity plan generation limit reached',
          message: `You have used all ${quotaResult.limit} activity plan generations for this month. Upgrade your plan for more.`,
          upgradeUrl: '/settings#billing',
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Also check general quota
    const auth = await requireAuthAndQuota(request, userId);
    if (auth.error) return auth.error;

    // Get church profile + user habits for personalized AI
    const churchProfile = userId ? await getChurchProfile(userId) : null;
    const habitsContext = userId ? await getUserHabits(userId) : '';

    const activityTypeLabels: Record<string, string> = {
      fellowship: 'Fellowship',
      outreach: 'Outreach',
      holiday: 'Holiday Celebration',
      retreat: 'Retreat',
      vbs: 'Vacation Bible School (VBS)',
      youth: 'Youth Event',
      community_service: 'Community Service',
      other: 'Other Activity',
    };

    const basePrompt = `You are an expert church activity planner AI assistant. You create comprehensive, detailed, and practical activity plans for churches. Your plans should be spiritually grounded, well-organized, and actionable.`;
    const systemPrompt = buildAISystemPrompt(basePrompt, churchProfile, habitsContext);

    const audienceLabel = Array.isArray(targetAudience) ? targetAudience.join(', ') : targetAudience || 'All ages';
    const activityLabel = activityTypeLabels[activityType] || activityType;

    const userPrompt = `Create a comprehensive activity plan for a church event with the following details:

**Activity Type:** ${activityLabel}
**Activity Name:** ${activityName}
**Expected Attendees:** ${expectedAttendees || 'Not specified'}
**Target Audience:** ${audienceLabel}
**Budget Range:** ${budgetRange || 'Not specified'}
**Date/Time Period:** ${dateRange || 'Not specified'}
**Church Denomination:** ${denomination || 'Not specified'}
**Special Requirements:** ${specialRequirements || 'None'}

Generate a COMPLETE activity plan in the following JSON format:
{
  "overview": {
    "theme": "A creative, catchy theme title",
    "scripture_focus": "Primary scripture reference",
    "goals": ["Goal 1", "Goal 2", "Goal 3"],
    "duration": "Total duration description"
  },
  "timeline": {
    "preparation": [
      {"weeks_before": 6, "tasks": ["Task 1", "Task 2"]},
      {"weeks_before": 4, "tasks": ["Task 1", "Task 2"]},
      {"weeks_before": 2, "tasks": ["Task 1", "Task 2"]},
      {"weeks_before": 1, "tasks": ["Task 1", "Task 2"]}
    ],
    "event_day": [
      {"time": "Start time", "activity": "Description", "duration": "X min", "lead": "Role"},
      {"time": "Next time", "activity": "Description", "duration": "X min", "lead": "Role"}
    ],
    "follow_up": [
      {"days_after": 1, "tasks": ["Task 1"]},
      {"days_after": 3, "tasks": ["Task 1"]},
      {"days_after": 7, "tasks": ["Task 1"]},
      {"days_after": 14, "tasks": ["Task 1"]}
    ]
  },
  "budget": {
    "total_estimated": "Dollar amount based on budget range",
    "categories": [
      {"name": "Category name", "amount": "$X", "items": ["Item 1", "Item 2"]},
      {"name": "Category name", "amount": "$X", "items": ["Item 1", "Item 2"]}
    ]
  },
  "team": {
    "roles": [
      {"role": "Role title", "responsibilities": ["Responsibility 1", "Responsibility 2"], "ideal_candidates": "Who to recruit"},
      {"role": "Role title", "responsibilities": ["Responsibility 1"], "ideal_candidates": "Who to recruit"}
    ]
  },
  "supplies": {
    "categories": [
      {"category": "Category", "items": [{"name": "Item name", "quantity": "X", "estimated_cost": "$X", "notes": "Where to get"}]}
    ]
  },
  "promotion": {
    "strategy": "Overall promotion strategy description",
    "channels": [
      {
        "channel": "Channel name",
        "content": "Ready-to-use content/copy",
        "timing": "When to post"
      }
    ],
    "social_media_posts": [
      {"platform": "Facebook", "content": "Post content with emojis and hashtags"},
      {"platform": "Instagram", "content": "Caption with hashtags"},
      {"platform": "Twitter/X", "content": "Tweet content within 280 chars"}
    ]
  },
  "follow_up_plan": {
    "immediate": ["Action 1", "Action 2"],
    "one_week": ["Action 1", "Action 2"],
    "one_month": ["Action 1", "Action 2"],
    "connection_strategy": "How to connect attendees to ongoing church life"
  }
}

Make the plan detailed, practical, and tailored to the specific activity type, audience, and church context. Include realistic timelines, budget breakdowns, and actionable tasks. Be creative with the theme and engaging with the social media content.`;

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
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    // Save generation record
    if (userId) {
      await recordGeneration(userId, 'activity_plan', `Activity Plan: ${activityName} (${activityType})`);
      await earnPoints(userId, 'generate_sermon').catch(e => console.error('Points error:', e));
    }

    // Save to activity_plans table for history
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from('activity_plans').insert({
        user_id: userId,
        activity_type: activityType,
        activity_name: activityName,
        expected_attendees: expectedAttendees || null,
        target_audience: Array.isArray(targetAudience) ? targetAudience : [targetAudience],
        budget_range: budgetRange || null,
        date_range: dateRange || null,
        denomination: denomination || null,
        special_requirements: specialRequirements || null,
        plan_content: parsed,
        created_at: new Date().toISOString(),
      }).then(() => {}).catch(() => {});
    } catch (e) {
      // Table might not exist yet, that's OK
    }

    return NextResponse.json({
      success: true,
      nearLimit: auth.nearLimit,
      plan: parsed,
      quota: {
        remaining: quotaResult.remaining,
        used: quotaResult.used + 1,
        limit: quotaResult.limit,
        plan: quotaResult.plan,
      },
    });
  } catch (error: any) {
    console.error('Activity Plan Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate activity plan' }, { status: 500 });
  }
}

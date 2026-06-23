import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const PLAN_ORDER = ['free', 'starter', 'pro', 'growth'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { churchId, reportType, startDate, endDate } = body;

    if (!churchId) {
      return NextResponse.json({ error: 'churchId is required' }, { status: 400 });
    }
    if (!reportType || !['weekly', 'monthly', 'annual'].includes(reportType)) {
      return NextResponse.json({ error: 'reportType must be weekly, monthly, or annual' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, SERVICE_ROLE_KEY);

    // Check plan gate
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', churchId)
      .single();

    const plan = profile?.plan || 'free';
    if (PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf('pro')) {
      return NextResponse.json({ error: 'This feature requires the Pro plan or higher.', planRequired: 'pro' }, { status: 403 });
    }

    // Check monthly quota for Pro plan (only if table exists)
    if (plan === 'pro') {
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { count: reportCount } = await supabaseAdmin
          .from('church_ai_reports')
          .select('*', { count: 'exact', head: true })
          .eq('church_id', churchId)
          .gte('created_at', monthStart);
        if (reportCount && reportCount >= 3) {
          return NextResponse.json({
            error: 'You have reached your monthly limit of 3 AI reports. Upgrade to Growth for unlimited reports.',
            quotaExceeded: true,
            limit: 3,
            used: reportCount,
          }, { status: 429 });
        }
      } catch (quotaErr) {
        // Table might not exist yet, skip quota check
        console.log('Quota check skipped:', quotaErr instanceof Error ? quotaErr.message : 'unknown');
      }
    }

    // Determine date range
    const now = new Date();
    let rangeStart: string;
    let rangeEnd: string;
    let periodLabel: string;

    if (startDate && endDate) {
      rangeStart = startDate;
      rangeEnd = endDate;
      periodLabel = startDate + ' to ' + endDate;
    } else {
      if (reportType === 'weekly') {
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        rangeStart = monday.toISOString().split('T')[0];
        rangeEnd = sunday.toISOString().split('T')[0];
        periodLabel = 'Week of ' + rangeStart;
      } else if (reportType === 'monthly') {
        rangeStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        periodLabel = now.toLocaleString('en', { month: 'long', year: 'numeric' });
      } else {
        rangeStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        rangeEnd = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        periodLabel = String(now.getFullYear());
      }
    }

    // Fetch all data in parallel - wrap each in try/catch for resilience
    const safeQuery = async (queryFn: () => Promise<any>, fallback: any = []) => {
      try {
        const result = await queryFn();
        return result.data || fallback;
      } catch (e) {
        return fallback;
      }
    };

    const [
      profileData,
      communityPosts,
      prayerRequests,
      visitors,
      devotionals,
      transactions,
      activityPlans,
    ] = await Promise.all([
      safeQuery(() => supabaseAdmin.from('profiles').select('church_name, member_count, plan').eq('id', churchId).single(), {}),
      safeQuery(() => supabaseAdmin.from('church_community_posts').select('id, created_at, type').eq('church_id', churchId).gte('created_at', rangeStart).lte('created_at', rangeEnd + 'T23:59:59'), []),
      safeQuery(() => supabaseAdmin.from('prayer_requests').select('id, created_at, status').eq('church_id', churchId).gte('created_at', rangeStart).lte('created_at', rangeEnd + 'T23:59:59'), []),
      safeQuery(() => supabaseAdmin.from('visitors').select('id, created_at, followup_status').eq('church_id', churchId).gte('created_at', rangeStart).lte('created_at', rangeEnd + 'T23:59:59'), []),
      safeQuery(() => supabaseAdmin.from('daily_devotionals').select('id, created_at').eq('church_id', churchId).gte('created_at', rangeStart).lte('created_at', rangeEnd + 'T23:59:59'), []),
      safeQuery(() => supabaseAdmin.from('church_transactions').select('type, category, amount, transaction_date').eq('church_id', churchId).gte('transaction_date', rangeStart).lte('transaction_date', rangeEnd), []),
      safeQuery(() => supabaseAdmin.from('activity_plans').select('id, created_at, status').eq('church_id', churchId).gte('created_at', rangeStart).lte('created_at', rangeEnd + 'T23:59:59'), []),
    ]);

    // Aggregate data
    const churchInfo = profileData || {};
    const posts = Array.isArray(communityPosts) ? communityPosts : [];
    const prayers = Array.isArray(prayerRequests) ? prayerRequests : [];
    const visitorList = Array.isArray(visitors) ? visitors : [];
    const devotionalList = Array.isArray(devotionals) ? devotionals : [];
    const txnList = Array.isArray(transactions) ? transactions : [];
    const activities = Array.isArray(activityPlans) ? activityPlans : [];

    // Compute metrics
    const communityPostCount = posts.length;
    const prayerCount = prayers.length;
    const prayersByStatus: Record<string, number> = {};
    prayers.forEach((p: any) => { prayersByStatus[p.status || 'unknown'] = (prayersByStatus[p.status || 'unknown'] || 0) + 1; });

    const visitorCount = visitorList.length;
    const visitorsFollowedUp = visitorList.filter((v: any) => v.followup_status === 'completed' || v.followup_status === 'active').length;
    const visitorsPending = visitorList.filter((v: any) => !v.followup_status || v.followup_status === 'pending' || v.followup_status === 'new').length;

    const devotionalCount = devotionalList.length;

    const totalIncome = txnList.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + parseFloat(String(t.amount)), 0);
    const totalExpense = txnList.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + parseFloat(String(t.amount)), 0);

    const incomeByCategory: Record<string, number> = {};
    txnList.filter((t: any) => t.type === 'income').forEach((t: any) => {
      incomeByCategory[t.category || 'other'] = (incomeByCategory[t.category || 'other'] || 0) + parseFloat(String(t.amount));
    });
    const expenseByCategory: Record<string, number> = {};
    txnList.filter((t: any) => t.type === 'expense').forEach((t: any) => {
      expenseByCategory[t.category || 'other'] = (expenseByCategory[t.category || 'other'] || 0) + parseFloat(String(t.amount));
    });

    const activityCount = activities.length;
    const activitiesByStatus: Record<string, number> = {};
    activities.forEach((a: any) => { activitiesByStatus[a.status || 'unknown'] = (activitiesByStatus[a.status || 'unknown'] || 0) + 1; });

    // Build summary for AI
    const dataSummary = {
      period: periodLabel,
      reportType,
      church: {
        name: churchInfo.church_name || 'Unknown Church',
        memberCount: churchInfo.member_count || 0,
        plan: churchInfo.plan || 'free',
      },
      community: { postCount: communityPostCount },
      prayers: { totalCount: prayerCount, byStatus: prayersByStatus },
      visitors: { totalCount: visitorCount, followedUp: visitorsFollowedUp, pending: visitorsPending },
      devotionals: { count: devotionalCount },
      finances: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
        incomeByCategory,
        expenseByCategory,
        transactionCount: txnList.length,
      },
      activities: { totalCount: activityCount, byStatus: activitiesByStatus },
    };

    const prompt = 'You are a church health analyst AI. Analyze the following church data for the period "' + periodLabel + '" (' + reportType + ' report) and generate a comprehensive church health report.\n\nChurch Data:\n' + JSON.stringify(dataSummary, null, 2) + '\n\nPlease return a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):\n{\n  "healthScore": <number 1-100, overall church health score>,\n  "scoreBreakdown": {\n    "communityEngagement": <number 1-100>,\n    "prayerLife": <number 1-100>,\n    "visitorFollowUp": <number 1-100>,\n    "devotionalEngagement": <number 1-100>,\n    "financialHealth": <number 1-100>,\n    "activityPlanning": <number 1-100>\n  },\n  "congregationActivity": {\n    "trend": "increasing|stable|declining",\n    "summary": "<2-3 sentence summary>"\n  },\n  "prayerTrends": {\n    "trend": "increasing|stable|declining",\n    "summary": "<2-3 sentence summary>"\n  },\n  "visitorFollowUp": {\n    "status": "strong|needs_attention|critical",\n    "summary": "<2-3 sentence summary>"\n  },\n  "devotionalEngagement": {\n    "trend": "increasing|stable|declining",\n    "summary": "<2-3 sentence summary>"\n  },\n  "financialSummary": {\n    "health": "strong|stable|needs_attention",\n    "summary": "<2-3 sentence summary>"\n  },\n  "recommendations": [\n    {"title": "<short title>", "description": "<detailed actionable advice>", "priority": "high|medium|low"},\n    {"title": "<short title>", "description": "<detailed actionable advice>", "priority": "high|medium|low"},\n    {"title": "<short title>", "description": "<detailed actionable advice>", "priority": "high|medium|low"}\n  ]\n}\n\nImportant scoring guidelines:\n- If there is NO data for a category (e.g., 0 visitors, 0 transactions), score it based on what a healthy church SHOULD have, and mark the trend as "declining" or status as "critical"\n- A church with active community posts, prayers, and visitors should score 60-80\n- A church with strong engagement across all areas should score 80-95\n- Provide exactly 3-5 recommendations that are specific, actionable, and biblically grounded\n- If data is sparse, focus recommendations on getting started with those features';

    // Call DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a church health analyst AI that provides data-driven insights for pastors. Always respond with valid JSON only, no markdown or extra text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', response.status, errText);
      return NextResponse.json({ error: 'AI report generation failed' }, { status: 500 });
    }

    const aiData = await response.json();
    let aiContent = aiData.choices?.[0]?.message?.content || '';

    // Clean up markdown code fences if present
    aiContent = aiContent.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    let parsedReport;
    try {
      parsedReport = JSON.parse(aiContent);
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', aiContent);
      parsedReport = {
        healthScore: 50,
        scoreBreakdown: { communityEngagement: 50, prayerLife: 50, visitorFollowUp: 50, devotionalEngagement: 50, financialHealth: 50, activityPlanning: 50 },
        congregationActivity: { trend: 'stable', summary: aiContent.substring(0, 200) },
        prayerTrends: { trend: 'stable', summary: 'Data analysis in progress.' },
        visitorFollowUp: { status: 'needs_attention', summary: 'Review visitor follow-up processes.' },
        devotionalEngagement: { trend: 'stable', summary: 'Continue encouraging daily devotionals.' },
        financialSummary: { health: 'stable', summary: 'Financial data under review.' },
        recommendations: [{ title: 'Review Report', description: 'The full AI analysis could not be parsed. Please try generating again.', priority: 'high' }],
      };
    }

    // Save report to database (best effort)
    try {
      await supabaseAdmin.from('church_ai_reports').insert({
        church_id: churchId,
        report_type: reportType,
        period_start: rangeStart,
        period_end: rangeEnd,
        health_score: parsedReport.healthScore,
        report_data: parsedReport,
      });
    } catch (dbErr) {
      console.log('Could not save report to DB:', dbErr instanceof Error ? dbErr.message : 'unknown');
    }

    return NextResponse.json({
      success: true,
      report: parsedReport,
      period: { start: rangeStart, end: rangeEnd, label: periodLabel, type: reportType },
      plan,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    console.error('Church AI report error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

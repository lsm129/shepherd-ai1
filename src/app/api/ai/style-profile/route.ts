import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const supabase = createClient(supabaseUrl, SERVICE_KEY);

    // Try ai_style_profiles table first
    let styleData: any = null;
    let generationsAnalyzed = 0;
    let lastUpdated = '';

    const { data: tableData, error: tableErr } = await supabase
      .from('ai_style_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!tableErr && tableData) {
      styleData = tableData.style_data;
      generationsAnalyzed = tableData.generations_analyzed || 0;
      lastUpdated = tableData.last_updated || '';
    } else {
      // Fallback: read from user_metadata
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      const meta = user?.user_metadata || {};
      styleData = meta.ai_style_data || null;
      generationsAnalyzed = meta.ai_style_generations_analyzed || 0;
      lastUpdated = meta.ai_style_last_updated || '';
    }

    // Also get existing habits data
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};

    // Get generation stats
    const { count: totalGenerations } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get recent generations for content analysis
    const { data: recentGens } = await supabase
      .from('generations')
      .select('tool_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Build comprehensive style profile
    const defaultStyle = {
      preferred_greetings: [],
      avoided_phrases: [],
      scripture_preferences: [],
      tone_adjectives: [],
      signoff_style: '',
      editing_patterns: {},
      preaching_style: '',
      editing_tendency: '',
    };

    const merged = { ...defaultStyle, ...(styleData || {}) };

    // Count total learned insights
    const totalLearned = 
      (merged.preferred_greetings?.length || 0) +
      (merged.avoided_phrases?.length || 0) +
      (merged.scripture_preferences?.length || 0) +
      (merged.tone_adjectives?.length || 0) +
      (merged.preaching_style ? 1 : 0) +
      (merged.signoff_style ? 1 : 0) +
      (merged.editing_tendency ? 1 : 0) +
      (merged.editing_patterns?.recent_insights?.length || 0);

    // Derive preaching style label
    const preachingStyleLabel = derivePreachingStyle(merged, meta);

    // Derive preferred greeting
    const preferredGreeting = merged.preferred_greetings?.[0] || '';

    // Derive go-to scripture
    const goToScripture = merged.scripture_preferences?.slice(0, 2).join(' & ') || '';

    // Derive tone summary
    const toneSummary = merged.tone_adjectives?.length > 0 
      ? merged.tone_adjectives.join(', ') 
      : meta.ai_habits_tone || '';

    // Derive editing tendency
    const editingTendency = merged.editing_tendency || '';

    // Derive tool usage pattern
    const toolUsage: Record<string, number> = {};
    if (recentGens) {
      for (const gen of recentGens) {
        const tool = gen.tool_type || 'unknown';
        toolUsage[tool] = (toolUsage[tool] || 0) + 1;
      }
    }
    const mostUsedTool = Object.entries(toolUsage).sort((a, b) => b[1] - a[1])?.[0]?.[0] || '';

    // Calculate style confidence (0-100)
    let confidence = 0;
    if (generationsAnalyzed >= 1) confidence += 10;
    if (generationsAnalyzed >= 3) confidence += 15;
    if (generationsAnalyzed >= 5) confidence += 15;
    if (generationsAnalyzed >= 10) confidence += 10;
    if (merged.preferred_greetings?.length > 0) confidence += 10;
    if (merged.scripture_preferences?.length > 0) confidence += 10;
    if (merged.preaching_style) confidence += 10;
    if (merged.avoided_phrases?.length > 0) confidence += 5;
    if (merged.signoff_style) confidence += 5;
    if (merged.tone_adjectives?.length > 0) confidence += 5;
    if (merged.editing_tendency) confidence += 5;
    confidence = Math.min(confidence, 100);

    // Calculate "switching cost" message
    const switchCostMsg = getSwitchCostMessage(totalLearned, generationsAnalyzed, confidence);

    const profile = {
      styleData: merged,
      stats: {
        totalLearned,
        generationsAnalyzed,
        totalGenerations: totalGenerations || 0,
        lastUpdated,
        editCount: merged.editing_patterns?.total_edits || meta.ai_habits_edit_count || 0,
        approvedCount: meta.ai_habits_approved_count || 0,
        confidence,
        mostUsedTool,
        toolUsage,
      },
      highlights: {
        preachingStyle: preachingStyleLabel,
        preferredGreeting,
        goToScripture,
        toneSummary,
        signoffStyle: merged.signoff_style || '',
        avoidedPhrases: merged.avoided_phrases?.slice(0, 5) || [],
        recentInsights: merged.editing_patterns?.recent_insights?.slice(-5) || [],
        editingTendency,
        switchCostMsg,
      },
      habits: {
        writing_style: meta.ai_habits_writing_style || '',
        preferred_phrases: meta.ai_habits_phrases || [],
        tone_preference: meta.ai_habits_tone || '',
        approved_count: meta.ai_habits_approved_count || 0,
        edit_count: meta.ai_habits_edit_count || 0,
      },
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Style profile read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function derivePreachingStyle(styleData: any, meta: any): string {
  if (styleData.preaching_style) {
    const ps = styleData.preaching_style.toLowerCase();
    if (ps.includes('narrative') || ps.includes('story')) return 'Narrative-driven';
    if (ps.includes('doctrin') || ps.includes('theolog')) return 'Doctrine-focused';
    if (ps.includes('applic') || ps.includes('practical')) return 'Application-oriented';
    return styleData.preaching_style;
  }
  const tone = (meta.ai_habits_tone || '').toLowerCase();
  const writing = (meta.ai_habits_writing_style || '').toLowerCase();
  if (writing.includes('question') || tone.includes('engag')) return 'Narrative-driven';
  if (writing.includes('detailed') || writing.includes('long')) return 'Doctrine-focused';
  if (writing.includes('concise') || writing.includes('practical')) return 'Application-oriented';
  return 'Still learning...';
}

function getSwitchCostMessage(totalLearned: number, generationsAnalyzed: number, confidence: number): string {
  if (totalLearned === 0) return 'Start generating content to teach your AI';
  if (totalLearned <= 3) return 'Your AI is getting to know you';
  if (totalLearned <= 8) return 'Your AI is learning your voice — switching would mean starting over';
  if (totalLearned <= 15) return 'Your AI knows your style well — months of learning would be lost';
  return `${totalLearned} style insights learned — this is your competitive advantage`;
}

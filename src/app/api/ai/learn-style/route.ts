import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';

function getAIConfig() {
  if (DEEPSEEK_KEY && DEEPSEEK_KEY !== 'your-deepseek-api-key') {
    return { apiKey: DEEPSEEK_KEY, baseURL: 'https://api.deepseek.com', model: 'deepseek-chat' };
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey !== 'your-openai-api-key') {
    return { apiKey: openaiKey, baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
  }
  return { apiKey: '', baseURL: '', model: '' };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, originalContent, editedContent, toolType } = body;
    if (!userId || !originalContent || !editedContent) {
      return NextResponse.json({ error: 'Missing required fields: userId, originalContent, editedContent' }, { status: 400 });
    }

    // Skip if content is unchanged or too short
    if (originalContent.trim() === editedContent.trim()) {
      return NextResponse.json({ success: true, insights: null, message: 'No changes detected' });
    }

    const supabase = createClient(supabaseUrl, SERVICE_KEY);

    // Check if table exists, try to create if not
    let { error: tableCheckErr } = await supabase.from('ai_style_profiles').select('id').limit(1);
    let tableExists = !tableCheckErr;
    
    if (!tableExists) {
      // Try to create the table via DATABASE_URL
      try {
        const pg = await import('pg');
        const databaseUrl = process.env.DATABASE_URL;
        if (databaseUrl) {
          const client = new pg.Client({
            connectionString: databaseUrl,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000,
          });
          await client.connect();
          await client.query(`
            CREATE TABLE IF NOT EXISTS ai_style_profiles (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID NOT NULL UNIQUE,
              style_data JSONB DEFAULT '{"preferred_greetings":[],"avoided_phrases":[],"scripture_preferences":[],"tone_adjectives":[],"signoff_style":"","editing_patterns":{},"preaching_style":""}'::jsonb,
              generations_analyzed INTEGER DEFAULT 0,
              last_updated TIMESTAMPTZ DEFAULT NOW(),
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            ALTER TABLE ai_style_profiles ENABLE ROW LEVEL SECURITY;
            DROP POLICY IF EXISTS "Service role full access" ON ai_style_profiles;
            CREATE POLICY "Service role full access" ON ai_style_profiles FOR ALL USING (true) WITH CHECK (true);
            CREATE INDEX IF NOT EXISTS idx_ai_style_profiles_user_id ON ai_style_profiles(user_id);
          `);
          await client.end();
          // Re-check
          const recheck = await supabase.from('ai_style_profiles').select('id').limit(1);
          tableExists = !recheck.error;
        }
      } catch (e) {
        // Table creation failed, continue with user_metadata fallback
        console.error('Auto-create ai_style_profiles failed:', e);
      }
    }

    // Get existing profile
    let existingProfile: any = null;
    if (tableExists) {
      const { data } = await supabase.from('ai_style_profiles').select('*').eq('user_id', userId).single();
      existingProfile = data;
    }

    const styleData = existingProfile?.style_data || {
      preferred_greetings: [],
      avoided_phrases: [],
      scripture_preferences: [],
      tone_adjectives: [],
      signoff_style: '',
      editing_patterns: {},
      preaching_style: '',
    };
    const generationsAnalyzed = (existingProfile?.generations_analyzed || 0) + 1;

    // Use AI to analyze the diff
    const { apiKey, baseURL, model } = getAIConfig();
    let learnedInsights: any = {};

    if (apiKey) {
      try {
        const diffPrompt = `You are an AI writing style analyst for a church ministry tool. Compare the ORIGINAL AI-generated text with the USER-EDITED version. Identify SPECIFIC patterns about this pastor's writing preferences.

ORIGINAL:
${originalContent.substring(0, 2000)}

USER-EDITED:
${editedContent.substring(0, 2000)}

Analyze what the user changed and extract style preferences. Return ONLY valid JSON:
{
  "greeting_changes": ["list any greeting patterns the user prefers, e.g. 'Dear church family', 'Hello everyone'"],
  "removed_phrases": ["list SPECIFIC phrases the user removed that they seem to dislike"],
  "added_phrases": ["list SPECIFIC phrases the user added that they prefer"],
  "tone_shift": "description of tone shift if any, e.g. 'more casual', 'more formal', 'more personal', 'more pastoral'",
  "scripture_preference": "any scripture book/chapter patterns noticed, e.g. 'Psalms', 'Romans'",
  "signoff_change": "if signoff was changed, what they prefer",
  "preaching_style": "one of: narrative, doctrinal, or application-focused based on the edits",
  "editing_tendency": "what the user tends to change most: 'shortens', 'expands', 'personalizes', 'formalizes', 'adds scripture', 'removes fluff'",
  "key_insight": "one concise sentence summary of what was learned about this user's style that will help generate better content next time"
}`;

        const response = await fetch(`${baseURL}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are a writing style analyst for church ministry content. Always respond with valid JSON only. Be specific and actionable in your insights.' },
              { role: 'user', content: diffPrompt },
            ],
            temperature: 0.3,
            max_tokens: 600,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            learnedInsights = JSON.parse(jsonMatch ? jsonMatch[0] : content);
          } catch {
            learnedInsights = { key_insight: 'Could not parse AI analysis' };
          }
        }
      } catch (aiErr) {
        console.error('AI style analysis error:', aiErr);
        learnedInsights = doBasicDiffAnalysis(originalContent, editedContent);
      }
    } else {
      learnedInsights = doBasicDiffAnalysis(originalContent, editedContent);
    }

    // Merge learned insights into style_data
    if (learnedInsights.greeting_changes?.length > 0) {
      const validGreetings = learnedInsights.greeting_changes.filter((g: string) => g && g.trim().length > 0 && !g.toLowerCase().includes('none'));
      styleData.preferred_greetings = [...new Set([...(styleData.preferred_greetings || []), ...validGreetings])].slice(0, 10);
    }
    if (learnedInsights.removed_phrases?.length > 0) {
      const validRemoved = learnedInsights.removed_phrases.filter((p: string) => p && p.trim().length > 0 && !p.toLowerCase().includes('none'));
      styleData.avoided_phrases = [...new Set([...(styleData.avoided_phrases || []), ...validRemoved])].slice(0, 15);
    }
    if (learnedInsights.added_phrases?.length > 0) {
      const validAdded = learnedInsights.added_phrases.filter((p: string) => p && p.trim().length > 0 && !p.toLowerCase().includes('none'));
      // Added phrases go to preferred_greetings if they're greetings, otherwise track separately
      for (const phrase of validAdded) {
        const lower = phrase.toLowerCase();
        if (lower.startsWith('dear') || lower.startsWith('hello') || lower.startsWith('greetings') || lower.startsWith('hi')) {
          styleData.preferred_greetings = [...new Set([...(styleData.preferred_greetings || []), phrase])].slice(0, 10);
        }
      }
    }
    if (learnedInsights.tone_shift) {
      const existingTones = styleData.tone_adjectives || [];
      if (!existingTones.includes(learnedInsights.tone_shift)) {
        styleData.tone_adjectives = [...existingTones, learnedInsights.tone_shift].slice(0, 8);
      }
    }
    if (learnedInsights.scripture_preference &&
        !learnedInsights.scripture_preference.toLowerCase().includes('none') &&
        !learnedInsights.scripture_preference.toLowerCase().includes('not') &&
        learnedInsights.scripture_preference.trim().length > 0) {
      styleData.scripture_preferences = [...new Set([...(styleData.scripture_preferences || []), learnedInsights.scripture_preference])].slice(0, 10);
    }
    if (learnedInsights.signoff_change) {
      styleData.signoff_style = learnedInsights.signoff_change;
    }
    if (learnedInsights.preaching_style) {
      styleData.preaching_style = learnedInsights.preaching_style;
    }
    if (learnedInsights.editing_tendency) {
      styleData.editing_tendency = learnedInsights.editing_tendency;
    }

    // Update editing patterns
    const editPatterns = styleData.editing_patterns || {};
    editPatterns.total_edits = (editPatterns.total_edits || 0) + 1;
    editPatterns.tools_edited = editPatterns.tools_edited || {};
    if (toolType) {
      editPatterns.tools_edited[toolType] = (editPatterns.tools_edited[toolType] || 0) + 1;
    }
    if (learnedInsights.key_insight) {
      editPatterns.recent_insights = editPatterns.recent_insights || [];
      editPatterns.recent_insights.push(learnedInsights.key_insight);
      if (editPatterns.recent_insights.length > 10) editPatterns.recent_insights.shift();
    }
    styleData.editing_patterns = editPatterns;

    // Save to database or user_metadata fallback
    if (tableExists) {
      const { error: upsertErr } = await supabase.from('ai_style_profiles').upsert({
        user_id: userId,
        style_data: styleData,
        generations_analyzed: generationsAnalyzed,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (upsertErr) {
        await saveToUserMetadata(supabase, userId, styleData, generationsAnalyzed);
      }
    } else {
      await saveToUserMetadata(supabase, userId, styleData, generationsAnalyzed);
    }

    return NextResponse.json({
      success: true,
      insights: learnedInsights,
      generationsAnalyzed,
      totalLearned: (
        (styleData.preferred_greetings?.length || 0) +
        (styleData.avoided_phrases?.length || 0) +
        (styleData.scripture_preferences?.length || 0) +
        (styleData.tone_adjectives?.length || 0) +
        (styleData.preaching_style ? 1 : 0) +
        (styleData.signoff_style ? 1 : 0) +
        (styleData.editing_patterns?.recent_insights?.length || 0)
      ),
    });
  } catch (error) {
    console.error('Style learning error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Basic diff analysis without AI
function doBasicDiffAnalysis(original: string, edited: string): any {
  const result: any = { greeting_changes: [], removed_phrases: [], added_phrases: [], tone_shift: '', scripture_preference: '', signoff_change: '', preaching_style: '', editing_tendency: '', key_insight: '' };

  const origLines = original.split('\n').filter(l => l.trim());
  const editLines = edited.split('\n').filter(l => l.trim());

  // Check first line changes (greeting)
  if (origLines[0] !== editLines[0] && editLines[0]) {
    result.greeting_changes.push(editLines[0].trim().substring(0, 80));
  }

  // Check last line changes (signoff)
  if (origLines[origLines.length - 1] !== editLines[editLines.length - 1] && editLines[editLines.length - 1]) {
    result.signoff_change = editLines[editLines.length - 1].trim();
  }

  // Find common Christian phrases that were removed
  const commonPhrases = ['Dear beloved', 'Greetings in the Lord', 'In Christ', 'Blessings', 'God bless you', 'Brothers and sisters', 'Beloved congregation', 'Dear saints'];
  for (const phrase of commonPhrases) {
    if (original.includes(phrase) && !edited.includes(phrase)) {
      result.removed_phrases.push(phrase);
    }
  }

  // Detect scripture book references in edited version
  const scripturePattern = /\b(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs?|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\b/gi;
  const scriptureMatches = edited.match(scripturePattern);
  if (scriptureMatches) {
    result.scripture_preference = [...new Set(scriptureMatches.map(s => s))].slice(0, 3).join(', ');
  }

  // Detect editing tendency
  const lengthDiff = edited.length - original.length;
  if (lengthDiff < -original.length * 0.3) {
    result.editing_tendency = 'shortens';
  } else if (lengthDiff > original.length * 0.3) {
    result.editing_tendency = 'expands';
  } else {
    result.editing_tendency = 'personalizes';
  }

  // Simple length-based tone shift detection
  if (edited.length < original.length * 0.7) {
    result.tone_shift = 'prefers more concise';
  } else if (edited.length > original.length * 1.3) {
    result.tone_shift = 'prefers more detailed';
  }

  // Detect preaching style from content
  const editedLower = edited.toLowerCase();
  if (editedLower.includes('story') || editedLower.includes('imagine') || editedLower.includes('picture this')) {
    result.preaching_style = 'narrative';
  } else if (editedLower.includes('doctrine') || editedLower.includes('theology') || editedLower.includes('systematic')) {
    result.preaching_style = 'doctrinal';
  } else if (editedLower.includes('apply') || editedLower.includes('practical') || editedLower.includes('action step')) {
    result.preaching_style = 'application-focused';
  }

  if (result.greeting_changes.length > 0 || result.removed_phrases.length > 0 || result.signoff_change) {
    result.key_insight = `User edited content: greeting changed to "${result.greeting_changes[0] || 'custom'}"${result.signoff_change ? ', signoff changed' : ''}${result.editing_tendency ? `, tends to ${result.editing_tendency}` : ''}`;
  } else {
    result.key_insight = `User made edits: ${result.editing_tendency || 'minor adjustments'}`;
  }

  return result;
}

// Fallback: save style data to user_metadata
async function saveToUserMetadata(supabase: any, userId: string, styleData: any, generationsAnalyzed: number) {
  const { data: { user } } = await supabase.auth.admin.getUserById(userId);
  const meta = user?.user_metadata || {};
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...meta,
      ai_style_data: styleData,
      ai_style_generations_analyzed: generationsAnalyzed,
      ai_style_last_updated: new Date().toISOString(),
    },
  });
}

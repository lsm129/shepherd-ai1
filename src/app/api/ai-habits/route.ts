import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Retrieve user's AI habits/preferences
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const supabaseUrl = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};

    const habits = {
      writing_style: meta.ai_habits_writing_style || '',
      preferred_phrases: meta.ai_habits_phrases || [],
      tone_preference: meta.ai_habits_tone || '',
      approved_count: meta.ai_habits_approved_count || 0,
      rejected_count: meta.ai_habits_rejected_count || 0,
      edit_count: meta.ai_habits_edit_count || 0,
      style_samples: meta.ai_habits_samples || [],
    };

    return NextResponse.json({ habits });
  } catch (error) {
    console.error('Habits read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Record a habit signal (approve/reject/edit_approve)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, platform, originalText, editedText, toolType } = body;
    if (!userId || !action) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const supabaseUrl = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const existingMeta = user?.user_metadata || {};

    const approvedCount = existingMeta.ai_habits_approved_count || 0;
    const rejectedCount = existingMeta.ai_habits_rejected_count || 0;

    const updates: Record<string, any> = {};

    if (action === 'approve') {
      updates.ai_habits_approved_count = approvedCount + 1;

      const samples = existingMeta.ai_habits_samples || [];
      const newSample = {
        text: originalText,
        platform: platform || toolType || 'unknown',
        approved_at: new Date().toISOString(),
      };
      samples.push(newSample);
      if (samples.length > 20) samples.shift();
      updates.ai_habits_samples = samples;

      if (approvedCount + 1 >= 5 && !existingMeta.ai_habits_writing_style) {
        const allTexts = samples.map((s: any) => s.text).join(' ');
        const avgLength = allTexts.length / samples.length;
        const usesEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(allTexts);
        const usesQuestions = /\?/.test(allTexts);
        const usesExclamation = /!/.test(allTexts);

        let styleNotes = [];
        if (avgLength < 200) styleNotes.push('prefers concise posts');
        else if (avgLength > 500) styleNotes.push('prefers detailed, long-form posts');
        else styleNotes.push('prefers medium-length posts');

        if (usesEmoji) styleNotes.push('uses emojis');
        if (usesQuestions) styleNotes.push('asks engaging questions');
        if (usesExclamation) styleNotes.push('uses enthusiastic exclamation');

        updates.ai_habits_writing_style = styleNotes.join(', ');
        updates.ai_habits_tone = usesExclamation ? 'enthusiastic' : 'warm and professional';
      }

      if (approvedCount + 1 >= 3) {
        const samples2 = (updates.ai_habits_samples || existingMeta.ai_habits_samples || []);
        const allText = samples2.map((s: any) => s.text).join(' ');
        const existingPhrases: string[] = existingMeta.ai_habits_phrases || [];
        const commonPhrases = [
          'God is faithful', 'praise God', 'join us', 'come and see',
          'God bless', 'in His name', 'prayer request', 'grateful heart',
          'walking in faith', 'love of Christ', "God's grace", 'blessed to',
          'together in prayer', 'faith community', "God's love",
        ];
        const found = commonPhrases.filter(p => allText.toLowerCase().includes(p.toLowerCase()));
        if (found.length > 0) {
          updates.ai_habits_phrases = [...new Set([...existingPhrases, ...found])].slice(0, 15);
        }
      }

    } else if (action === 'reject') {
      updates.ai_habits_rejected_count = rejectedCount + 1;

    } else if (action === 'edit_approve') {
      updates.ai_habits_approved_count = approvedCount + 1;
      const editCount = (existingMeta.ai_habits_edit_count || 0) + 1;
      updates.ai_habits_edit_count = editCount;

      const samples = existingMeta.ai_habits_samples || [];
      samples.push({
        text: editedText,
        originalText: originalText,
        platform: platform || toolType || 'unknown',
        edited: true,
        approved_at: new Date().toISOString(),
      });
      if (samples.length > 20) samples.shift();
      updates.ai_habits_samples = samples;

      if (editCount >= 3 && !(existingMeta.ai_habits_writing_style || '').includes('frequently edits')) {
        updates.ai_habits_writing_style = (existingMeta.ai_habits_writing_style || '') + 
          (existingMeta.ai_habits_writing_style ? '; ' : '') + 'user frequently edits - try closer to their original voice';
      }
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...existingMeta, ...updates },
    });

    if (error) throw error;

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('Habits update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

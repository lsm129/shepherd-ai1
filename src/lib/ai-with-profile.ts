import { createClient } from '@supabase/supabase-js';
import { buildChurchContext, getLiturgicalSeason, ChurchProfile } from './church-profile';

// Get church profile for AI context - reads from church_settings + user_metadata
export async function getChurchProfile(userId: string): Promise<ChurchProfile | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get church_settings (basic info like church_name, pastor_name)
    const { data: settings } = await supabase
      .from('church_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user_metadata for denomination/congregation_size/worship_style
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};

    // Merge both sources
    return {
      church_name: settings?.church_name || '',
      pastor_name: settings?.pastor_name || '',
      denomination: meta.denomination || settings?.denomination || '',
      congregation_size: meta.congregation_size || settings?.congregation_size || '',
      worship_style: meta.worship_style || settings?.worship_style || '',
      preferred_tone: settings?.preferred_tone || '',
      ai_tone: settings?.ai_tone || '',
      default_signoff: settings?.default_signoff || '',
      email_signature: settings?.email_signature || '',
      website: settings?.website || '',
      address: settings?.address || '',
    } as ChurchProfile;
  } catch {
    return null;
  }
}

// Build the AI system prompt with church profile context
export function buildAISystemPrompt(basePrompt: string, profile: ChurchProfile | null, habitsContext?: string): string {
  const churchContext = buildChurchContext(profile);
  const liturgicalNote = profile?.denomination && ['catholic', 'anglican', 'lutheran'].includes(profile.denomination)
    ? ` Current liturgical season: ${getLiturgicalSeason()}. Reference it where appropriate.`
    : '';
  
  const habitsSection = habitsContext ? `\n\nUSER WRITING HABITS (CRITICAL - match their style):\n${habitsContext}\n\nIMPORTANT: The above habits are learned from texts the user has explicitly approved. Match this style closely.` : '';
  
  return `${basePrompt}

CHURCH CONTEXT (use this to personalize ALL content):
${churchContext}${liturgicalNote}${habitsSection}

IMPORTANT: Tailor your content specifically for this church's denomination, congregation size, and worship style. Do NOT use generic one-size-fits-all language. The content should feel like it was written by someone who knows this church personally.`;
}


// Get user's writing habits for AI personalization
export async function getUserHabits(userId: string): Promise<string> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};
    
    const parts: string[] = [];
    
    if (meta.ai_habits_writing_style) {
      parts.push(`USER WRITING STYLE (learned from ${meta.ai_habits_approved_count || 0} approved texts): ${meta.ai_habits_writing_style}`);
    }
    
    if (meta.ai_habits_phrases && meta.ai_habits_phrases.length > 0) {
      parts.push(`PREFERRED PHRASES the user likes to use: ${(meta.ai_habits_phrases || []).join(', ')}`);
    }
    
    if (meta.ai_habits_tone) {
      parts.push(`PREFERRED TONE: ${meta.ai_habits_tone}`);
    }
    
    if (meta.ai_habits_edit_count >= 3) {
      parts.push(`NOTE: This user frequently edits AI output (${meta.ai_habits_edit_count} edits). Try to match their voice more closely. Be less flowery and more direct.`);
    }
    
    // Include recent approved samples for style matching
    const samples = meta.ai_habits_samples || [];
    const recentSamples = samples.slice(-3); // Last 3 approved texts
    if (recentSamples.length > 0) {
      const sampleTexts = recentSamples.map((s: any, i: number) => 
        `Sample ${i+1} (${s.platform}${s.edited ? ', user-edited' : ''}): "${s.text.substring(0, 150)}..."`
      ).join('\n');
      parts.push(`RECENT APPROVED TEXTS (match this style):\n${sampleTexts}`);
    }
    
    return parts.length > 0 ? parts.join('\n\n') : '';
  } catch {
    return '';
  }
}

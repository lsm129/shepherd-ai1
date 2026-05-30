import { createClient } from '@supabase/supabase-js';
import { buildChurchContext, getLiturgicalSeason, ChurchProfile } from './church-profile';

// Get church profile for AI context
export async function getChurchProfile(userId: string): Promise<ChurchProfile | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data } = await supabase
      .from('church_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return data as ChurchProfile | null;
  } catch {
    return null;
  }
}

// Build the AI system prompt with church profile context
export function buildAISystemPrompt(basePrompt: string, profile: ChurchProfile | null): string {
  const churchContext = buildChurchContext(profile);
  const liturgicalNote = profile?.denomination && ['catholic', 'anglican', 'lutheran'].includes(profile.denomination)
    ? ` Current liturgical season: ${getLiturgicalSeason()}. Reference it where appropriate.`
    : '';
  
  return `${basePrompt}

CHURCH CONTEXT (use this to personalize ALL content):
${churchContext}${liturgicalNote}

IMPORTANT: Tailor your content specifically for this church's denomination, congregation size, and worship style. Do NOT use generic one-size-fits-all language. The content should feel like it was written by someone who knows this church personally.`;
}

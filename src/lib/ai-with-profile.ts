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

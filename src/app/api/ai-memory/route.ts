import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Retrieve AI's understanding of the user's church
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const supabaseUrl = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user metadata (profile data)
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};

    // Get church settings
    const { data: settings } = await supabase.from('church_settings').select('*').eq('user_id', userId).single();

    // Get usage patterns
    const { data: generations } = await supabase.from('generations').select('tool_type').eq('user_id', userId);
    const toolCounts: Record<string, number> = {};
    (generations || []).forEach((g: any) => {
      toolCounts[g.tool_type] = (toolCounts[g.tool_type] || 0) + 1;
    });

    // Get chat messages count
    const { count: chatCount } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('user_id', userId);

    // Build AI's understanding
    const memory = {
      profile: {
        denomination: meta.denomination || settings?.denomination || 'Not set',
        congregation_size: meta.congregation_size || settings?.congregation_size || 'Not set',
        worship_style: meta.worship_style || settings?.worship_style || 'Not set',
        church_name: settings?.church_name || 'Not set',
        pastor_name: settings?.pastor_name || 'Not set',
      },
      usage_patterns: {
        total_generations: (generations || []).length,
        tools_used: toolCounts,
        chat_conversations: chatCount || 0,
        favorite_tool: Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None yet',
      },
      ai_notes: meta.ai_notes || '',
      custom_preferences: meta.custom_preferences || '',
    };

    return NextResponse.json({ memory });
  } catch (error) {
    console.error('Memory read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Update AI's understanding (user corrects AI memory)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, field, value } = body;
    if (!userId || !field || value === undefined) {
      return NextResponse.json({ error: 'Missing userId, field, or value' }, { status: 400 });
    }

    const supabaseUrl = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update user metadata
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const existingMeta = user?.user_metadata || {};

    // Profile fields go directly to user_metadata
    const profileFields = ['denomination', 'congregation_size', 'worship_style'];
    if (profileFields.includes(field)) {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { ...existingMeta, [field]: value },
      });
      if (error) throw error;
    }
    // Church settings fields go to church_settings table
    else if (['church_name', 'pastor_name', 'website', 'address', 'email_signature'].includes(field)) {
      const { error } = await supabase.from('church_settings').upsert({
        user_id: userId,
        [field]: value,
      }, { onConflict: 'user_id' });
      if (error) throw error;
    }
    // Custom preferences / AI notes go to user_metadata
    else {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { ...existingMeta, [field]: value },
      });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, field, value });
  } catch (error) {
    console.error('Memory update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

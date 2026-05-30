import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { earnPoints } from '@/lib/points';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/templates - Browse public templates with search & filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'popular';

    const supabase = getAdminClient();

    let dbQuery = supabase
      .from('generations')
      .select('id, user_id, tool_type, input_summary, content, created_at')
      .eq('tool_type', 'sermon_template');

    if (query) {
      dbQuery = dbQuery.ilike('content', `%${query}%`);
    }

    if (sort === 'newest') {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    dbQuery = dbQuery.limit(50);

    const { data: templates, error } = await dbQuery;

    if (error) {
      console.error('Template query error:', error);
      return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
    }

    const parsedTemplates = (templates || [])
      .map((t: any) => {
        let contentObj: any = {};
        try {
          contentObj = JSON.parse(t.content || '{}');
        } catch {}

        if (contentObj.is_public !== true) return null;

        if (category && contentObj.category !== category) return null;

        return {
          id: t.id,
          user_id: t.user_id,
          tool_type: t.tool_type,
          input_summary: t.input_summary,
          content: t.content,
          created_at: t.created_at,
          template_title: contentObj.template_title || '',
          template_description: contentObj.template_description || '',
          category: contentObj.category || '',
          usage_count: contentObj.usage_count || 0,
          avg_rating: contentObj.avg_rating || 0,
          creator_name: contentObj.creator_name || '',
        };
      })
      .filter(Boolean);

    if (sort === 'popular') {
      parsedTemplates.sort((a: any, b: any) => (b.usage_count || 0) - (a.usage_count || 0));
    }

    const creatorIds = [...new Set(parsedTemplates.map((t: any) => t.user_id))];
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('church_settings')
        .select('user_id, pastor_name, church_name')
        .in('user_id', creatorIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => {
        profileMap[p.user_id] = p;
      });

      parsedTemplates.forEach((t: any) => {
        if (!t.creator_name && profileMap[t.user_id]) {
          t.creator_name = profileMap[t.user_id].pastor_name || profileMap[t.user_id].church_name || 'A Fellow Pastor';
        }
      });
    }

    return NextResponse.json({ templates: parsedTemplates });
  } catch (error: any) {
    console.error('Templates GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load templates' }, { status: 500 });
  }
}

// POST /api/templates - Mark a generation as a public template
export async function POST(request: NextRequest) {
  try {
    const { userId, generationId, template_title, template_description, category } = await request.json();

    if (!userId || !generationId) {
      return NextResponse.json({ error: 'userId and generationId are required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: generation, error: genError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', userId)
      .single();

    if (genError || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    if (generation.tool_type === 'sermon_template') {
      return NextResponse.json({ error: 'This sermon is already shared as a template' }, { status: 400 });
    }

    const { data: settings } = await supabase
      .from('church_settings')
      .select('pastor_name, church_name')
      .eq('user_id', userId)
      .single();

    const creatorName = settings?.pastor_name || settings?.church_name || 'A Fellow Pastor';

    let existingContent: any = {};
    try {
      existingContent = JSON.parse(generation.content || '{}');
    } catch {}

    const templateContent = {
      ...existingContent,
      is_public: true,
      template_title: template_title || existingContent.template_title || generation.input_summary?.substring(0, 80) || 'Untitled Template',
      template_description: template_description || existingContent.template_description || '',
      category: category || existingContent.category || 'topical',
      usage_count: 0,
      avg_rating: 0,
      creator_name: creatorName,
      original_tool_type: generation.tool_type,
      shared_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('generations')
      .update({
        tool_type: 'sermon_template',
        content: JSON.stringify(templateContent),
      })
      .eq('id', generationId);

    if (updateError) {
      console.error('Template update error:', updateError);
      return NextResponse.json({ error: 'Failed to share template' }, { status: 500 });
    }

    try {
      await earnPoints(userId, 'template_shared');
    } catch (e) {
      console.error('Points award error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Template shared successfully! +50 points',
      template_id: generationId,
    });
  } catch (error: any) {
    console.error('Template share error:', error);
    return NextResponse.json({ error: error.message || 'Failed to share template' }, { status: 500 });
  }
}

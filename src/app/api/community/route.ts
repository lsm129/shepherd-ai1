import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { earnPoints } from '@/lib/points';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


function getAdminClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/community - Browse community knowledge base
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const supabase = getAdminClient();

    // generations table only has: id, user_id, tool_type, input_summary, created_at
    // We store all post data as JSON in input_summary
    let dbQuery = supabase
      .from('generations')
      .select('id, user_id, tool_type, input_summary, created_at')
      .eq('tool_type', 'community_post');

    if (query) {
      dbQuery = dbQuery.ilike('input_summary', `%${query}%`);
    }

    if (sort === 'newest') {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    const from = (page - 1) * limit;
    dbQuery = dbQuery.range(from, from + limit - 1);

    const { data: posts, error } = await dbQuery;

    if (error) {
      console.error('Community query error:', error);
      return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
    }

    const parsedPosts = (posts || []).map((p: any) => {
      let contentObj: any = {};
      try { contentObj = JSON.parse(p.input_summary || '{}'); } catch {
        contentObj = { title: p.input_summary || 'Untitled', body: '' };
      }

      return {
        id: p.id,
        user_id: p.user_id,
        created_at: p.created_at,
        title: contentObj.title || 'Untitled',
        body: contentObj.body || '',
        category: contentObj.category || 'general',
        tags: contentObj.tags || [],
        likes: contentObj.likes || 0,
        views: contentObj.views || 0,
        author_name: contentObj.author_name || 'A Fellow Pastor',
        church_name: contentObj.church_name || '',
        liked_by: contentObj.liked_by || [],
        image_urls: contentObj.image_urls || [],
        video_url: contentObj.video_url || '',
      };
    });

    // Filter by category after parsing
    let filtered = parsedPosts;
    if (category) {
      filtered = parsedPosts.filter((p: any) => p.category === category);
    }

    // Fill author names from church_settings
    const authorIds = [...new Set(filtered.map((p: any) => p.user_id))];
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('church_settings')
        .select('user_id, pastor_name, church_name')
        .in('user_id', authorIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });

      filtered.forEach((p: any) => {
        if ((!p.author_name || p.author_name === 'A Fellow Pastor') && profileMap[p.user_id]) {
          p.author_name = profileMap[p.user_id].pastor_name || 'A Fellow Pastor';
          p.church_name = p.church_name || profileMap[p.user_id].church_name || '';
        }
      });
    }

    if (sort === 'popular') {
      filtered.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
    }

    return NextResponse.json({ posts: filtered, page, hasMore: filtered.length === limit });
  } catch (error: any) {
    console.error('Community GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load posts' }, { status: 500 });
  }
}

// POST /api/community - Create a new community post
export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, category, tags, image_urls, video_url } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'userId, title, and body are required' }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 });
    }

    if (body.length > 5000) {
      return NextResponse.json({ error: 'Content must be 5000 characters or less' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: settings } = await supabase
      .from('church_settings')
      .select('pastor_name, church_name')
      .eq('user_id', userId)
      .single();

    const authorName = settings?.pastor_name || 'A Fellow Pastor';
    const churchName = settings?.church_name || '';

    // Store all data as JSON in input_summary (since no content column)
    const inputSummary = JSON.stringify({
      title: title.trim(),
      body: body.trim(),
      category: category || 'general',
      tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
      likes: 0,
      views: 0,
      liked_by: [] as string[],
      author_name: authorName,
      church_name: churchName,
      image_urls: Array.isArray(image_urls) ? image_urls.slice(0, 5) : [],
      video_url: video_url || '',
    });

    const { data: post, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        tool_type: 'community_post',
        input_summary: inputSummary,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Community post insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    try { await earnPoints(userId, 'template_shared'); } catch (e) {
      console.error('Points award error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Post published! +50 points',
      post_id: post.id,
    });
  } catch (error: any) {
    console.error('Community POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
  }
}

// PATCH /api/community - Like/unlike/view a post
export async function PATCH(request: NextRequest) {
  try {
    const { userId, postId, action } = await request.json();

    if (!userId || !postId || !action) {
      return NextResponse.json({ error: 'userId, postId, and action are required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: post, error: fetchError } = await supabase
      .from('generations')
      .select('input_summary, user_id')
      .eq('id', postId)
      .eq('tool_type', 'community_post')
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let contentObj: any = {};
    try { contentObj = JSON.parse(post.input_summary || '{}'); } catch {
      contentObj = { title: post.input_summary, body: '' };
    }

    if (action === 'like') {
      const likedBy: string[] = contentObj.liked_by || [];
      if (likedBy.includes(userId)) {
        return NextResponse.json({ error: 'Already liked' }, { status: 400 });
      }
      likedBy.push(userId);
      contentObj.liked_by = likedBy;
      contentObj.likes = likedBy.length;
    } else if (action === 'unlike') {
      const likedBy: string[] = contentObj.liked_by || [];
      const idx = likedBy.indexOf(userId);
      if (idx > -1) likedBy.splice(idx, 1);
      contentObj.liked_by = likedBy;
      contentObj.likes = likedBy.length;
    } else if (action === 'view') {
      contentObj.views = (contentObj.views || 0) + 1;
    }

    const { error: updateError } = await supabase
      .from('generations')
      .update({ input_summary: JSON.stringify(contentObj) })
      .eq('id', postId);

    if (updateError) {
      console.error('Community update error:', updateError);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ success: true, likes: contentObj.likes, views: contentObj.views });
  } catch (error: any) {
    console.error('Community PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/community - Delete a post (only by author)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');

    if (!userId || !postId) {
      return NextResponse.json({ error: 'userId and postId are required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { error: deleteError } = await supabase
      .from('generations')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)
      .eq('tool_type', 'community_post');

    if (deleteError) {
      console.error('Community delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    console.error('Community DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}

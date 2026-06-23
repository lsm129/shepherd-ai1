import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

// POST: Add a reply to a prayer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prayerId, userId, content } = body;

    if (!prayerId) {
      return NextResponse.json({ error: 'prayerId is required' }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Verify the prayer exists
    const { data: post, error: fetchError } = await supabase
      .from('church_community_posts')
      .select('id, church_user_id')
      .eq('id', prayerId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Prayer not found' }, { status: 404 });
    }

    // Get user name for the reply
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const authorName = user?.user_metadata?.full_name || user?.user_metadata?.pastor_name || user?.email?.split('@')[0] || 'Anonymous';

    // Try inserting into prayer_replies table
    const { data: reply, error: insertError } = await supabase
      .from('prayer_replies')
      .insert({
        prayer_id: prayerId,
        user_id: userId,
        content: content.trim(),
        author_name: authorName,
      })
      .select()
      .single();

    if (!insertError && reply) {
      // prayer_replies table exists
      return NextResponse.json({
        success: true,
        reply: {
          id: reply.id,
          prayerId: reply.prayer_id,
          userId: reply.user_id,
          content: reply.content,
          authorName: reply.author_name,
          createdAt: reply.created_at,
        },
      });
    }

    // Fallback: store reply as a church_community_post with category='prayer_reply'
    const { data: fallbackReply, error: fallbackError } = await supabase
      .from('church_community_posts')
      .insert({
        church_user_id: post.church_user_id,
        user_id: userId,
        title: `Reply::${prayerId}`,
        body: content.trim(),
        category: 'prayer_reply',
        author_name: authorName,
        likes: 0,
        liked_by: [],
      })
      .select()
      .single();

    if (fallbackError) {
      console.error('Reply insert error:', fallbackError);
      return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reply: {
        id: fallbackReply.id,
        prayerId: prayerId,
        userId: userId,
        content: fallbackReply.body,
        authorName: fallbackReply.author_name,
        createdAt: fallbackReply.created_at,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add reply';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: Fetch replies for a prayer
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const prayerId = url.searchParams.get('prayerId');

    if (!prayerId) {
      return NextResponse.json({ error: 'prayerId is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Try prayer_replies table first
    const { data: replies, error: replyError } = await supabase
      .from('prayer_replies')
      .select('*')
      .eq('prayer_id', prayerId)
      .order('created_at', { ascending: true });

    if (!replyError && replies && replies.length >= 0) {
      // prayer_replies table exists (even if empty)
      return NextResponse.json({
        success: true,
        replies: (replies || []).map((r: { id: string; prayer_id: string; user_id: string; content: string; author_name: string; created_at: string }) => ({
          id: r.id,
          prayerId: r.prayer_id,
          userId: r.user_id,
          content: r.content,
          authorName: r.author_name,
          createdAt: r.created_at,
        })),
      });
    }

    // Fallback: get replies from church_community_posts with title prefix
    const { data: fallbackReplies } = await supabase
      .from('church_community_posts')
      .select('*')
      .eq('category', 'prayer_reply')
      .like('title', `Reply::${prayerId}%`)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      success: true,
      replies: (fallbackReplies || []).map((r: { id: string; body: string; user_id: string; author_name: string; created_at: string }) => ({
        id: r.id,
        prayerId: prayerId,
        userId: r.user_id,
        content: r.body,
        authorName: r.author_name,
        createdAt: r.created_at,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch replies';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

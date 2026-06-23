import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

// POST: Like a prayer (toggle - like if not liked, unlike if already liked)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prayerId, userId } = body;

    if (!prayerId) {
      return NextResponse.json({ error: 'prayerId is required' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Verify prayer exists
    const { data: post, error: fetchError } = await supabase
      .from('church_community_posts')
      .select('id, liked_by, like_count, likes')
      .eq('id', prayerId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Prayer not found' }, { status: 404 });
    }

    // Try using prayer_likes table first
    const { data: existingLike } = await supabase
      .from('prayer_likes')
      .select('id')
      .eq('prayer_id', prayerId)
      .eq('user_id', userId)
      .single();

    if (existingLike !== null) {
      // prayer_likes table exists, use it
      if (existingLike) {
        // Unlike: delete from prayer_likes
        const { error: deleteError } = await supabase
          .from('prayer_likes')
          .delete()
          .eq('prayer_id', prayerId)
          .eq('user_id', userId);

        if (deleteError) {
          return NextResponse.json({ error: 'Failed to unlike' }, { status: 500 });
        }
      } else {
        // Like: insert into prayer_likes
        const { error: insertError } = await supabase
          .from('prayer_likes')
          .insert({ prayer_id: prayerId, user_id: userId });

        if (insertError) {
          return NextResponse.json({ error: 'Failed to like' }, { status: 500 });
        }
      }

      // Get updated like count from prayer_likes
      const { data: allLikes } = await supabase
        .from('prayer_likes')
        .select('user_id')
        .eq('prayer_id', prayerId);
      const likedBy = (allLikes || []).map((l: { user_id: string }) => l.user_id);
      const newLiked = likedBy.includes(userId);

      // Sync legacy liked_by array on church_community_posts
      await supabase
        .from('church_community_posts')
        .update({ liked_by: likedBy, likes: likedBy.length, like_count: likedBy.length })
        .eq('id', prayerId);

      return NextResponse.json({
        success: true,
        liked: newLiked,
        likeCount: likedBy.length,
      });
    }

    // Fallback: use liked_by array on church_community_posts (prayer_likes table doesn't exist)
    const likedBy: string[] = post.liked_by || [];
    const alreadyLiked = likedBy.includes(userId);

    let newLikedBy: string[];
    if (alreadyLiked) {
      newLikedBy = likedBy.filter(id => id !== userId);
    } else {
      newLikedBy = [...likedBy, userId];
    }

    const updateData: Record<string, unknown> = {
      liked_by: newLikedBy,
      likes: newLikedBy.length,
    };

    // Try update with like_count first
    const { error: updateError1 } = await supabase
      .from('church_community_posts')
      .update({ ...updateData, like_count: newLikedBy.length })
      .eq('id', prayerId);

    if (updateError1) {
      // like_count column may not exist, try without
      await supabase
        .from('church_community_posts')
        .update(updateData)
        .eq('id', prayerId);
    }

    return NextResponse.json({
      success: true,
      liked: !alreadyLiked,
      likeCount: newLikedBy.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process like';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove a like (explicit unlike endpoint)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { prayerId, userId } = body;

    if (!prayerId || !userId) {
      return NextResponse.json({ error: 'prayerId and userId are required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Try deleting from prayer_likes table
    const { error: deleteError, count } = await supabase
      .from('prayer_likes')
      .delete()
      .eq('prayer_id', prayerId)
      .eq('user_id', userId);

    if (!deleteError) {
      // prayer_likes table exists, sync legacy array
      const { data: allLikes } = await supabase
        .from('prayer_likes')
        .select('user_id')
        .eq('prayer_id', prayerId);
      const likedBy = (allLikes || []).map((l: { user_id: string }) => l.user_id);

      await supabase
        .from('church_community_posts')
        .update({ liked_by: likedBy, likes: likedBy.length, like_count: likedBy.length })
        .eq('id', prayerId);

      return NextResponse.json({
        success: true,
        liked: false,
        likeCount: likedBy.length,
      });
    }

    // Fallback: use liked_by array
    const { data: post } = await supabase
      .from('church_community_posts')
      .select('liked_by, likes')
      .eq('id', prayerId)
      .single();

    if (!post) {
      return NextResponse.json({ error: 'Prayer not found' }, { status: 404 });
    }

    const likedBy: string[] = (post.liked_by || []).filter((id: string) => id !== userId);

    await supabase
      .from('church_community_posts')
      .update({ liked_by: likedBy, likes: likedBy.length, like_count: likedBy.length })
      .eq('id', prayerId);

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: likedBy.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to unlike';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

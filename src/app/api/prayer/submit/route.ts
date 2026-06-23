import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { earnPoints } from '@/lib/points';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, request: prayerRequest, anonymous, userId, postToChurch, postToCommunity } = body;
    if (!prayerRequest) return NextResponse.json({ error: 'Prayer request is required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);
    let displayName = anonymous ? 'Anonymous' : (name || 'Anonymous');
    let pastorId: string | null = null;

    if (userId) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (user) {
        const meta = user.user_metadata || {};
        displayName = anonymous ? 'Anonymous' : (name || meta.full_name || meta.pastor_name || user.email?.split('@')[0] || 'Anonymous');
        const joined: string[] = meta.joined_churches || [];
        if (joined.length > 0) pastorId = joined[0];
      }
    }

    const title = anonymous ? 'Prayer Request (Anonymous)' : `Prayer Request from ${displayName}`;
    let postedChurch = false;
    let postedCommunity = false;

    // 1. Post to Church Prayer Wall
    if (postToChurch && pastorId) {
      const { error } = await supabase.from('church_community_posts').insert({
        church_user_id: pastorId,
        user_id: userId || null,
        title: '⛪ ' + title,
        body: prayerRequest,
        category: 'prayer-request',
        author_name: displayName,
        likes: 0,
        liked_by: [],
      });
      if (!error) postedChurch = true;
    }

    // 2. Post to Community Prayer Wall (uses generations table, same as /community page)
    if (postToCommunity) {
      const communityPost = JSON.stringify({
        title: title,
        body: prayerRequest,
        category: 'prayer-request',
        author_name: displayName,
        church_name: '',
        tags: ['prayer'],
        likes: 0,
        views: 0,
      });
      const { error } = await supabase.from('generations').insert({
        user_id: userId || '7cd1f0bf-d4c6-4b15-bbc3-eb2fa49a1969',
        tool_type: 'community_post',
        input_summary: communityPost,
      });
      if (!error) postedCommunity = true;
    }

    // Award points
    if (userId) {
      try { await earnPoints(userId, 'generate_prayer'); } catch (e) {}
    }

    return NextResponse.json({ success: true, postedChurch, postedCommunity });
  } catch (error) {
    console.error('Prayer submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

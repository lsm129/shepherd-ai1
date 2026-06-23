import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function POST(request: NextRequest) {
  try {
    const { userId, subscribe } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Try updating profiles.email_subscriptions first
    let profileUpdated = false;
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        email_subscriptions: { daily_devotional: subscribe },
      })
      .eq('id', userId);

    if (!profileErr) {
      profileUpdated = true;
    }

    // Also update user_metadata as fallback (always works)
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (user) {
      const existingMeta = user.user_metadata || {};
      const existingSubs = existingMeta.email_subscriptions || {};
      const updatedSubs = { ...existingSubs, daily_devotional: subscribe };

      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingMeta,
          email_subscriptions: updatedSubs,
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscribed: subscribe,
      profileUpdated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update subscription';
    console.error('Subscribe devotional error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Check profiles.email_subscriptions first
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('email_subscriptions')
      .eq('id', userId)
      .single();

    if (!profileErr && profile?.email_subscriptions) {
      const subs = profile.email_subscriptions;
      return NextResponse.json({
        subscribed: subs.daily_devotional !== false,
      });
    }

    // Fallback to user_metadata
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};
    const subs = meta.email_subscriptions;

    return NextResponse.json({
      subscribed: !subs || subs.daily_devotional !== false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check subscription';
    console.error('Check devotional subscription error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

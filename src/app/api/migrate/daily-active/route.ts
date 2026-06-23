import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET || 'shepherdai_cron_2026_secret';
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get('x-cron-secret');
    if (secret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);
    const checks: Record<string, boolean> = {};
    const results: string[] = [];
    const { error: e1 } = await supabase.from('profiles').select('id,daily_devotional_email').limit(1);
    checks.daily_devotional_email = !e1;
    results.push(e1 ? 'profiles.daily_devotional_email: MISSING' : 'profiles.daily_devotional_email: OK');
    const { error: e2 } = await supabase.from('church_settings').select('user_id,weekly_digest_enabled').limit(1);
    checks.weekly_digest_enabled = !e2;
    results.push(e2 ? 'church_settings.weekly_digest_enabled: MISSING' : 'church_settings.weekly_digest_enabled: OK');
    const { error: e3 } = await supabase.from('church_community_posts').select('id,like_count').limit(1);
    checks.like_count = !e3;
    results.push(e3 ? 'church_community_posts.like_count: MISSING' : 'church_community_posts.like_count: OK');
    const { error: e4 } = await supabase.from('prayer_replies').select('id').limit(1);
    checks.prayer_replies = !e4;
    results.push(e4 ? 'prayer_replies table: MISSING' : 'prayer_replies table: OK');
    return NextResponse.json({ checks, results });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}

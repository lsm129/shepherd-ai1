import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const secret = body.secret;
  const cronSecret = process.env.CRON_SECRET || 'shepherdai_cron_2026_secret';
  if (secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey);
    
    // Check if column exists
    const { data, error } = await supabase
      .from('church_settings')
      .select('daily_devotional_enabled')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        columnExists: false, 
        error: error.message,
        manualSql: "ALTER TABLE church_settings ADD COLUMN IF NOT EXISTS daily_devotional_enabled boolean DEFAULT false;"
      });
    }

    return NextResponse.json({ columnExists: true, sample: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const secret = body.secret || request.headers.get('x-cron-secret');
  const cronSecret = process.env.CRON_SECRET || 'shepherdai_cron_2026_secret';
  if (secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if column exists by querying
    const { data, error: selectError } = await supabase
      .from('church_settings')
      .select('daily_devotional_enabled')
      .limit(1);

    if (selectError) {
      return NextResponse.json({
        status: 'column_missing',
        message: 'Column daily_devotional_enabled does not exist. Please add it manually in Supabase SQL Editor:',
        sql: "ALTER TABLE church_settings ADD COLUMN IF NOT EXISTS daily_devotional_enabled boolean DEFAULT false;"
      });
    }

    return NextResponse.json({ status: 'column_exists', sample: data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

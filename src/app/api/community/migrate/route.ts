import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'shepherdai-migrate-2024';

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Check if columns exist by attempting a select
    const { data: testData, error: testError } = await supabase
      .from('church_community_posts')
      .select('id, image_urls, video_url')
      .limit(1);

    if (testError && (testError.message?.includes('image_urls') || testError.message?.includes('video_url'))) {
      return NextResponse.json({ 
        error: 'Columns do not exist yet. Please run the migration SQL in Supabase Dashboard manually.',
        sql: 'ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT {}; ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS video_url TEXT;'
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration columns verified',
      columns_exist: true 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message || 'Migration failed' }, { status: 500 });
  }
}

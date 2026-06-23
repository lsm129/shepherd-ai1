import { NextRequest, NextResponse } from 'next/server';

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const SQL = `
CREATE TABLE IF NOT EXISTS ai_style_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  style_data JSONB DEFAULT '{"preferred_greetings":[],"avoided_phrases":[],"scripture_preferences":[],"tone_adjectives":[],"signoff_style":"","editing_patterns":{},"preaching_style":""}'::jsonb,
  generations_analyzed INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_style_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON ai_style_profiles;
CREATE POLICY "Service role full access" ON ai_style_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ai_style_profiles_user_id ON ai_style_profiles(user_id);
`;

export async function POST(request: NextRequest) {
  try {
    // First check if table already exists via REST API
    const { createClient } = await import('@supabase/supabase-js');
    const { supabaseUrl } = await import('@/lib/supabase-config');
    const supabase = createClient(supabaseUrl, SERVICE_KEY);

    const { error: checkErr } = await supabase.from('ai_style_profiles').select('id').limit(1);
    if (!checkErr) {
      return NextResponse.json({ status: 'already_exists', message: 'ai_style_profiles table already exists' });
    }

    // Try DATABASE_URL with pg
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        const pg = await import('pg');
        const client = new pg.Client({
          connectionString: databaseUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 15000,
        });
        await client.connect();
        await client.query(SQL);
        await client.end();
        return NextResponse.json({ status: 'created', message: 'ai_style_profiles table created via DATABASE_URL' });
      } catch (pgErr: any) {
        console.error('DATABASE_URL connection failed:', pgErr.message);
      }
    }

    return NextResponse.json({
      status: 'needs_creation',
      message: 'Could not create table automatically. Please run the SQL in Supabase Dashboard > SQL Editor.',
      sql: SQL.trim(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

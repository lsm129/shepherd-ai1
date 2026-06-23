import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, SERVICE_KEY);
    
    // Check if table already exists
    const { error: checkErr } = await supabase.from('ai_style_profiles').select('id').limit(1);
    if (!checkErr) {
      return NextResponse.json({ status: 'already_exists', message: 'ai_style_profiles table already exists' });
    }

    // Try to use DATABASE_URL to create the table directly
    // Try multiple connection methods
    const connectionUrls = [
      process.env.DATABASE_URL,
      process.env.DIRECT_URL,
    ].filter(Boolean);

    let tableCreated = false;
    for (const databaseUrl of connectionUrls) {
      if (tableCreated) break;
      try {
        const pg = await import('pg');
        const client = new pg.Client({
          connectionString: databaseUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 15000,
        });
        await client.connect();
        
        await client.query(`
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
        `);
        
        await client.end();
        tableCreated = true;
        return NextResponse.json({ status: 'created', message: 'ai_style_profiles table created successfully via DATABASE_URL' });
      } catch (pgErr: any) {
        console.error('SQL creation failed for URL:', pgErr.message);
      }
    }

    return NextResponse.json({
      status: 'needs_creation',
      message: 'Could not create table automatically. Please run the SQL in Supabase Dashboard > SQL Editor.',
      sql: `CREATE TABLE IF NOT EXISTS ai_style_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  style_data JSONB DEFAULT '{"preferred_greetings":[],"avoided_phrases":[],"scripture_preferences":[],"tone_adjectives":[],"signoff_style":"","editing_patterns":{},"preaching_style":""}'::jsonb,
  generations_analyzed INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_style_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON ai_style_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ai_style_profiles_user_id ON ai_style_profiles(user_id);`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

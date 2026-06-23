import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const CREATE_TABLES_SQL = `
-- Create prayer_likes table
CREATE TABLE IF NOT EXISTS prayer_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID NOT NULL REFERENCES church_community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prayer_id, user_id)
);

-- Create prayer_replies table
CREATE TABLE IF NOT EXISTS prayer_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID NOT NULL REFERENCES church_community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prayer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for prayer_likes
DO $$ BEGIN
  CREATE POLICY "Anyone can view prayer likes" ON prayer_likes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert prayer likes" ON prayer_likes FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own prayer likes" ON prayer_likes FOR DELETE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS policies for prayer_replies
DO $$ BEGIN
  CREATE POLICY "Anyone can view prayer replies" ON prayer_replies FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert prayer replies" ON prayer_replies FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prayer_likes_prayer_id ON prayer_likes(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_likes_user_id ON prayer_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_replies_prayer_id ON prayer_replies(prayer_id);
`;

export async function POST(request: NextRequest) {
  try {
    // Method 1: Try using pg module with DATABASE_URL
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL || '',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      const client = await pool.connect();
      await client.query(CREATE_TABLES_SQL);
      client.release();
      await pool.end();
      return NextResponse.json({ success: true, message: 'Tables created via pg connection' });
    } catch (pgError: unknown) {
      console.log('pg connection failed:', pgError instanceof Error ? pgError.message : 'unknown');
    }

    // Method 2: Try Supabase Management API
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    if (accessToken) {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/hsunvuixqesjcoohbrmp/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: CREATE_TABLES_SQL }),
        }
      );
      if (response.ok) {
        return NextResponse.json({ success: true, message: 'Tables created via Management API' });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Could not connect to database. Please run the following SQL in the Supabase SQL Editor:',
      sql: CREATE_TABLES_SQL,
    }, { status: 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create tables';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: Return the SQL for manual execution
export async function GET() {
  return NextResponse.json({
    sql: CREATE_TABLES_SQL,
    instructions: 'Run this SQL in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/hsunvuixqesjcoohbrmp/sql)',
  });
}

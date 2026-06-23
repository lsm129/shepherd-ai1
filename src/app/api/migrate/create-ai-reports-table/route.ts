import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const SQL = `
CREATE TABLE IF NOT EXISTS church_ai_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID,
  report_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  health_score INTEGER,
  report_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE church_ai_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Service role full access" ON church_ai_reports FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_church_ai_reports_church_id ON church_ai_reports(church_id);
CREATE INDEX IF NOT EXISTS idx_church_ai_reports_created_at ON church_ai_reports(created_at);
`;

export async function GET() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, SERVICE_ROLE_KEY);

    // Check if table exists by trying to select from it
    const { error: checkError } = await supabaseAdmin
      .from('church_ai_reports')
      .select('id')
      .limit(1);

    if (!checkError) {
      return NextResponse.json({ success: true, message: 'church_ai_reports table already exists' });
    }

    // Table doesn't exist - try to create it using pg_net if available
    // pg_net allows making HTTP requests from PostgreSQL
    // But we can't execute DDL through REST API. Let's try a different approach.
    
    // Use the supabase rpc to try executing SQL
    // Most Supabase projects don't have exec_sql, so this will likely fail
    try {
      const { error: rpcError } = await supabaseAdmin.rpc('exec_sql', { query: SQL });
      if (!rpcError) {
        return NextResponse.json({ success: true, message: 'church_ai_reports table created via RPC' });
      }
    } catch (e) {
      // RPC not available
    }

    // If we can't create the table, provide SQL for manual creation
    return NextResponse.json({
      success: false,
      message: 'Table needs to be created manually. Please run the SQL in Supabase Dashboard > SQL Editor.',
      sql: SQL,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  // POST method also tries the same thing
  return GET();
}

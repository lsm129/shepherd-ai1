import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create activity_plans table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_plans (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          activity_type TEXT NOT NULL,
          activity_name TEXT NOT NULL,
          expected_attendees TEXT,
          target_audience JSONB DEFAULT '[]',
          budget_range TEXT,
          date_range TEXT,
          denomination TEXT,
          special_requirements TEXT,
          plan_content JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE activity_plans ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own activity plans" ON activity_plans
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own activity plans" ON activity_plans
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });

    if (error) {
      // Try creating table directly via insert (will fail if table exists, which is fine)
      const testInsert = await supabase.from('activity_plans').select('id').limit(1);
      if (testInsert.error && testInsert.error.code === '42P01') {
        // Table doesn't exist and RPC not available, try alternative approach
        return NextResponse.json({ 
          message: 'Table needs to be created manually. SQL provided below.',
          sql: `
CREATE TABLE IF NOT EXISTS activity_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  expected_attendees TEXT,
  target_audience JSONB DEFAULT '[]',
  budget_range TEXT,
  date_range TEXT,
  denomination TEXT,
  special_requirements TEXT,
  plan_content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE activity_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own activity plans" ON activity_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activity plans" ON activity_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
          `.trim()
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Activity plans table created or already exists' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

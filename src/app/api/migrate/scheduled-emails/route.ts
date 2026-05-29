import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: checkError } = await supabase
      .from('scheduled_emails')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST205') {
      return NextResponse.json({ 
        status: 'table_not_found', 
        message: 'Please create the scheduled_emails table in Supabase SQL Editor',
        sql: `CREATE TABLE IF NOT EXISTS scheduled_emails (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID, recipient_email TEXT NOT NULL, recipient_name TEXT NOT NULL, week INTEGER NOT NULL, subject TEXT NOT NULL, body TEXT, scheduled_for TIMESTAMPTZ NOT NULL, status TEXT DEFAULT 'pending', brevo_message_id TEXT, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()); ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY; CREATE POLICY "Service role full access" ON scheduled_emails FOR ALL USING (true) WITH CHECK (true);`
      });
    }

    return NextResponse.json({ status: 'table_exists' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

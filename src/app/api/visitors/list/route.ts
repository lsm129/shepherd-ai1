import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, getServiceRoleKey());

    const { data: visitors, error } = await supabase
      .from('visitor_followups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch visitors:', error);
      return NextResponse.json({ error: 'Failed to fetch visitors' }, { status: 500 });
    }

    // Parse notes JSON to extract AI emails and metadata
    const enrichedVisitors = (visitors || []).map((v: any) => {
      let parsedNotes: any = {};
      try {
        parsedNotes = JSON.parse(v.notes || '{}');
      } catch {
        parsedNotes = { raw_notes: v.notes };
      }

      return {
        id: v.id,
        visitor_name: v.visitor_name,
        visitor_email: v.visitor_email,
        visitor_phone: v.visitor_phone,
        visit_date: v.visit_date,
        followup_status: v.followup_status,
        email_sequence_started: v.email_sequence_started,
        email_sequence_id: v.email_sequence_id,
        how_heard: parsedNotes.how_heard || '',
        interests: parsedNotes.interests || '',
        ai_emails: parsedNotes.ai_emails || [],
        emails_status: parsedNotes.emails_status || 'none',
        created_at: v.created_at,
        updated_at: v.updated_at,
      };
    });

    return NextResponse.json({ success: true, visitors: enrichedVisitors });
  } catch (error: any) {
    console.error('List visitors error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list visitors' },
      { status: 500 }
    );
  }
}

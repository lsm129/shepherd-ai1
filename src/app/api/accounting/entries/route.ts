import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('churchId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const type = searchParams.get('type');

    if (!churchId) {
      return NextResponse.json({ error: 'churchId is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, SERVICE_ROLE_KEY);

    let query = supabaseAdmin
      .from('church_transactions')
      .select('*')
      .eq('church_id', churchId)
      .order('transaction_date', { ascending: false });

    if (year) {
      const y = parseInt(year);
      if (month) {
        const m = parseInt(month);
        const startDate = new Date(y, m - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(y, m, 0).toISOString().split('T')[0];
        query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
      } else {
        const startDate = new Date(y, 0, 1).toISOString().split('T')[0];
        const endDate = new Date(y, 11, 31).toISOString().split('T')[0];
        query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
      }
    }

    if (type && ['income', 'expense'].includes(type)) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch entries error:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entries: data || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch entries';
    console.error('Accounting entries error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

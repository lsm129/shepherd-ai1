import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { CRON_SECRET } = process.env;
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get('x-cron-secret');
    
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

    // Execute SQL directly via Supabase REST API (using pg_net extension or direct fetch)
    // We'll use a simpler approach: try to select the column, and if it fails, we need manual migration
    
    // Try adding discount_codes column via SQL
    try {
      const sqlRes = await fetch(supabaseUrl + '/rest/v1/rpc/', {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      // This will likely fail - that's ok, we check differently
    } catch (e) {}

    // Simple column check via Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: discountErr } = await supabase.from('profiles').select('discount_codes').limit(1);
    if (discountErr) {
      results.push('discount_codes: NEEDS MANUAL ADD - Run: ALTER TABLE profiles ADD COLUMN discount_codes jsonb DEFAULT \'[]\'::jsonb;');
    } else {
      results.push('discount_codes: OK');
    }

    const { error: subErr } = await supabase.from('profiles').select('subscription_discount').limit(1);
    if (subErr) {
      results.push('subscription_discount: NEEDS MANUAL ADD');
    } else {
      results.push('subscription_discount: OK');
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

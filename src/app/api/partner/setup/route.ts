import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const SETUP_SECRET = process.env.PARTNER_SETUP_SECRET || 'shepherdai_partner_setup_2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const secret = body.secret || req.headers.get('x-setup-secret');
    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminHeaders = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    };

    // Check if tables already exist
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?select=id&limit=1`,
      { headers: adminHeaders }
    );

    if (checkRes.ok) {
      return NextResponse.json({ message: 'Tables already exist', setup: false });
    }

    // Tables don't exist yet - try to create via DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({
        status: 'needs_setup',
        message: 'Partner tables not found. Run the SQL migration in Supabase Dashboard SQL Editor.',
        sqlFile: 'supabase/migrations/20260601000000_partner_system.sql',
      }, { status: 200 });
    }

    const { Client } = await import('pg');
    const fs = await import('fs');
    const path = await import('path');

    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20260601000000_partner_system.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await client.query(sql);
      const res = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'partner%'"
      );
      await client.end();
      return NextResponse.json({
        success: true,
        tablesCreated: res.rows.map((r: any) => r.table_name),
      });
    } catch (e: any) {
      try { await client.end(); } catch (e2) {}
      return NextResponse.json({
        status: 'needs_setup',
        message: 'Could not connect to database. Run the SQL migration in Supabase Dashboard SQL Editor.',
        error: e.message?.substring(0, 100),
        sqlFile: 'supabase/migrations/20260601000000_partner_system.sql',
      }, { status: 200 });
    }
  } catch (err: any) {
    console.error('Partner setup error:', err);
    return NextResponse.json({ error: err.message || 'Setup failed' }, { status: 500 });
  }
}

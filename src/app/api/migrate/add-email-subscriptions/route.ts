import { NextRequest, NextResponse } from 'next/server';

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const PASSWORD = 'Lsm1986129%26lsm';
const PROJECT_REF = 'hsunvuixqesjcoohbrmp';

export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET || 'shepherdai_cron_2026_secret';
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get('x-cron-secret');
    if (secret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { Pool } = await import('pg');
    let pool: any = null;
    let connectionMethod = '';

    const regions = ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ap-northeast-1', 'ap-southeast-1', 'eu-west-1', 'eu-central-1'];
    const ports = [6543, 5432];
    const userFormats = [
      `postgres.${PROJECT_REF}`,
      `postgres`,
    ];

    const connectionConfigs: Array<{name: string, connStr: string}> = [];

    for (const region of regions) {
      for (const port of ports) {
        for (const user of userFormats) {
          const host = `aws-0-${region}.pooler.supabase.com`;
          connectionConfigs.push({
            name: `pooler-${region}-${port}-${user.replace('.', '_')}`,
            connStr: `postgresql://${user}:${PASSWORD}@${host}:${port}/postgres`
          });
        }
      }
    }

    if (process.env.DATABASE_URL) {
      connectionConfigs.push({ name: 'direct-env', connStr: process.env.DATABASE_URL });
    }

    for (const config of connectionConfigs) {
      try {
        const testPool = new Pool({
          connectionString: config.connStr,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 10000
        });
        const result = await testPool.query('SELECT 1 as test');
        pool = testPool;
        connectionMethod = config.name;
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message.substring(0, 100) : String(err).substring(0, 100);
      }
    }

    if (!pool) {
      return NextResponse.json({
        error: 'Could not connect to database',
        hint: 'Add email_subscriptions column manually: ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_subscriptions JSONB DEFAULT \'{"daily_devotional": true}\'::jsonb;'
      }, { status: 500 });
    }

    // Add email_subscriptions column
    const results: string[] = [];

    try {
      await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_subscriptions JSONB DEFAULT '{"daily_devotional": true}'::jsonb`);
      results.push('Added email_subscriptions JSONB column to profiles');
    } catch (e: unknown) {
      results.push(`email_subscriptions: ${e instanceof Error ? e.message : 'error'}`);
    }

    // Verify the column exists
    const { rows } = await pool.query(
      `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_subscriptions'`
    );

    await pool.end();

    return NextResponse.json({
      success: true,
      connectionMethod,
      results,
      columns: rows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Migration failed';
    console.error('Migration error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const attempts: Record<string, string> = {};

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

    // Also try direct connection
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
        // Only store interesting errors, not the duplicate "tenant not found" ones
        if (!msg.includes('ENOTFOUND db.') && !msg.includes('tenant/user postgres. not found')) {
          attempts[config.name] = msg;
        }
        // Store first error for each region
        if (!Object.keys(attempts).some(k => k.includes(config.name.split('-').slice(0, 2).join('-')))) {
          attempts[config.name] = msg;
        }
      }
    }

    if (!pool) {
      // Store a sample of attempts
      const sampleAttempts: Record<string, string> = {};
      const keys = Object.keys(attempts);
      for (const key of keys.slice(0, 10)) {
        sampleAttempts[key] = attempts[key];
      }
      return NextResponse.json({ 
        error: 'Could not connect to database',
        totalAttempted: connectionConfigs.length,
        sampleAttempts
      }, { status: 500 });
    }

    const sqls = [
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_devotional_email boolean DEFAULT true;',
      'ALTER TABLE church_settings ADD COLUMN IF NOT EXISTS weekly_digest_enabled boolean DEFAULT true;',
      'ALTER TABLE church_settings ADD COLUMN IF NOT EXISTS daily_devotional_enabled boolean DEFAULT false;',
      'ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;',
      `CREATE TABLE IF NOT EXISTS prayer_replies (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        prayer_id uuid NOT NULL REFERENCES church_community_posts(id) ON DELETE CASCADE,
        user_id uuid NOT NULL,
        content text NOT NULL,
        author_name text DEFAULT 'Anonymous',
        created_at timestamptz DEFAULT now()
      );`,
      'ALTER TABLE prayer_replies ENABLE ROW LEVEL SECURITY;',
      'DROP POLICY IF EXISTS "Allow read access" ON prayer_replies;',
      'CREATE POLICY "Allow read access" ON prayer_replies FOR SELECT USING (true);',
      'DROP POLICY IF EXISTS "Allow insert" ON prayer_replies;',
      'CREATE POLICY "Allow insert" ON prayer_replies FOR INSERT WITH CHECK (true);',
    ];

    const results: string[] = [];

    for (const sql of sqls) {
      try {
        await pool.query(sql);
        results.push('OK: ' + sql.substring(0, 80));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'unknown';
        results.push('ERR: ' + sql.substring(0, 80) + ' => ' + msg);
      }
    }

    await pool.end();

    // Verify via REST API
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const checks: Record<string, boolean> = {};
    
    const { error: c1 } = await supabase.from('profiles').select('id,daily_devotional_email').limit(1);
    checks.daily_devotional_email = !c1;
    const { error: c2 } = await supabase.from('church_settings').select('user_id,weekly_digest_enabled').limit(1);
    const { error: c5 } = await supabase.from('church_settings').select('daily_devotional_enabled').limit(1);
    checks.weekly_digest_enabled = !c2;
    checks.daily_devotional_enabled = !c5;
    const { error: c3 } = await supabase.from('church_community_posts').select('id,like_count').limit(1);
    checks.like_count = !c3;
    const { error: c4 } = await supabase.from('prayer_replies').select('id').limit(1);
    checks.prayer_replies = !c4;

    return NextResponse.json({ 
      success: true, 
      connectionMethod,
      results, 
      checks 
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

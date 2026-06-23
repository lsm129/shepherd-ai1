import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  const sql = `ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}'; ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS video_url TEXT;`;

  try {
    const pg = await import('pg');
    const Pool = pg.Pool || pg.default?.Pool;
    
    if (!Pool) {
      return NextResponse.json({ 
        success: false, 
        message: 'pg Pool not available. Please run the SQL manually in Supabase SQL Editor.',
        sql
      }, { status: 200 });
    }

    // Try multiple connection formats with correct regions
    const connectionConfigs = [
      // Direct connection with SNI
      {
        connectionString: 'postgresql://postgres:Lsm1986129%26lsm@db.hsunvuixqesjcoohbrmp.supabase.co:5432/postgres',
        ssl: { rejectUnauthorized: false, servername: 'db.hsunvuixqesjcoohbrmp.supabase.co' }
      },
      // Session mode pooler - us-west-1
      {
        host: 'aws-0-us-west-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        user: 'postgres.hsunvuixqesjcoohbrmp',
        password: 'Lsm1986129&lsm',
        ssl: { rejectUnauthorized: false }
      },
      // Transaction mode pooler - us-west-1
      {
        host: 'aws-0-us-west-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.hsunvuixqesjcoohbrmp',
        password: 'Lsm1986129&lsm',
        ssl: { rejectUnauthorized: false }
      },
      // Direct connection
      {
        host: 'db.hsunvuixqesjcoohbrmp.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'Lsm1986129&lsm',
        ssl: { rejectUnauthorized: false }
      },
    ];

    const errors: string[] = [];

    for (const config of connectionConfigs) {
      const pool = new Pool(typeof config === 'object' && 'connectionString' in config ? config : config);
      try {
        const client = await pool.connect();
        console.log(`Connected via ${JSON.stringify(config).substring(0, 80)}`);
        await client.query("ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}'");
        await client.query("ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS video_url TEXT");
        client.release();
        await pool.end();
        return NextResponse.json({ success: true, message: 'Media columns created successfully!' });
      } catch (err: any) {
        errors.push(`${(config as any).host || 'connectionString'}: ${err.message}`);
        try { await pool.end(); } catch {}
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Could not connect to database. Please run the SQL manually in Supabase SQL Editor.',
      errors,
      sql
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      sql
    }, { status: 500 });
  }
}

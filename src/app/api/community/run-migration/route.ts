import { NextRequest, NextResponse } from 'next/server';

const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'shepherdai-migrate-2024';

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try postgres.js (better SNI/TLS support)
    const dbUrl = process.env.DATABASE_URL;
    const errors: string[] = [];

    if (dbUrl) {
      try {
        const postgres = (await import('postgres')).default;
        const sql = postgres(dbUrl, {
          ssl: 'prefer',
          connect_timeout: 15,
        });

        await sql`ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}'`;
        await sql`ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS video_url TEXT`;

        const columns = await sql`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'church_community_posts' AND column_name IN ('image_urls', 'video_url')
        `;

        await sql.end();

        return NextResponse.json({
          success: true,
          method: 'postgres_js',
          columns: columns.map((r: any) => r.column_name)
        });
      } catch (err: any) {
        errors.push(`postgres.js: ${err.message}`);
        console.error('postgres.js failed:', err.message);
      }
    }

    // Fallback: try pg module with various connection strings
    const connectionStrings = [
      'postgresql://postgres:Lsm1986129%26lsm@db.hsunvuixqesjcoohbrmp.supabase.co:5432/postgres',
      'postgresql://postgres.hsunvuixqesjcoohbrmp:Lsm1986129%26lsm@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    ];

    try {
      const { Client } = await import('pg');
      for (const connStr of connectionStrings) {
        try {
          const client = new Client({
            connectionString: connStr,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000,
          });
          await client.connect();
          await client.query("ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}'");
          await client.query("ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS video_url TEXT");
          const result = await client.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'church_community_posts' AND column_name IN ('image_urls', 'video_url')"
          );
          await client.end();
          return NextResponse.json({
            success: true,
            method: 'pg',
            columns: result.rows.map((r: any) => r.column_name)
          });
        } catch (err: any) {
          errors.push(`pg ${connStr.split('@')[1]?.split('/')[0]}: ${err.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`pg import: ${err.message}`);
    }

    return NextResponse.json({
      success: false,
      message: 'Could not connect to database. Please run the SQL manually in Supabase Dashboard.',
      errors,
      sql: "ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}'; ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS video_url TEXT;"
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message || 'Migration failed' }, { status: 500 });
  }
}

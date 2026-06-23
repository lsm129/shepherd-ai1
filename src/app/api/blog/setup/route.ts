import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function GET(req: NextRequest) {
  try {
    const errors: string[] = [];
    
    // Method 1: Try DATABASE_URL (direct pg, bypasses PostgREST)
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        const pg = await import('pg');
        const client = new pg.Client({
          connectionString: databaseUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 15000,
        });
        await client.connect();
        await client.query(`
          CREATE TABLE IF NOT EXISTS blog_posts (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            title text NOT NULL,
            slug text UNIQUE NOT NULL,
            excerpt text,
            content text NOT NULL,
            cover_image text,
            author text DEFAULT 'ShepherdAI Team',
            published boolean DEFAULT false,
            featured boolean DEFAULT false,
            meta_description text,
            tags text[] DEFAULT '{}'::text[],
            language text DEFAULT 'en',
            published_at timestamptz,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );
        `);
        console.log('blog_posts table created via DATABASE_URL');
        
        // Also try to force refresh PostgREST schema cache
        try {
          await client.query('NOTIFY pgrst, \'reload schema\'');
        } catch {}
        
        await client.end();
        
        return NextResponse.json({
          status: 'created_via_direct_pg',
          message: 'blog_posts table created directly via DATABASE_URL',
        });
      } catch (e: any) {
        errors.push(`DATABASE_URL method failed: ${e.message}`);
      }
    }

    // Method 2: Try Supabase service role (PostgREST)
    try {
      const supabase = createClient(supabaseUrl, SERVICE_KEY);
      const { error: checkErr } = await supabase.from('blog_posts').select('id').limit(1);
      if (!checkErr) {
        return NextResponse.json({ 
          status: 'already_exists',
          message: 'blog_posts table already exists and is accessible via PostgREST',
        });
      }
      errors.push(`PostgREST: ${checkErr?.message}`);
    } catch (e: any) {
      errors.push(`Supabase method failed: ${e.message}`);
    }
    
    return NextResponse.json({
      status: 'failed',
      table_exists: false,
      errors
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Lsm1986129%26lsm@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('Connected!');
  
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
      tags text[] DEFAULT '{}',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  `);
  console.log('Table blog_posts created!');
  
  // Enable RLS
  await client.query('ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;');
  
  // Public can read published posts
  await client.query(`
    CREATE POLICY "Blog posts are publicly readable" ON blog_posts
    FOR SELECT USING (published = true);
  `);
  
  // Service role can do everything
  await client.query(`
    CREATE POLICY "Service role full access" ON blog_posts
    FOR ALL USING (true) WITH CHECK (true);
  `);
  
  console.log('RLS policies created!');
  
  await client.end();
} catch (err) {
  console.error('Error:', err.message);
  await client.end().catch(() => {});
}

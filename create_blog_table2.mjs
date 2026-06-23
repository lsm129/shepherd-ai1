import pg from 'pg';
import dns from 'dns/promises';

// Resolve the hostname to get IPv6
const addresses = await dns.resolve6('db.hsunvuixqesjcoohbrmp.supabase.co');
const ipv6Addr = addresses[0];
console.log('IPv6 address:', ipv6Addr);

const client = new pg.Client({
  host: ipv6Addr,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Lsm1986129&lsm',
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('Connected via IPv6!');
  
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
  
  await client.query('ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;');
  
  await client.query(`
    CREATE POLICY "Blog posts are publicly readable" ON blog_posts
    FOR SELECT USING (published = true);
  `);
  
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

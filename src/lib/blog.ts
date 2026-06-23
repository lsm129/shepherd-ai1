// src/lib/blog.ts — Shared Supabase blog queries
import { createClient } from '@supabase/supabase-js';
// Dynamic pg import for direct DB access (bypasses PostgREST schema cache issues)
let pgModule: any = null;
async function getPg() {
  if (!pgModule) {
    pgModule = await import('pg');
  }
  return pgModule;
}
import { supabaseUrl } from './supabase-config';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';

export function getSupabaseClient(useServiceRole = false) {
  const key = useServiceRole
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8')
    : supabaseAnonKey;
  return createClient(supabaseUrl, key);
}

// BLOG_API_KEY — used by AI auto-blogging script to authenticate POST /api/blog
// Generate once and set in Vercel env vars. Default is a placeholder.
export const BLOG_API_KEY = process.env.BLOG_API_KEY || 'sk-blog-4fd8b789-shepherdai';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author: string;
  published: boolean;
  featured: boolean;
  meta_description: string | null;
  tags: string[];
  language: string;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  author?: string;
  published?: boolean;
  featured?: boolean;
  meta_description?: string;
  tags?: string[];
  language?: string;
  published_at?: string;
}

export async function getPublishedPosts(language: 'en' | 'pt-br' = 'en'): Promise<BlogPost[]> {
  // Method 1: Direct pg via Supabase pooler (bypasses PostgREST schema cache issues)
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const pg = await import('pg');
      const url = new URL(databaseUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ''),
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      };
      const client = new pg.Client(config);
      await client.connect();
      const result = await client.query(
        `SELECT * FROM blog_posts WHERE published = true AND language = $1 ORDER BY published_at DESC, created_at DESC`,
        [language]
      );
      await client.end().catch(() => {});
      return result.rows.map(r => ({
        ...r,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || []),
      })) as BlogPost[];
    } catch (pgErr: any) {
      console.error('getPublishedPosts direct pg error:', pgErr.message);
    }
  }
  
  // Method 2: PostgREST fallback
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('language', language)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('getPublishedPosts error:', error);
    return [];
  }
  return data || [];
}

export async function getPostBySlug(slug: string, language?: string): Promise<BlogPost | null> {
  // Method 1: Direct pg (bypasses PostgREST schema cache)
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const pg = await import('pg');
      const url = new URL(databaseUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ''),
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      };
      const client = new pg.Client(config);
      await client.connect();
      let queryText = 'SELECT * FROM blog_posts WHERE slug = $1 AND published = true';
      const params: any[] = [slug];
      if (language) {
        queryText += ' AND language = $2';
        params.push(language);
      }
      queryText += ' LIMIT 1';
      const result = await client.query(queryText, params);
      await client.end().catch(() => {});
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      row.tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []);
      return row as BlogPost;
    } catch (pgErr: any) {
      console.error('getPostBySlug direct pg error:', pgErr.message);
    }
  }
  
  // Method 2: PostgREST fallback
  const supabase = getSupabaseClient();
  let query = supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true);
  if (language) {
    query = query.eq('language', language);
  }
  const { data, error } = await query.single();
  
  if (error) {
    console.error('getPostBySlug error:', error);
    return null;
  }
  return data;
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; published_at: string | null }[]> {
  // Method 1: Direct pg (bypasses PostgREST schema cache)
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const pg = await import('pg');
      const url = new URL(databaseUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ''),
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      };
      const client = new pg.Client(config);
      await client.connect();
      const result = await client.query(
        `SELECT slug, published_at FROM blog_posts WHERE published = true ORDER BY published_at DESC`
      );
      await client.end().catch(() => {});
      return result.rows;
    } catch (pgErr: any) {
      console.error('getAllPublishedSlugs direct pg error:', pgErr.message);
    }
  }
  
  // Method 2: PostgREST fallback
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false });
  
  if (error) {
    console.error('getAllPublishedSlugs error:', error);
    return [];
  }
  return data || [];
}

export async function createPost(input: BlogPostInput): Promise<BlogPost | null> {
  const now = new Date().toISOString();
  
  // Method 1: Direct pg via Supabase pooler (IPv4, bypasses PostgREST schema cache)
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const pg = await import('pg');
      const url = new URL(databaseUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ''),
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      };
      
      // Debug output
      console.log('pg config:', JSON.stringify({...config, password: '***'}));
      
      const client = new pg.Client(config);
      await client.connect();
      
      const result = await client.query(
        `INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, author, published, featured, meta_description, tags, language, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
         RETURNING *`,
        [
          input.title,
          input.slug,
          input.content,
          input.excerpt || '',
          input.cover_image || null,
          input.author || 'ShepherdAI Team',
          input.published !== false,
          input.featured || false,
          input.meta_description || null,
          input.tags || [],
          input.language || 'en',
          input.published_at || now,
          now,
        ]
      );
      await client.end().catch(() => {});
      return result.rows[0] as unknown as BlogPost;
    } catch (pgErr: any) {
      console.error('createPost direct pg error:', pgErr.message, pgErr.stack?.split('\n').slice(0,3).join('; '));
    }
  }
  
  // Method 2: Try PostgREST - first do a SELECT to force schema cache refresh
  try {
    const supabase = getSupabaseClient(true);
    
    // Force schema cache refresh by SELECTing first
    const { error: selectErr } = await supabase.from('blog_posts').select('id').limit(1);
    if (selectErr) {
      console.log('PostgREST SELECT error (may need schema refresh):', selectErr.message);
      // Even if SELECT fails, try INSERT anyway
    }
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt || '',
        cover_image: input.cover_image || null,
        author: input.author || 'ShepherdAI Team',
        published: input.published !== false,
        featured: input.featured || false,
        meta_description: input.meta_description || null,
        tags: input.tags || [],
        language: input.language || 'en',
        published_at: input.published_at || now,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();
    
    if (!error) return data;
    console.log('PostgREST INSERT error:', error.message);
    throw error;
  } catch (restErr: any) {
    // Method 3: Try RPC as last resort
    try {
      const supabase = getSupabaseClient(true);
      const { data: rpcData, error: rpcError } = await supabase.rpc('insert_blog_post', {
        p_title: input.title,
        p_slug: input.slug,
        p_content: input.content,
        p_excerpt: input.excerpt || '',
        p_cover_image: input.cover_image || null,
        p_author: input.author || 'ShepherdAI Team',
        p_published: input.published !== false,
        p_featured: input.featured || false,
        p_meta_description: input.meta_description || null,
        p_tags: input.tags || [],
        p_language: input.language || 'en',
        p_published_at: input.published_at || now,
      });
      
      if (!rpcError) return rpcData as unknown as BlogPost;
      throw rpcError;
    } catch (lastErr: any) {
      console.error('createPost all methods failed:', lastErr);
      throw lastErr;
    }
  }
}

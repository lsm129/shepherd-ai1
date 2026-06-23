-- ShepherdAI Blog Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Created: 2026-06-23
-- Purpose: Setup blog_posts table with full schema for AI auto-blogging

-- 1. Create blog_posts table
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
  language text DEFAULT 'en',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 3. Public can read published posts
DROP POLICY IF EXISTS "Blog posts are publicly readable" ON blog_posts;
CREATE POLICY "Blog posts are publicly readable" ON blog_posts
FOR SELECT USING (published = true);

-- 4. Service role has full access (for AI auto-blogging via API)
DROP POLICY IF EXISTS "Service role full access" ON blog_posts;
CREATE POLICY "Service role full access" ON blog_posts
FOR ALL USING (true) WITH CHECK (true);

-- 5. Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- 6. Create index on language for language filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_language ON blog_posts(language);

-- 7. Create index on published_at for sorting
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- 8. Create index for published + language combo (common query pattern)
CREATE INDEX IF NOT EXISTS idx_blog_posts_pub_lang ON blog_posts(published, language);

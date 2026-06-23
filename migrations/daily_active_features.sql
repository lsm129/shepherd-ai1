-- Migration: Daily Active Features for ShepherdAI
-- Run this SQL in the Supabase Dashboard SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run

-- 1. Add daily_devotional_email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_devotional_email boolean DEFAULT true;

-- 2. Add weekly_digest_enabled column to church_settings table
ALTER TABLE church_settings ADD COLUMN IF NOT EXISTS weekly_digest_enabled boolean DEFAULT true;

-- 3. Add like_count column to church_community_posts table
ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;

-- 4. Backfill like_count from existing liked_by arrays
UPDATE church_community_posts SET like_count = COALESCE(array_length(liked_by, 1), 0) WHERE like_count = 0 AND liked_by IS NOT NULL;

-- 5. Create prayer_replies table
CREATE TABLE IF NOT EXISTS prayer_replies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prayer_id uuid NOT NULL REFERENCES church_community_posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    content text NOT NULL,
    author_name text DEFAULT 'Anonymous',
    created_at timestamptz DEFAULT now()
);

-- 6. Enable Row Level Security on prayer_replies
ALTER TABLE prayer_replies ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for prayer_replies
DROP POLICY IF EXISTS "Allow read access" ON prayer_replies;
CREATE POLICY "Allow read access" ON prayer_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert" ON prayer_replies;
CREATE POLICY "Allow insert" ON prayer_replies FOR INSERT WITH CHECK (true);

-- 8. Add parent_post_id column to church_community_posts for reply threading (optional)
ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS parent_post_id uuid REFERENCES church_community_posts(id) ON DELETE CASCADE;

-- 9. Create index for faster reply lookups
CREATE INDEX IF NOT EXISTS idx_prayer_replies_prayer_id ON prayer_replies(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_replies_user_id ON prayer_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_parent ON church_community_posts(parent_post_id) WHERE parent_post_id IS NOT NULL;

-- 10. Migrate any fallback replies from church_community_posts to prayer_replies
INSERT INTO prayer_replies (prayer_id, user_id, content, author_name, created_at)
SELECT 
    CASE 
        WHEN parent_post_id IS NOT NULL THEN parent_post_id
        ELSE substring(title from 'Reply::([0-9a-f-]+)')::uuid
    END,
    user_id, body, author_name, created_at
FROM church_community_posts 
WHERE category = 'prayer_reply' 
AND NOT EXISTS (
    SELECT 1 FROM prayer_replies pr WHERE pr.prayer_id = CASE 
        WHEN parent_post_id IS NOT NULL THEN parent_post_id
        ELSE substring(title from 'Reply::([0-9a-f-]+)')::uuid
    END AND pr.user_id = church_community_posts.user_id AND pr.content = church_community_posts.body
);

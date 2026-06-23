-- Community Media Support: image_urls and video_url for church_community_posts
-- Migration: 20260607000001
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Add image_urls column (array of text URLs, up to 5 images per post)
ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Add video_url column (single URL for YouTube/Vimeo embed)
ALTER TABLE church_community_posts ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create storage bucket for community images (5MB limit, public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  public = true;

-- Storage policy: allow public read access
CREATE POLICY "Community images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-images');

-- Storage policy: allow authenticated uploads
CREATE POLICY "Users can upload community images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-images'
    AND auth.role() = 'authenticated'
  );

-- Storage policy: allow users to delete their own images
CREATE POLICY "Users can delete own community images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'community-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

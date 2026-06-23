-- Create prayer_likes table
CREATE TABLE IF NOT EXISTS prayer_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID NOT NULL REFERENCES church_community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prayer_id, user_id)
);

-- Create prayer_replies table
CREATE TABLE IF NOT EXISTS prayer_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID NOT NULL REFERENCES church_community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prayer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for prayer_likes
DO $$ BEGIN
  CREATE POLICY "Anyone can view prayer likes" ON prayer_likes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert prayer likes" ON prayer_likes FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own prayer likes" ON prayer_likes FOR DELETE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS policies for prayer_replies
DO $$ BEGIN
  CREATE POLICY "Anyone can view prayer replies" ON prayer_replies FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert prayer replies" ON prayer_replies FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prayer_likes_prayer_id ON prayer_likes(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_likes_user_id ON prayer_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_replies_prayer_id ON prayer_replies(prayer_id);

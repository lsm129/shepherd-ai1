-- ShepherdAI Migration: New Feature Tables
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Created: 2026-06-04

-- 1. Create founding_church_reports table
CREATE TABLE IF NOT EXISTS founding_church_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  milestone VARCHAR(10) CHECK (milestone IN ('30day', '60day')),
  experience TEXT,
  favorite_feature TEXT,
  improvement_suggestions TEXT,
  testimonial TEXT,
  authorize_marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create feedback_submissions table
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  experience TEXT,
  favorite_feature TEXT,
  considering_upgrade VARCHAR(20),
  points_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS feedback_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_discount NUMERIC(10,2) DEFAULT 0;

-- 4. Enable RLS
ALTER TABLE founding_church_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
DO $$ BEGIN
  CREATE POLICY "Users can read own reports" ON founding_church_reports FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own reports" ON founding_church_reports FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read own submissions" ON feedback_submissions FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own submissions" ON feedback_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Grant access
GRANT ALL ON founding_church_reports TO service_role;
GRANT ALL ON founding_church_reports TO anon;
GRANT ALL ON feedback_submissions TO service_role;
GRANT ALL ON feedback_submissions TO anon;

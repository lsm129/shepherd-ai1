-- ShepherdAI: Missing Tables SQL v2 (fixed RLS policies)
-- Run this in Supabase Dashboard → SQL Editor
-- Date: 2026-06-01

-- 1. prayer_requests table
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  church_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  prayer_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'answered', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for prayer_requests
CREATE POLICY "Users can view their own prayer requests" ON public.prayer_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Pastors can view prayer requests from their church (church_id = pastor's user_id)
CREATE POLICY "Pastors can view church prayer requests" ON public.prayer_requests
  FOR SELECT USING (church_id = auth.uid());

-- Users can create prayer requests
CREATE POLICY "Users can create prayer requests" ON public.prayer_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own prayer requests
CREATE POLICY "Users can update own prayer requests" ON public.prayer_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on prayer_requests" ON public.prayer_requests
  FOR ALL USING (true) WITH CHECK (true);

-- 2. visitor_followups table
CREATE TABLE IF NOT EXISTS public.visitor_followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  visitor_phone TEXT,
  visit_date DATE,
  followup_status TEXT DEFAULT 'pending' CHECK (followup_status IN ('pending', 'contacted', 'responded', 'joined', 'lost')),
  notes TEXT,
  email_sequence_started BOOLEAN DEFAULT false,
  email_sequence_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.visitor_followups ENABLE ROW LEVEL SECURITY;

-- RLS policies for visitor_followups
CREATE POLICY "Users can view own visitor followups" ON public.visitor_followups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create visitor followups" ON public.visitor_followups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visitor followups" ON public.visitor_followups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visitor followups" ON public.visitor_followups
  FOR DELETE USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on visitor_followups" ON public.visitor_followups
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS worship_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  theme TEXT,
  tradition TEXT,
  total_duration INTEGER,
  segments JSONB DEFAULT '[]',
  pastoral_notes TEXT,
  scripture_readings JSONB DEFAULT '[]',
  hymn_suggestions JSONB DEFAULT '[]',
  prayer_points JSONB DEFAULT '[]',
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE worship_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own worship plans" ON worship_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own worship plans" ON worship_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

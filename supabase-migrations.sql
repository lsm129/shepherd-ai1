-- ShepherdAI Database Tables
-- Run this in Supabase SQL Editor

-- 1. Generations table (quota tracking)
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL,
  input_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own generations" ON generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_generations_user_month ON generations(user_id, created_at);

-- 2. Profiles table (plan tracking)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  plan TEXT DEFAULT 'free',
  church_name TEXT,
  pastor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, plan, church_name, pastor_name)
  VALUES (NEW.id, 'free', '', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Referrals table (referral program)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  referred_email TEXT,
  referred_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can insert referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Users can update own referrals" ON referrals FOR UPDATE USING (auth.uid() = referrer_id);

-- Auto-generate referral code on signup
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO referrals (referrer_id, referral_code)
  VALUES (NEW.id, UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- ============================================================
-- 4. Points System Tables
-- ============================================================

-- 4a. points_transactions: every earn / spend event
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,           -- 'daily_login','generate_sermon','generate_prayer','generate_other','complete_profile','referral_bonus','redeem_*'
  points INTEGER NOT NULL,        -- positive = earn, negative = spend
  balance_after INTEGER NOT NULL, -- balance after this transaction
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points_transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points_transactions" ON points_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_points_tx_user_date ON points_transactions(user_id, created_at);
CREATE INDEX idx_points_tx_user_action ON points_transactions(user_id, action, created_at);

-- 4b. points_redemptions: every reward claim
CREATE TABLE IF NOT EXISTS points_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_type TEXT NOT NULL,      -- 'extra_generations','premium_templates','ai_style_custom','analytics_report'
  points_cost INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE points_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own redemptions" ON points_redemptions FOR SELECT USING (auth.uid() = user_id);

-- 4c. Add points columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS extra_generations INTEGER DEFAULT 0;

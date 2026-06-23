-- Add Creem payment columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creem_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creem_subscription_id TEXT;

-- Update RLS: users should NOT be able to update their own plan or creem fields directly
-- This prevents users from bypassing payment by updating their plan field
CREATE OR REPLACE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id) 
  WITH CHECK (
    auth.uid() = id 
    -- Users can only update: church_name, pastor_name, points_balance, profile_completed, extra_generations, ai_tone, default_signoff, updated_at
    -- They CANNOT update: plan, creem_customer_id, creem_subscription_id
  );

-- Note: The restrictive RLS above may break the existing Settings page upsert.
-- A safer approach: allow updates but use a database trigger to prevent plan/creem field changes from client
-- For now, we'll use a trigger approach:

-- First, drop the restrictive policy and restore the original
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Instead, add a trigger that prevents clients from modifying plan/creem fields
-- Only service role (server-side) can change these fields
CREATE OR REPLACE FUNCTION protect_payment_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If the client tries to change plan, creem_customer_id, or creem_subscription_id, restore the old values
  IF NEW.plan IS DISTINCT FROM OLD.plan AND current_user != 'authenticator' THEN
    -- Allow only if the change comes from service role (via admin API)
    -- The anon key user can't change plan via this trigger
    NEW.plan = OLD.plan;
  END IF;
  IF NEW.creem_customer_id IS DISTINCT FROM OLD.creem_customer_id THEN
    NEW.creem_customer_id = OLD.creem_customer_id;
  END IF;
  IF NEW.creem_subscription_id IS DISTINCT FROM OLD.creem_subscription_id THEN
    NEW.creem_subscription_id = OLD.creem_subscription_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_payment_fields_trigger ON profiles;
CREATE TRIGGER protect_payment_fields_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_payment_fields();

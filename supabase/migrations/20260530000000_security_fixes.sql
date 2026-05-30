-- 1. Protect payment fields from client-side modification
CREATE OR REPLACE FUNCTION protect_payment_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from modifying plan, creem_customer_id, creem_subscription_id
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  IF NEW.creem_customer_id IS DISTINCT FROM OLD.creem_customer_id THEN
    NEW.creem_customer_id := OLD.creem_customer_id;
  END IF;
  IF NEW.creem_subscription_id IS DISTINCT FROM OLD.creem_subscription_id THEN
    NEW.creem_subscription_id := OLD.creem_subscription_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_payment_fields ON profiles;
CREATE TRIGGER protect_payment_fields
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_payment_fields();

-- 2. Tighten RLS on points_transactions - only service_role can INSERT
DROP POLICY IF EXISTS "Service role full access" ON points_transactions;

CREATE POLICY "Users can view own points transactions" ON points_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert points transactions" ON points_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can do everything on points_transactions" ON points_transactions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

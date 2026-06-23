-- Church Accounting: church_transactions table
-- Run this SQL in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS church_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  transaction_date DATE NOT NULL,
  payment_method TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast filtering by church and date
CREATE INDEX IF NOT EXISTS idx_church_transactions_church_id ON church_transactions(church_id);
CREATE INDEX IF NOT EXISTS idx_church_transactions_date ON church_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_church_transactions_church_date ON church_transactions(church_id, transaction_date);

-- RLS: enable
ALTER TABLE church_transactions ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by API routes)
-- No explicit policy needed for service_role — it bypasses RLS by default

-- Auth users can only see their own church's data
CREATE POLICY "Users can view own church transactions"
  ON church_transactions
  FOR SELECT
  USING (church_id IN (
    SELECT id FROM profiles WHERE id = auth.uid()
  ));

-- Auth users can insert for their own church
CREATE POLICY "Users can insert own church transactions"
  ON church_transactions
  FOR INSERT
  WITH CHECK (church_id = auth.uid());

-- Auth users can update own church transactions
CREATE POLICY "Users can update own church transactions"
  ON church_transactions
  FOR UPDATE
  USING (church_id = auth.uid());

-- Auth users can delete own church transactions
CREATE POLICY "Users can delete own church transactions"
  ON church_transactions
  FOR DELETE
  USING (church_id = auth.uid());

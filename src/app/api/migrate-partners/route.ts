import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (body.secret !== 'shepherdai_migrate_2026') {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
  }

  // Try multiple connection strings
  const connectionStrings = [
    'postgresql://postgres:Lsm1986129%26lsm@db.hsunvuixqesjcoohbrmp.supabase.co:5432/postgres',
    'postgresql://postgres.hsunvuixqesjcoohbrmp:Lsm1986129%26lsm@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres.hsunvuixqesjcoohbrmp:Lsm1986129%26lsm@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ];

  const sql = `
    CREATE TABLE IF NOT EXISTS partners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      phone TEXT NOT NULL,
      referral_code TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
      paypal_email TEXT NOT NULL,
      churches_served INTEGER,
      services_description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS partner_referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      referred_email TEXT NOT NULL,
      referred_church TEXT,
      plan TEXT CHECK (plan IN ('starter', 'pro', 'growth')),
      billing_type TEXT CHECK (billing_type IN ('monthly', 'yearly')),
      first_payment_date TIMESTAMPTZ,
      last_payment_date TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'churned')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS partner_commissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      referral_id UUID NOT NULL REFERENCES partner_referrals(id) ON DELETE CASCADE,
      month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 8),
      commission_rate DECIMAL(5,4) NOT NULL,
      plan_price DECIMAL(10,2) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
      settled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);
    CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
    CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_id ON partner_referrals(partner_id);
    CREATE INDEX IF NOT EXISTS idx_partner_referrals_status ON partner_referrals(status);
    CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id ON partner_commissions(partner_id);
    CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON partner_commissions(status);

    ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
    ALTER TABLE partner_referrals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      CREATE POLICY "Service role full access on partners" ON partners FOR ALL USING (auth.role() = 'service_role');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE POLICY "Service role full access on partner_referrals" ON partner_referrals FOR ALL USING (auth.role() = 'service_role');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE POLICY "Service role full access on partner_commissions" ON partner_commissions FOR ALL USING (auth.role() = 'service_role');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;

  const { Client } = await import('pg');
  
  for (const connStr of connectionStrings) {
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      await client.connect();
      await client.query(sql);
      
      const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'partner%'");
      const tables = res.rows.map((r: any) => r.table_name);
      
      await client.end();
      return NextResponse.json({ success: true, connection: connStr.split('@')[1]?.split('/')[0], tables });
    } catch (e: any) {
      try { await client.end(); } catch(_) {}
      continue;
    }
  }
  
  return NextResponse.json({ error: 'All connection attempts failed' }, { status: 500 });
}

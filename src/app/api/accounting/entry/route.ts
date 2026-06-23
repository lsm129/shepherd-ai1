import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const VALID_CATEGORIES = ['tithe', 'special_offering', 'rent', 'utilities', 'salary', 'activity', 'maintenance', 'office_supplies', 'other'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { churchId, type, category, amount, description, transactionDate, paymentMethod, createdBy } = body;

    if (!churchId || !type || !category || !amount || !transactionDate) {
      return NextResponse.json({ error: 'Missing required fields: churchId, type, category, amount, transactionDate' }, { status: 400 });
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json({ error: 'Type must be "income" or "expense"' }, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category. Must be one of: ' + VALID_CATEGORIES.join(', ') }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, SERVICE_ROLE_KEY);
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', churchId)
      .single();

    const plan = profile?.plan || 'free';

    if (plan === 'free' || plan === 'starter') {
      return NextResponse.json({ error: 'Accounting is available on Pro and Growth plans. Please upgrade.', upgradeRequired: true, minPlan: 'pro' }, { status: 403 });
    }

    if (plan === 'pro') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabaseAdmin
        .from('church_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('church_id', churchId)
        .gte('created_at', startOfMonth);

      if ((count || 0) >= 50) {
        return NextResponse.json({ error: 'Pro plan limit reached (50 entries/month). Upgrade to Growth for unlimited entries.', upgradeRequired: true, minPlan: 'growth' }, { status: 403 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('church_transactions')
      .insert({
        church_id: churchId,
        type,
        category,
        amount: Number(amount).toFixed(2),
        description: description || null,
        transaction_date: transactionDate,
        payment_method: paymentMethod || null,
        created_by: createdBy || churchId,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create entry';
    console.error('Accounting entry error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8'
    );

    // Get user's current plan and subscription details
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, creem_customer_id, creem_subscription_id')
      .eq('id', userId)
      .single();

    // Get user email from auth
    let userEmail = '';
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      userEmail = authUser?.user?.email || '';
    } catch (e) {}

    const plan = profile?.plan || 'free';
    const customerId = profile?.creem_customer_id;
    const subscriptionId = profile?.creem_subscription_id;

    let subscriptionDetails = null;

    // Only check Creem if subscription ID exists
    if (process.env.CREEM_API_KEY && subscriptionId) {
      try {
        const CREEM_API_BASE = 'https://api.creem.io/v1';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        const response = await fetch(`${CREEM_API_BASE}/subscriptions?subscription_id=${subscriptionId}`, {
          method: 'GET',
          headers: {
            'x-api-key': process.env.CREEM_API_KEY,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          subscriptionDetails = await response.json();
        }
      } catch (e) {
        // Creem API timeout or error - don't block the response
        console.log('Creem API check skipped:', e instanceof Error ? e.message : 'unknown');
      }
    }

    return NextResponse.json({
      plan,
      email: userEmail,
      customerId,
      subscriptionId,
      subscription: subscriptionDetails,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get subscription';
    console.error('Subscription error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const CREEM_API_KEY = process.env.CREEM_API_KEY!;
const CREEM_API_BASE = 'https://api.creem.io/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's current plan and subscription details
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, creem_customer_id, creem_subscription_id')
      .eq('id', userId)
      .single();

    const plan = profile?.plan || 'free';
    const customerId = profile?.creem_customer_id;
    const subscriptionId = profile?.creem_subscription_id;

    let subscriptionDetails = null;

    // If user has a Creem subscription, fetch details
    if (CREEM_API_KEY && subscriptionId) {
      
      const response = await fetch(`CREEM_API_BASE/subscriptions?subscription_id=${subscriptionId}`, {
        method: 'GET',
        headers: {
          'x-api-key': CREEM_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        subscriptionDetails = await response.json();
      }
    }

    return NextResponse.json({
      plan,
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

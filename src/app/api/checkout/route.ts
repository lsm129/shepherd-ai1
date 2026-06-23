import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CREEM_PRODUCTS, CREEM_ANNUAL_PRODUCTS } from '@/lib/creem';

const CREEM_API_KEY = process.env.CREEM_API_KEY!;
const CREEM_API_BASE = 'https://api.creem.io/v1';
import { PLANS, type PlanId } from '@/lib/pricing';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, userId, email, billingCycle } = body;

    if (!planId || !CREEM_PRODUCTS[planId as keyof typeof CREEM_PRODUCTS]) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose: starter, pro, or growth.' },
        { status: 400 }
      );
    }

    if (!CREEM_API_KEY) {
      return NextResponse.json(
        { error: 'Payment system not configured.' },
        { status: 500 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated. Please log in first.' }, { status: 401 });
    }

    // Check if user already has this plan or higher
    const supabaseAdmin = createClient(
      supabaseUrl || 'https://hsunvuixqesjcoohbrmp.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8'
    );
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    const currentPlan = (profile?.plan as PlanId) || 'free';
    const currentPlanData = PLANS[currentPlan];
    const targetPlanData = PLANS[planId as PlanId];

    // Allow same-plan upgrade if switching from monthly to annual
    const isSamePlanUpgrade = planId === currentPlan && billingCycle === 'annual';
    if (currentPlanData && targetPlanData && currentPlanData.price >= targetPlanData.price && !isSamePlanUpgrade) {
      return NextResponse.json(
        { error: 'You already have this plan or a higher plan.' },
        { status: 400 }
      );
    }

    const isAnnual = billingCycle === 'annual';
    const productId = isAnnual 
      ? (CREEM_ANNUAL_PRODUCTS[planId as keyof typeof CREEM_ANNUAL_PRODUCTS] || CREEM_PRODUCTS[planId as keyof typeof CREEM_PRODUCTS])
      : CREEM_PRODUCTS[planId as keyof typeof CREEM_PRODUCTS];
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shepherdaitech.com';

    const response = await fetch(`${CREEM_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        request_id: `checkout_${userId}_${Date.now()}`,
        success_url: `${appUrl}/dashboard?upgraded=true&plan=${planId}`,
        customer: email ? { email } : undefined,
        metadata: {
          userId,
          planId,
          source: 'shepherdai-web',
        },
      }),
    });

    const checkout = await response.json();

    if (!response.ok) {
      console.error('Creem checkout error:', checkout);
      return NextResponse.json(
        { error: checkout.message || 'Failed to create checkout session.' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      checkoutUrl: checkout.checkout_url,
      checkoutId: checkout.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    console.error('Checkout error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

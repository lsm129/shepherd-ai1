import { NextRequest, NextResponse } from 'next/server';
import { createCheckout, CREEM_PRODUCTS, CREEM_ANNUAL_PRODUCTS } from '@/lib/creem';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import type { PlanId, BillingCycle } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, userId, userEmail, billingCycle } = body;

    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, userId' },
        { status: 400 }
      );
    }

    // Validate plan
    const validPlans: PlanId[] = ['starter', 'pro', 'growth'];
    if (!validPlans.includes(planId as PlanId)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be starter, pro, or growth.' },
        { status: 400 }
      );
    }

    // Determine product ID based on billing cycle
    const isAnnual = billingCycle === 'annual';
    const productId = isAnnual
      ? CREEM_ANNUAL_PRODUCTS[planId as keyof typeof CREEM_ANNUAL_PRODUCTS]
      : CREEM_PRODUCTS[planId as keyof typeof CREEM_PRODUCTS];

    if (!productId) {
      return NextResponse.json(
        { error: isAnnual ? 'Annual plan not yet available' : 'Product not configured for this plan' },
        { status: 500 }
      );
    }

    // Check if user has discount codes from points redemption (stored in user_metadata)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      supabaseUrl || 'https://hsunvuixqesjcoohbrmp.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8'
    );
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};

    // Find an unused discount code
    const discountCodes: any[] = meta.discount_codes || [];
    const unusedCode = discountCodes.find((dc: any) => !dc.used);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shepherdaitech.com';
    const successUrl = `${appUrl}/settings?checkout=success&plan=${planId}`;

    const checkoutParams: any = {
      productId,
      successUrl,
      customerEmail: userEmail,
      metadata: {
        userId,
        planId,
        billingCycle: isAnnual ? 'annual' : 'monthly',
        discountCode: unusedCode?.code || '',
      },
    };

    // Apply discount code if available
    if (unusedCode) {
      checkoutParams.discountCode = unusedCode.code;
    }

    const result = await createCheckout(checkoutParams);

    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      checkoutId: result.checkoutId,
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

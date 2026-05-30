import { NextRequest, NextResponse } from 'next/server';
import { createCheckout, CREEM_PRODUCTS, CREEM_ANNUAL_PRODUCTS } from '@/lib/creem';
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shepherdaitech.com';
    const successUrl = `${appUrl}/settings?checkout=success&plan=${planId}`;

    const result = await createCheckout({
      productId,
      successUrl,
      customerEmail: userEmail,
      metadata: {
        userId,
        planId,
        billingCycle: isAnnual ? 'annual' : 'monthly',
      },
    });

    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      checkoutId: result.checkoutId,
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

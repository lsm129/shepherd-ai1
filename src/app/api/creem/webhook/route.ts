import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, getPlanByProductId, updateUserPlan } from '@/lib/creem';
import type { CreemWebhookEvent, CreemEventType } from '@/lib/creem';
import type { PlanId } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('creem-signature');
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    // Verify webhook signature
    if (!webhookSecret) {
      console.error('CREEM_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (!signature) {
      console.error('Missing creem-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const isValid = verifyWebhookSignature(payload, webhookSecret, signature);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the event
    const event: CreemWebhookEvent = JSON.parse(payload);
    const { eventType } = event;

    console.log(`Received Creem webhook: ${eventType}`);

    // Process the event
    await handleWebhookEvent(event);

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 so Creem doesn't retry, but log the error
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

async function handleWebhookEvent(event: CreemWebhookEvent) {
  const { eventType, object } = event;

  switch (eventType) {
    case 'checkout.completed':
      await handleCheckoutCompleted(object);
      break;

    case 'subscription.active':
    case 'subscription.paid':
      await handleSubscriptionActiveOrPaid(object, eventType);
      break;

    case 'subscription.canceled':
      await handleSubscriptionCanceled(object);
      break;

    case 'subscription.scheduled_cancel':
      await handleSubscriptionScheduledCancel(object);
      break;

    case 'subscription.expired':
      await handleSubscriptionExpired(object);
      break;

    case 'subscription.past_due':
      await handleSubscriptionPastDue(object);
      break;

    case 'refund.created':
      await handleRefundCreated(object);
      break;

    case 'dispute.created':
      await handleDisputeCreated(object);
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

async function handleCheckoutCompleted(object: CreemWebhookEvent['object']) {
  const checkout = object as any;
  const metadata = checkout.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in checkout metadata');
    return;
  }

  // Get product ID from the checkout
  let productId: string | undefined;
  if (checkout.product && typeof checkout.product === 'object') {
    productId = checkout.product.id;
  } else if (checkout.order && checkout.order.product) {
    productId = checkout.order.product;
  }

  if (!productId) {
    console.error('No product ID found in checkout');
    return;
  }

  const planId = getPlanByProductId(productId);
  if (!planId) {
    console.error(`Unknown product ID: ${productId}`);
    return;
  }

  // Get customer and subscription info
  let customerId: string | undefined;
  let subscriptionId: string | undefined;

  if (checkout.customer && typeof checkout.customer === 'object') {
    customerId = checkout.customer.id;
  } else if (typeof checkout.customer === 'string') {
    customerId = checkout.customer;
  }

  if (checkout.subscription && typeof checkout.subscription === 'object') {
    subscriptionId = checkout.subscription.id;
  } else if (typeof checkout.subscription === 'string') {
    subscriptionId = checkout.subscription;
  }

  await updateUserPlan(userId, planId, customerId, subscriptionId);

  // Mark discount code as used if one was applied
  const discountCode = metadata.discountCode || metadata.discount_code;
  if (discountCode) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8'
      );
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
      const meta = user?.user_metadata || {};
      const codes: any[] = meta.discount_codes || [];
      const updatedCodes = codes.map((dc: any) => dc.code === discountCode ? { ...dc, used: true, used_at: new Date().toISOString() } : dc);
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { ...meta, discount_codes: updatedCodes }
      });
      console.log(`Marked discount code ${discountCode} as used for user ${userId}`);
    } catch (e) {
      console.error('Failed to mark discount code as used:', e);
    }
  }

  // Update partner referral if this user was referred by a partner
  try {
    const SUPABASE_URL_P = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
    const SERVICE_KEY_P = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
    const adminHeadersP = { 'apikey': SERVICE_KEY_P, 'Authorization': `Bearer ${SERVICE_KEY_P}`, 'Content-Type': 'application/json' };
    const pRefRes = await fetch(`${SUPABASE_URL_P}/rest/v1/partner_referrals?referred_user_id=eq.${userId}&status=eq.trial&select=id`, { headers: adminHeadersP });
    const pRefs = await pRefRes.json();
    if (pRefs?.length > 0) {
      const now = new Date().toISOString();
      for (const r of pRefs) {
        await fetch(`${SUPABASE_URL_P}/rest/v1/partner_referrals?id=eq.${r.id}`, {
          method: 'PATCH',
          headers: adminHeadersP,
          body: JSON.stringify({ status: 'active', plan: planId, first_payment_date: now, last_payment_date: now, billing_type: metadata.billing_type || 'monthly' }),
        });
      }
      console.log(`Partner referral activated for user ${userId}, plan: ${planId}`);
    }
  } catch (e) { console.error('Partner referral checkout update error:', e); }
  console.log(`Updated user ${userId} to plan ${planId} via checkout`);
}

async function handleSubscriptionActiveOrPaid(
  object: CreemWebhookEvent['object'],
  eventType: CreemEventType
) {
  const subscription = object as any;
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Get product ID from subscription
  let productId: string | undefined;
  if (subscription.product && typeof subscription.product === 'object') {
    productId = subscription.product.id;
  } else if (typeof subscription.product === 'string') {
    productId = subscription.product;
  }

  if (!productId) {
    console.error('No product ID found in subscription');
    return;
  }

  const planId = getPlanByProductId(productId);
  if (!planId) {
    console.error(`Unknown product ID: ${productId}`);
    return;
  }

  let customerId: string | undefined;
  if (subscription.customer && typeof subscription.customer === 'object') {
    customerId = subscription.customer.id;
  } else if (typeof subscription.customer === 'string') {
    customerId = subscription.customer;
  }

  await updateUserPlan(userId, planId, customerId, subscription.id);
  console.log(`Updated user ${userId} to plan ${planId} via ${eventType}`);

  // Update partner referral if this user was referred by a partner
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
    const adminHeaders = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };
    const refRes = await fetch(`${SUPABASE_URL}/rest/v1/partner_referrals?referred_user_id=eq.${userId}&status=eq.trial&select=id`, { headers: adminHeaders });
    const refs = await refRes.json();
    if (refs?.length > 0) {
      const now = new Date().toISOString();
      for (const ref of refs) {
        await fetch(`${SUPABASE_URL}/rest/v1/partner_referrals?id=eq.${ref.id}`, {
          method: 'PATCH',
          headers: adminHeaders,
          body: JSON.stringify({
            status: 'active',
            plan: planId,
            first_payment_date: now,
            last_payment_date: now,
            billing_type: metadata.billing_type || 'monthly',
          }),
        });
      }
      console.log(`Updated partner referral for user ${userId} to active, plan: ${planId}`);
    } else {
      // Check if already active, update last_payment_date
      const activeRefRes = await fetch(`${SUPABASE_URL}/rest/v1/partner_referrals?referred_user_id=eq.${userId}&status=eq.active&select=id`, { headers: adminHeaders });
      const activeRefs = await activeRefRes.json();
      if (activeRefs?.length > 0) {
        const now = new Date().toISOString();
        for (const ref of activeRefs) {
          await fetch(`${SUPABASE_URL}/rest/v1/partner_referrals?id=eq.${ref.id}`, {
            method: 'PATCH',
            headers: adminHeaders,
            body: JSON.stringify({ last_payment_date: now }),
          });
        }
        console.log(`Updated partner referral last_payment_date for user ${userId}`);
      }
    }
  } catch (e) { console.error('Partner referral webhook update error:', e); }
}

async function handleSubscriptionCanceled(object: CreemWebhookEvent['object']) {
  const subscription = object as any;
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserPlan(userId, 'free');
  console.log(`Downgraded user ${userId} to free (subscription canceled)`);
}

async function handleSubscriptionScheduledCancel(object: CreemWebhookEvent['object']) {
  const subscription = object as any;
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Don't downgrade yet — subscription is still active until period end
  console.log(`User ${userId} subscription scheduled for cancellation at period end`);
}

async function handleSubscriptionExpired(object: CreemWebhookEvent['object']) {
  const subscription = object as any;
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserPlan(userId, 'free');
  console.log(`Downgraded user ${userId} to free (subscription expired)`);
}

async function handleSubscriptionPastDue(object: CreemWebhookEvent['object']) {
  const subscription = object as any;
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Keep current plan but log — Creem will retry payment
  console.log(`User ${userId} subscription is past due — payment retry in progress`);
}

async function handleRefundCreated(object: CreemWebhookEvent['object']) {
  const refund = object as any;
  const metadata = refund.checkout?.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.error('No userId in refund metadata');
    return;
  }

  // If the refund is for a subscription that got canceled, downgrade
  if (refund.subscription && refund.subscription.status === 'canceled') {
    await updateUserPlan(userId, 'free');
    console.log(`Downgraded user ${userId} to free (refund + subscription canceled)`);
  } else {
    console.log(`Refund created for user ${userId} — subscription still active`);
  }
}

async function handleDisputeCreated(object: CreemWebhookEvent['object']) {
  const dispute = object as any;
  const metadata = dispute.checkout?.metadata || {};
  const userId = metadata.userId;

  console.log(`Dispute created${userId ? ` for user ${userId}` : ''} — amount: ${dispute.amount}`);
}

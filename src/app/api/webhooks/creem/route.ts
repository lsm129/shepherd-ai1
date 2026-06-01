import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { CREEM_WEBHOOK_SECRET, CREEM_PRODUCTS, CREEM_ANNUAL_PRODUCTS } from '@/lib/creem';
import { earnPoints } from '@/lib/points';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


// Reverse map: Creem product ID -> plan ID (both monthly and annual)
const PRODUCT_TO_PLAN: Record<string, string> = {};
for (const [plan, productId] of Object.entries(CREEM_PRODUCTS)) {
  PRODUCT_TO_PLAN[productId] = plan;
}
for (const [plan, productId] of Object.entries(CREEM_ANNUAL_PRODUCTS)) {
  if (productId) PRODUCT_TO_PLAN[productId] = plan;
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return computed === signature;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('creem-signature');
    const rawBody = await request.text();

    // Verify webhook signature
    if (CREEM_WEBHOOK_SECRET && signature) {
      if (!verifySignature(rawBody, signature, CREEM_WEBHOOK_SECRET)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('Webhook signature verification skipped (no secret configured)');
    }

    const event = JSON.parse(rawBody);
    const eventType = event.eventType;
    const eventObject = event.object;

    console.log(`[Creem Webhook] ${eventType}`, JSON.stringify(eventObject).substring(0, 500));

    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    switch (eventType) {
      case 'checkout.completed': {
        const { customer, metadata, product, order } = eventObject;
        const userId = metadata?.userId;
        const planId = metadata?.planId || PRODUCT_TO_PLAN[product?.id];
        const customerEmail = customer?.email;
        const customerId = customer?.id;

        if (!userId && !customerEmail) {
          console.error('No userId or email in webhook payload');
          break;
        }

        // Find user by userId (from metadata) or by email
        let targetUserId = userId;
        if (!targetUserId && customerEmail) {
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          const user = users.find(u => u.email === customerEmail);
          if (user) targetUserId = user.id;
        }

        if (!targetUserId) {
          console.error('Could not find user for webhook event');
          break;
        }

        if (!planId) {
          console.error('Could not determine plan from webhook payload');
          break;
        }

        // Update user's plan in profiles
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            plan: planId,
            creem_customer_id: customerId,
            creem_subscription_id: order?.subscription_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);

        // Track payment conversion in PostHog (server-side)
        try {
          const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
          const phHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
          if (phKey && targetUserId) {
            fetch(`${phHost}/capture/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: phKey, event: 'checkout_completed', properties: { distinct_id: targetUserId, plan: planId, product_id: product?.id, billing: metadata?.billing || 'monthly' } }),
            }).catch(() => {});
          }
        } catch (e) { console.error('PostHog tracking error:', e); }

        if (profileError) {
          console.error('Failed to update profile plan:', profileError);
        } else {
          console.log(`[Creem Webhook] Updated user ${targetUserId} to plan: ${planId}`);
        }

        // Award referral bonus if the user was referred
        try {
          const { data: referralData } = await supabaseAdmin
            .from('referrals')
            .select('referrer_id, referral_code')
            .eq('referred_id', targetUserId)
            .eq('status', 'pending')
            .single();

          if (referralData) {
            // Mark referral as completed
            await supabaseAdmin
              .from('referrals')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
              })
              .eq('referred_id', targetUserId);

            // Award bonus points to referrer
            await earnPoints(referralData.referrer_id, 'referral_bonus');
            console.log(`[Creem Webhook] Awarded referral bonus to referrer: ${referralData.referrer_id}`);
          }
        } catch (refErr) {
          console.error('Referral bonus error:', refErr);
        }

        break;
      }

      case 'subscription.paid': {
        // Recurring payment - extend access, keep plan active
        const { metadata } = eventObject;
        const userId = metadata?.userId;

        if (userId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', userId);

          if (error) console.error('Failed to update profile on subscription.paid:', error);
          else console.log(`[Creem Webhook] Subscription renewed for user ${userId}`);
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.expired': {
        // Downgrade to free plan
        const { metadata } = eventObject;
        const userId = metadata?.userId;

        if (userId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) console.error('Failed to downgrade profile:', error);
          else console.log(`[Creem Webhook] Downgraded user ${userId} to free`);
        }
        break;
      }

      case 'subscription.scheduled_cancel': {
        // Subscription will be canceled at period end - notify but don't downgrade yet
        console.log(`[Creem Webhook] Subscription scheduled for cancellation`);
        break;
      }

      case 'refund.created': {
        // Handle refund - potentially downgrade
        const { metadata } = eventObject;
        const userId = metadata?.userId;

        if (userId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) console.error('Failed to handle refund:', error);
          else console.log(`[Creem Webhook] Refund processed, downgraded user ${userId} to free`);
        }
        break;
      }

      default:
        console.log(`[Creem Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('Webhook error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

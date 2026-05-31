// ShepherdAI Creem Payment Integration
// API wrapper for Creem checkout, subscription management, and webhook verification

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import { PLANS, type PlanId } from './pricing';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


export const CREEM_API_KEY = process.env.CREEM_API_KEY!;
export const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET!;
const CREEM_API_BASE = 'https://api.creem.io/v1';

// Creem product IDs for each plan (monthly)
export const CREEM_PRODUCTS: Record<Exclude<PlanId, 'free'>, string> = {
  starter: 'prod_89GZ0Mr4cUbRkaH1guqcD',
  pro: 'prod_6mHoeoWBuxR3qsJdAfQWo0',
  growth: 'prod_LtkwTRkzN7R7brJIoCh5Q',
};

// Creem product IDs for annual plans (20% off)
export const CREEM_ANNUAL_PRODUCTS: Record<Exclude<PlanId, 'free'>, string> = {
  starter: '', // TODO: Fill in after creating annual product in Creem
  pro: '', // TODO: Fill in after creating annual product in Creem
  growth: '', // TODO: Fill in after creating annual product in Creem
};

// Map Creem product ID back to plan ID (checks both monthly and annual)
export function getPlanByProductId(productId: string): PlanId | null {
  for (const [planId, prodId] of Object.entries(CREEM_PRODUCTS)) {
    if (prodId === productId) return planId as PlanId;
  }
  for (const [planId, prodId] of Object.entries(CREEM_ANNUAL_PRODUCTS)) {
    if (prodId === productId) return planId as PlanId;
  }
  return null;
}

// Creem webhook event types
export type CreemEventType =
  | 'checkout.completed'
  | 'subscription.active'
  | 'subscription.paid'
  | 'subscription.canceled'
  | 'subscription.scheduled_cancel'
  | 'subscription.past_due'
  | 'subscription.expired'
  | 'subscription.trialing'
  | 'subscription.paused'
  | 'subscription.update'
  | 'refund.created'
  | 'dispute.created';

// Creem webhook payload interfaces
export interface CreemCustomer {
  id: string;
  object: 'customer';
  email: string;
  name: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface CreemProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_type: 'recurring' | 'onetime';
  billing_period: string;
  status: string;
}

export interface CreemSubscription {
  id: string;
  object: 'subscription';
  product: string | CreemProduct;
  customer: string | CreemCustomer;
  status: string;
  collection_method: string;
  current_period_start_date?: string;
  current_period_end_date?: string;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, string>;
}

export interface CreemCheckoutObject {
  id: string;
  object: 'checkout';
  request_id?: string;
  order?: {
    id: string;
    customer: string;
    product: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
  };
  product?: CreemProduct;
  customer?: CreemCustomer;
  subscription?: CreemSubscription;
  custom_fields?: unknown[];
  status: string;
  metadata?: Record<string, string>;
}

export interface CreemWebhookEvent {
  id: string;
  eventType: CreemEventType;
  created_at: number;
  object: CreemCheckoutObject | CreemSubscription;
}

// Create a checkout session
export async function createCheckout(params: {
  productId: string;
  successUrl: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const body: Record<string, unknown> = {
    product_id: params.productId,
    success_url: params.successUrl,
    metadata: params.metadata || {},
  };

  if (params.customerId || params.customerEmail) {
    body.customer = {};
    if (params.customerId) (body.customer as Record<string, string>).id = params.customerId;
    if (params.customerEmail) (body.customer as Record<string, string>).email = params.customerEmail;
  }

  const response = await fetch(`${CREEM_API_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      'x-api-key': CREEM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Creem checkout creation failed: ${error}`);
  }

  const data = await response.json();
  return {
    checkoutUrl: data.checkout_url,
    checkoutId: data.id,
  };
}

// Create a customer portal link
export async function createCustomerPortal(customerId: string): Promise<string> {
  const response = await fetch(`${CREEM_API_BASE}/customers/billing`, {
    method: 'POST',
    headers: {
      'x-api-key': CREEM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_id: customerId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Creem portal creation failed: ${error}`);
  }

  const data = await response.json();
  return data.customer_portal_link;
}

// Get customer by email
export async function getCustomerByEmail(email: string): Promise<{ id: string } | null> {
  const response = await fetch(`${CREEM_API_BASE}/customers?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'x-api-key': CREEM_API_KEY,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.id ? data : null;
}

// Verify webhook signature using HMAC-SHA256
export function verifyWebhookSignature(
  payload: string,
  secret: string,
  signature: string
): boolean {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return computed === signature;
}

// Update user plan in Supabase
export async function updateUserPlan(
  userId: string,
  plan: PlanId,
  creemCustomerId?: string,
  creemSubscriptionId?: string
): Promise<void> {
  const supabaseUrl = (supabaseUrl);
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const updateData: Record<string, unknown> = { plan };
  if (creemCustomerId) updateData.creem_customer_id = creemCustomerId;
  if (creemSubscriptionId) updateData.creem_subscription_id = creemSubscriptionId;

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user plan:', error);
    throw error;
  }
}

// Get user plan from Supabase
export async function getUserPlan(userId: string): Promise<{
  plan: PlanId;
  creemCustomerId?: string;
  creemSubscriptionId?: string;
}> {
  const supabaseUrl = (supabaseUrl);
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('profiles')
    .select('plan, creem_customer_id, creem_subscription_id')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return { plan: 'free' };
  }

  return {
    plan: (data.plan as PlanId) || 'free',
    creemCustomerId: data.creem_customer_id || undefined,
    creemSubscriptionId: data.creem_subscription_id || undefined,
  };
}

// Handle webhook: determine what plan change to make based on event
export function getPlanChangeFromEvent(
  eventType: CreemEventType,
  subscriptionStatus?: string
): { plan: PlanId } | null {
  switch (eventType) {
    case 'subscription.canceled':
    case 'subscription.expired':
      return { plan: 'free' };
    default:
      return null;
  }
}

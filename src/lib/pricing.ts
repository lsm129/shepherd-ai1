// ShepherdAI Pricing Configuration
// Single source of truth for all pricing-related logic

export type PlanId = 'free' | 'starter' | 'pro' | 'growth';

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // monthly price
  annualPrice?: number; // annual price (20% off monthly * 12)
  generationsPerMonth: number; // -1 = unlimited
  features: string[];
  maxTools: number; // how many AI tools they can access (7 total)
  highlight?: string;
  creemProductId?: string; // Creem product ID for monthly plan
  annualCreemProductId?: string; // Creem product ID for annual plan
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    generationsPerMonth: 10,
    maxTools: 3,
    features: [
      '10 AI generations/month',
      'Visitor follow-up',
      'Weekly newsletter',
      'Prayer requests',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    generationsPerMonth: 50,
    maxTools: 3,
    creemProductId: 'prod_89GZ0Mr4cUbRkaH1guqcD',
    annualCreemProductId: '', // TODO: Fill in after creating annual product in Creem
    annualPrice: 278, // $29*12*0.8
    features: [
      '50 AI generations/month',
      '3 core AI tools',
      'Email sending',
      'Custom AI tone',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    generationsPerMonth: 200,
    maxTools: 7,
    highlight: 'Most Popular',
    creemProductId: 'prod_6mHoeoWBuxR3qsJdAfQWo0',
    annualCreemProductId: '', // TODO: Fill in after creating annual product in Creem
    annualPrice: 470, // $49*12*0.8
    features: [
      '200 AI generations/month',
      'All 7 AI tools',
      'Email sending',
      'Priority support',
      'Referral program',
      'Custom AI tone',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 99,
    generationsPerMonth: -1, // unlimited
    maxTools: 7,
    creemProductId: 'prod_LtkwTRkzN7R7brJIoCh5Q',
    annualCreemProductId: '', // TODO: Fill in after creating annual product in Creem
    annualPrice: 950, // $99*12*0.8
    features: [
      'Unlimited AI generations',
      'Everything in Pro',
      'Multi-campus support',
      'Team accounts (5 users)',
      'Dedicated onboarding',
      'API access',
      'Custom integrations',
    ],
  },
};

export const TOTAL_AI_TOOLS = 7;

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

export function isUnlimited(plan: Plan): boolean {
  return plan.generationsPerMonth === -1;
}

export function canGenerate(usedCount: number, plan: Plan): boolean {
  if (isUnlimited(plan)) return true;
  return usedCount < plan.generationsPerMonth;
}

export function getRemainingGenerations(usedCount: number, plan: Plan): number | string {
  if (isUnlimited(plan)) return 'Unlimited';
  return Math.max(0, plan.generationsPerMonth - usedCount);
}

export type BillingCycle = 'monthly' | 'annual';

export function getPlanPrice(plan: Plan, billingCycle: BillingCycle): number {
  if (billingCycle === 'annual' && plan.annualPrice) return plan.annualPrice;
  return plan.price;
}

export function getPlanProductId(plan: Plan, billingCycle: BillingCycle): string | undefined {
  if (billingCycle === 'annual' && plan.annualCreemProductId) return plan.annualCreemProductId;
  return plan.creemProductId;
}

export function getAnnualSavings(plan: Plan): number {
  if (!plan.annualPrice) return 0;
  return plan.price * 12 - plan.annualPrice;
}

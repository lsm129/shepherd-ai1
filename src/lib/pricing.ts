// Pricing configuration - 4-tier plan system
// Updated: $19/$39/$79 monthly, annual pricing with 2 months free

export type PlanId = 'free' | 'starter' | 'pro' | 'growth';

export type BillingCycle = 'monthly' | 'annual';

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // monthly in USD, 0 = free
  annualPrice: number; // annual in USD, 0 = free
  priceId?: string; // Creem/stripe price ID for checkout (monthly)
  annualPriceId?: string; // Creem/stripe price ID for checkout (annual)
  generationsPerMonth: number; // -1 = unlimited
  features: string[];
  highlighted?: boolean;
  badge?: string;
  congregantSeats?: number; // -1 = unlimited
  batchLimit?: number;
  highlight?: boolean; // alias for highlighted
  annualCreemProductId?: string; // max posts per batch generation
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    annualPrice: 0,
    generationsPerMonth: 20,
    features: [
      '7-day full-feature trial',
      '20 AI generations/month after trial',
      'Visitor follow-up emails',
      'Sermon prep & research - outlines, word studies, illustrations',
      'Prayer request management',
      'Church announcements',
      'Basic email support',
    ],
    congregantSeats: 5,
    batchLimit: 5,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19,
    annualPrice: 190, // save $38 (2 months free)
    generationsPerMonth: 100,
    features: [
      '100 AI generations/month',
      'Everything in Free',
      'Sermon social media content',
      'Daily devotional generator',
      'Church newsletter agent',
      'Template marketplace access',
      'Priority support',
    ],
    highlighted: true,
    badge: 'Most Popular',
    congregantSeats: 25,
    batchLimit: 20,
  },
  pro: {
    id: 'pro',
    name: 'Pro — Team Collaboration',
    price: 39,
    annualPrice: 390, // save $78 (2 months free)
    generationsPerMonth: 300,
    features: [
      '300 AI generations/month',
      'Everything in Starter',
      'AI habit learning — gets smarter over time',
      'Correctable AI memory',
      'Paper prayer OCR scanning',
      'Batch content generation',
      'Share your templates & earn',
      'Unlimited congregant seats',
    ],
    congregantSeats: -1, // unlimited
    batchLimit: 50,
  },
  growth: {
    id: 'growth',
    name: 'Growth — Full Automation',
    price: 79,
    annualPrice: 790, // save $158 (2 months free)
    generationsPerMonth: -1, // unlimited
    features: [
      'Unlimited AI generations',
      'Everything in Pro',
      'Full automation — AI runs your ministry',
      'AI diagnosis report on signup',
      'Proactive AI suggestions',
      'Prayer Tap for congregants',
      'Community knowledge base',
      'White-label church pages',
      'Dedicated account manager',
    ],
    congregantSeats: -1,
    batchLimit: -1,
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'starter', 'pro', 'growth'];

export function getPlan(planId: string | null | undefined): Plan {
  return PLANS[(planId as PlanId) || 'free'] || PLANS.free;
}

export function canUpgrade(currentPlan: PlanId): boolean {
  const idx = PLAN_ORDER.indexOf(currentPlan);
  return idx < PLAN_ORDER.length - 1;
}

export function getNextPlan(currentPlan: PlanId): Plan | null {
  const idx = PLAN_ORDER.indexOf(currentPlan);
  if (idx < PLAN_ORDER.length - 1) {
    return PLANS[PLAN_ORDER[idx + 1]];
  }
  return null;
}

// Quota checking middleware for AI generation routes
// Rule: 生成即扣1次，recordGeneration写入generations表即扣次
import { createClient } from '@supabase/supabase-js';
import { PLANS, type PlanId } from './pricing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface QuotaResult {
  allowed: boolean;
  remaining: number | string; // number or 'Unlimited'
  plan: PlanId;
  used: number;
  limit: number | string; // number or 'Unlimited'
}

export async function checkQuota(userId: string): Promise<QuotaResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get user's current plan (default to free)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();
  
  const planId: PlanId = (profile?.plan as PlanId) || 'free';
  const plan = PLANS[planId];
  
  // Count generations this month (生成即扣次，每条记录=1次使用)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const { count } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth);
  
  const used = count || 0;
  const limit = plan.generationsPerMonth === -1 ? 'Unlimited' : plan.generationsPerMonth;
  const remaining = plan.generationsPerMonth === -1 ? 'Unlimited' : Math.max(0, plan.generationsPerMonth - used);
  const allowed = plan.generationsPerMonth === -1 ? true : used < plan.generationsPerMonth;
  
  return { allowed, remaining, plan: planId, used, limit };
}

// Record a generation - 生成即扣1次
export async function recordGeneration(userId: string, toolType: string, inputSummary: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  await supabase.from('generations').insert({
    user_id: userId,
    tool_type: toolType,
    input_summary: inputSummary,
    created_at: new Date().toISOString(),
  });
}

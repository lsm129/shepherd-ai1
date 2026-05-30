// Quota checking middleware for AI generation routes
// KEY CHANGE: Generation = preview (pending). Approval = consumed (counts toward quota).
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
  pending: number;
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
  
  // Count CONSUMED generations this month (only approved ones count)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const { count } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth);
  
  const used = count || 0;
  
  // Get pending count from user_metadata
  const { data: { user } } = await supabase.auth.admin.getUserById(userId);
  const pending = user?.user_metadata?.pending_gen_count || 0;
  
  const limit = plan.generationsPerMonth === -1 ? 'Unlimited' : plan.generationsPerMonth;
  const remaining = plan.generationsPerMonth === -1 ? 'Unlimited' : Math.max(0, plan.generationsPerMonth - used);
  
  // Allow generation if consumed + pending < limit (pending = previewing but not yet approved)
  // This gives users room to preview and retry without wasting quota
  const totalPotential = used + pending;
  const allowed = plan.generationsPerMonth === -1 ? true : totalPotential < plan.generationsPerMonth;
  
  return { allowed, remaining, plan: planId, used, limit, pending };
}

// Increment pending count when user generates (preview mode)
export async function incrementPending(userId: string): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: { user } } = await supabase.auth.admin.getUserById(userId);
  const meta = user?.user_metadata || {};
  const pendingCount = (meta.pending_gen_count || 0) + 1;
  
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { ...meta, pending_gen_count: pendingCount },
  });
}

// DEPRECATED: Use /api/ai-consume instead. Kept for backward compat.
export async function recordGeneration(userId: string, toolType: string, inputSummary: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  await supabase.from('generations').insert({
    user_id: userId,
    tool_type: toolType,
    input_summary: inputSummary,
    created_at: new Date().toISOString(),
  });
}

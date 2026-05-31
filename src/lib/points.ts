// ShepherdAI Points System
// Configuration and helper functions for earning/redeeming points
import { createClient } from '@supabase/supabase-js';

// --- Points Configuration ---
export const POINTS_CONFIG: Record<string, { points: number; dailyCap: number; label: string }> = {
  daily_login: { points: 3, dailyCap: 3, label: 'Daily Login' },
  generate_sermon: { points: 10, dailyCap: 30, label: 'Sermon/Social/Announcement Generation' },
  generate_prayer: { points: 5, dailyCap: 15, label: 'Prayer/Devotional/Newsletter Generation' },
  generate_other: { points: 5, dailyCap: 15, label: 'Other Generation' },
  complete_profile: { points: 500, dailyCap: 500, label: 'Complete Church Profile' },
  referral_bonus: { points: 50, dailyCap: Infinity, label: 'Referral Bonus' },
  template_shared: { points: 50, dailyCap: Infinity, label: 'Shared Sermon Template' },
};

// --- Rewards Configuration ---
export const REWARDS: Record<string, { cost: number; label: string; value: number | string }> = {
  extra_generations: { cost: 500, label: '10 Extra AI Generations', value: 10 },
  premium_templates: { cost: 800, label: 'Premium Sermon Templates', value: 'templates' },
  ai_style_custom: { cost: 1000, label: 'Custom AI Writing Style', value: 'style' },
  analytics_report: { cost: 1500, label: 'Monthly Church Analytics Report', value: 'analytics' },
};

// --- Supabase admin client (server-side only) ---
export function getAdminClient() {
  const supabaseUrl = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// --- Get today's earned points for a specific action ---
export async function getTodayEarned(userId: string, action: string): Promise<number> {
  const supabase = getAdminClient();
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const { data } = await supabase
    .from('points_transactions')
    .select('points')
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', startOfDay);
  return (data || []).reduce((sum: number, t: { points: number }) => sum + t.points, 0);
}

// --- Get points balance ---
export async function getPointsBalance(userId: string): Promise<number> {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('points_balance')
    .eq('id', userId)
    .single();
  return data?.points_balance || 0;
}

// --- Earn points (with daily cap check) ---
export async function earnPoints(
  userId: string,
  action: string,
): Promise<{ success: boolean; pointsEarned: number; newBalance: number; reason?: string }> {
  const config = POINTS_CONFIG[action];
  if (!config) {
    return { success: false, pointsEarned: 0, newBalance: 0, reason: 'Invalid action' };
  }

  const supabase = getAdminClient();

  const todayEarned = await getTodayEarned(userId, action);
  if (todayEarned >= config.dailyCap) {
    return {
      success: false,
      pointsEarned: 0,
      newBalance: await getPointsBalance(userId),
      reason: 'Daily cap reached',
    };
  }

  const pointsToAward = Math.min(config.points, config.dailyCap - todayEarned);
  const currentBalance = await getPointsBalance(userId);
  const newBalance = currentBalance + pointsToAward;

  const { error: txError } = await supabase.from('points_transactions').insert({
    user_id: userId,
    action,
    points: pointsToAward,
    balance_after: newBalance,
    description: config.label,
  });

  if (txError) {
    console.error('Failed to insert points transaction:', txError);
    return { success: false, pointsEarned: 0, newBalance: currentBalance, reason: 'DB error' };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ points_balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) {
    console.error('Failed to update points_balance:', profileError);
  }

  return { success: true, pointsEarned: pointsToAward, newBalance };
}

// --- Redeem reward ---
export async function redeemReward(
  userId: string,
  rewardType: string,
): Promise<{ success: boolean; newBalance: number; reward?: string; reason?: string }> {
  const reward = REWARDS[rewardType];
  if (!reward) {
    return { success: false, newBalance: 0, reason: 'Invalid reward type' };
  }

  const supabase = getAdminClient();
  const currentBalance = await getPointsBalance(userId);

  if (currentBalance < reward.cost) {
    return {
      success: false,
      newBalance: currentBalance,
      reason: 'Insufficient points',
    };
  }

  const newBalance = currentBalance - reward.cost;

  const { error: txError } = await supabase.from('points_transactions').insert({
    user_id: userId,
    action: 'redeem_' + rewardType,
    points: -reward.cost,
    balance_after: newBalance,
    description: 'Redeemed: ' + reward.label,
  });

  if (txError) {
    console.error('Failed to insert redemption transaction:', txError);
    return { success: false, newBalance: currentBalance, reason: 'DB error' };
  }

  const { error: redError } = await supabase.from('points_redemptions').insert({
    user_id: userId,
    reward_type: rewardType,
    points_cost: reward.cost,
  });

  if (redError) {
    console.error('Failed to insert redemption record:', redError);
  }

  await supabase
    .from('profiles')
    .update({ points_balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (rewardType === 'extra_generations') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('extra_generations')
      .eq('id', userId)
      .single();
    const currentExtra = profile?.extra_generations || 0;
    await supabase
      .from('profiles')
      .update({ extra_generations: currentExtra + (reward.value as number) })
      .eq('id', userId);
  }

  return { success: true, newBalance, reward: reward.label };
}

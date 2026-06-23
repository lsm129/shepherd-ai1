// ShepherdAI Points System
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

// --- Points Configuration ---
export const POINTS_CONFIG: Record<string, { points: number; dailyCap: number; label: string }> = {
  daily_login: { points: 3, dailyCap: 3, label: 'Daily Login' },
  generate_sermon: { points: 10, dailyCap: 30, label: 'Sermon/Social/Announcement Generation' },
  generate_prayer: { points: 5, dailyCap: 15, label: 'Prayer/Devotional/Newsletter Generation' },
  generate_other: { points: 5, dailyCap: 15, label: 'Other Generation' },
  complete_profile: { points: 500, dailyCap: 500, label: 'Complete Church Profile' },
  referral_bonus: { points: 50, dailyCap: Infinity, label: 'Referral Bonus' },
  template_shared: { points: 50, dailyCap: Infinity, label: 'Shared Sermon Template' },
  feedback_bonus: { points: 100, dailyCap: 100, label: 'Feedback Bonus' },
};

// --- Pastor Rewards ---
export const REWARDS: Record<string, { cost: number; label: string; description: string; icon: string; value: number | string }> = {
  extra_generations: { cost: 500, label: 'Extra AI Generations', description: '500 points = 10 extra generations', icon: '🎯', value: 10 },
  subscription_discount: { cost: 1000, label: 'Subscription Discount', description: '1000 points = $10 off your next renewal', icon: '💰', value: 10 },
  premium_content: { cost: 800, label: 'Premium Content Packs', description: '800 points = Holiday sermon series', icon: '📦', value: 'content' },
  beta_access: { cost: 600, label: 'Beta Access', description: '600 points = Early access to new features', icon: '🧪', value: 'beta' },
};

// --- Congregant Rewards ---
export const CONGREGANT_REWARDS: Record<string, { cost: number; label: string; description: string; icon: string; value: number | string }> = {
  prayer_pin: { cost: 50, label: 'Prayer Wall Pin', description: '50 points = Pin your prayer request for 7 days', icon: '📌', value: 7 },
  community_badge: { cost: 100, label: 'Community Badge', description: '100 points = Unlock a special badge', icon: '🏅', value: 'badge' },
  custom_devotional: { cost: 200, label: 'Personal Devotional', description: '200 points = AI personalized devotional plan', icon: '📖', value: 'devotional' },
  greeting_card: { cost: 100, label: 'Blessing Card', description: '100 points = Create a blessing card to share', icon: '💌', value: 'card' },
};

// Combined for lookup
const ALL_REWARDS = { ...REWARDS, ...CONGREGANT_REWARDS };

// --- Supabase admin client ---
export function getAdminClient() {
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

// --- Redeem reward (supports both pastor and congregant rewards) ---
export async function redeemReward(
  userId: string,
  rewardType: string,
): Promise<{ success: boolean; newBalance: number; reward?: string; reason?: string; rewardData?: any }> {
  const reward = ALL_REWARDS[rewardType];
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

  // Record transaction
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

  // Record redemption
  const { error: redError } = await supabase.from('points_redemptions').insert({
    user_id: userId,
    reward_type: rewardType,
    points_cost: reward.cost,
  });

  if (redError) {
    console.error('Failed to insert redemption record:', redError);
  }

  // Update balance
  await supabase
    .from('profiles')
    .update({ points_balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  // Handle reward-specific logic
  let rewardData: any = {};

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
    rewardData = { extraGenerations: currentExtra + (reward.value as number) };
  }

  if (rewardType === 'subscription_discount') {
    // Create a real Creem discount code for the pastor
    try {
      const discountAmount = reward.value as number; // e.g. $10
      const discountCode = 'PTS' + userId.substring(0, 8).toUpperCase() + Date.now().toString(36).toUpperCase();
      const allProductIds = [
        'prod_3Av1v0XK7Eglf0prqEZXUg', 'prod_2WcfpcakaMmjSMBIMLdikG', 'prod_1scixDX166NXlXkIdGckWW',
        'prod_761U0bBPstrqlxWZdMmlEb', 'prod_5ZaFuO5sa0YF3YZZBh7qjf', 'prod_31gKtMQgUQFh6HhMnGdxZ6',
      ];
      const creemRes = await fetch('https://api.creem.io/v1/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.CREEM_API_KEY! },
        body: JSON.stringify({
          name: 'Points Discount $' + discountAmount,
          code: discountCode,
          type: 'fixed',
          amount: discountAmount * 100, // cents
          currency: 'USD',
          duration: 'once',
          max_redemptions: 1,
          applies_to_products: allProductIds,
        }),
      });
      if (creemRes.ok) {
        const creemData = await creemRes.json();
        // Store discount code in user_metadata (avoids DB schema migration)
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        const meta = user?.user_metadata || {};
        const existingCodes: any[] = meta.discount_codes || [];
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...meta,
            discount_codes: [...existingCodes, { code: discountCode, amount: discountAmount, creem_id: creemData.id, created_at: new Date().toISOString(), used: false }],
            subscription_discount: (meta.subscription_discount || 0) + discountAmount,
          }
        });
        rewardData = { discountCode, amount: discountAmount, message: 'Your discount code ' + discountCode + ' ($' + discountAmount + ' off) will be auto-applied at next renewal.' };
      } else {
        const errText = await creemRes.text();
        console.error('Creem discount creation failed:', errText);
        // Fallback: store discount in user_metadata
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        const meta = user?.user_metadata || {};
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { ...meta, subscription_discount: (meta.subscription_discount || 0) + discountAmount }
        });
        rewardData = { discount: discountAmount, message: 'Discount recorded. Contact support to apply at renewal.' };
      }
    } catch (e) {
      console.error('Discount code creation error:', e);
      rewardData = { discount: reward.value, message: 'Discount recorded. Contact support to apply at renewal.' };
    }
  }

  if (rewardType === 'prayer_pin') {
    // Store pin status in user metadata
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};
    const pinnedPrayers: string[] = meta.pinned_prayers || [];
    const pinExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...meta, pinned_prayers: [...pinnedPrayers, pinExpiry] }
    });
    rewardData = { pinDays: 7, expiresAt: pinExpiry };
  }

  if (rewardType === 'community_badge') {
    // Unlock a badge
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};
    const badges: string[] = meta.badges || [];
    const newBadge = badges.length === 0 ? 'Prayer Warrior' : 
                     badges.length === 1 ? 'Faithful Servant' : 
                     badges.length === 2 ? 'Devoted Member' : 'Church Pillar';
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...meta, badges: [...badges, newBadge] }
    });
    rewardData = { badge: newBadge, allBadges: [...badges, newBadge] };
  }

  if (rewardType === 'custom_devotional') {
    // Generate a devotional plan using DeepSeek
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      const meta = user?.user_metadata || {};
      const churchName = meta.church_name || meta.joined_churches?.[0] || '';
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'system',
            content: 'You are a Christian devotional plan generator. Create a personalized 7-day devotional plan in English. Format: Day 1-7, each with a Bible verse, short reflection (2-3 sentences), and a prayer focus. Keep it warm, encouraging, and practical.'
          }, {
            role: 'user',
            content: `Create a 7-day personal devotional plan for a church member${churchName ? ' at ' + churchName : ''}. Make it practical and uplifting.`
          }],
          max_tokens: 1500,
        }),
      });
      const aiData = await response.json();
      const devotionalText = aiData.choices?.[0]?.message?.content || 'Devotional plan will be generated shortly.';
      rewardData = { devotional: devotionalText };
    } catch (e) {
      rewardData = { devotional: 'Your devotional plan is being prepared. Check back shortly!' };
    }
  }

  if (rewardType === 'greeting_card') {
    // Generate a blessing card message
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'system',
            content: 'You are a Christian blessing card generator. Create a beautiful, heartfelt blessing message that can be shared with friends and family. Include a Bible verse. Keep it warm and personal, 3-5 sentences.'
          }, {
            role: 'user',
            content: 'Generate a beautiful blessing card message with a Bible verse.'
          }],
          max_tokens: 500,
        }),
      });
      const aiData = await response.json();
      const cardText = aiData.choices?.[0]?.message?.content || 'May the Lord bless you and keep you!';
      rewardData = { card: cardText };
    } catch (e) {
      rewardData = { card: 'May the Lord bless you and keep you! (Numbers 6:24-26)' };
    }
  }

  if (rewardType === 'premium_content') {
    // Generate a premium sermon series pack using DeepSeek
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      const meta = user?.user_metadata || {};
      const denomination = meta.denomination || 'Non-denominational';
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'system',
            content: 'You are a Christian sermon series generator. Create a 4-week sermon series with: a series title, weekly themes, key Bible verses, and brief sermon outlines (3-4 bullet points each). Make it practical and relevant for modern congregations.'
          }, {
            role: 'user',
            content: 'Create a 4-week sermon series for a ' + denomination + ' church. Focus on a timely theme like spiritual growth, community, faith in difficult times, or living with purpose.'
          }],
          max_tokens: 2000,
        }),
      });
      const aiData = await response.json();
      const contentText = aiData.choices?.[0]?.message?.content || 'Your premium content pack is being generated. Check back shortly!';
      rewardData = { content: contentText };
    } catch (e) {
      rewardData = { content: 'Your premium sermon series is being prepared. Check back shortly!' };
    }
  }

  if (rewardType === 'beta_access') {
    // Grant beta access flag in user profile
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      const meta = user?.user_metadata || {};
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { ...meta, beta_access: true, beta_access_since: new Date().toISOString() }
      });
      rewardData = { betaAccess: true, message: 'You now have early access to all new features before they are publicly released!' };
    } catch (e) {
      rewardData = { betaAccess: true, message: 'Beta access granted! New features will appear in your dashboard first.' };
    }
  }

  return { success: true, newBalance, reward: reward.label, rewardData };
}

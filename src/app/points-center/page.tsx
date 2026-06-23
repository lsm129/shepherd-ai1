'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

interface Transaction {
  action: string;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function PointsCenterPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemConfirm, setRedeemConfirm] = useState<string | null>(null);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('pastor');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const router = useRouter();

  const pastorRewards = [
    { key: 'extra_generations', icon: '🎯', label: 'Extra AI Generations', desc: '500 pts = 10 extra generations', cost: 500 },
    { key: 'subscription_discount', icon: '💰', label: 'Subscription Discount', desc: '1000 pts = $10 off next renewal', cost: 1000 },
    { key: 'premium_content', icon: '📦', label: 'Premium Content Packs', desc: '800 pts = Holiday sermon series', cost: 800 },
    { key: 'beta_access', icon: '🧪', label: 'Beta Access', desc: '600 pts = Early access to new features', cost: 600 },
  ];
  const congregantRewards = [
    { key: 'prayer_pin', icon: '📌', label: 'Prayer Wall Pin', desc: '50 pts = Pin your prayer for 7 days', cost: 50 },
    { key: 'community_badge', icon: '🏅', label: 'Community Badge', desc: '100 pts = Unlock a special badge', cost: 100 },
    { key: 'custom_devotional', icon: '📖', label: 'Personal Devotional', desc: '200 pts = AI personalized devotional plan', cost: 200 },
    { key: 'greeting_card', icon: '💌', label: 'Blessing Card', desc: '100 pts = Create a blessing card to share', cost: 100 },
  ];
  const rewards = userRole === 'congregant' ? congregantRewards : pastorRewards;

  useEffect(() => {
    setMounted(true);
    async function init() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        setIsLoggedIn(true);
        setUserId(session.user.id);
        const meta = session.user.user_metadata || {};
        setUserRole(meta.role || 'pastor');
        const r = await fetch('/api/points/balance?userId=' + session.user.id);
        if (r.ok) {
          const d = await r.json();
          setPoints(d.balance || 0);
          setRecentTransactions((d.recentTransactions || []).slice(0, 5));
        }
        // Check if already checked in today
        const today = new Date().toISOString().split('T')[0];
        const lastCheck = localStorage.getItem('lastCheckIn');
        if (lastCheck === today) setCheckedIn(true);
      } catch (e) { console.error('Init error:', e); }
      setLoading(false);
    }
    init();
  }, [router]);

  const handleRedeem = async (rewardType: string) => {
    setRedeeming(rewardType);
    setRedeemResult(null);
    try {
      const r = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rewardType }),
      });
      const d = await r.json();
      if (d.success) {
        setPoints(d.newBalance);
        let msg = `Redeemed: ${d.reward}! 🎉`;
        if (d.rewardData) {
          if (d.rewardData.badge) msg = `Badge Unlocked: ${d.rewardData.badge}! 🏅`;
          if (d.rewardData.devotional) msg = `Your Personal Devotional is ready! 📖`;
          if (d.rewardData.card) msg = `Your Blessing Card is ready! 💌`;
          if (d.rewardData.pinDays) msg = `Your prayer is pinned for ${d.rewardData.pinDays} days! 📌`;
          if (d.rewardData.extraGenerations) msg = `+${d.rewardData.extraGenerations} extra generations added! 🎯`;
          if (d.rewardData.discountCode) msg = `Discount code ${d.rewardData.discountCode} ($${d.rewardData.amount} off) created! Will auto-apply at renewal. 💰`;
          if (d.rewardData.discount) msg = `$${d.rewardData.discount} discount recorded! 💰`;
          if (d.rewardData.content) msg = `Your Premium Sermon Series is ready! 📦`;
          if (d.rewardData.betaAccess) msg = `Beta Access granted! You'll see new features first. 🧪`;
        }
        setRedeemResult({ success: true, message: msg, data: d.rewardData });
        const br = await fetch('/api/points/balance?userId=' + userId);
        if (br.ok) {
          const bd = await br.json();
          setRecentTransactions((bd.recentTransactions || []).slice(0, 5));
        }
      } else {
        setRedeemResult({ success: false, message: d.reason || 'Redemption failed' });
      }
    } catch (e) {
      setRedeemResult({ success: false, message: 'Something went wrong' });
    }
    setRedeeming(null);
    setRedeemConfirm(null);
  };

  if (!mounted) return null;
  if (loading) return <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}><p style={{ color: '#666' }}>Loading...</p></div>;
  if (!isLoggedIn) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 4 }}>🎯 Points Center</h1>
          <p style={{ color: '#666', fontSize: 16 }}>Earn points, unlock rewards, and get more from ShepherdAI.</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', color: 'white', padding: '12px 24px', borderRadius: 16, fontWeight: 700, fontSize: 20 }}>
          {points} pts
        </div>
      </div>

      {/* Daily Check-in */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #fef3c7, #fff7ed)', border: '1px solid #fcd34d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#92400e', marginBottom: 4 }}>Daily Check-in</h2>
            <p style={{ color: '#a16207', fontSize: 14 }}>Check in daily to earn 3 points!</p>
          </div>
          <button
            onClick={async () => {
              setCheckInLoading(true);
              try {
                const r = await fetch('/api/points/earn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'daily_login' }) });
                const d = await r.json();
                if (d.success) {
                  setPoints(d.newBalance);
                  setCheckedIn(true);
                  localStorage.setItem('lastCheckIn', new Date().toISOString().split('T')[0]);
                } else {
                  setCheckedIn(true); // already checked in today
                  localStorage.setItem('lastCheckIn', new Date().toISOString().split('T')[0]);
                }
              } catch (e) {}
              setCheckInLoading(false);
            }}
            disabled={checkedIn || checkInLoading}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: checkedIn ? 'default' : 'pointer', background: checkedIn ? '#22c55e' : '#f59e0b', color: 'white' }}
          >
            {checkedIn ? '✅ Checked In!' : checkInLoading ? '...' : 'Check In (+3 pts)'}
          </button>
        </div>
      </div>

      {/* How to Earn */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 16 }}>💡 How to Earn Points</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {userRole === 'congregant' ? [
            { label: '🎯 Daily Check-in', pts: '+3 pts/day' },
            { label: '🙏 Submit Prayer', pts: '+5 pts each' },
            { label: '💬 Give Feedback', pts: '+100 pts one-time' },
            { label: '🔗 Invite Friends', pts: '+50 pts each' },
          ].map((item) => (
            <div key={item.label} style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>{item.pts}</div>
            </div>
          )) : [
            { label: '🎯 Daily Login', pts: '+3 pts/day' },
            { label: '📝 Sermon Generation', pts: '+10 pts each' },
            { label: '🙏 Prayer/Devotional', pts: '+5 pts each' },
            { label: '📋 Complete Profile', pts: '+500 pts one-time' },
            { label: '🔗 Referral Bonus', pts: '+50 pts each' },
            { label: '💬 Feedback Bonus', pts: '+100 pts one-time' },
          ].map((item) => (
            <div key={item.label} style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>{item.pts}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Rewards */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 16 }}>🎁 Redeem Your Points</h2>
        {redeemResult && (
          <div style={{ background: redeemResult.success ? '#f0fdf4' : '#fee2e2', border: `1px solid ${redeemResult.success ? '#22c55e' : '#ef4444'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: redeemResult.success ? '#15803d' : '#ef4444', fontWeight: 600, fontSize: 14 }}>
            {redeemResult.message}
            {redeemResult.data?.discountCode && (
              <div style={{ marginTop: 12, background: '#fffbeb', padding: 12, borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Your Discount Code: {redeemResult.data.discountCode}</div>
                <div style={{ fontSize: 13, color: '#666' }}>${redeemResult.data.amount} off — will be auto-applied at your next renewal.</div>
              </div>
            )}
            {redeemResult.data?.content && (
              <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, background: '#f8fafc', padding: 12, borderRadius: 8, color: '#333' }}>{redeemResult.data.content}</pre>
            )}
            {redeemResult.data?.devotional && (
              <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, background: '#f8fafc', padding: 12, borderRadius: 8, color: '#333' }}>{redeemResult.data.devotional}</pre>
            )}
            {redeemResult.data?.card && (
              <div style={{ marginTop: 12, background: '#fff7ed', padding: 16, borderRadius: 8, color: '#333', fontSize: 14, fontStyle: 'italic', borderLeft: '4px solid #f59e0b' }}>{redeemResult.data.card}</div>
            )}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {rewards.map((reward) => {
            const canRedeem = points >= reward.cost;
            return (
              <div key={reward.key} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: canRedeem ? '#fafafa' : '#f9f9f9', opacity: canRedeem ? 1 : 0.7 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{reward.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1e3a5f' }}>{reward.label}</div>
                    <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{reward.desc}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 8, fontSize: 14, color: canRedeem ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                  {canRedeem ? '✅ You have enough points' : `❌ Need ${reward.cost - points} more pts`}
                </div>
                {redeemConfirm === reward.key ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleRedeem(reward.key)} disabled={redeeming === reward.key} style={{ flex: 1, padding: 10, background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                      {redeeming === reward.key ? 'Processing...' : '✓ Confirm'}
                    </button>
                    <button onClick={() => setRedeemConfirm(null)} style={{ padding: '10px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => canRedeem && setRedeemConfirm(reward.key)} disabled={!canRedeem} style={{ width: '100%', padding: 10, background: canRedeem ? '#1e3a5f' : '#e5e7eb', color: canRedeem ? 'white' : '#999', border: 'none', borderRadius: 8, cursor: canRedeem ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}>
                    {canRedeem ? `Redeem for ${reward.cost} pts` : `Need ${reward.cost} pts`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 16 }}>📊 Recent Points Activity</h2>
        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>No points activity yet. Start using ShepherdAI to earn points!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTransactions.map((tx, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{tx.description || tx.action}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: tx.points > 0 ? '#22c55e' : '#ef4444' }}>{tx.points > 0 ? '+' : ''}{tx.points}</span>
                  <span style={{ fontSize: 12, color: '#999' }}>Bal: {tx.balance_after}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href={userRole === 'congregant' ? '/member/dashboard' : '/dashboard'} style={{ color: '#1e3a5f', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>← Back to Dashboard</Link>
      </div>
    </div>
  );
}

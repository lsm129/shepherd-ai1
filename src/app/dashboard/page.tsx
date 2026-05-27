'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Transaction {
  action: string;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [churchName, setChurchName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [totalTimeSaved, setTotalTimeSaved] = useState(0);
  const [genCount, setGenCount] = useState(0);
  const [emailVerified, setEmailVerified] = useState(true);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemMessage, setRedeemMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') return;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        setUserEmail(session.user.email || '');
        if (!session.user.email_confirmed_at) { setEmailVerified(false); return; }

        // Load church name
        try {
          const { data } = await supabase.from('church_settings').select('church_name').eq('user_id', session.user.id).single();
          if (data && data.church_name) setChurchName(data.church_name);
        } catch (e) {}

        // Load generation count
        try {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const { count } = await supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).gte('created_at', startOfMonth);
          setGenCount(count || 0);
          setTotalTimeSaved((count || 0) * 2.5);
        } catch (e) {}

        // Load points balance
        try {
          const res = await fetch('/api/points/balance?userId=' + session.user.id);
          if (res.ok) {
            const data = await res.json();
            setPointsBalance(data.balance || 0);
            // Check if already checked in today
            const todayTx = (data.recentTransactions || []).filter(
              (t: Transaction) => t.action === 'daily_login' && new Date(t.created_at).toDateString() === new Date().toDateString()
            );
            if (todayTx.length > 0) setCheckedInToday(true);
          }
        } catch (e) {}
      } catch (e) { console.error('Auth error:', e); }
    }
    checkAuth();
  }, [router]);

  const handleDailyCheckin = async () => {
    setCheckingIn(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/points/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setPointsBalance(data.newBalance);
        setCheckedInToday(true);
        setStreakDays(data.streakDays || 0);
      }
    } catch (e) {
      console.error('Check-in error:', e);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRedeem = async (rewardType: string) => {
    setRedeeming(rewardType);
    setRedeemMessage('');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, rewardType }),
      });
      const data = await res.json();
      if (data.success) {
        setPointsBalance(data.newBalance);
        setRedeemMessage('Redeemed: ' + data.reward);
      } else {
        setRedeemMessage(data.reason || 'Redemption failed');
      }
    } catch (e) {
      setRedeemMessage('Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.auth.signOut();
      }
    } catch (e) {}
    window.location.href = '/';
  };

  if (!mounted) return null;

  // Email not verified
  if (!emailVerified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Verify Your Email</h1>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
            We sent a verification link to <strong>{userEmail}</strong>.<br />
            Please check your inbox and click the link to activate your account.
          </p>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>
            Didn&apos;t receive the email? Check your spam folder.
          </p>
          <button
            onClick={async () => {
              try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                await supabase.auth.resend({ type: 'signup', email: userEmail });
                alert('Verification email resent!');
              } catch (e) { alert('Failed to resend. Please try again.'); }
            }}
            style={{ background: '#1e3a5f', color: 'white', padding: '12px 32px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}
          >
            Resend Email
          </button>
          <button
            onClick={async () => {
              try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                await supabase.auth.signOut();
              } catch (e) {}
              window.location.href = '/login';
            }}
            style={{ background: 'white', color: '#666', padding: '12px 24px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', cursor: 'pointer' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const rewards = [
    { type: 'extra_generations', icon: '⚡', name: '10 Extra AI Generations', cost: 500, desc: 'Get 10 more AI generations beyond your plan limit' },
    { type: 'premium_templates', icon: '📋', name: 'Premium Sermon Templates', cost: 800, desc: 'Unlock premium sermon template pack' },
    { type: 'ai_style_custom', icon: '🎨', name: 'Custom AI Writing Style', cost: 1000, desc: 'Unlock custom AI writing style feature' },
    { type: 'analytics_report', icon: '📊', name: 'Monthly Church Analytics Report', cost: 1500, desc: 'Unlock data analysis & reporting' },
  ];

  const features = [
    {
      href: '/visitor-followup',
      icon: '📧',
      title: 'Visitor Follow-up Agent',
      desc: 'Create personalized 6-week email sequences for new visitors.',
      color: '#1e3a5f',
      saves: '3 hrs/week',
    },
    {
      href: '/weekly-newsletter',
      icon: '📰',
      title: 'Weekly Newsletter Agent',
      desc: 'Transform weekly highlights into professional newsletters instantly.',
      color: '#4a90a4',
      saves: '2 hrs/week',
    },
    {
      href: '/prayer-requests',
      icon: '🙏',
      title: 'Prayer Requests',
      desc: 'Submit prayer requests and receive AI-generated warm responses with Bible verses.',
      color: '#8b5cf6',
      saves: '1.5 hrs/week',
    },
    {
      href: '/sermon-social',
      icon: '📱',
      title: 'Sermon to Social Media',
      desc: 'Transform sermon notes into engaging posts for Facebook, Instagram, and Twitter/X.',
      color: '#ec4899',
      saves: '2 hrs/week',
    },
    {
      href: '/church-announcement',
      icon: '📢',
      title: 'Church Announcement Generator',
      desc: 'Generate polished church announcements for services, events, or urgent notices.',
      color: '#f59e0b',
      saves: '1 hr/week',
    },
    {
      href: '/daily-devotional',
      icon: '📖',
      title: 'Daily Devotional',
      desc: 'Generate daily devotionals with Bible verses, meditation, application, and prayer.',
      color: '#10b981',
      saves: '1.5 hrs/week',
    },
    {
      href: '/feedback',
      icon: '💬',
      title: 'Suggestion Box',
      desc: 'Share your feedback, feature suggestions, or bug reports to help us improve.',
      color: '#6366f1',
      saves: '',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{userEmail}</span>
        <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: '#666', fontSize: '14px' }}>Sign Out</button>
      </div>

      {/* Welcome Banner with Church Name + Check-in */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', borderRadius: '16px', padding: '40px', color: 'white', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          {churchName ? 'Welcome to ' + churchName : 'Welcome'}!
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>Your AI-powered church assistant is ready.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/visitor-followup" style={{ background: 'white', color: '#1e3a5f', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Visitor Follow-up</Link>
          <Link href="/prayer-requests" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Prayer Requests</Link>
          <Link href="/daily-devotional" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Daily Devotional</Link>
          {/* Daily Check-in Button */}
          <button
            onClick={handleDailyCheckin}
            disabled={checkedInToday || checkingIn}
            style={{
              background: checkedInToday ? 'rgba(255,255,255,0.3)' : '#f59e0b',
              color: checkedInToday ? 'rgba(255,255,255,0.7)' : '#1e3a5f',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '700',
              border: 'none',
              cursor: checkedInToday ? 'default' : 'pointer',
              fontSize: '14px',
            }}
          >
            {checkingIn ? '⏳ Checking in...' : checkedInToday ? '✅ Checked In Today' : '🎁 Daily Check-in (+3 pts)'}
          </button>
          {/* Rewards Button */}
          <button
            onClick={() => setShowRewards(!showRewards)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🏆 Rewards
          </button>
        </div>
        {streakDays > 0 && (
          <p style={{ marginTop: '12px', fontSize: '14px', opacity: 0.8 }}>🔥 {streakDays}-day check-in streak!</p>
        )}
      </div>

      {/* Rewards Panel */}
      {showRewards && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>🏆 Points Rewards</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Your balance: <strong style={{ fontSize: '20px', color: '#f59e0b' }}>{pointsBalance} pts</strong></p>
          {redeemMessage && (
            <div style={{ background: redeemMessage.startsWith('Redeemed') ? '#dcfce7' : '#fef2f2', border: '1px solid ' + (redeemMessage.startsWith('Redeemed') ? '#22c55e' : '#ef4444'), borderRadius: '8px', padding: '12px', marginBottom: '16px', color: redeemMessage.startsWith('Redeemed') ? '#16a34a' : '#dc2626', fontSize: '14px' }}>
              {redeemMessage}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {rewards.map((r) => (
              <div key={r.type} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{r.icon}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e3a5f' }}>{r.name}</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>{r.desc}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '12px' }}>{r.cost} pts</div>
                <button
                  onClick={() => handleRedeem(r.type)}
                  disabled={redeeming === r.type || pointsBalance < r.cost}
                  style={{
                    background: pointsBalance >= r.cost ? '#1e3a5f' : '#ccc',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: pointsBalance >= r.cost ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  {redeeming === r.type ? 'Redeeming...' : pointsBalance >= r.cost ? 'Redeem' : 'Not enough pts'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#22c55e' }}>{totalTimeSaved > 0 ? totalTimeSaved + ' hrs' : '—'}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Time Saved</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a5f' }}>{genCount}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>AI Generations Used</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: genCount >= 10 ? '#ef4444' : '#1e3a5f' }}>{Math.max(0, 10 - genCount)}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Remaining This Month</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{pointsBalance}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Points Balance</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a5f' }}>Free</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Current Plan</div>
        </div>
      </div>

      {/* AI Assistants */}
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Your AI Assistants</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} style={{ textDecoration: 'none' }}>
            <div className="dashboard-card" style={{ height: '100%', cursor: 'pointer', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '48px' }}>{feature.icon}</span>
                {feature.saves && (
                  <span className="badge badge-success" style={{ fontSize: '12px', padding: '4px 10px', fontWeight: '700' }}>
                    Saves {feature.saves}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{feature.title}</h3>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>{feature.desc}</p>
              <div style={{ color: feature.color, fontWeight: '600' }}>Get Started →</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link href="/settings" style={{ color: '#1e3a5f', fontWeight: '600', textDecoration: 'none', fontSize: '16px' }}>Configure Your Church Settings →</Link>
      </div>
    </div>
  );
}

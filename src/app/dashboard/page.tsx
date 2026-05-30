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
  const [userPlan, setUserPlan] = useState<string>('free');
  const [quotaLimit, setQuotaLimit] = useState<number>(10); // default free plan
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    denomination: '',
    congregation_size: '',
    worship_style: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showAiMemory, setShowAiMemory] = useState(false);
  const [aiMemory, setAiMemory] = useState<any>(null);
  const [editingField, setEditingField] = useState<string>('');
  const [editValue, setEditValue] = useState('');
  const [savingMemory, setSavingMemory] = useState(false);
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

        // Load church name and check profile completeness from user_metadata
        try {
          const { data: csData } = await supabase.from('church_settings').select('church_name').eq('user_id', session.user.id).single();
          if (csData && csData.church_name) setChurchName(csData.church_name);
          // Read denomination/congregation_size/worship_style from user_metadata
          const meta = session.user.user_metadata || {};
          if (meta.denomination && meta.congregation_size && meta.worship_style) {
            setProfileForm({
              denomination: meta.denomination || '',
              congregation_size: meta.congregation_size || '',
              worship_style: meta.worship_style || '',
            });
          } else {
            setProfileComplete(false);
          }
        } catch (e) {
          setProfileComplete(false);
        }

        // Load user plan and quota
        try {
          const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
          const plan = (profile?.plan as string) || 'free';
          setUserPlan(plan);
          // Set quota limits based on plan
          const planLimits: Record<string, number> = { free: 10, starter: 50, pro: 200, growth: -1 };
          const limit = planLimits[plan] ?? 10;
          if (limit === -1) {
            setIsUnlimited(true);
          } else {
            setQuotaLimit(limit);
          }
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

  // Load suggestions and diagnosis when profile is complete
  useEffect(() => {
    if (profileComplete && !profileSaved) {
      loadSuggestions();
    }
  }, [profileComplete]);

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

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Save to user_metadata (no DDL needed)
      const { error } = await supabase.auth.updateUser({
        data: {
          denomination: profileForm.denomination,
          congregation_size: profileForm.congregation_size,
          worship_style: profileForm.worship_style,
        }
      });

      if (error) throw error;

      // Award 500 points for completing profile
      try {
        await fetch('/api/points/earn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id, action: 'complete_profile' }),
        });
        const res = await fetch('/api/points/balance?userId=' + session.user.id);
        if (res.ok) {
          const data = await res.json();
          setPointsBalance(data.balance || 0);
        }
      } catch (e) { console.error('Points error:', e); }

      setProfileComplete(true);
      setProfileSaved(true);
      // Generate AI diagnosis report immediately
      generateDiagnosis(profileForm.denomination, profileForm.congregation_size, profileForm.worship_style);
      setTimeout(() => { setShowProfileModal(false); setProfileSaved(false); }, 2000);
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save. Please try again.');
    } finally {
      setSavingProfile(false);
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
  ];

  const feedbackFeature = {
    href: '/feedback',
    icon: '💬',
    title: 'Suggestion Box',
    desc: 'Share your feedback, feature suggestions, or bug reports to help us improve.',
    color: '#6366f1',
  };

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

      {/* MANDATORY Profile Completion - Blocking Overlay */}
      {!profileComplete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '20px',
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '48px',
            maxWidth: '560px', width: '100%', maxHeight: '95vh', overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.3)', textAlign: 'center',
          }}>
            {profileSaved ? (
              <>
                <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Profile Complete!</h3>
                <p style={{ color: '#666', marginBottom: '8px' }}>AI now understands your church. All content will be personalized.</p>
                <p style={{ color: '#f59e0b', fontWeight: '700', fontSize: '18px' }}>+500 points awarded!</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>⛪</div>
                <h3 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
                  Tell Us About Your Church
                </h3>
                <p style={{ color: '#666', marginBottom: '6px', fontSize: '15px' }}>
                  Our AI needs to understand your church to create personalized content.
                </p>
                <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px', marginBottom: '28px' }}>
                  🎁 Complete your profile to earn 500 bonus points!
                </p>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>Denomination *</label>
                    <select value={profileForm.denomination} onChange={(e) => setProfileForm({ ...profileForm, denomination: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', background: 'white' }}>
                      <option value="">Select your denomination</option>
                      <option value="baptist">Baptist</option>
                      <option value="methodist">Methodist (UMC)</option>
                      <option value="lutheran">Lutheran (ELCA/Missouri Synod)</option>
                      <option value="presbyterian">Presbyterian (PCA/PCUSA)</option>
                      <option value="pentecostal">Pentecostal / Assemblies of God</option>
                      <option value="catholic">Roman Catholic</option>
                      <option value="anglican">Anglican / Episcopal</option>
                      <option value="non-denominational">Non-Denominational</option>
                      <option value="orthodox">Eastern Orthodox</option>
                      <option value="adventist">Seventh-day Adventist</option>
                      <option value="reformed">Reformed (CRC/RCA)</option>
                      <option value="nazarene">Church of the Nazarene</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>Congregation Size *</label>
                    <select value={profileForm.congregation_size} onChange={(e) => setProfileForm({ ...profileForm, congregation_size: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', background: 'white' }}>
                      <option value="">Select size</option>
                      <option value="small">Small (under 50)</option>
                      <option value="medium">Medium (50-200)</option>
                      <option value="large">Large (200-500)</option>
                      <option value="mega">Mega (500+)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>Worship Style *</label>
                    <select value={profileForm.worship_style} onChange={(e) => setProfileForm({ ...profileForm, worship_style: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', background: 'white' }}>
                      <option value="">Select style</option>
                      <option value="traditional">Traditional (hymns, liturgy)</option>
                      <option value="contemporary">Contemporary (modern worship band)</option>
                      <option value="blended">Blended (mix of both)</option>
                      <option value="charismatic">Charismatic (Spirit-led)</option>
                      <option value="high-church">High Church (formal liturgy)</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleSaveProfile} disabled={!profileForm.denomination || !profileForm.congregation_size || !profileForm.worship_style || savingProfile} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', fontSize: '17px', fontWeight: '700', cursor: (!profileForm.denomination || !profileForm.congregation_size || !profileForm.worship_style) ? 'not-allowed' : 'pointer', background: (!profileForm.denomination || !profileForm.congregation_size || !profileForm.worship_style) ? '#ccc' : '#1e3a5f', color: 'white' }}>
                  {savingProfile ? 'Saving...' : 'Complete Profile & Earn 500 Points →'}
                </button>
                <p style={{ color: '#999', fontSize: '13px', marginTop: '16px' }}>Required to personalize your AI experience</p>
              </>
            )}
          </div>
        </div>
      )}

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

      {/* AI Diagnosis Report */}
      {profileSaved && diagnosis && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '4px' }}>AI Church Diagnosis</h2>
              <p style={{ color: '#666', fontSize: '14px' }}>{diagnosis.summary}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: diagnosis.overallScore >= 70 ? '#22c55e' : diagnosis.overallScore >= 40 ? '#f59e0b' : '#ef4444' }}>{diagnosis.overallScore}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Overall Score</div>
            </div>
          </div>

          {diagnosis.denominationInsight && (
            <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '16px', marginBottom: '20px', borderLeft: '4px solid #6366f1' }}>
              <span style={{ fontWeight: '600', color: '#1e3a5f' }}>💡 Denomination Insight: </span>
              <span style={{ color: '#444' }}>{diagnosis.denominationInsight}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {(diagnosis.modules || []).map((mod: any, i: number) => (
              <div key={mod.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                {mod.status === 'locked' && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, borderRadius: '12px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
                    <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '4px' }}>Unlock with Starter Plan</div>
                    <a href="/pricing" style={{ color: '#6366f1', fontWeight: '600', fontSize: '14px' }}>Upgrade to $29/mo →</a>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f' }}>{mod.title}</h3>
                  <div style={{ background: mod.score >= 7 ? '#dcfce7' : mod.score >= 4 ? '#fef3c7' : '#fee2e2', color: mod.score >= 7 ? '#16a34a' : mod.score >= 4 ? '#d97706' : '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>{mod.score}/10</div>
                </div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{mod.finding}</p>
                <p style={{ color: '#6366f1', fontSize: '13px', fontWeight: '500' }}>✨ {mod.recommendation}</p>
              </div>
            ))}
          </div>

          {diagnosis.quickWins && (
            <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #22c55e' }}>
              <div style={{ fontWeight: '600', color: '#16a34a', marginBottom: '8px' }}>🎯 Quick Wins</div>
              {(diagnosis.quickWins || []).map((win: string, i: number) => (
                <div key={i} style={{ color: '#444', fontSize: '14px', marginBottom: '4px' }}>• {win}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {profileSaved && diagnosing && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', marginBottom: '32px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>AI is analyzing your church...</h3>
          <p style={{ color: '#666' }}>Generating personalized diagnosis report</p>
        </div>
      )}

      {/* AI Proactive Suggestions */}
      {profileComplete && suggestions.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '16px', padding: '28px', marginBottom: '32px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>🤖 AI Suggestions for You</h2>
              <p style={{ opacity: 0.8, fontSize: '14px' }}>Based on your usage and church profile</p>
            </div>
            <button onClick={loadSuggestions} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Refresh</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {suggestions.map((s: any, i: number) => (
              <a key={i} href={s.actionUrl || '#'} style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '16px', display: 'block', transition: 'background 0.2s' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{s.title}</div>
                <div style={{ opacity: 0.85, fontSize: '13px', lineHeight: '1.4' }}>{s.description}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {profileComplete && loadingSuggestions && (
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '16px', padding: '28px', marginBottom: '32px', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
          <p>Loading personalized suggestions...</p>
        </div>
      )}

      {/* AI Memory / Correct AI Understanding */}
      {profileComplete && (
        <div style={{ marginBottom: '32px' }}>
          <button onClick={() => { setShowAiMemory(!showAiMemory); if (!showAiMemory) loadAiMemory(); }} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🧠 {showAiMemory ? 'Hide' : 'View'} AI Memory
            <span style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>(See what AI knows about you & correct it)</span>
          </button>
          
          {showAiMemory && aiMemory && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginTop: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '20px' }}>🧠 What AI Knows About Your Church</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {Object.entries(aiMemory.profile || {}).map(([key, val]) => (
                  <div key={key} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</div>
                    {editingField === key ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }} />
                        <button onClick={() => handleUpdateMemory(key, editValue)} disabled={savingMemory} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>{savingMemory ? '...' : '✓'}</button>
                        <button onClick={() => setEditingField('')} style={{ background: '#eee', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{String(val)}</span>
                        <button onClick={() => { setEditingField(key); setEditValue(String(val)); }} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(aiMemory.usage_patterns) && (
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', fontSize: '13px' }}>📊 Usage Patterns (AI learns from this)</div>
                  <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                    <div>Total AI generations: {aiMemory.usage_patterns.total_generations}</div>
                    <div>Favorite tool: {aiMemory.usage_patterns.favorite_tool}</div>
                    <div>Chat conversations: {aiMemory.usage_patterns.chat_conversations}</div>
                    {Object.entries(aiMemory.usage_patterns.tools_used || {}).map(([tool, count]) => (
                      <div key={tool}>{tool}: {String(count)} uses</div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>📝 Tell AI something specific about your church</label>
                {editingField === 'custom_preferences' ? (
                  <div>
                    <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="e.g., We prefer informal language, Our congregation is mostly elderly, We focus on youth ministry..." style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => handleUpdateMemory('custom_preferences', editValue)} disabled={savingMemory} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>{savingMemory ? 'Saving...' : 'Save'}</button>
                      <button onClick={() => setEditingField('')} style={{ background: '#eee', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                    <span style={{ color: '#666', fontSize: '13px' }}>{aiMemory.custom_preferences || 'No custom preferences set'}</span>
                    <button onClick={() => { setEditingField('custom_preferences'); setEditValue(aiMemory.custom_preferences || ''); }} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                  </div>
                )}
              </div>
            </div>
          )}
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
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: isUnlimited ? '#22c55e' : (quotaLimit > 0 && genCount / quotaLimit >= 0.8 ? '#ef4444' : '#1e3a5f') }}>{isUnlimited ? '∞' : Math.max(0, quotaLimit - genCount)}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Remaining This Month</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{pointsBalance}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Points Balance</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a5f' }}>{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</div>
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

      {/* Feedback Section */}
      <div style={{ background: '#f0f4ff', borderRadius: '16px', padding: '32px', marginBottom: '40px', textAlign: 'center', border: '1px dashed #c7d2fe' }}>
        <span style={{ fontSize: '40px' }}>💬</span>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>Share Your Feedback</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>Help us improve ShepherdAI with your suggestions and bug reports.</p>
        <Link href="/feedback" style={{ color: '#6366f1', fontWeight: '600', textDecoration: 'none', fontSize: '16px' }}>Open Suggestion Box →</Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link href="/settings" style={{ color: '#1e3a5f', fontWeight: '600', textDecoration: 'none', fontSize: '16px' }}>Configure Your Church Settings →</Link>
      </div>
    </div>
  );
}

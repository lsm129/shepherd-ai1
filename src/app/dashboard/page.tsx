'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { supabase as globalSupabase } from '@/lib/supabase';
import { trackUpgradePromptShown, trackUpgradePromptClicked } from '@/lib/analytics';


export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [churchName, setChurchName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [totalTimeSaved, setTotalTimeSaved] = useState(0);
  const [points, setPoints] = useState(0);
  const [plan, setPlan] = useState('free');
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [generationsLimit, setGenerationsLimit] = useState(10);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [userId, setUserId] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [diagnosisPending, setDiagnosisPending] = useState(false);
  const [nearLimit, setNearLimit] = useState(false);

  // AI Style Fingerprint state
  const [styleProfile, setStyleProfile] = useState<any>(null);

  // Founding Church Hub state
  const [isFoundingChurch, setIsFoundingChurch] = useState(false);
  const [foundingChurchReports, setFoundingChurchReports] = useState<any[]>([]);
  const [foundingAppDate, setFoundingAppDate] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<'30day' | '60day' | null>(null);
  const [reportExperience, setReportExperience] = useState('');
  const [reportFavoriteFeature, setReportFavoriteFeature] = useState('');
  const [reportSuggestions, setReportSuggestions] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [testimonial, setTestimonial] = useState('');
  const [authorizeMarketing, setAuthorizeMarketing] = useState(false);
  const [testimonialSubmitting, setTestimonialSubmitting] = useState(false);
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);

  const router = useRouter();

  // Fetch email from our own API when userId is available
  useEffect(() => {
    if (!userId) return;
    fetch('/api/subscription?userId=' + userId)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.email) setUserEmail(data.email);
        if (data?.plan) setUserPlan(data.plan);
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url') return;
        
        // Try getSession first, then listen for auth state change
        const { data: { session } } = await globalSupabase.auth.getSession();
        if (session) {
          setUserEmail(session.user.email || '');
          const meta = session.user.user_metadata || {};
          if (meta.role === 'congregant') { router.push('/member/dashboard'); return; }
          setUserId(session.user.id);
        }
        
        // Also listen for auth state changes (important for OAuth redirect)
        const { data: { subscription } } = globalSupabase.auth.onAuthStateChange((_event, sess) => {
          if (sess) {
            setUserEmail(sess.user.email || '');
            setUserId(sess.user.id);
          }
        });

        const sessionMeta = session?.user?.user_metadata || {};
        if (sessionMeta.diagnosis_pending) {
          setDiagnosisPending(true);
        }

        // Parallel API calls
        const results = await Promise.allSettled([
          supabase.from('church_settings').select('church_name').eq('user_id', session.user.id).single(),
          supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
          fetch('/api/points/balance?userId=' + session.user.id).then(r => r.ok ? r.json() : Promise.reject('points failed')).catch(() => null),
          fetch('/api/subscription?userId=' + session.user.id).then(r => r.ok ? r.json() : Promise.reject('subscription failed')).catch(() => null),
          fetch('/api/founding-church/report?userId=' + session.user.id).then(r => r.ok ? r.json() : Promise.reject('founding church failed')).catch(() => null),
          fetch('/api/ai/style-profile?userId=' + session.user.id).then(r => r.ok ? r.json() : Promise.reject('style profile failed')).catch(() => null),
        ]);

        if (results[0].status === 'fulfilled') {
          const res = results[0].value;
          if (res.data && res.data.church_name) setChurchName(res.data.church_name);
        }
        if (results[1].status === 'fulfilled') {
          const res = results[1].value;
          const count = res.count || 0;
          setTotalTimeSaved(count * 2.5);
          setGenerationsUsed(count);
        }
        const pointsData = results[2].status === 'fulfilled' ? results[2].value : null;
        if (pointsData && pointsData.balance !== undefined) setPoints(pointsData.balance);
        const subData = results[3].status === 'fulfilled' ? results[3].value : null;
        if (subData && subData.plan) {
          setPlan(subData.plan);
          setUserPlan(subData.plan);
          if (subData.email) setUserEmail(subData.email);
          const limits: Record<string, number> = { free: 20, starter: 100, pro: 300, growth: -1 };
          setGenerationsLimit(limits[subData.plan] || 20);
          const genUsed = results[1].status === 'fulfilled' ? (results[1].value.count || 0) : 0;
          if (limits[subData.plan] !== -1 && limits[subData.plan] - genUsed <= 5) {
            setNearLimit(true);
          }
        }
        const fcData = results[4].status === 'fulfilled' ? results[4].value : null;
        if (fcData) {
          setIsFoundingChurch(fcData.isApproved || false);
          setFoundingChurchReports(fcData.reports || []);
          setFoundingAppDate(fcData.applicationDate || null);
        }
        const spData = results[5].status === 'fulfilled' ? results[5].value : null;
        if (spData?.profile) {
          setStyleProfile(spData.profile);
        }
      } catch (e) { console.error('Auth error:', e); }
    }
    checkAuth();
  }, [router]);

  const handleDailyCheckIn = async () => {
    if (!userId || checkedIn || checkInLoading) return;
    setCheckInLoading(true);
    try {
      const r = await fetch('/api/points/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const d = await r.json();
      if (d.success) {
        setCheckedIn(true);
        setPoints(d.newBalance || points + 3);
        setStreakDays(d.streakDays || 1);
      } else if (d.alreadyCheckedIn) {
        if (d.newBalance) setPoints(d.newBalance);
        setCheckedIn(true);
      }
    } catch (e) {}
    setCheckInLoading(false);
  };

  const handleReportSubmit = async () => {
    if (!showReportModal || !reportExperience) return;
    setReportSubmitting(true);
    try {
      const r = await fetch('/api/founding-church/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          milestone: showReportModal,
          experience: reportExperience,
          favoriteFeature: reportFavoriteFeature,
          improvementSuggestions: reportSuggestions,
        }),
      });
      const d = await r.json();
      if (d.success) {
        const rr = await fetch('/api/founding-church/report?userId=' + userId);
        const rd = await rr.json();
        if (rd.reports) setFoundingChurchReports(rd.reports);
        setShowReportModal(null);
        setReportExperience('');
        setReportFavoriteFeature('');
        setReportSuggestions('');
      }
    } catch (e) {}
    setReportSubmitting(false);
  };

  const handleTestimonialSubmit = async () => {
    if (!testimonial) return;
    setTestimonialSubmitting(true);
    try {
      const r = await fetch('/api/founding-church/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          milestone: '30day',
          experience: 'Testimonial submission',
          favoriteFeature: 'N/A',
          improvementSuggestions: '',
          testimonial,
          authorizeMarketing,
        }),
      });
      const d = await r.json();
      if (d.success) {
        setTestimonialSubmitted(true);
        setTestimonial('');
      }
    } catch (e) {}
    setTestimonialSubmitting(false);
  };

  const getDaysSinceApproval = () => {
    if (!foundingAppDate) return 0;
    const diff = Date.now() - new Date(foundingAppDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };
  const daysSince = getDaysSinceApproval();
  const has30DayReport = foundingChurchReports.some((r: any) => r.milestone === '30day');
  const has60DayReport = foundingChurchReports.some((r: any) => r.milestone === '60day');

  if (!mounted) return null;

  const PLAN_ORDER = ['free', 'starter', 'pro', 'growth'];
  const canAccess = (minPlan: string) => PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(minPlan);

  const features = [
    { href: '/sermon-prep', icon: '📖', title: 'Sermon Preparation', desc: 'From scripture to sermon — outlines, word studies, illustrations, applications.', color: '#1a56db', saves: '8 hrs/wk', minPlan: 'free' },
    { href: '/visitor-followup', icon: '📧', title: 'Visitor Follow-up', desc: 'Personalized 6-week email sequences for new visitors.', color: '#1e3a5f', saves: '3 hrs/wk', minPlan: 'free' },
    { href: '/prayer-requests', icon: '🙏', title: 'Prayer Requests', desc: 'AI-generated responses with Bible verses for prayer requests.', color: '#8b5cf6', saves: '1.5 hrs/wk', minPlan: 'free' },
    { href: '/church-announcement', icon: '📢', title: 'Announcements', desc: 'Generate polished church announcements for services and events.', color: '#f59e0b', saves: '1 hr/wk', minPlan: 'free' },
    { href: '/church-community', icon: '⛪', title: 'My Church Community', desc: 'Private hub for your congregation — announcements, devotionals, prayer wall.', color: '#7c3aed', saves: '', minPlan: 'free' },
    { href: '/sermon-social', icon: '📱', title: 'Sermon → Social Media', desc: 'Transform sermon notes into engaging social media posts.', color: '#ec4899', saves: '2 hrs/wk', minPlan: 'starter' },
    { href: '/activity-planner', icon: '🎯', title: 'Activity Planner', desc: 'Generate comprehensive plans for any church activity — timeline, budget, team, and more.', color: '#0ea5e9', saves: '4 hrs/wk', minPlan: 'starter' },
    { href: '/daily-devotional', icon: '📖', title: 'Daily Devotional', desc: 'Bible verses, meditation, application, and prayer.', color: '#10b981', saves: '1.5 hrs/wk', minPlan: 'starter' },
    { href: '/weekly-newsletter', icon: '📰', title: 'Weekly Newsletter', desc: 'Transform highlights into professional newsletters.', color: '#4a90a4', saves: '2 hrs/wk', minPlan: 'starter' },
    { href: '/templates', icon: '📋', title: 'Template Marketplace', desc: 'Share & browse sermon outlines from fellow pastors.', color: '#22c55e', saves: '2 hrs/wk', minPlan: 'starter' },
    { href: '/batch-content', icon: '🎬', title: 'Content Studio', desc: 'Plan your content calendar — any topic, all platforms, one workflow.', color: '#6366f1', saves: '3 hrs/wk', minPlan: 'pro' },
    { href: '/church-accounting', icon: '💰', title: 'Church Accounting', desc: 'Track income and expenses with automatic financial reports and AI insights.', color: '#059669', saves: '2 hrs/wk', minPlan: 'pro' },
    { href: '/church-reports', icon: '📈', title: 'Financial Reports', desc: 'Auto-generated reports with category breakdowns, trends, and AI analysis.', color: '#0891b2', saves: '3 hrs/wk', minPlan: 'pro' },
    { href: '/church-reports-ai', icon: '🤖', title: 'AI Church Reports', desc: 'AI-powered weekly, monthly, and annual church health reports with actionable insights.', color: '#8b5cf6', saves: '2 hrs/wk', minPlan: 'pro' },
    { href: '/diagnosis', icon: '🏥', title: 'Ministry Health Report', desc: 'See how your church is doing and get personalized recommendations.', color: '#ef4444', saves: '', minPlan: 'free' },
    { href: '/community', icon: '🌍', title: 'Community Knowledge Base', desc: 'Share wisdom and learn from pastors worldwide.', color: '#0ea5e9', saves: '', minPlan: 'free' },
    { href: '/pastor/style-profile', icon: '🧠', title: 'Style Profile', desc: 'See what your AI has learned about your writing and preaching style.', color: '#0ea5e9', saves: '', minPlan: 'free' },
    { href: '/settings', icon: '⚙️', title: 'Church Settings', desc: 'Configure your church profile, plan, and preferences.', color: '#64748b', saves: '', minPlan: 'free' },
    { href: '/founding-church', icon: '⭐', title: 'Founding Church Program', desc: 'Apply for free Pro access — limited to 10 churches.', color: '#f5a623', saves: '$39/mo', minPlan: 'growth' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', borderRadius: '16px', padding: '32px', color: 'white', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          {churchName ? `Welcome to ${churchName}` : 'Welcome'}!
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '20px' }}>Your AI ministry platform is ready.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/sermon-prep" style={{ background: 'white', color: '#1a56db', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>📖 Sermon Prep</Link>
          <Link href="/visitor-followup" style={{ background: 'white', color: '#1e3a5f', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Visitor Follow-up</Link>
          <Link href="/prayer-requests" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Prayer Requests</Link>
          <Link href="/community" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Community</Link>
        </div>
      </div>
      {/* Account Info Bar */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>Account:</span>
          <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{userEmail || 'Loading...'}</span>
          <span style={{ background: userPlan === 'free' ? '#e2e8f0' : '#dcfce7', color: userPlan === 'free' ? '#475569' : '#166534', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{userPlan}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/settings" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>Settings</a>
          <button onClick={async () => { const { createClient } = await import('@supabase/supabase-js'); const sb = createClient(supabaseUrl, supabaseAnonKey); await sb.auth.signOut(); router.push('/login'); }} style={{ color: '#64748b', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      {/* Diagnosis Notification */}
      {diagnosisPending && (
        <Link href="/diagnosis" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '12px', padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '24px', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>!</span>
              <span style={{ fontWeight: 'bold', color: '#92400e', fontSize: '16px' }}>Your Ministry Health Report is ready!</span>
            </div>
            <span style={{ color: '#92400e', fontWeight: '600', fontSize: '14px' }}>View Report →</span>
          </div>
        </Link>
      )}

      {/* Stats Row with Daily Check-in */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#22c55e' }}>{totalTimeSaved > 0 ? `${totalTimeSaved}h` : '—'}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Time Saved</div>
        </div>

        {/* Clickable Points Card */}
        <Link href="/points-center" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s', position: 'relative' }}>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f59e0b' }}>{points} pts</div>
            <div style={{ color: '#666', fontSize: '12px' }}>Points</div>
            <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '2px', fontWeight: '600' }}>View & Redeem →</div>
          </div>
        </Link>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e3a5f' }}>{generationsUsed}/{generationsLimit === -1 ? '∞' : generationsLimit}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>AI Generations</div>
        </div>
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleDailyCheckIn}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: checkedIn ? '#22c55e' : '#8b5cf6' }}>
            {checkInLoading ? '⏳' : checkedIn ? '✅' : '🎯'}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>{checkedIn ? 'Checked In!' : 'Daily Check-in +3pts'}</div>
          {streakDays > 0 && <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '2px' }}>🔥 {streakDays} day streak</div>}
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', textTransform: 'capitalize' }}>{plan}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Current Plan</div>
          {plan === 'free' && <Link href="/settings" onClick={() => trackUpgradePromptClicked('dashboard_plan_upgrade')} style={{ fontSize: '11px', color: '#8b5cf6' }}>Upgrade →</Link>}
        </div>
      </div>

      {/* Near-Limit Upgrade Nudge */}
      {nearLimit && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)', border: '2px solid #f59e0b', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>⚡</span>
            <div>
              <p style={{ fontWeight: '700', fontSize: '15px', color: '#92400e', margin: 0 }}>You're almost out of AI generations this month</p>
              <p style={{ color: '#a16207', fontSize: '13px', margin: '4px 0 0 0' }}>{generationsUsed}/{generationsLimit} used — upgrade to keep your ministry workflow going.</p>
            </div>
          </div>
          <Link href="/settings" onClick={() => { trackUpgradePromptShown('dashboard_near_limit'); trackUpgradePromptClicked('dashboard_near_limit'); }} style={{ background: '#1e3a5f', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>
            Upgrade Now →
          </Link>
        </div>
      )}

      {/* ===== FOUNDING CHURCH HUB ===== */}
      {isFoundingChurch && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)', border: '2px solid #f59e0b', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>⭐</span>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>Founding Church Hub</h2>
              <p style={{ color: '#a16207', fontSize: '14px', margin: '4px 0 0 0' }}>Thank you for being a founding church! Track your milestones below.</p>
            </div>
          </div>

          {/* Milestone Tracker */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {/* 30-Day */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: has30DayReport ? '2px solid #22c55e' : daysSince >= 30 ? '2px solid #f59e0b' : '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e3a5f' }}>30-Day Report</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: has30DayReport ? '#22c55e' : daysSince >= 30 ? '#f59e0b' : '#999', background: has30DayReport ? '#f0fdf4' : daysSince >= 30 ? '#fef3c7' : '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>
                  {has30DayReport ? '✅ Completed' : daysSince >= 30 ? '📝 Pending' : `Day ${daysSince}/30`}
                </span>
              </div>
              {has30DayReport ? (
                <p style={{ color: '#22c55e', fontSize: '13px', margin: 0 }}>Report submitted!</p>
              ) : daysSince >= 30 ? (
                <button onClick={() => setShowReportModal('30day')} style={{ width: '100%', padding: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  Submit 30-Day Report →
                </button>
              ) : (
                <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>Available after 30 days ({30 - daysSince} days remaining)</p>
              )}
            </div>

            {/* 60-Day */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: has60DayReport ? '2px solid #22c55e' : daysSince >= 60 ? '2px solid #f59e0b' : '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e3a5f' }}>60-Day Report</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: has60DayReport ? '#22c55e' : daysSince >= 60 ? '#f59e0b' : '#999', background: has60DayReport ? '#f0fdf4' : daysSince >= 60 ? '#fef3c7' : '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>
                  {has60DayReport ? '✅ Completed' : daysSince >= 60 ? '📝 Pending' : `Day ${daysSince}/60`}
                </span>
              </div>
              {has60DayReport ? (
                <p style={{ color: '#22c55e', fontSize: '13px', margin: 0 }}>Report submitted!</p>
              ) : daysSince >= 60 ? (
                <button onClick={() => setShowReportModal('60day')} style={{ width: '100%', padding: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  Submit 60-Day Report →
                </button>
              ) : (
                <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>Available after 60 days ({60 - daysSince} days remaining)</p>
              )}
            </div>

            {/* 90-Day (display only) */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '2px solid #e5e7eb', opacity: daysSince >= 90 ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e3a5f' }}>90-Day Review</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: daysSince >= 90 ? '#f59e0b' : '#999', background: daysSince >= 90 ? '#fef3c7' : '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>
                  {daysSince >= 90 ? '🏁 Milestone!' : `Day ${daysSince}/90`}
                </span>
              </div>
              <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
                {daysSince >= 90 ? 'Congratulations on reaching 90 days! 🎉' : `${90 - daysSince} days remaining`}
              </p>
            </div>
          </div>

          {/* Testimonial Section */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>💬 Share Your Testimonial</h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>Tell other churches about your experience with ShepherdAI!</p>
            {testimonialSubmitted ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px', color: '#15803d', fontWeight: '600' }}>
                ✅ Thank you for your testimonial! We appreciate your support.
              </div>
            ) : (
              <>
                <textarea
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  placeholder="How has ShepherdAI helped your ministry? What would you tell other pastors about it?"
                  style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', marginBottom: '12px', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                  <input type="checkbox" checked={authorizeMarketing} onChange={(e) => setAuthorizeMarketing(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  ✅ I authorize ShepherdAI to use my church name and testimonial in marketing materials
                </label>
                <button
                  onClick={handleTestimonialSubmit}
                  disabled={!testimonial || testimonialSubmitting}
                  style={{
                    padding: '10px 24px', background: testimonial && !testimonialSubmitting ? '#1e3a5f' : '#e5e7eb',
                    color: testimonial && !testimonialSubmitting ? 'white' : '#999',
                    border: 'none', borderRadius: '8px', cursor: testimonial && !testimonialSubmitting ? 'pointer' : 'not-allowed',
                    fontWeight: '600', fontSize: '14px',
                  }}
                >
                  {testimonialSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '4px' }}>
              {showReportModal === '30day' ? '30' : '60'}-Day Report
            </h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Share your experience so far — your feedback helps us improve!</p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px', color: '#333' }}>How has your experience been? *</label>
              <textarea value={reportExperience} onChange={(e) => setReportExperience(e.target.value)} placeholder="What's working well? What surprised you?" style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px', color: '#333' }}>What's your favorite feature?</label>
              <input type="text" value={reportFavoriteFeature} onChange={(e) => setReportFavoriteFeature(e.target.value)} placeholder="e.g., Sermon generation, Visitor follow-up..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px', color: '#333' }}>Any suggestions for improvement?</label>
              <textarea value={reportSuggestions} onChange={(e) => setReportSuggestions(e.target.value)} placeholder="What could we do better?" style={{ width: '100%', minHeight: '60px', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleReportSubmit} disabled={!reportExperience || reportSubmitting} style={{ flex: 1, padding: '12px', background: reportExperience && !reportSubmitting ? '#1e3a5f' : '#e5e7eb', color: reportExperience && !reportSubmitting ? 'white' : '#999', border: 'none', borderRadius: '8px', cursor: reportExperience && !reportSubmitting ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '14px' }}>
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button onClick={() => { setShowReportModal(null); setReportExperience(''); setReportFavoriteFeature(''); setReportSuggestions(''); }} style={{ padding: '12px 24px', background: '#f5f5f5', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#666' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Features Grid */}
      {/* AI Style Fingerprint Card - Enhanced */}
      {styleProfile && styleProfile.stats && (
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.1 }}>🧠</div>
          
          {/* Header with confidence meter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <span style={{ fontSize: '18px', fontWeight: '800' }}>
                  {styleProfile.stats.totalLearned > 0 
                    ? `Your AI has learned ${styleProfile.stats.totalLearned} things about your style`
                    : 'Your AI is getting to know you'}
                </span>
              </div>
              <div style={{ fontSize: '13px', opacity: 0.75, maxWidth: '500px' }}>
                {styleProfile.highlights.switchCostMsg || 'Every generation makes your AI more personalized'}
              </div>
            </div>
            
            {/* Confidence Ring */}
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
              <svg width="56" height="56" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray={`${(styleProfile.stats.confidence || 0) * 1.508} 150.8`} strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: '14px', fontWeight: '800', position: 'relative' }}>{styleProfile.stats.confidence || 0}%</span>
            </div>
          </div>

          {/* Style Tags */}
          {styleProfile.stats.totalLearned > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {styleProfile.highlights.preachingStyle && styleProfile.highlights.preachingStyle !== 'Still learning...' && (
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600' }}>
                  🎯 Preaching: {styleProfile.highlights.preachingStyle}
                </span>
              )}
              {styleProfile.highlights.preferredGreeting && (
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600' }}>
                  👋 "{styleProfile.highlights.preferredGreeting}"
                </span>
              )}
              {styleProfile.highlights.goToScripture && (
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600' }}>
                  📖 {styleProfile.highlights.goToScripture}
                </span>
              )}
              {styleProfile.highlights.toneSummary && (
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600' }}>
                  🎨 {styleProfile.highlights.toneSummary}
                </span>
              )}
              {styleProfile.highlights.editingTendency && (
                <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600' }}>
                  ✏️ Tends to {styleProfile.highlights.editingTendency}
                </span>
              )}
              {styleProfile.highlights.signoffStyle && (
                <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600' }}>
                  ✍️ Signs off: "{styleProfile.highlights.signoffStyle.substring(0, 30)}"
                </span>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
            <span>📝 {styleProfile.stats.generationsAnalyzed} analyzed</span>
            <span>✏️ {styleProfile.stats.editCount} edits</span>
            <span>✅ {styleProfile.stats.approvedCount} approved</span>
            {styleProfile.stats.mostUsedTool && (
              <span>🔥 Most used: {styleProfile.stats.mostUsedTool}</span>
            )}
          </div>
          
          <a href="/pastor/style-profile" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'underline', display: 'inline-block' }}>View full style profile →</a>
        </div>
      )}

      
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>Your AI Assistants</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {features.map((feature) => {
          const locked = !canAccess(feature.minPlan);
          const CardContent = () => (
            <div className="dashboard-card" style={{ height: '100%', cursor: locked ? 'default' : 'pointer', position: 'relative', opacity: locked ? 0.6 : 1 }}>
              {locked && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                  🔒 {feature.minPlan.charAt(0).toUpperCase() + feature.minPlan.slice(1)}+
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '36px' }}>{feature.icon}</span>
                {feature.saves && !locked && (
                  <span className="badge badge-success" style={{ fontSize: '11px', padding: '3px 8px', fontWeight: '700' }}>Saves {feature.saves}</span>
                )}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>{feature.title}</h3>
              <p style={{ color: '#666', lineHeight: '1.5', fontSize: '13px' }}>{feature.desc}</p>
              {locked ? (
                <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '13px', marginTop: '8px' }}>🔒 Upgrade to Unlock</div>
              ) : (
                <div style={{ color: feature.color, fontWeight: '600', fontSize: '13px', marginTop: '8px' }}>Get Started →</div>
              )}
            </div>
          );
          return locked ? (
            <Link key={feature.href} href="/settings" onClick={() => trackUpgradePromptClicked(feature.title)} style={{ textDecoration: "none" }}><CardContent /></Link>
          ) : (
            <Link key={feature.href} href={feature.href} style={{ textDecoration: 'none' }}><CardContent /></Link>
          );
        })}
      </div>
    </div>
  );
}

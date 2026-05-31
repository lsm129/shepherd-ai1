'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


interface Dimension {
  key: string;
  label: string;
  icon: string;
  score: number;
  suggestion: string;
  feature: string;
  featureHref: string;
  featurePlan: string;
}

export default function DiagnosisPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('free');
  const [churchName, setChurchName] = useState('');
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Mark diagnosis as viewed
        await supabase.auth.updateUser({ data: { diagnosis_pending: false } });

        // Get plan
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
        if (profile?.plan) setPlan(profile.plan);

        // Get church settings
        const { data: settings } = await supabase.from('church_settings').select('*').eq('user_id', session.user.id).single();
        const cs = settings || {};
        if (cs.church_name) setChurchName(cs.church_name);

        const size = cs.congregation_size || 'medium';
        const denom = cs.denomination || 'non-denominational';
        const style = cs.worship_style || 'contemporary';
        const hasWebsite = !!cs.website;
        const hasSignature = !!cs.email_signature;

        // Score algorithms
        const sizeScores: Record<string, number> = { small: 70, medium: 55, large: 40, mega: 30 };
        const sizeEngage: Record<string, number> = { small: 60, medium: 50, large: 35, mega: 25 };
        const sizeCommunity: Record<string, number> = { small: 75, medium: 55, large: 35, mega: 20 };
        const denomDigital: Record<string, number> = {
          'traditional': 30, 'high-church': 30, 'catholic': 35, 'orthodox': 25, 'anglican': 35,
          'lutheran': 40, 'methodist': 45, 'presbyterian': 45, 'reformed': 45,
          'baptist': 50, 'nazarene': 50, 'adventist': 45,
          'pentecostal': 60, 'charismatic': 65, 'non-denominational': 70, 'other': 50,
        };

        const communication = Math.min(100, 50 + (hasWebsite ? 20 : 0) + (hasSignature ? 20 : 0) + (style ? 10 : 0));
        const contentCreation = sizeScores[size] || 55;
        const engagement = sizeEngage[size] || 50;
        const digital = denomDigital[denom] || 50;
        const community = sizeCommunity[size] || 55;
        const outreach = Math.min(100, 40 + (hasWebsite ? 15 : 0) + (['contemporary', 'charismatic', 'pentecostal'].includes(style) ? 10 : 0) + (['large', 'mega'].includes(size) ? 10 : 0));

        const dims: Dimension[] = [
          { key: 'communication', label: 'Communication', icon: '📧', score: communication,
            suggestion: 'Sermon → Social Media helps you reach your congregation where they are.',
            feature: 'Sermon → Social Media', featureHref: '/sermon-social', featurePlan: 'starter' },
          { key: 'content', label: 'Content Creation', icon: '✍️', score: contentCreation,
            suggestion: 'Content Studio plans your entire content calendar in minutes.',
            feature: 'Content Studio', featureHref: '/batch-content', featurePlan: 'pro' },
          { key: 'engagement', label: 'Congregation Engagement', icon: '🙏', score: engagement,
            suggestion: 'Prayer Tap keeps your members engaged with daily prayer prompts.',
            feature: 'Prayer Tap', featureHref: '/settings', featurePlan: 'growth' },
          { key: 'digital', label: 'Digital Presence', icon: '💻', score: digital,
            suggestion: 'AI Ministry Platform automates tasks you are still doing manually.',
            feature: 'AI Ministry Platform', featureHref: '/dashboard', featurePlan: 'starter' },
          { key: 'community', label: 'Community Building', icon: '🏘️', score: community,
            suggestion: 'My Church Community gives your members a private space to connect.',
            feature: 'My Church Community', featureHref: '/church-community', featurePlan: 'growth' },
          { key: 'outreach', label: 'Outreach', icon: '🚪', score: outreach,
            suggestion: 'Weekly Newsletter + Visitor Follow-up bring new faces through your doors.',
            feature: 'Visitor Follow-up', featureHref: '/visitor-followup', featurePlan: 'starter' },
        ];
        setDimensions(dims);
        setOverallScore(Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (!mounted) return null;

  const getScoreColor = (s: number) => s >= 71 ? '#22c55e' : s >= 41 ? '#f59e0b' : '#ef4444';
  const getScoreLabel = (s: number) => s >= 71 ? 'Strong' : s >= 41 ? 'Needs Improvement' : 'Critical';
  const planOrder: Record<string, number> = { free: 0, starter: 1, pro: 2, growth: 3 };
  const canAccess = (fp: string) => (planOrder[plan] || 0) >= (planOrder[fp] || 0);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Analyzing your ministry...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>🏥 Ministry Health Report</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{churchName ? `${churchName} — ` : ''}Personalized recommendations to strengthen your ministry</p>
      </div>

      {/* Overall Score */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px', padding: '32px' }}>
        <div style={{ fontSize: '64px', fontWeight: 'bold', color: getScoreColor(overallScore), marginBottom: '8px' }}>{overallScore}</div>
        <div style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Overall Ministry Health Score</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div><span style={{ color: '#22c55e', fontWeight: 'bold' }}>71-100</span> Strong</div>
          <div><span style={{ color: '#f59e0b', fontWeight: 'bold' }}>41-70</span> Needs Improvement</div>
          <div><span style={{ color: '#ef4444', fontWeight: 'bold' }}>0-40</span> Critical</div>
        </div>
      </div>

      {/* Dimension Cards */}
      <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
        {dimensions.map(dim => (
          <div key={dim.key} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{dim.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{dim.label}</div>
                  <div style={{ fontSize: '13px', color: getScoreColor(dim.score), fontWeight: 600 }}>{getScoreLabel(dim.score)}</div>
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: getScoreColor(dim.score) }}>{dim.score}</div>
            </div>
            {/* Score Bar */}
            <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '12px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ background: getScoreColor(dim.score), height: '100%', borderRadius: '8px', width: `${dim.score}%`, transition: 'width 1s ease' }}></div>
            </div>
            {/* Suggestion */}
            <div style={{ background: dim.score < 60 ? '#fef3c7' : '#f0fdf4', border: `1px solid ${dim.score < 60 ? '#f59e0b' : '#22c55e'}`, borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: dim.score < 60 ? '#92400e' : '#166534' }}>{dim.suggestion}</span>
              {canAccess(dim.featurePlan) ? (
                <Link href={dim.featureHref} style={{ background: '#1e3a5f', color: 'white', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Try It →</Link>
              ) : (
                <Link href="/settings" style={{ background: '#6b7280', color: 'white', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>🔒 Upgrade</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      {plan === 'free' && (
        <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', color: 'white', padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>Unlock the Full Power of Your Ministry</h2>
          <p style={{ opacity: 0.9, marginBottom: '20px' }}>Upgrade to access all the tools your church needs to thrive.</p>
          <Link href="/settings" style={{ background: 'white', color: '#1e3a5f', padding: '12px 32px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px' }}>Upgrade Now →</Link>
        </div>
      )}
    </div>
  );
}

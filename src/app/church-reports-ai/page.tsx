'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

type ReportType = 'weekly' | 'monthly' | 'annual';

interface ScoreBreakdown {
  communityEngagement: number;
  prayerLife: number;
  visitorFollowUp: number;
  devotionalEngagement: number;
  financialHealth: number;
  activityPlanning: number;
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface ChurchReport {
  healthScore: number;
  scoreBreakdown: ScoreBreakdown;
  congregationActivity: { trend: string; summary: string };
  prayerTrends: { trend: string; summary: string };
  visitorFollowUp: { status: string; summary: string };
  devotionalEngagement: { trend: string; summary: string };
  financialSummary: { health: string; summary: string };
  recommendations: Recommendation[];
}

const TREND_ICON: Record<string, string> = {
  increasing: '📈',
  stable: '➡️',
  declining: '📉',
};

const STATUS_COLORS: Record<string, string> = {
  strong: '#22c55e',
  needs_attention: '#f59e0b',
  critical: '#ef4444',
  stable: '#3b82f6',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export default function ChurchReportsAIPage() {
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState('free');
  const [userId, setUserId] = useState('');
  const [churchName, setChurchName] = useState('');
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [report, setReport] = useState<ChurchReport | null>(null);
  const [periodLabel, setPeriodLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function init() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        setUserId(session.user.id);
        const r = await fetch('/api/subscription?userId=' + session.user.id);
        const d = await r.json();
        if (d.plan) setPlan(d.plan);
        // Fetch church name
        const { data: profile } = await supabase.from('profiles').select('church_name').eq('id', session.user.id).single();
        if (profile?.church_name) setChurchName(profile.church_name);
      } catch (e) {}
    }
    init();
  }, [router]);

  // Auto-create table on first visit
  useEffect(() => {
    if (userId && (plan === 'pro' || plan === 'growth')) {
      fetch('/api/migrate/create-ai-reports-table').catch(() => {});
    }
  }, [userId, plan]);

  if (!mounted) return null;

  // Plan gate
  if (plan === 'free' || plan === 'starter') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>AI Church Reports</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              This feature requires the <strong style={{ color: '#1e3a5f' }}>Pro</strong> plan or higher.
            </p>
            <Link href="/settings" style={{ display: 'inline-block', background: '#1e3a5f', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
              Upgrade Now
            </Link>
            <div style={{ marginTop: '16px' }}>
              <Link href="/dashboard" style={{ color: '#666', fontSize: '14px' }}>← Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function generateReport() {
    if (!userId) return;
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await fetch('/api/generate/church-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: userId, reportType }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
        setPeriodLabel(data.period?.label || '');
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  }

  function handlePrint() {
    window.print();
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f' }}>🤖 AI Church Reports</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
            {churchName ? churchName + ' — ' : ''}AI-powered health insights for your ministry
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/church-reports" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1e3a5f', color: '#1e3a5f', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
            📈 Financial Reports
          </Link>
          <button onClick={handlePrint} disabled={!report} style={{ padding: '10px 20px', background: report ? '#1e3a5f' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: report ? 'pointer' : 'not-allowed', fontSize: '14px' }}>
            🖨️ Print / PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector + Generate Button */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
          {(['weekly', 'monthly', 'annual'] as ReportType[]).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              style={{
                padding: '8px 20px',
                border: 'none',
                background: reportType === type ? '#1e3a5f' : 'transparent',
                color: reportType === type ? 'white' : '#333',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          style={{
            padding: '10px 28px',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(30,58,95,0.3)',
          }}
        >
          {loading ? '⏳ Generating...' : '🤖 Generate AI Report'}
        </button>
        {plan === 'pro' && (
          <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
            Pro: 3 reports/month
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', color: '#ef4444', fontSize: '14px', marginBottom: '20px' }}>
          {error}
          {error.includes('Upgrade') && (
            <Link href="/settings" style={{ marginLeft: '12px', fontWeight: '600', color: '#1e3a5f', textDecoration: 'underline' }}>Upgrade Now</Link>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>🤖</div>
          <h3 style={{ fontSize: '20px', color: '#1e3a5f', marginBottom: '8px' }}>Analyzing Your Church Data...</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Our AI is reviewing community activity, prayer trends, visitor follow-up, devotionals, and finances.</p>
          <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }' }} />
        </div>
      )}

      {/* Report Display */}
      {report && !loading && (
        <div>
          {/* Period Label */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ background: '#eff6ff', color: '#1e40af', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
              📅 {periodLabel} — {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </span>
          </div>

          {/* Health Score Card */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', borderRadius: '16px', padding: '32px', color: 'white', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', fontSize: '120px', opacity: 0.08 }}>🏥</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>Overall Church Health Score</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '56px', fontWeight: 'bold' }}>{report.healthScore}</span>
                  <span style={{ fontSize: '20px', opacity: 0.7 }}>/100</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '600', color: getScoreColor(report.healthScore) }}>
                  {getScoreLabel(report.healthScore)}
                </div>
              </div>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '6px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                <svg width="120" height="120" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={getScoreColor(report.healthScore)} strokeWidth="6" strokeDasharray={report.healthScore * 3.14 + ' ' + 314} strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: '28px', fontWeight: 'bold', position: 'relative' }}>{report.healthScore}</span>
              </div>
            </div>
          </div>

          {/* Score Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { key: 'communityEngagement', label: 'Community', icon: '⛪' },
              { key: 'prayerLife', label: 'Prayer Life', icon: '🙏' },
              { key: 'visitorFollowUp', label: 'Visitors', icon: '👋' },
              { key: 'devotionalEngagement', label: 'Devotionals', icon: '📖' },
              { key: 'financialHealth', label: 'Finances', icon: '💰' },
              { key: 'activityPlanning', label: 'Activities', icon: '🎯' },
            ].map(({ key, label, icon }) => {
              const score = report.scoreBreakdown[key as keyof ScoreBreakdown] || 0;
              return (
                <div key={key} className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: getScoreColor(score) }}>{score}</div>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: score + '%', background: getScoreColor(score), borderRadius: '2px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Congregation Activity */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>⛪</span>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', margin: 0 }}>Congregation Activity</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>{TREND_ICON[report.congregationActivity.trend] || '➡️'}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: STATUS_COLORS[report.congregationActivity.trend] || '#666', textTransform: 'capitalize' }}>
                  {report.congregationActivity.trend}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{report.congregationActivity.summary}</p>
            </div>

            {/* Prayer Trends */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>🙏</span>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', margin: 0 }}>Prayer Trends</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>{TREND_ICON[report.prayerTrends.trend] || '➡️'}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: STATUS_COLORS[report.prayerTrends.trend] || '#666', textTransform: 'capitalize' }}>
                  {report.prayerTrends.trend}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{report.prayerTrends.summary}</p>
            </div>

            {/* Visitor Follow-Up */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>👋</span>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', margin: 0 }}>Visitor Follow-Up</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS[report.visitorFollowUp.status] || '#666', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: STATUS_COLORS[report.visitorFollowUp.status] || '#666', textTransform: 'capitalize' }}>
                  {report.visitorFollowUp.status.replace('_', ' ')}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{report.visitorFollowUp.summary}</p>
            </div>

            {/* Devotional Engagement */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📖</span>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', margin: 0 }}>Devotional Engagement</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>{TREND_ICON[report.devotionalEngagement.trend] || '➡️'}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: STATUS_COLORS[report.devotionalEngagement.trend] || '#666', textTransform: 'capitalize' }}>
                  {report.devotionalEngagement.trend}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{report.devotionalEngagement.summary}</p>
            </div>

            {/* Financial Summary */}
            <div className="card" style={{ padding: '20px', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>💰</span>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f', margin: 0 }}>Financial Summary</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS[report.financialSummary.health] || '#666', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: STATUS_COLORS[report.financialSummary.health] || '#666', textTransform: 'capitalize' }}>
                  {report.financialSummary.health.replace('_', ' ')}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{report.financialSummary.summary}</p>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', margin: 0 }}>AI Recommendations</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.recommendations.map((rec, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', borderLeft: '4px solid ' + PRIORITY_COLORS[rec.priority] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e3a5f' }}>{i + 1}. {rec.title}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: PRIORITY_COLORS[rec.priority], background: PRIORITY_COLORS[rec.priority] + '15', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {rec.priority}
                    </span>
                  </div>
                  <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '16px', color: '#999', fontSize: '12px' }}>
            Generated by ShepherdAI • {new Date().toLocaleDateString()} • {periodLabel}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>AI Church Health Report</h3>
          <p style={{ color: '#666', fontSize: '15px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Select a report type and click Generate to get an AI-powered analysis of your church&apos;s health — covering community engagement, prayer life, visitor follow-up, devotionals, finances, and more.
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏥</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Health Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>📈</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Trend Analysis</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>💡</div>
              <div style={{ fontSize: '13px', color: '#666' }}>AI Recommendations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

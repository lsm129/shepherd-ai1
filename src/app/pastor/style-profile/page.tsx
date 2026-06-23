'use client';

import { useState, useEffect } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import Link from 'next/link';

function getSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseAnonKey);
}

interface StyleProfile {
  styleData: {
    preferred_greetings: string[];
    avoided_phrases: string[];
    scripture_preferences: string[];
    tone_adjectives: string[];
    signoff_style: string;
    editing_patterns: {
      total_edits?: number;
      tools_edited?: Record<string, number>;
      recent_insights?: string[];
    };
    preaching_style: string;
    editing_tendency: string;
  };
  stats: {
    totalLearned: number;
    generationsAnalyzed: number;
    totalGenerations: number;
    lastUpdated: string;
    editCount: number;
    approvedCount: number;
    confidence: number;
    mostUsedTool: string;
    toolUsage: Record<string, number>;
  };
  highlights: {
    preachingStyle: string;
    preferredGreeting: string;
    goToScripture: string;
    toneSummary: string;
    signoffStyle: string;
    avoidedPhrases: string[];
    recentInsights: string[];
    editingTendency: string;
    switchCostMsg: string;
  };
  habits: {
    writing_style: string;
    preferred_phrases: string[];
    tone_preference: string;
    approved_count: number;
    edit_count: number;
  };
}

export default function StyleProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'voice' | 'insights'>('overview');

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    (async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/login';
          return;
        }
        setUserId(session.user.id);

        const res = await fetch('/api/ai/style-profile?userId=' + session.user.id);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (e) {
        console.error('Style profile load error:', e);
      } finally {
        setLoading(false);
      }
    })();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  const totalLearned = profile?.stats?.totalLearned || 0;
  const confidence = profile?.stats?.confidence || 0;
  const highlights = profile?.highlights;
  const stats = profile?.stats;
  const styleData = profile?.styleData;
  const habits = profile?.habits;

  return (
    <div style={{ padding: isMobile ? '16px' : '0', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
        <Link href="/dashboard" style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          ← Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
              🧠 AI Style Profile
            </h1>
            <p style={{ color: '#64748b', fontSize: isMobile ? '14px' : '16px' }}>
              See what your AI has learned about your preaching and writing style.
            </p>
          </div>
          {/* Confidence Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="72" height="72" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="32" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="36" cy="36" r="32" fill="none" stroke={confidence >= 60 ? '#22c55e' : confidence >= 30 ? '#f59e0b' : '#94a3b8'} strokeWidth="3" strokeDasharray={`${confidence * 2.01} 201`} strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: '18px', fontWeight: '800', position: 'relative', color: '#1e3a5f' }}>{confidence}%</span>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>CONFIDENCE</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧠</div>
          <p>Loading your style profile...</p>
        </div>
      ) : !profile || totalLearned === 0 ? (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🌱</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
            Your AI is still getting to know you
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            Generate and approve content to teach your AI your unique style. Every approval helps it learn your voice, tone, and preferences.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/sermon-social" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 24px' }}>
              📱 Create Social Content
            </Link>
            <Link href="/daily-devotional" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 24px' }}>
              📖 Write a Devotional
            </Link>
          </div>
          {stats && stats.totalGenerations > 0 && (
            <p style={{ marginTop: '16px', fontSize: '13px', color: '#94a3b8' }}>
              You have generated {stats.totalGenerations} pieces of content. Approve some to start teaching your AI!
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Stats Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
            borderRadius: '16px', padding: isMobile ? '20px' : '24px',
            marginBottom: '24px', color: 'white', display: 'flex',
            justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalLearned}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Things Learned</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>{stats?.generationsAnalyzed || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Content Analyzed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>{stats?.approvedCount || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Approved</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>{stats?.editCount || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Edits Made</div>
            </div>
          </div>

          {/* Switch Cost Message */}
          {highlights?.switchCostMsg && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
              padding: '16px 20px', marginBottom: '24px', display: 'flex',
              alignItems: 'center', gap: '12px',
            }}>
              <span style={{ fontSize: '24px' }}>✨</span>
              <div>
                <div style={{ fontWeight: '700', color: '#15803d', fontSize: '14px' }}>
                  {highlights.switchCostMsg}
                </div>
                {stats?.lastUpdated && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
            {(['overview', 'voice', 'insights'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: '10px', border: 'none',
                  background: activeTab === tab ? 'white' : 'transparent',
                  color: activeTab === tab ? '#1e3a5f' : '#64748b',
                  fontWeight: activeTab === tab ? '700' : '500',
                  fontSize: '14px', cursor: 'pointer',
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab === 'overview' ? '📋 Overview' : tab === 'voice' ? '🎙️ Your Voice' : '💡 Insights'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {highlights?.preachingStyle && highlights.preachingStyle !== 'Still learning...' && (
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px' }}>🎯</span>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preaching Style</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#15803d' }}>{highlights.preachingStyle}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                    Your AI has detected your sermons tend to be {highlights.preachingStyle.toLowerCase()}. This shapes how it generates new content for you.
                  </p>
                </div>
              )}

              {highlights?.preferredGreeting && (
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>👋</span>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferred Greeting</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1d4ed8' }}>&ldquo;{highlights.preferredGreeting}&rdquo;</div>
                    </div>
                  </div>
                </div>
              )}

              {highlights?.goToScripture && (
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>📖</span>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Go-to Scripture</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#a16207' }}>{highlights.goToScripture}</div>
                    </div>
                  </div>
                </div>
              )}

              {highlights?.toneSummary && (
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>🎨</span>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tone</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#7e22ce' }}>{highlights.toneSummary}</div>
                    </div>
                  </div>
                </div>
              )}

              {highlights?.editingTendency && (
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>✏️</span>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Editing Tendency</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#0369a1' }}>Tends to {highlights.editingTendency}</div>
                    </div>
                  </div>
                </div>
              )}

              {highlights?.signoffStyle && (
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>✍️</span>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signoff Style</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f' }}>&ldquo;{highlights.signoffStyle.substring(0, 60)}&rdquo;</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {styleData?.preferred_greetings && styleData.preferred_greetings.length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '12px' }}>
                    👋 Preferred Greetings
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {styleData.preferred_greetings.map((g, i) => (
                      <span key={i} style={{
                        background: '#eff6ff', color: '#1d4ed8', borderRadius: '20px',
                        padding: '6px 14px', fontSize: '13px', fontWeight: '600',
                        border: '1px solid #bfdbfe',
                      }}>
                        &ldquo;{g}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {styleData?.avoided_phrases && styleData.avoided_phrases.length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '12px' }}>
                    🚫 Phrases You Avoid
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {styleData.avoided_phrases.map((p, i) => (
                      <span key={i} style={{
                        background: '#fef2f2', color: '#dc2626', borderRadius: '20px',
                        padding: '6px 14px', fontSize: '13px', fontWeight: '600',
                        border: '1px solid #fecaca', textDecoration: 'line-through',
                      }}>
                        {p}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', marginBottom: 0 }}>
                    Your AI avoids these phrases when generating content for you.
                  </p>
                </div>
              )}

              {styleData?.scripture_preferences && styleData.scripture_preferences.length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '12px' }}>
                    📖 Scripture Preferences
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {styleData.scripture_preferences.map((s, i) => (
                      <span key={i} style={{
                        background: '#fefce8', color: '#a16207', borderRadius: '20px',
                        padding: '6px 14px', fontSize: '13px', fontWeight: '600',
                        border: '1px solid #fde68a',
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {styleData?.tone_adjectives && styleData.tone_adjectives.length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '12px' }}>
                    🎨 Tone Adjectives
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {styleData.tone_adjectives.map((t, i) => (
                      <span key={i} style={{
                        background: '#faf5ff', color: '#7e22ce', borderRadius: '20px',
                        padding: '6px 14px', fontSize: '13px', fontWeight: '600',
                        border: '1px solid #e9d5ff',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {habits?.preferred_phrases && habits.preferred_phrases.length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '12px' }}>
                    💬 Commonly Used Phrases
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {habits.preferred_phrases.map((p, i) => (
                      <span key={i} style={{
                        background: '#f0fdf4', color: '#15803d', borderRadius: '20px',
                        padding: '6px 14px', fontSize: '13px', fontWeight: '600',
                        border: '1px solid #bbf7d0',
                      }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {habits?.writing_style && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' }}>
                    ✍️ Writing Style
                  </h3>
                  <p style={{ color: '#475569', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                    {habits.writing_style}
                  </p>
                </div>
              )}

              {(!styleData?.preferred_greetings?.length) &&
               (!styleData?.avoided_phrases?.length) &&
               (!styleData?.scripture_preferences?.length) &&
               (!styleData?.tone_adjectives?.length) &&
               (!habits?.preferred_phrases?.length) && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎙️</div>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>
                    No detailed voice data yet. Keep approving and editing content to teach your AI about your preferred voice and phrasing.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {styleData?.editing_patterns?.recent_insights && styleData.editing_patterns.recent_insights.length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '16px' }}>
                    💡 What Your AI Has Learned
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {styleData.editing_patterns.recent_insights.map((insight, i) => (
                      <div key={i} style={{
                        background: '#f8fafc', borderRadius: '10px', padding: '14px 16px',
                        borderLeft: '3px solid #1e3a5f', fontSize: '14px', color: '#334155',
                        lineHeight: '1.6',
                      }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Insight #{styleData.editing_patterns!.recent_insights!.length - i}</span>
                        <div style={{ marginTop: '4px' }}>{insight}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats?.toolUsage && Object.keys(stats.toolUsage).length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '16px' }}>
                    📊 Content Usage Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(stats.toolUsage)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([tool, count]) => {
                        const maxCount = Math.max(...Object.values(stats.toolUsage));
                        const pct = maxCount > 0 ? ((count as number) / maxCount) * 100 : 0;
                        const toolLabels: Record<string, string> = {
                          sermon_social: '📱 Sermon → Social',
                          devotional: '📖 Devotional',
                          newsletter: '📰 Newsletter',
                          announcement: '📢 Announcement',
                          visitor_followup: '📧 Visitor Follow-up',
                          prayer_response: '🙏 Prayer Response',
                        };
                        return (
                          <div key={tool}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                                {toolLabels[tool] || tool}
                              </span>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>{count as number}x</span>
                            </div>
                            <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px' }}>
                              <div style={{ background: '#1e3a5f', borderRadius: '4px', height: '6px', width: `${pct}%`, transition: 'width 0.5s' }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {styleData?.editing_patterns?.tools_edited && Object.keys(styleData.editing_patterns.tools_edited).length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '16px' }}>
                    ✏️ Where You Edit Most
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(styleData.editing_patterns.tools_edited)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([tool, count]) => (
                        <span key={tool} style={{
                          background: '#fef3c7', color: '#92400e', borderRadius: '20px',
                          padding: '6px 14px', fontSize: '13px', fontWeight: '600',
                          border: '1px solid #fde68a',
                        }}>
                          {tool}: {count as number} edits
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {(!styleData?.editing_patterns?.recent_insights || styleData.editing_patterns.recent_insights.length === 0) &&
               (!stats?.toolUsage || Object.keys(stats.toolUsage).length === 0) && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>
                    No detailed insights yet. Keep generating and approving content — your AI will learn more with each interaction.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Summary */}
          <div style={{
            marginTop: '32px', padding: '20px', background: '#f8fafc',
            borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f', marginBottom: '4px' }}>
              🧠 AI has learned {totalLearned} things about your style
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Every time you approve or edit content, your AI gets better at matching your voice.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { usePlan, canAccess, LockedFeature } from '@/lib/plan-gate';

function getSupabase() {
  const url = supabaseUrl;
  const key = supabaseAnonKey;
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

const ACTIVITY_TYPES = [
  { value: 'fellowship', label: 'Fellowship', icon: '🤝' },
  { value: 'outreach', label: 'Outreach', icon: '🕊️' },
  { value: 'holiday', label: 'Holiday', icon: '🎄' },
  { value: 'retreat', label: 'Retreat', icon: '🏔️' },
  { value: 'vbs', label: 'VBS', icon: '🎨' },
  { value: 'youth', label: 'Youth Event', icon: '🎸' },
  { value: 'community_service', label: 'Community Service', icon: '❤️' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const AUDIENCE_OPTIONS = [
  { value: 'children', label: 'Children' },
  { value: 'youth', label: 'Youth' },
  { value: 'adults', label: 'Adults' },
  { value: 'all_ages', label: 'All Ages' },
];

const BUDGET_OPTIONS = [
  { value: 'under_100', label: 'Under $100' },
  { value: '100_500', label: '$100 - $500' },
  { value: '500_1000', label: '$500 - $1,000' },
  { value: '1000_5000', label: '$1,000 - $5,000' },
  { value: '5000_plus', label: '$5,000+' },
  { value: 'no_budget', label: 'No Budget' },
];

interface ActivityPlan {
  overview: {
    theme: string;
    scripture_focus: string;
    goals: string[];
    duration: string;
  };
  timeline: {
    preparation: Array<{ weeks_before: number; tasks: string[] }>;
    event_day: Array<{ time: string; activity: string; duration: string; lead: string }>;
    follow_up: Array<{ days_after: number; tasks: string[] }>;
  };
  budget: {
    total_estimated: string;
    categories: Array<{ name: string; amount: string; items: string[] }>;
  };
  team: {
    roles: Array<{ role: string; responsibilities: string[]; ideal_candidates: string }>;
  };
  supplies: {
    categories: Array<{ category: string; items: Array<{ name: string; quantity: string; estimated_cost: string; notes: string }> }>;
  };
  promotion: {
    strategy: string;
    channels: Array<{ channel: string; content: string; timing: string }>;
    social_media_posts: Array<{ platform: string; content: string }>;
  };
  follow_up_plan: {
    immediate: string[];
    one_week: string[];
    one_month: string[];
    connection_strategy: string;
  };
}

export default function ActivityPlannerPage() {
  const { plan, loading: planLoading } = usePlan();
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);

  // Form state
  const [activityType, setActivityType] = useState('');
  const [activityName, setActivityName] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [denomination, setDenomination] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');

  // Generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<ActivityPlan | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number | string; used: number; limit: number | string; plan: string } | null>(null);

  // UI state
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedSection, setCopiedSection] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    (async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          setEmailVerified(!!session.user.email_confirmed_at);
          // Load denomination from profile
          const { data: csData } = await supabase.from('church_settings').select('denomination, church_name').eq('user_id', session.user.id).single();
          if (csData?.denomination) setDenomination(csData.denomination);
        }
      } catch {}
    })();
  }, []);

  if (!planLoading && !canAccess(plan, 'starter')) return <LockedFeature minPlan="starter" title="Activity Planner" />;

  if (!mounted) return null;

  function toggleAudience(value: string) {
    setTargetAudience(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!emailVerified) { setError('Please verify your email first.'); return; }
    if (!activityType) { setError('Please select an activity type.'); return; }
    if (!activityName.trim()) { setError('Please enter an activity name.'); return; }
    setLoading(true);
    setGeneratedPlan(null);

    try {
      const response = await fetch('/api/generate/activity-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({
          activityType,
          activityName,
          expectedAttendees,
          targetAudience,
          budgetRange,
          dateRange,
          denomination,
          specialRequirements,
          userId,
        }),
      });
      const data = await response.json();
      if (response.status === 429) { throw new Error('Monthly activity plan generation limit reached! Upgrade your plan for more generations.'); }
      if (!response.ok) { throw new Error(data.error || 'Failed to generate activity plan'); }
      setGeneratedPlan(data.plan);
      if (data.quota) setQuotaInfo(data.quota);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setGeneratedPlan(null);
    setActivityType('');
    setActivityName('');
    setExpectedAttendees('');
    setTargetAudience([]);
    setBudgetRange('');
    setDateRange('');
    setSpecialRequirements('');
    setError('');
    setActiveSection('overview');
  }

  function copySection(key: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(''), 2000);
  }

  function copyFullPlan() {
    if (!generatedPlan) return;
    const text = JSON.stringify(generatedPlan, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedSection('full');
    setTimeout(() => setCopiedSection(''), 2000);
  }

  // Section navigation for the generated plan
  const sections = [
    { key: 'overview', label: '📋 Overview', icon: '' },
    { key: 'timeline', label: '⏰ Timeline', icon: '' },
    { key: 'budget', label: '💰 Budget', icon: '' },
    { key: 'team', label: '👥 Team', icon: '' },
    { key: 'supplies', label: '📦 Supplies', icon: '' },
    { key: 'promotion', label: '📢 Promotion', icon: '' },
    { key: 'followup', label: '🔄 Follow-up', icon: '' },
  ];

  // --- Render: Overview ---
  function renderOverview() {
    if (!generatedPlan?.overview) return null;
    const o = generatedPlan.overview;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', borderRadius: '12px', padding: '24px', color: 'white' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{o.theme}</div>
          <div style={{ opacity: 0.9, fontSize: '14px', marginBottom: '12px' }}>📖 Scripture Focus: {o.scripture_focus}</div>
          <div style={{ opacity: 0.85, fontSize: '14px' }}>⏱️ Duration: {o.duration}</div>
        </div>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>Goals</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {o.goals?.map((g, i) => (
              <li key={i} style={{ padding: '10px 16px', background: i % 2 === 0 ? '#f8fafc' : 'white', borderRadius: '8px', marginBottom: '4px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span> {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // --- Render: Timeline ---
  function renderTimeline() {
    if (!generatedPlan?.timeline) return null;
    const t = generatedPlan.timeline;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Preparation */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a5f' }}>📅 Preparation Phase</h4>
          {t.preparation?.map((p, i) => (
            <div key={i} style={{ borderLeft: '3px solid #1e3a5f', paddingLeft: '16px', marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e3a5f', marginBottom: '6px' }}>{p.weeks_before} weeks before</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {p.tasks?.map((task, j) => (
                  <li key={j} style={{ fontSize: '13px', color: '#444', padding: '4px 0', display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#1e3a5f' }}>•</span> {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Event Day */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a5f' }}>🎪 Event Day Schedule</h4>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '80px 1fr 60px' : '100px 1fr 80px 120px', background: '#f1f5f9', padding: '10px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
              <div>Time</div><div>Activity</div><div>Duration</div>{!mobile && <div>Lead</div>}
            </div>
            {t.event_day?.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: mobile ? '80px 1fr 60px' : '100px 1fr 80px 120px', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', alignItems: 'center' }}>
                <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{e.time}</div>
                <div>{e.activity}</div>
                <div style={{ color: '#64748b' }}>{e.duration}</div>
                {!mobile && <div style={{ color: '#64748b' }}>{e.lead}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Timeline */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a5f' }}>📋 Post-Event Follow-up</h4>
          {t.follow_up?.map((f, i) => (
            <div key={i} style={{ borderLeft: '3px solid #22c55e', paddingLeft: '16px', marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#22c55e', marginBottom: '6px' }}>Day {f.days_after}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {f.tasks?.map((task, j) => (
                  <li key={j} style={{ fontSize: '13px', color: '#444', padding: '4px 0', display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#22c55e' }}>•</span> {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Render: Budget ---
  function renderBudget() {
    if (!generatedPlan?.budget) return null;
    const b = generatedPlan.budget;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#166534', marginBottom: '4px' }}>Total Estimated Budget</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#15803d' }}>{b.total_estimated}</div>
        </div>
        {b.categories?.map((cat, i) => (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', fontSize: '15px', color: '#1e3a5f' }}>{cat.name}</span>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#15803d' }}>{cat.amount}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cat.items?.map((item, j) => (
                <li key={j} style={{ fontSize: '13px', color: '#666', padding: '4px 0', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  // --- Render: Team ---
  function renderTeam() {
    if (!generatedPlan?.team) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
        {generatedPlan.team.roles?.map((r, i) => (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ background: '#1e3a5f', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👤</span>
              <span style={{ fontWeight: '600', fontSize: '15px', color: '#1e3a5f' }}>{r.role}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '8px' }}>
              {r.responsibilities?.map((resp, j) => (
                <li key={j} style={{ fontSize: '13px', color: '#444', padding: '3px 0', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#1e3a5f' }}>•</span> {resp}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
              💡 <strong>Ideal:</strong> {r.ideal_candidates}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- Render: Supplies ---
  function renderSupplies() {
    if (!generatedPlan?.supplies) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {generatedPlan.supplies.categories?.map((cat, i) => (
          <div key={i}>
            <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>{cat.category}</h4>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 60px 70px' : '2fr 80px 100px 2fr', background: '#f1f5f9', padding: '10px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                <div>Item</div><div>Qty</div><div>Cost</div>{!mobile && <div>Notes</div>}
              </div>
              {cat.items?.map((item, j) => (
                <div key={j} style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 60px 70px' : '2fr 80px 100px 2fr', padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', alignItems: 'center' }}>
                  <div style={{ fontWeight: '500' }}>{item.name}</div>
                  <div style={{ color: '#64748b' }}>{item.quantity}</div>
                  <div style={{ color: '#15803d', fontWeight: '500' }}>{item.estimated_cost}</div>
                  {!mobile && <div style={{ color: '#64748b' }}>{item.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- Render: Promotion ---
  function renderPromotion() {
    if (!generatedPlan?.promotion) return null;
    const p = generatedPlan.promotion;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#92400e', marginBottom: '6px' }}>📢 Promotion Strategy</div>
          <div style={{ fontSize: '14px', color: '#78350f' }}>{p.strategy}</div>
        </div>

        {/* Promotion Channels */}
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>Channels</h4>
          {p.channels?.map((ch, i) => (
            <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e3a5f' }}>{ch.channel}</span>
                <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{ch.timing}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap', ...noSelectStyle }} {...noSelectEvents}>{ch.content}</div>
              <button onClick={() => copySection(`channel-${i}`, ch.content)} style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', cursor: 'pointer', color: '#64748b' }}>
                {copiedSection === `channel-${i}` ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          ))}
        </div>

        {/* Social Media Posts */}
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>📱 Ready-to-Post Social Media</h4>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>
            {p.social_media_posts?.map((smp, i) => {
              const platformColors: Record<string, string> = { Facebook: '#1877F2', Instagram: '#E4405F', 'Twitter/X': '#000000' };
              const platformIcons: Record<string, string> = { Facebook: '📘', Instagram: '📸', 'Twitter/X': '🐦' };
              return (
                <div key={i} style={{ border: `2px solid ${platformColors[smp.platform] || '#e2e8f0'}20`, borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span>{platformIcons[smp.platform] || '📱'}</span>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: platformColors[smp.platform] || '#333' }}>{smp.platform}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap', minHeight: '80px', background: '#f8fafc', padding: '12px', borderRadius: '8px', ...noSelectStyle }} {...noSelectEvents}>
                    {smp.content}
                  </div>
                  <button onClick={() => copySection(`social-${i}`, smp.content)} style={{ marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', cursor: 'pointer', color: '#1e3a5f', fontWeight: '600' }}>
                    {copiedSection === `social-${i}` ? '✓ Copied!' : '📋 Copy Post'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Follow-up ---
  function renderFollowUp() {
    if (!generatedPlan?.follow_up_plan) return null;
    const f = generatedPlan.follow_up_plan;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e3a5f', marginBottom: '10px' }}>⚡ Immediate (Day 1)</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {f.immediate?.map((item, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#444', padding: '4px 0', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#1e3a5f' }}>•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#f59e0b', marginBottom: '10px' }}>📅 One Week Later</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {f.one_week?.map((item, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#444', padding: '4px 0', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#f59e0b' }}>•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#22c55e', marginBottom: '10px' }}>🌱 One Month Later</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {f.one_month?.map((item, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#444', padding: '4px 0', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#22c55e' }}>•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e40af', marginBottom: '8px' }}>🔗 Connection Strategy</div>
          <div style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: '1.6' }}>{f.connection_strategy}</div>
        </div>
      </div>
    );
  }

  function renderSection() {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'timeline': return renderTimeline();
      case 'budget': return renderBudget();
      case 'team': return renderTeam();
      case 'supplies': return renderSupplies();
      case 'promotion': return renderPromotion();
      case 'followup': return renderFollowUp();
      default: return renderOverview();
    }
  }

  return (
    <div style={{ padding: mobile ? '16px' : '0' }}>
      <div style={{ marginBottom: mobile ? '20px' : '32px' }}>
        <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
          Activity Planner
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: mobile ? '14px' : '16px' }}>
          Generate comprehensive plans for any church activity — timelines, budgets, team roles, and more.
        </p>
      </div>

      {/* Quota indicator */}
      {quotaInfo && !generatedPlan && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#64748b' }}>
          📊 Activity Plan Quota: {quotaInfo.used} / {quotaInfo.limit} used this month ({quotaInfo.remaining} remaining)
        </div>
      )}

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {!generatedPlan ? (
        <div className="card" style={{ maxWidth: '800px' }}>
          <form onSubmit={handleGenerate}>
            {/* Activity Type Selection */}
            <div className="form-group">
              <label className="form-label">Activity Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {ACTIVITY_TYPES.map(at => (
                  <button
                    key={at.value}
                    type="button"
                    onClick={() => setActivityType(at.value)}
                    style={{
                      padding: '12px 8px', borderRadius: '10px', border: activityType === at.value ? '2px solid #1e3a5f' : '1px solid #e2e8f0',
                      background: activityType === at.value ? '#f0f4ff' : 'white', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{at.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: activityType === at.value ? '600' : '400', color: activityType === at.value ? '#1e3a5f' : '#666' }}>{at.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Name */}
            <div className="form-group">
              <label className="form-label">Activity Name *</label>
              <input
                type="text"
                className="input"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="e.g., Summer Family Fun Day, Easter Outreach..."
                required
              />
            </div>

            {/* Expected Attendees & Date Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Expected Attendees</label>
                <input
                  type="text"
                  className="input"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(e.target.value)}
                  placeholder="e.g., 50-100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date / Time Period</label>
                <input
                  type="text"
                  className="input"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="e.g., June 15, 2025 / Saturday 9am-3pm"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {AUDIENCE_OPTIONS.map(ao => (
                  <button
                    key={ao.value}
                    type="button"
                    onClick={() => toggleAudience(ao.value)}
                    style={{
                      padding: '8px 16px', borderRadius: '20px', border: targetAudience.includes(ao.value) ? '2px solid #1e3a5f' : '1px solid #e2e8f0',
                      background: targetAudience.includes(ao.value) ? '#1e3a5f' : 'white', color: targetAudience.includes(ao.value) ? 'white' : '#666',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s',
                    }}
                  >
                    {ao.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget & Denomination */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Budget Range</label>
                <select
                  className="input"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  style={{ padding: '10px 12px' }}
                >
                  <option value="">Select budget range</option>
                  {BUDGET_OPTIONS.map(bo => (
                    <option key={bo.value} value={bo.value}>{bo.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Church Denomination</label>
                <input
                  type="text"
                  className="input"
                  value={denomination}
                  onChange={(e) => setDenomination(e.target.value)}
                  placeholder="Auto-filled from your profile"
                />
              </div>
            </div>

            {/* Special Requirements */}
            <div className="form-group">
              <label className="form-label">Special Requirements</label>
              <textarea
                className="input textarea"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Any special needs? e.g., wheelchair accessible, bilingual program, outdoor venue, dietary restrictions..."
                style={{ minHeight: '80px' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading || !activityType || !activityName.trim()}>
              {loading ? 'Generating your activity plan...' : '🚀 Generate Activity Plan'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          {/* Plan Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: mobile ? '18px' : '22px', fontWeight: 'bold', color: '#1e3a5f' }}>
                {generatedPlan.overview?.theme || activityName}
              </h2>
              {quotaInfo && (
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Quota: {quotaInfo.used}/{quotaInfo.limit} used
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyFullPlan} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', cursor: 'pointer', color: '#1e3a5f', fontWeight: '600' }}>
                {copiedSection === 'full' ? '✓ Copied!' : '📋 Copy Full Plan'}
              </button>
              <button onClick={handleReset} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', cursor: 'pointer', color: '#666' }}>
                ✨ New Plan
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {sections.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                style={{
                  padding: '10px 14px', borderRadius: '8px', border: activeSection === s.key ? '2px solid #1e3a5f' : '1px solid #e2e8f0',
                  background: activeSection === s.key ? '#f0f4ff' : 'white', cursor: 'pointer',
                  fontSize: '13px', fontWeight: activeSection === s.key ? '600' : '400',
                  color: activeSection === s.key ? '#1e3a5f' : '#666', whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="card" style={{ padding: '24px' }}>
            {renderSection()}
          </div>
        </div>
      )}
    </div>
  );
}

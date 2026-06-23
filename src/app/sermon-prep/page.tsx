'use client';

import { useState, useEffect } from 'react';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

function getSupabase() {
  const url = supabaseUrl;
  const key = supabaseAnonKey;
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

interface SermonData {
  title: string;
  mainPoint: string;
  scriptureAnalysis: {
    context: string;
    wordStudies: { word: string; transliteration: string; meaning: string; significance: string }[];
    crossReferences: { reference: string; connection: string }[];
  };
  outline: { point: string; subpoints: string[]; transition: string }[];
  illustrations: { type: string; title: string; story: string; connection: string }[];
  applications: { audience: string; action: string; scriptureTie: string }[];
  prayerFocus: { opening: string; pastoral: string };
}

const TRADITIONS = [
  { value: 'non-denominational', label: 'Non-Denominational' },
  { value: 'baptist', label: 'Baptist' },
  { value: 'methodist', label: 'Methodist' },
  { value: 'presbyterian', label: 'Presbyterian' },
  { value: 'lutheran', label: 'Lutheran' },
  { value: 'anglican', label: 'Anglican/Episcopal' },
  { value: 'pentecostal', label: 'Pentecostal' },
  { value: 'catholic', label: 'Roman Catholic' },
  { value: 'reformed', label: 'Reformed' },
  { value: 'nazarene', label: 'Nazarene' },
  { value: 'other', label: 'Other' },
];

const FOCUS_OPTIONS = [
  'General congregation',
  'Young adults',
  'New believers',
  'Church leaders',
  'Seniors',
  'Youth group',
  'Multi-generational',
];

export default function SermonPrepPage() {
  const [step, setStep] = useState<'form' | 'generating' | 'result'>('form');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [scripture, setScripture] = useState('');
  const [theme, setTheme] = useState('');
  const [tradition, setTradition] = useState('non-denominational');
  const [focus, setFocus] = useState('General congregation');

  const [sermon, setSermon] = useState<SermonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    analysis: true, outline: true, illustrations: true, applications: true, prayer: false,
  });

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    (async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setUserId(session.user.id);
      } catch {}
    })();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  function toggleSection(key: string) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!scripture && !theme) { setError('Please enter a scripture passage or sermon theme'); return; }
    setError(''); setLoading(true); setStep('generating');
    try {
      const response = await fetch('/api/sermon-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({ scripture, theme, tradition, focus, userId }),
      });
      const data = await response.json();
      if (response.status === 429) throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.');
      if (!response.ok) throw new Error(data.error || 'Failed to generate sermon preparation');
      if (data.sermon) { setSermon(data.sermon); setSaved(false); setStep('result'); }
      else { setError('AI generated no content. Please try again.'); setStep('form'); }
    } catch (err: any) { setError(err.message || 'Something went wrong'); setStep('form'); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!userId || !sermon) return;
    setSaving(true);
    try {
      const res = await fetch('/api/sermon-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', userId, planData: { title: sermon.title, scripture, theme, tradition, sermon_data: sermon } }),
      });
      if (res.ok) setSaved(true);
    } catch {} setSaving(false);
  }

  function handleStartOver() {
    setStep('form'); setSermon(null); setError(''); setSaved(false);
    setExpandedSections({ analysis: true, outline: true, illustrations: true, applications: true, prayer: false });
  }

  // ==================== FORM ====================
  if (step === 'form') {
    return (
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
            Sermon Preparation AI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
            From scripture to sermon in minutes — outlines, illustrations, applications, and prayer focus.
          </p>
        </div>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>{error}</div>
        )}
        <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div>
            <form onSubmit={handleGenerate} className="card" style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Scripture Passage</label>
                <input type="text" className="input" placeholder='e.g., "Philippians 4:6-9" or "Psalm 23"' value={scripture} onChange={(e) => setScripture(e.target.value)} />
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Enter the Bible passage for your sermon</div>
              </div>
              <div className="form-group">
                <label className="form-label">Sermon Theme <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(if no specific scripture)</span></label>
                <input type="text" className="input" placeholder='e.g., "Finding peace in anxiety"' value={theme} onChange={(e) => setTheme(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Church Tradition</label>
                  <select className="input" value={tradition} onChange={(e) => setTradition(e.target.value)}>
                    {TRADITIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Congregation Focus</label>
                  <select className="input" value={focus} onChange={(e) => setFocus(e.target.value)}>
                    {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                {loading ? '⏳ Generating...' : '✨ Generate Sermon Prep'}
              </button>
            </form>
          </div>
          <div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', color: 'white', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>📖 What You Get</h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px' }}>
                <li style={{ marginBottom: '8px' }}>✅ Scripture context & word studies</li>
                <li style={{ marginBottom: '8px' }}>✅ 3-4 point sermon outline</li>
                <li style={{ marginBottom: '8px' }}>✅ Modern & historical illustrations</li>
                <li style={{ marginBottom: '8px' }}>✅ Actionable applications</li>
                <li style={{ marginBottom: '8px' }}>✅ Prayer focus & suggestions</li>
                <li style={{ marginBottom: '8px' }}>✅ Cross-references for deeper study</li>
              </ul>
            </div>
            <div className="card" style={{ background: 'var(--surface)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>⏱️ Time Saved</h3>
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>8-12 hrs</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Traditional sermon prep</div>
                <div style={{ fontSize: '24px', margin: '8px 0', color: 'var(--success)' }}>↓</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--success)' }}>2-3 min</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>With ShepherdAI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== GENERATING ====================
  if (step === 'generating') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Preparing Your Sermon...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>AI is analyzing scripture, finding illustrations, and crafting your outline.</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>This usually takes 30-60 seconds</p>
      </div>
    );
  }

  // ==================== RESULT ====================
  if (step === 'result' && sermon) {
    return (
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
          <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>{sermon.title}</h1>
          <p style={{ color: 'var(--success)', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Main Point: {sermon.mainPoint}</p>
          {(scripture || theme) && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {scripture && <span style={{ marginRight: '16px' }}>📖 {scripture}</span>}
              {theme && <span>🎯 {theme}</span>}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {userId && <button onClick={handleSave} className="btn-primary" disabled={saving || saved}>{saved ? '✅ Saved!' : saving ? 'Saving...' : '💾 Save to My Sermons'}</button>}
          <button onClick={handleStartOver} className="btn-secondary">🔄 New Sermon Prep</button>
        </div>

        {/* Scripture Analysis */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection('analysis')}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>📖 Scripture Analysis</h3>
            <span style={{ fontSize: '20px' }}>{expandedSections.analysis ? '▼' : '▶'}</span>
          </div>
          {expandedSections.analysis && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Historical & Cultural Context</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{sermon.scriptureAnalysis?.context}</p>
              </div>
              {sermon.scriptureAnalysis?.wordStudies?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Key Word Studies</h4>
                  {sermon.scriptureAnalysis.wordStudies.map((ws, i) => (
                    <div key={i} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{ws.word} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>({ws.transliteration})</span></div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}><strong>Meaning:</strong> {ws.meaning}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}><strong>Significance:</strong> {ws.significance}</div>
                    </div>
                  ))}
                </div>
              )}
              {sermon.scriptureAnalysis?.crossReferences?.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Cross-References</h4>
                  {sermon.scriptureAnalysis.crossReferences.map((cr, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '14px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{cr.reference}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>— {cr.connection}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sermon Outline */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection('outline')}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>📋 Sermon Outline</h3>
            <span style={{ fontSize: '20px' }}>{expandedSections.outline ? '▼' : '▶'}</span>
          </div>
          {expandedSections.outline && (
            <div style={{ marginTop: '16px' }}>
              {sermon.outline?.map((pt, i) => (
                <div key={i} style={{ marginBottom: '20px', borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
                  <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Point {i + 1}: {pt.point}</div>
                  {pt.subpoints?.map((sp, j) => (
                    <div key={j} style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', paddingLeft: '12px' }}>• {sp}</div>
                  ))}
                  {pt.transition && <div style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '8px', fontStyle: 'italic' }}>→ {pt.transition}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Illustrations */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection('illustrations')}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>💡 Illustrations & Stories</h3>
            <span style={{ fontSize: '20px' }}>{expandedSections.illustrations ? '▼' : '▶'}</span>
          </div>
          {expandedSections.illustrations && (
            <div style={{ marginTop: '16px' }}>
              {sermon.illustrations?.map((il, i) => (
                <div key={i} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600' }}>{il.title}</span>
                    <span style={{
                      background: il.type === 'modern' ? '#dbeafe' : il.type === 'historical' ? '#fef3c7' : '#f3e8ff',
                      color: il.type === 'modern' ? '#1e40af' : il.type === 'historical' ? '#92400e' : '#6b21a8',
                      padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                    }}>{il.type}</span>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{il.story}</p>
                  <div style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '8px', fontStyle: 'italic' }}>Connection: {il.connection}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection('applications')}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>🎯 Application Points</h3>
            <span style={{ fontSize: '20px' }}>{expandedSections.applications ? '▼' : '▶'}</span>
          </div>
          {expandedSections.applications && (
            <div style={{ marginTop: '16px' }}>
              {sermon.applications?.map((ap, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>{ap.audience}</span>
                    </div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{ap.action}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>📖 {ap.scriptureTie}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prayer Focus */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection('prayer')}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>🙏 Prayer Focus</h3>
            <span style={{ fontSize: '20px' }}>{expandedSections.prayer ? '▼' : '▶'}</span>
          </div>
          {expandedSections.prayer && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '6px' }}>Opening Prayer</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{sermon.prayerFocus?.opening}</p>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '6px' }}>Pastoral Prayer</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{sermon.prayerFocus?.pastoral}</p>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {userId && <button onClick={handleSave} className="btn-primary" disabled={saving || saved}>{saved ? '✅ Saved!' : saving ? 'Saving...' : '💾 Save to My Sermons'}</button>}
          <button onClick={handleStartOver} className="btn-secondary">🔄 New Sermon Prep</button>
          <a href="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return null;
}

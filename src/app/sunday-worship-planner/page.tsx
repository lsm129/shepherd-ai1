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

const TRADITIONS = [
  { value: 'baptist', label: 'Baptist' },
  { value: 'methodist', label: 'Methodist' },
  { value: 'presbyterian', label: 'Presbyterian' },
  { value: 'lutheran', label: 'Lutheran' },
  { value: 'pentecostal', label: 'Pentecostal' },
  { value: 'non_denominational', label: 'Non-Denominational' },
  { value: 'anglican', label: 'Anglican/Episcopal' },
  { value: 'catholic', label: 'Catholic' },
  { value: 'other', label: 'Other' },
];

const SEASONAL_OPTIONS = [
  { value: 'ordinary', label: 'Ordinary Time' },
  { value: 'advent', label: 'Advent' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'lent', label: 'Lent' },
  { value: 'easter', label: 'Easter' },
  { value: 'pentecost', label: 'Pentecost' },
];

interface WorshipSegment {
  name: string;
  duration: number;
  leader: string;
  notes: string;
  scripture_ref?: string;
}

interface WorshipPlan {
  title: string;
  theme: string;
  total_duration: number;
  tradition: string;
  segments: WorshipSegment[];
  pastoral_notes: string;
  scripture_readings: string[];
  hymn_suggestions: string[];
  prayer_points: string[];
}

export default function SundayWorshipPlannerPage() {
  const { plan, loading: planLoading } = usePlan();
  const [mounted, setMounted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<WorshipPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('');

  const [formData, setFormData] = useState({
    theme: '',
    tradition: 'non_denominational',
    duration: 75,
    season: 'ordinary',
    sermonTopic: '',
    specialOccasion: '',
  });

  const [editedSegments, setEditedSegments] = useState<WorshipSegment[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (async () => {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUserId(session.user.id);
            // Load saved plans
            const adminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
            const admin = createClient(supabaseUrl, adminKey);
            const { data } = await admin.from('worship_plans').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(10);
            if (data) setSavedPlans(data);
          }
        } catch (e) {}
      })();
    }
  }, []);

  const handleGenerate = async () => {
    if (!formData.theme && !formData.sermonTopic) {
      setError('Please enter a theme or sermon topic');
      return;
    }
    setGenerating(true);
    setError('');
    setResult(null);
    setEditedSegments([]);

    try {
      const res = await fetch('/api/generate/worship-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.plan);
        setEditedSegments(data.plan.segments || []);
      }
    } catch (e: any) {
      setError(e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result || !userId) return;
    setSaving(true);
    try {
      const adminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
      const { createClient } = await import('@supabase/supabase-js');
      const admin = createClient(supabaseUrl, adminKey);
      const { error } = await admin.from('worship_plans').insert({
        user_id: userId,
        title: result.title,
        theme: result.theme,
        tradition: result.tradition,
        total_duration: result.total_duration,
        segments: editedSegments.length > 0 ? editedSegments : result.segments,
        pastoral_notes: result.pastoral_notes,
        scripture_readings: result.scripture_readings,
        hymn_suggestions: result.hymn_suggestions,
        prayer_points: result.prayer_points,
        is_template: false,
      });
      if (error) throw error;
      // Reload saved plans
      const { data } = await admin.from('worship_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
      if (data) setSavedPlans(data);
      alert('Worship plan saved!');
    } catch (e: any) {
      setError('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSegment = (idx: number, field: string, value: string | number) => {
    const updated = [...editedSegments];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditedSegments(updated);
  };

  if (!planLoading && !canAccess(plan, 'starter')) return <LockedFeature minPlan="starter" title="Sunday Worship Planner" />;

  if (!mounted) return null;

  return (
    <div style={{ ...noSelectStyle, ...noSelectEvents, minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>🕊️ Sunday Worship Planner</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>AI-powered worship service planning — from call to worship to benediction</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left: Form */}
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Service Details</h2>

              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
                Theme / Sermon Topic *
                <input type="text" value={formData.sermonTopic} onChange={e => setFormData({ ...formData, sermonTopic: e.target.value })}
                  placeholder="e.g., Walking by Faith, Grace Alone" style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </label>

              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
                Service Theme (optional)
                <input type="text" value={formData.theme} onChange={e => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="e.g., Harvest Thanksgiving, Youth Sunday" style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <label style={{ fontWeight: 500 }}>
                  Church Tradition
                  <select value={formData.tradition} onChange={e => setFormData({ ...formData, tradition: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}>
                    {TRADITIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </label>
                <label style={{ fontWeight: 500 }}>
                  Liturgical Season
                  <select value={formData.season} onChange={e => setFormData({ ...formData, season: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }}>
                    {SEASONAL_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </label>
              </div>

              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
                Total Service Duration (minutes)
                <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  min={30} max={180} style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </label>

              <label style={{ display: 'block', marginBottom: '16px', fontWeight: 500 }}>
                Special Occasion (optional)
                <input type="text" value={formData.specialOccasion} onChange={e => setFormData({ ...formData, specialOccasion: e.target.value })}
                  placeholder="e.g., Baptism, Communion, Baby Dedication" style={{ width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </label>

              <button onClick={handleGenerate} disabled={generating}
                style={{ width: '100%', padding: '12px', background: generating ? '#999' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer' }}>
                {generating ? '⏳ Generating...' : '✨ Generate Worship Plan'}
              </button>

              {error && <p style={{ color: '#dc2626', marginTop: '12px', fontSize: '14px' }}>{error}</p>}
            </div>

            {/* Saved Plans */}
            {savedPlans.length > 0 && (
              <div className="card" style={{ padding: '24px', marginTop: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>📋 Saved Plans</h2>
                {savedPlans.map((sp: any) => (
                  <div key={sp.id} style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onClick={() => { setResult(sp); setEditedSegments(sp.segments || []); }}>
                    <div style={{ fontWeight: 500 }}>{sp.title || sp.theme}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{sp.tradition} · {sp.total_duration} min · {new Date(sp.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Result */}
          <div>
            {result ? (
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{result.title}</h2>
                  <button onClick={handleSave} disabled={saving}
                    style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>
                </div>

                <p style={{ color: '#555', marginBottom: '4px' }}><strong>Theme:</strong> {result.theme}</p>
                <p style={{ color: '#555', marginBottom: '4px' }}><strong>Duration:</strong> {result.total_duration} minutes</p>
                <p style={{ color: '#555', marginBottom: '16px' }}><strong>Tradition:</strong> {result.tradition}</p>

                {/* Segments */}
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Service Flow</h3>
                {(editedSegments.length > 0 ? editedSegments : result.segments || []).map((seg: WorshipSegment, idx: number) => (
                  <div key={idx} style={{ background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <input type="text" value={seg.name} onChange={e => updateSegment(idx, 'name', e.target.value)}
                        style={{ fontWeight: 600, fontSize: '15px', border: 'none', background: 'transparent', flex: 1 }} />
                      <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 500 }}>{seg.duration} min</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '13px', color: '#666' }}>
                      <span>👤 {seg.leader}</span>
                      {seg.scripture_ref && <span>📖 {seg.scripture_ref}</span>}
                    </div>
                    <input type="text" value={seg.notes} onChange={e => updateSegment(idx, 'notes', e.target.value)}
                      style={{ width: '100%', fontSize: '13px', color: '#555', border: 'none', background: 'transparent', marginTop: '4px' }} />
                  </div>
                ))}

                {/* Scripture Readings */}
                {result.scripture_readings?.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>📖 Scripture Readings</h3>
                    <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                      {result.scripture_readings.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {/* Hymn Suggestions */}
                {result.hymn_suggestions?.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>🎵 Hymn & Song Suggestions</h3>
                    <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                      {result.hymn_suggestions.map((h: string, i: number) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}

                {/* Prayer Points */}
                {result.prayer_points?.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>🙏 Prayer Points</h3>
                    <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                      {result.prayer_points.map((p: string, i: number) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                {/* Pastoral Notes */}
                {result.pastoral_notes && (
                  <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>📝 Pastoral Notes</h3>
                    <p style={{ fontSize: '14px', color: '#555', whiteSpace: 'pre-wrap' }}>{result.pastoral_notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⛪</div>
                <p>Fill in the service details and generate a worship plan</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>AI will create a complete order of service with scripture, hymns, and prayer points</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

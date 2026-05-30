'use client';

import { useState, useEffect } from 'react';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

interface PrayerEntry {
  id: string;
  requester_name: string;
  request_text: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'responded' | 'follow-up';
  ai_response: string;
  verse: { reference: string; text: string };
  created_at: string;
}

export default function PrayerRequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'add' | 'manage'>('manage');
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [requestText, setRequestText] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setUserId(session.user.id);
      } catch {}
    })();
  }, []);

  if (!mounted) return null;

  async function handleAddRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!requestText) return;
    const newEntry: PrayerEntry = {
      id: Date.now().toString(),
      requester_name: name || 'Anonymous',
      request_text: requestText,
      urgency,
      status: 'pending',
      ai_response: '',
      verse: { reference: '', text: '' },
      created_at: new Date().toISOString(),
    };
    setEntries(prev => [newEntry, ...prev]);
    setName('');
    setRequestText('');
    setUrgency('medium');
    setTab('manage');
  }

  async function handleGenerateResponse(entryId: string) {
    setGenerating(entryId);
    setError('');
    try {
      const entry = entries.find(e => e.id === entryId);
      if (!entry) return;
      const response = await fetch('/api/generate/prayer-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({ name: entry.requester_name, request: entry.request_text, userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate response');
      setEntries(prev => prev.map(e => e.id === entryId ? {
        ...e, ai_response: data.response, verse: data.verse, status: 'responded'
      } : e));
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setGenerating(null);
    }
  }

  async function handleGenerateAllPending() {
    const pending = entries.filter(e => e.status === 'pending');
    for (const entry of pending) {
      await handleGenerateResponse(entry.id);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
  }

  const urgencyColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
  const statusLabels = { pending: '⏳ Pending', responded: '✅ Responded', 'follow-up': '🔄 Follow-up' };
  const pendingCount = entries.filter(e => e.status === 'pending').length;
  const highUrgencyCount = entries.filter(e => e.urgency === 'high' && e.status === 'pending').length;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>🙏 Prayer Request Manager</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage prayer requests from your congregation. AI helps you draft compassionate responses with relevant scriptures.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)' }}>{error}</div>
      )}

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{pendingCount}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Pending</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{highUrgencyCount}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>High Urgency</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>{entries.filter(e => e.status === 'responded').length}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Responded</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setTab('manage')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', background: tab === 'manage' ? 'var(--primary)' : '#f3f4f6', color: tab === 'manage' ? 'white' : '#333' }}>
          📋 Manage Requests {pendingCount > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '12px', marginLeft: '6px' }}>{pendingCount}</span>}
        </button>
        <button onClick={() => setTab('add')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', background: tab === 'add' ? 'var(--primary)' : '#f3f4f6', color: tab === 'add' ? 'white' : '#333' }}>
          ➕ Add Request
        </button>
        {pendingCount > 1 && (
          <button onClick={handleGenerateAllPending} disabled={!!generating} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', background: '#6366f1', color: 'white', marginLeft: 'auto' }}>
            🤖 AI Respond to All Pending
          </button>
        )}
      </div>

      {tab === 'add' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Add Prayer Request</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Enter a prayer request from your congregation member. AI will help you draft a response.</p>
          <form onSubmit={handleAddRequest}>
            <div className="form-group">
              <label className="form-label">Requester Name</label>
              <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sister Mary, Brother John" />
            </div>
            <div className="form-group">
              <label className="form-label">Prayer Request *</label>
              <textarea className="input textarea" value={requestText} onChange={(e) => setRequestText(e.target.value)} placeholder="e.g., Please pray for my mother who is in hospital recovering from surgery..." style={{ minHeight: '120px' }} required />
            </div>
            <div className="form-group">
              <label className="form-label">Urgency Level</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['low', 'medium', 'high'] as const).map(level => (
                  <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', border: `2px solid ${urgency === level ? urgencyColors[level] : '#ddd'}`, background: urgency === level ? `${urgencyColors[level]}15` : 'white' }}>
                    <input type="radio" name="urgency" checked={urgency === level} onChange={() => setUrgency(level)} style={{ display: 'none' }} />
                    <span style={{ color: urgencyColors[level], fontWeight: '600', fontSize: '14px' }}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Add Request</button>
          </form>
        </div>
      )}

      {tab === 'manage' && (
        <div>
          {entries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🙏</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px' }}>No Prayer Requests Yet</h3>
              <p style={{ color: '#666', marginBottom: '16px' }}>Add prayer requests from your congregation and let AI help you respond with compassion.</p>
              <button onClick={() => setTab('add')} className="btn-primary">➕ Add First Request</button>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="card" style={{ marginBottom: '16px', borderLeft: `4px solid ${urgencyColors[entry.urgency]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{entry.requester_name}</span>
                    <span style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: `${urgencyColors[entry.urgency]}20`, color: urgencyColors[entry.urgency], fontWeight: '600' }}>{entry.urgency.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#999' }}>{new Date(entry.created_at).toLocaleDateString()}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{statusLabels[entry.status]}</span>
                  </div>
                </div>
                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '12px' }}>"{entry.request_text}"</p>
                
                {entry.ai_response ? (
                  <div>
                    <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#16a34a', marginBottom: '8px' }}>✉️ AI Drafted Response</div>
                      <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#333' }}>{entry.ai_response}</p>
                    </div>
                    {entry.verse.reference && (
                      <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--primary)' }}>📖 {entry.verse.reference}</span>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '4px' }}>"{entry.verse.text}"</p>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleCopy(`${entry.ai_response}\n\n— ${entry.verse.reference}: "${entry.verse.text}"`)} className="btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }}>📋 Copy Response</button>
                      <button onClick={() => setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'follow-up' } : e))} className="btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }}>🔄 Mark for Follow-up</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleGenerateResponse(entry.id)} disabled={generating === entry.id} className="btn-primary" style={{ fontSize: '14px' }}>
                    {generating === entry.id ? '🤖 Generating Response...' : '🤖 Generate AI Response'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

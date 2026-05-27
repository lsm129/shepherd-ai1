'use client';

import { useState, useEffect } from 'react';

interface PrayerRequest {
  id: string;
  name: string;
  request: string;
  anonymous: boolean;
  response: string;
  verse: { reference: string; text: string };
  created_at: string;
}

export default function PrayerRequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [requestText, setRequestText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiVerse, setAiVerse] = useState({ reference: '', text: '' });
  const [showResult, setShowResult] = useState(false);
  const [prayerList, setPrayerList] = useState<PrayerRequest[]>([]);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowResult(false);

    try {
      const response = await fetch('/api/generate/prayer-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({ name, request: requestText, anonymous }),
      });

      const data = await response.json();

      if (response.status === 429) { throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.'); }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prayer response');
      }

      setAiResponse(data.response);
      setAiVerse(data.verse);
      setShowResult(true);

      const newPrayer: PrayerRequest = {
        id: Date.now().toString(),
        name: anonymous ? 'Anonymous' : name || 'Anonymous',
        request: requestText,
        anonymous,
        response: data.response,
        verse: data.verse,
        created_at: new Date().toISOString(),
      };
      setPrayerList(prev => [newPrayer, ...prev]);
      setName('');
      setRequestText('');
      setAnonymous(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Prayer Requests</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Submit a prayer request and receive an AI-generated warm prayer response with a relevant Bible verse.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Submit a Prayer Request</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                disabled={anonymous}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prayer Request *</label>
              <textarea
                className="input textarea"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Please share your prayer request..."
                style={{ minHeight: '120px' }}
                required
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="anonymous"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="anonymous" style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Submit anonymously
              </label>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Generating Prayer Response...' : 'Submit Prayer Request'}
            </button>
          </form>
        </div>

        <div>
          {showResult && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--primary)' }}>🙏 Prayer Response</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>{aiResponse}</p>
              <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>📖 {aiVerse.reference}</div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.6' }}>&ldquo;{aiVerse.text}&rdquo;</p>
              </div>
              <button
                onClick={() => handleCopy(`${aiResponse}\n\n— ${aiVerse.reference}: "${aiVerse.text}"`)}
                className="btn-secondary"
                style={{ width: '100%' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Response'}
              </button>
            </div>
          )}

          {prayerList.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Past Prayer Requests</h3>
              {prayerList.map((pr) => (
                <div key={pr.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600' }}>{pr.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(pr.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{pr.request}</p>
                  <p style={{ fontSize: '13px', color: 'var(--secondary)', fontStyle: 'italic' }}>📖 {pr.verse.reference}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

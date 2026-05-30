'use client';

import { useState } from 'react';

export default function PrayerSubmitPage() {
  const [name, setName] = useState('');
  const [requestText, setRequestText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestText) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/prayer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: anonymous ? '' : name, request: requestText, anonymous }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🙏</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Your Prayer Request Has Been Received</h2>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>Our pastoral team is lifting you up in prayer. You are not alone — God hears every prayer.</p>
          <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ fontStyle: 'italic', color: '#1e3a5f', fontSize: '15px' }}>"Cast all your anxiety on him because he cares for you."</p>
            <p style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>— 1 Peter 5:7</p>
          </div>
          <button onClick={() => { setSubmitted(false); setName(''); setRequestText(''); setAnonymous(false); }} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '15px', cursor: 'pointer', fontWeight: '600' }}>Submit Another Prayer Request</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '520px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🙏</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Share Your Prayer Request</h1>
          <p style={{ color: '#666', fontSize: '15px' }}>We are here to pray with you. Your request goes directly to our pastoral team.</p>
        </div>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#dc2626', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!anonymous && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333', fontSize: '14px' }}>Prayer Request *</label>
            <textarea value={requestText} onChange={(e) => setRequestText(e.target.value)} placeholder="Please share your prayer request... We are here to pray with you." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', minHeight: '140px', boxSizing: 'border-box', resize: 'vertical' }} required />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Submit anonymously</span>
          </label>

          <button type="submit" disabled={loading || !requestText} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: loading || !requestText ? 'not-allowed' : 'pointer', background: loading || !requestText ? '#ccc' : '#1e3a5f', color: 'white' }}>
            {loading ? 'Submitting...' : 'Submit Prayer Request'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#999' }}>Your prayer request is private and shared only with the pastoral team.</p>
      </div>
    </div>
  );
}

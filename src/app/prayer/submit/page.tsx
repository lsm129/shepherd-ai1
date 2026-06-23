'use client';

import { useState, useEffect } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export default function PrayerSubmitPage() {
  const [name, setName] = useState('');
  const [requestText, setRequestText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [hasChurch, setHasChurch] = useState(false);
  const [churchName, setChurchName] = useState('');
  const [postToChurch, setPostToChurch] = useState(false);
  const [postToCommunity, setPostToCommunity] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
          const meta = session.user.user_metadata || {};
          const joined: string[] = meta.joined_churches || [];
          if (joined.length > 0) {
            setHasChurch(true);
            setPostToChurch(true);
            const { data: cs } = await supabase.from('church_settings').select('church_name').eq('user_id', joined[0]).single();
            if (cs) setChurchName(cs.church_name || '');
          }
        }
      } catch (e) {}
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestText) return;
    if (!postToChurch && !postToCommunity) {
      setError('Please select at least one destination for your prayer request.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/prayer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: anonymous ? '' : name,
          request: requestText,
          anonymous,
          userId,
          postToChurch,
          postToCommunity,
        }),
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

  const canSubmit = requestText && (postToChurch || postToCommunity);

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🙏</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Your Prayer Request Has Been Received</h2>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>Your prayer request has been shared. You are not alone — God hears every prayer.</p>
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
          <p style={{ color: '#666', fontSize: '15px' }}>We are here to pray with you. You are not alone.</p>
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
            <textarea value={requestText} onChange={(e) => setRequestText(e.target.value)} placeholder="Please share your prayer request..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', minHeight: '120px', boxSizing: 'border-box', resize: 'vertical' }} required />
          </div>

          {/* Destination selection */}
          <div style={{ marginBottom: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e3a5f', marginBottom: '12px' }}>Where should your prayer be shared? *</div>
            
            {/* Church Prayer Wall option */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', cursor: hasChurch ? 'pointer' : 'not-allowed', opacity: hasChurch ? 1 : 0.5, padding: '10px', borderRadius: '8px', background: postToChurch && hasChurch ? '#f0f4ff' : 'transparent', border: postToChurch && hasChurch ? '1px solid #6366f1' : '1px solid transparent', transition: 'all 0.2s' }}>
              <input type="checkbox" checked={postToChurch && hasChurch} onChange={(e) => { if (hasChurch) setPostToChurch(e.target.checked); }} disabled={!hasChurch} style={{ width: '18px', height: '18px', marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: hasChurch ? '#1e3a5f' : '#999' }}>⛪ My Church Prayer Wall</div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                  {hasChurch ? `Shared with ${churchName} — your pastor and fellow members can see and respond` : 'Join a church first to share with your church community'}
                </div>
              </div>
            </label>

            {/* Community Prayer Wall option */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '10px', borderRadius: '8px', background: postToCommunity ? '#f0fdf4' : 'transparent', border: postToCommunity ? '1px solid #22c55e' : '1px solid transparent', transition: 'all 0.2s' }}>
              <input type="checkbox" checked={postToCommunity} onChange={(e) => setPostToCommunity(e.target.checked)} style={{ width: '18px', height: '18px', marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e3a5f' }}>🌍 Community Prayer Wall</div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>Visible to all pastors and members — get support from the wider community</div>
              </div>
            </label>

            {!postToChurch && !postToCommunity && (
              <div style={{ fontSize: '13px', color: '#ef4444', marginTop: '8px', fontWeight: '600' }}>Please select at least one destination</div>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Submit anonymously</span>
          </label>

          <button type="submit" disabled={loading || !canSubmit} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: loading || !canSubmit ? 'not-allowed' : 'pointer', background: loading || !canSubmit ? '#ccc' : '#1e3a5f', color: 'white' }}>
            {loading ? 'Submitting...' : 'Submit Prayer Request'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#999' }}>Your prayer request is treated with care and respect.</p>
      </div>
    </div>
  );
}

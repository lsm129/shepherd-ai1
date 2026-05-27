'use client';

import { useState, useEffect } from 'react';

interface SocialContent {
  facebook: { post: string };
  instagram: { caption: string; hashtags: string };
  twitter: { tweet: string };
}

export default function SermonSocialPage() {
  const [mounted, setMounted] = useState(false);
  const [sermonNotes, setSermonNotes] = useState('');
  const [churchName, setChurchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialContent, setSocialContent] = useState<SocialContent | null>(null);
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSocialContent(null);

    try {
      const response = await fetch('/api/generate/sermon-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sermon_notes: sermonNotes, church_name: churchName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate social media content');
      }

      setSocialContent(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(field: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  }

  function handleReset() {
    setSocialContent(null);
    setSermonNotes('');
    setChurchName('');
    setError('');
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Sermon to Social Media</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Transform your sermon notes into engaging content for Facebook, Instagram, and Twitter/X.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {!socialContent ? (
        <div className="card" style={{ maxWidth: '700px' }}>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Church Name</label>
              <input
                type="text"
                className="input"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                placeholder="Grace Community Church"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sermon Notes / Summary *</label>
              <textarea
                className="input textarea"
                value={sermonNotes}
                onChange={(e) => setSermonNotes(e.target.value)}
                placeholder="Paste your sermon notes, key points, or summary here..."
                style={{ minHeight: '160px' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Generating Social Content...' : 'Generate Social Media Posts'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          {/* Facebook */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1877F2' }}>📘 Facebook Post</h3>
              <button
                onClick={() => handleCopy('facebook', socialContent.facebook.post)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                {copiedField === 'facebook' ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{socialContent.facebook.post}</p>
          </div>

          {/* Instagram */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#E4405F' }}>📸 Instagram</h3>
              <button
                onClick={() => handleCopy('instagram', `${socialContent.instagram.caption}\n\n${socialContent.instagram.hashtags}`)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                {copiedField === 'instagram' ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '12px' }}>{socialContent.instagram.caption}</p>
            <p style={{ color: 'var(--secondary)', fontSize: '14px' }}>{socialContent.instagram.hashtags}</p>
          </div>

          {/* Twitter */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000000' }}>🐦 Twitter / X</h3>
              <button
                onClick={() => handleCopy('twitter', socialContent.twitter.tweet)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                {copiedField === 'twitter' ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{socialContent.twitter.tweet}</p>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {socialContent.twitter.tweet.length}/280 characters
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <button onClick={handleReset} className="btn-primary">Create Another</button>
          </div>
        </div>
      )}
    </div>
  );
}

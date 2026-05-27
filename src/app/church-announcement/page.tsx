'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  title: string;
  content: string;
  summary: string;
}

export default function ChurchAnnouncementPage() {
  const [mounted, setMounted] = useState(false);
  const [keyPoints, setKeyPoints] = useState('');
  const [announcementType, setAnnouncementType] = useState<'sunday' | 'special' | 'urgent'>('sunday');
  const [churchName, setChurchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAnnouncement(null);

    try {
      const response = await fetch('/api/generate/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({ key_points: keyPoints, announcement_type: announcementType, church_name: churchName }),
      });

      const data = await response.json();

      if (response.status === 429) { throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.'); }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate announcement');
      }

      setAnnouncement({ title: data.title, content: data.content, summary: data.summary });
      setEditedContent(data.content);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!announcement) return;
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setAnnouncement(null);
    setEditedContent('');
    setKeyPoints('');
    setError('');
  }

  const typeOptions = [
    { value: 'sunday', label: '⛪ Sunday Service', desc: 'Regular weekly service' },
    { value: 'special', label: '🎉 Special Event', desc: 'Events, programs, celebrations' },
    { value: 'urgent', label: '🚨 Urgent Notice', desc: 'Emergency or time-sensitive' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Church Announcement Generator</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Enter key points and let AI create a polished church announcement.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {!announcement ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Create Announcement</h2>
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
                <label className="form-label">Announcement Type</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnnouncementType(opt.value as any)}
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '12px',
                        border: announcementType === opt.value ? '2px solid var(--primary)' : '2px solid var(--border)',
                        borderRadius: '8px',
                        background: announcementType === opt.value ? 'rgba(30, 58, 95, 0.05)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Key Points *</label>
                <textarea
                  className="input textarea"
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  placeholder="Enter the main points for your announcement...&#10;e.g., Christmas Eve service at 5pm, Special guest speaker, Potluck after service"
                  style={{ minHeight: '120px' }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Generating Announcement...' : 'Generate Announcement'}
              </button>
            </form>
          </div>

          <div className="card" style={{ background: 'var(--surface)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Tips for Great Announcements</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                'Include date, time, and location',
                'Mention who the announcement is for',
                'Add contact information if applicable',
                'Keep key points clear and concise',
                'Specify any preparation needed',
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--primary)' }}>{announcement.title}</h3>
            <div className="form-group">
              <label className="form-label">Announcement Content</label>
              <textarea
                className="input"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>

          <div className="card" style={{ position: 'sticky', top: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Actions</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Summary</div>
              <p style={{ fontSize: '14px', fontStyle: 'italic' }}>{announcement.summary}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <span className="badge badge-primary">{announcementType === 'sunday' ? 'Sunday Service' : announcementType === 'special' ? 'Special Event' : 'Urgent Notice'}</span>
            </div>
            <button onClick={handleCopy} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
              {copied ? '✓ Copied!' : '📋 Copy Announcement'}
            </button>
            <button onClick={handleReset} className="btn-secondary" style={{ width: '100%' }}>
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

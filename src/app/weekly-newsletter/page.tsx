'use client';

import { useState, useEffect } from 'react';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

export default function WeeklyNewsletterPage() {
  const [step, setStep] = useState<'form' | 'preview' | 'sent'>('form');
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sending, setSending] = useState(false);
  const [highlights, setHighlights] = useState('');
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState('');
  const [prayerRequests, setPrayerRequests] = useState('');
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    (async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          setEmailVerified(!!session.user.email_confirmed_at);
        }
      } catch {}
    })();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!emailVerified) { setError('Please verify your email first. Check your inbox for the verification link.'); return; }
    setLoading(true);

    try {
      const response = await fetch('/api/generate/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
        body: JSON.stringify({
          highlights,
          church_name: churchName,
          pastor_name: pastorName,
          upcoming_events: upcomingEvents,
          prayer_requests: prayerRequests,
          userId,
        }),
      });

      const data = await response.json();

      if (response.status === 429) { throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.'); }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate newsletter');
      }

      if (data.newsletter) {
        const title = data.newsletter.title || 'Weekly Newsletter';
        const content = data.newsletter.content || '';
        setNewsletterTitle(title);
        setNewsletterContent(content);
        setEditedTitle(title);
        setEditedContent(content);
        setIsEditing(false);
        setStep('preview');
      } else {
        setError('AI generated no content. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleBackToForm() {
    setStep('form');
    setError('');
    setHighlights('');
    setUpcomingEvents('');
    setPrayerRequests('');
    setIsEditing(false);
  }

  function handleEdit() {
    setIsEditing(true);
  }

  function handleSaveEdit() {
    setNewsletterTitle(editedTitle);
    setNewsletterContent(editedContent);
    setIsEditing(false);
  }

  async function handleCopy() {
    const text = `${newsletterTitle}\n\n${newsletterContent}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendNewsletter() {
    setSending(true);
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await supabase.from('newsletters').insert({
          user_id: session.user.id,
          title: newsletterTitle,
          highlights: highlights,
          content: editedContent,
        });
      }

      setStep('sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send newsletter');
    } finally {
      setSending(false);
    }
  }

  const noSelectStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  if (step === 'form') {
    return (
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Weekly Newsletter Agent 周刊助手</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>Enter your week highlights and let AI create a beautiful newsletter. 输入本周亮点，AI生成精美周刊</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ maxWidth: '700px' }}>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Church Name 教会名称</label>
              <input type="text" className="input" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" />
            </div>
            <div className="form-group">
              <label className="form-label">Pastor Name 牧师姓名</label>
              <input type="text" className="input" value={pastorName} onChange={(e) => setPastorName(e.target.value)} placeholder="Pastor John Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">This Week's Highlights * 本周亮点</label>
              <textarea className="input textarea" value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Youth group had 20 attendees, New bible study starting next week, Building fund reached 50%..." style={{ minHeight: '120px' }} required />
            </div>
            <div className="form-group">
              <label className="form-label">Upcoming Events 近期活动</label>
              <textarea className="input textarea" value={upcomingEvents} onChange={(e) => setUpcomingEvents(e.target.value)} placeholder="Sunday service 10am, Wednesday bible study 7pm..." style={{ minHeight: '80px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Prayer Requests 代祷事项</label>
              <textarea className="input textarea" value={prayerRequests} onChange={(e) => setPrayerRequests(e.target.value)} placeholder="Pray for the Smith family, Community outreach..." style={{ minHeight: '80px' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Generating... 生成中...' : 'Generate Newsletter 生成周刊'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Review Newsletter 审阅周刊</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>Edit and send your newsletter 编辑并发送周刊</p>
        </div>

        <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div className="card">
            {/* Title */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Newsletter Title 周刊标题</label>
                {!isEditing && (
                  <button onClick={handleEdit} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px' }}>
                    ✏️ Edit 编辑
                  </button>
                )}
              </div>
              {isEditing ? (
                <input type="text" className="input" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
              ) : (
                <div style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  ...noSelectStyle,
                }}>
                  {newsletterTitle}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Content 内容</label>
                {!isEditing && (
                  <button onClick={handleEdit} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px' }}>
                    ✏️ Edit 编辑
                  </button>
                )}
              </div>
              {isEditing ? (
                <textarea className="input" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} style={{ minHeight: isMobile ? '300px' : '400px' }} />
              ) : (
                <div style={{
                  minHeight: isMobile ? '300px' : '400px',
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  ...noSelectStyle,
                }}>
                  {newsletterContent}
                </div>
              )}
            </div>

            {isEditing && (
              <button onClick={handleSaveEdit} className="btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
                ✅ Save 保存修改
              </button>
            )}
          </div>

          <div className="card" style={{ position: isMobile ? 'relative' : 'sticky', top: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Send Options 发送选项</h3>
            <button onClick={handleCopy} className="btn-secondary" style={{ width: '100%', marginBottom: '12px' }}>
              {copied ? '✓ Copied! 已复制' : '📋 Copy Newsletter 复制周刊'}
            </button>
            <button onClick={handleSendNewsletter} disabled={sending} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>{sending ? 'Sending... 发送中...' : 'Send Newsletter 发送周刊'}</button>
            <button onClick={handleBackToForm} className="btn-secondary" style={{ width: '100%' }}>Start Over 重新开始</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Newsletter Sent! 周刊已发送！</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your newsletter has been sent successfully. 您的周刊已成功发送。</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={handleBackToForm} className="btn-primary">Create Another 再创建一份</button>
          <a href="/dashboard" className="btn-secondary">Back to Dashboard 返回仪表盘</a>
        </div>
      </div>
    );
  }

  return null;
}

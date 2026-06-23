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

interface Email {
  week: number;
  subject: string;
  body: string;
}

interface VisitorRecord {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  followup_status: string;
  email_sequence_started: boolean;
  how_heard: string;
  interests: string;
  ai_emails: Email[];
  emails_status: string;
  created_at: string;
}

export default function VisitorFollowupPage() {
  const [view, setView] = useState<'form' | 'list' | 'preview'>('form');
  const [step, setStep] = useState<'form' | 'preview' | 'sending' | 'sent'>('form');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Visitor form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [firstVisitDate, setFirstVisitDate] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [interests, setInterests] = useState('');

  // Email state
  const [emails, setEmails] = useState<Email[]>([]);
  const [editedEmails, setEditedEmails] = useState<Email[]>([]);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [currentVisitorId, setCurrentVisitorId] = useState<string>('');

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState(true);
  const [approved, setApproved] = useState(false);

  // Visitor list state
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // Church profile state
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [pastorEmail, setPastorEmail] = useState('');

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
          if (session.user.email) setPastorEmail(session.user.email);

          // Load church profile for personalization
          const res = await fetch('/api/subscription?userId=' + session.user.id);
          if (res.ok) {
            const data = await res.json();
            if (data.church_name) setChurchName(data.church_name);
            if (data.pastor_name) setPastorName(data.pastor_name);
            if (data.email) setPastorEmail(data.email);
          }

          // Load church settings
          try {
            const supabase2 = getSupabase();
            const { data: settings } = await supabase2
              .from('church_settings')
              .select('church_name, pastor_name, reply_email')
              .eq('user_id', session.user.id)
              .single();
            if (settings) {
              if (settings.church_name) setChurchName(settings.church_name);
              if (settings.pastor_name) setPastorName(settings.pastor_name);
              if (settings.reply_email) setPastorEmail(settings.reply_email);
            }
          } catch {}
        }
      } catch {}
    })();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  async function loadVisitors() {
    if (!userId) return;
    setListLoading(true);
    try {
      const res = await fetch('/api/visitors/list?userId=' + userId);
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors || []);
      }
    } catch (e) {
      console.error('Failed to load visitors:', e);
    } finally {
      setListLoading(false);
    }
  }

  function showListView() {
    setView('list');
    loadVisitors();
  }

  function showFormView() {
    setView('form');
    setStep('form');
    setEmails([]);
    setEditedEmails([]);
    setError('');
    setEditingWeek(null);
    setCurrentVisitorId('');
    setApproved(false);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!emailVerified) {
      setError('Please verify your email first. Check your inbox for the verification link.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/visitors/generate-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          name: visitorName,
          email: visitorEmail,
          phone: visitorPhone,
          first_visit_date: firstVisitDate,
          how_heard: howHeard,
          interests: interests,
          church_name: churchName,
          pastor_name: pastorName,
          userId,
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.');
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email sequence');
      }

      if (data.emails && data.emails.length > 0) {
        setEmails(data.emails);
        setEditedEmails(data.emails);
        setEditingWeek(null);
        setCurrentVisitorId(data.visitorId);
        setStep('preview');
        setView('form');
      } else {
        setError('AI generated no emails. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveAndSend() {
    setStep('sending');
    setError('');
    try {
      const response = await fetch('/api/visitors/approve-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: currentVisitorId,
          emails: editedEmails,
          recipientEmail: visitorEmail,
          recipientName: visitorName,
          fromName: pastorName || churchName || undefined,
          fromEmail: pastorEmail || undefined,
          userId: userId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      setApproved(true);
      setStep('sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send emails');
      setStep('preview');
    }
  }

  function handleRejectSequence() {
    if (userId) {
      const allContent = emails?.map(e => e.body).join(' ') || '';
      try {
        fetch('/api/ai-habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            action: 'reject',
            platform: 'visitor-followup',
            originalText: allContent,
            toolType: 'visitor-followup',
          }),
        });
      } catch (e) { console.error('Habit track error:', e); }
    }
    showFormView();
  }

  function updateEmail(week: number, field: 'subject' | 'body', value: string) {
    setEditedEmails(prev => prev.map(email => email.week === week ? { ...email, [field]: value } : email));
  }

  function handleEditVisitorEmails(visitor: VisitorRecord) {
    setVisitorName(visitor.visitor_name);
    setVisitorEmail(visitor.visitor_email);
    setVisitorPhone(visitor.visitor_phone || '');
    setFirstVisitDate(visitor.visit_date || '');
    setHowHeard(visitor.how_heard || '');
    setInterests(visitor.interests || '');
    setEmails(visitor.ai_emails || []);
    setEditedEmails(visitor.ai_emails || []);
    setCurrentVisitorId(visitor.id);
    setEditingWeek(null);
    setApproved(false);

    if (visitor.emails_status === 'approved' || visitor.email_sequence_started) {
      // Already approved — just show read-only preview
      setStep('sent');
      setApproved(true);
    } else {
      setStep('preview');
    }
    setView('form');
  }

  function getStatusBadge(status: string, emailsStatus: string) {
    if (emailsStatus === 'approved' || status === 'contacted') {
      return { text: 'In Progress', color: '#16a34a', bg: '#f0fdf4' };
    }
    if (emailsStatus === 'draft') {
      return { text: 'Draft — Needs Review', color: '#d97706', bg: '#fffbeb' };
    }
    return { text: 'Pending', color: '#6b7280', bg: '#f3f4f6' };
  }

  // ==================== RENDER: List View ====================
  if (view === 'list') {
    return (
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
            Your Visitors
          </h1>
          <button onClick={showFormView} className="btn-primary" style={{ fontSize: '14px' }}>
            + Add New Visitor
          </button>
        </div>

        {listLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading visitors...
          </div>
        ) : visitors.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>👥</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              No visitors yet. Add your first visitor to get started with AI-powered follow-up!
            </p>
            <button onClick={showFormView} className="btn-primary">Add Your First Visitor</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visitors.map((visitor) => {
              const badge = getStatusBadge(visitor.followup_status, visitor.emails_status);
              return (
                <div key={visitor.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => handleEditVisitorEmails(visitor)}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>{visitor.visitor_name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{visitor.visitor_email}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Visited: {visitor.visit_date || 'Not set'}
                        {visitor.how_heard ? ' · Heard via: ' + visitor.how_heard : ''}
                        {visitor.interests ? ' · Interests: ' + visitor.interests.substring(0, 50) : ''}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px',
                      color: badge.color, background: badge.bg,
                    }}>
                      {badge.text}
                    </div>
                  </div>
                  {visitor.ai_emails && visitor.ai_emails.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {visitor.ai_emails.map((e: Email) => (
                        <span key={e.week} style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                          background: 'var(--surface)', color: 'var(--text-secondary)',
                        }}>
                          W{e.week}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==================== RENDER: Form Step ====================
  if (step === 'form') {
    return (
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
              AI Visitor Follow-up ✨
            </h1>
            {userId && (
              <button onClick={showListView} className="btn-secondary" style={{ fontSize: '13px' }}>
                View All Visitors
              </button>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
            Enter visitor information and AI creates a unique 6-week follow-up sequence — personalized for each visitor.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Visitor Information</h2>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="input" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} placeholder="John Smith" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="input" value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)} placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="input" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} placeholder="(555) 123-4567" />
              </div>
              <div className="form-group">
                <label className="form-label">First Visit Date *</label>
                <input type="date" className="input" value={firstVisitDate} onChange={(e) => setFirstVisitDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">How Did They Hear About Us?</label>
                <input type="text" className="input" value={howHeard} onChange={(e) => setHowHeard(e.target.value)} placeholder="Friend referral, Google search, walked by, etc." />
              </div>
              <div className="form-group">
                <label className="form-label">Expressed Interests / Needs</label>
                <textarea className="input textarea" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Youth ministry, small groups, counseling, children's program, etc." />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? '✨ AI is crafting personalized emails...' : '✨ Generate Personalized Follow-up'}
              </button>
            </form>
          </div>

          <div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', color: 'white', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>🤖 How AI Personalization Works</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px', opacity: 0.9 }}>
                Unlike generic templates, our AI creates unique emails for <strong>each visitor</strong> based on their specific details.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px' }}>
                <li style={{ marginBottom: '8px' }}>✅ References how they found your church</li>
                <li style={{ marginBottom: '8px' }}>✅ Mentions their specific interests</li>
                <li style={{ marginBottom: '8px' }}>✅ Sounds like you wrote it personally</li>
                <li style={{ marginBottom: '8px' }}>✅ No two visitors get the same email</li>
              </ul>
            </div>

            <div className="card" style={{ background: 'var(--surface)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>6-Week Sequence</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  { week: 1, title: 'Welcome', desc: 'Personalized greeting referencing their visit', icon: '👋' },
                  { week: 2, title: 'Check-in', desc: 'Ask about their experience specifically', icon: '💬' },
                  { week: 3, title: 'Community', desc: 'Connect them to relevant groups/ministries', icon: '🤝' },
                  { week: 4, title: 'Invite', desc: 'Targeted event or service invitation', icon: '📅' },
                  { week: 5, title: 'Story', desc: 'Share a relatable community story', icon: '📖' },
                  { week: 6, title: 'Personal Note', desc: 'Pastor\'s personal connection', icon: '❤️' },
                ].map((item) => (
                  <li key={item.week} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: '600' }}>Week {item.week}: {item.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER: Preview Step ====================
  if (step === 'preview') {
    return (
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
            Review AI-Generated Emails ✨
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
            Review and edit the personalized emails for <strong>{visitorName}</strong> ({visitorEmail})
          </p>
          {(howHeard || interests) && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {howHeard && <span style={{ marginRight: '16px' }}>🔗 Heard via: <strong>{howHeard}</strong></span>}
              {interests && <span>⭐ Interests: <strong>{interests}</strong></span>}
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div>
            {editedEmails.map((email) => {
              const isEditingThis = editingWeek === email.week;
              return (
                <div key={email.week} className="card" style={{ marginBottom: '16px', border: isEditingThis ? '2px solid var(--primary)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                        {email.week}
                      </span>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Week {email.week} · {['Welcome', 'Check-in', 'Community', 'Invite', 'Story', 'Personal Note'][email.week - 1]}
                      </span>
                    </div>
                    {!isEditingThis && (
                      <button
                        onClick={() => setEditingWeek(email.week)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px' }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="form-group">
                    <label className="form-label">Subject Line</label>
                    {isEditingThis ? (
                      <input type="text" className="input" value={email.subject} onChange={(e) => updateEmail(email.week, 'subject', e.target.value)} />
                    ) : (
                      <div style={{
                        background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
                        padding: '10px 12px', fontSize: '14px', fontWeight: '600',
                        ...noSelectStyle,
                      }} {...noSelectEvents}>
                        {email.subject}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="form-group">
                    <label className="form-label">Email Body</label>
                    {isEditingThis ? (
                      <textarea className="input" value={email.body} onChange={(e) => updateEmail(email.week, 'body', e.target.value)} style={{ minHeight: '220px' }} />
                    ) : (
                      <div style={{
                        minHeight: '200px', background: 'white', border: '1px solid var(--border)',
                        borderRadius: '8px', padding: '12px', fontSize: '14px', lineHeight: '1.7',
                        whiteSpace: 'pre-wrap', ...noSelectStyle,
                      }} {...noSelectEvents}>
                        {email.body}
                      </div>
                    )}
                  </div>

                  {isEditingThis && (
                    <button onClick={() => setEditingWeek(null)} className="btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
                      ✅ Save Changes
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card" style={{ position: isMobile ? 'relative' : 'sticky', top: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Approve & Schedule</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Recipient</div>
              <div style={{ fontWeight: '600' }}>{visitorName}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{visitorEmail}</div>
            </div>
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '13px' }}>
              <div style={{ fontWeight: '600', marginBottom: '6px', color: '#16a34a' }}>📅 Schedule:</div>
              <div>Week 1: <strong>Sent immediately</strong></div>
              <div>Weeks 2-6: <strong>Auto-sent weekly</strong></div>
            </div>
            <button onClick={handleApproveAndSend} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
              ✅ Approve & Start Sequence
            </button>
            <button onClick={handleRejectSequence} className="btn-secondary" style={{ width: '100%', marginBottom: '12px', color: '#dc2626' }}>
              🔄 Regenerate
            </button>
            <button onClick={showFormView} className="btn-secondary" style={{ width: '100%' }}>
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER: Sending Step ====================
  if (step === 'sending') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Sending Emails...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your personalized email sequence is being sent to {visitorName}</p>
      </div>
    );
  }

  // ==================== RENDER: Sent Step ====================
  if (step === 'sent') {
    return (
      <div style={{ padding: isMobile ? '16px' : '0' }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#16a34a' }}>
            {approved ? 'Personalized Sequence Started!' : 'Follow-up In Progress'}
          </h2>
          {approved && (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Week 1 email sent immediately to <strong>{visitorName}</strong>
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Weeks 2-6 are scheduled to send automatically every 7 days
              </p>
            </>
          )}
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', maxWidth: '500px', margin: '0 auto 24px', textAlign: 'left' }}>
          <div style={{ fontWeight: '600', marginBottom: '12px', color: '#16a34a' }}>📧 Email Schedule:</div>
          {editedEmails.map((email, i) => (
            <div key={email.week} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#333', borderBottom: '1px solid #e5e7eb' }}>
              <span>Week {email.week}: {email.subject.substring(0, 35)}{email.subject.length > 35 ? '...' : ''}</span>
              <span style={{ color: i === 0 ? '#16a34a' : '#64748b', fontWeight: i === 0 ? '600' : '400' }}>
                {i === 0 ? '✅ Sent!' : `+${i * 7} days`}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={showFormView} className="btn-primary">
            Add Another Visitor
          </button>
          {userId && (
            <button onClick={showListView} className="btn-secondary">
              View All Visitors
            </button>
          )}
          <a href="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return null;
}

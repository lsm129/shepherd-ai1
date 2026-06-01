'use client';

import { useState, useEffect } from 'react';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { usePlan, canAccess, LockedFeature } from '@/lib/plan-gate';


function getSupabase() {
 const url = (supabaseUrl);
 const key = (supabaseAnonKey);
 // eslint-disable-next-line @typescript-eslint/no-require-imports
 const { createClient } = require('@supabase/supabase-js');
 return createClient(url, key);
}

interface Devotional {
 title: string;
 verse: { reference: string; text: string };
 meditation: string;
 prayer: string;
 application: string;
}

const PRESET_TOPICS = [
 'Faith', 'Hope', 'Love', 'Grace', 'Forgiveness',
 'Strength', 'Wisdom', 'Peace', 'Joy', 'Trust',
 'Patience', 'Courage', 'Gratitude', 'Prayer', 'Obedience',
];

export default function DailyDevotionalPage() {
  const { plan, loading: planLoading } = usePlan();
  if (!planLoading && !canAccess(plan, 'starter')) return <LockedFeature minPlan="starter" title="Daily Devotional" />;

 const [mounted, setMounted] = useState(false);
 const [isMobile, setIsMobile] = useState(false);
 const [selectedTopic, setSelectedTopic] = useState('');
 const [customTopic, setCustomTopic] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [devotional, setDevotional] = useState<Devotional | null>(null);
 const [editedMeditation, setEditedMeditation] = useState('');
 const [editedApplication, setEditedApplication] = useState('');
 const [editedPrayer, setEditedPrayer] = useState('');
 const [editingField, setEditingField] = useState<string>('');
 const [copied, setCopied] = useState(false);
 const [userId, setUserId] = useState<string>('');
 const [emailVerified, setEmailVerified] = useState(true);

 useEffect(() => {
 setMounted(true);
 const checkMobile = () => setIsMobile(window.innerWidth < 768);
 checkMobile();
 window.addEventListener('resize', checkMobile);
 // Read Supabase session for auth
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
 setDevotional(null);

 try {
 const response = await fetch('/api/generate/devotional', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
 body: JSON.stringify({ topic: selectedTopic, custom_topic: customTopic, userId }),
 });

 const data = await response.json();

 if (response.status === 429) { throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.'); }
 if (!response.ok) {
 throw new Error(data.error || 'Failed to generate devotional');
 }

 setDevotional(data);
 setEditedMeditation(data.meditation || '');
 setEditedApplication(data.application || '');
 setEditedPrayer(data.prayer || '');
 setEditingField('');
 } catch (err: any) {
 setError(err.message || 'Something went wrong');
 } finally {
 setLoading(false);
 }
 }

 async function handleCopy() {
 if (!devotional) return;
 const meditation = editingField === 'meditation' ? editedMeditation : devotional.meditation;
 const application = editingField === 'application' ? editedApplication : devotional.application;
 const prayer = editingField === 'prayer' ? editedPrayer : devotional.prayer;
 const text = `${devotional.title}\n\n📖 ${devotional.verse.reference}\n"${devotional.verse.text}"\n\n💭 Meditation\n${meditation}\n\n🎯 Application\n${application}\n\n🙏 Prayer\n${prayer}`;
 navigator.clipboard.writeText(text);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }

 function handleReset() {
 setDevotional(null);
 setSelectedTopic('');
 setCustomTopic('');
 setError('');
 setEditingField('');
 }

 function handleEdit(field: string) {
 setEditingField(field);
 }

 function handleSaveEdit() {
 if (editingField === 'meditation' && devotional) {
 setDevotional({ ...devotional, meditation: editedMeditation });
 } else if (editingField === 'application' && devotional) {
 setDevotional({ ...devotional, application: editedApplication });
 } else if (editingField === 'prayer' && devotional) {
 setDevotional({ ...devotional, prayer: editedPrayer });
 }
 setEditingField('');
 }

 return (
 <div style={{ padding: isMobile ? '16px' : '0' }}>
 <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
 <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
 Daily Devotional
 </h1>
 <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
 Generate a daily devotional with Bible verse, meditation, application, and prayer.
 </p>
 </div>

 {error && (
 <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>
 {error}
 </div>
 )}

 {!devotional ? (
 <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
 <div className="card">
 <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Choose a Topic</h2>
 <form onSubmit={handleGenerate}>
 <div className="form-group">
 <label className="form-label">Select a Topic</label>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
 {PRESET_TOPICS.map((topic) => (
 <button
 key={topic}
 type="button"
 onClick={() => { setSelectedTopic(topic); setCustomTopic(''); }}
 style={{
 padding: '8px 16px',
 border: selectedTopic === topic ? '2px solid var(--primary)' : '2px solid var(--border)',
 borderRadius: '20px',
 background: selectedTopic === topic ? 'rgba(30, 58, 95, 0.1)' : 'white',
 cursor: 'pointer',
 fontSize: '14px',
 fontWeight: selectedTopic === topic ? '600' : '400',
 color: selectedTopic === topic ? 'var(--primary)' : 'var(--text-secondary)',
 }}
 >
 {topic}
 </button>
 ))}
 </div>
 </div>
 <div className="form-group">
 <label className="form-label">Or Enter a Custom Topic</label>
 <input
 type="text"
 className="input"
 value={customTopic}
 onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(''); }}
 placeholder="e.g., Overcoming anxiety, God's faithfulness..."
 />
 </div>
 <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading || (!selectedTopic && !customTopic)}>
 {loading ? 'Generating Devotional......' : 'Generate Daily Devotional'}
 </button>
 </form>
 </div>

 <div className="card" style={{ background: 'var(--surface)' }}>
 <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📖 What You'll Receive</h3>
 <ul style={{ listStyle: 'none', padding: 0 }}>
 {[
 { icon: '📖', title: 'Bible Verse', desc: 'A relevant Scripture passage' },
 { icon: '💭', title: 'Meditation', desc: 'Thoughtful reflection on the verse' },
 { icon: '🎯', title: 'Application', desc: 'Practical steps for today' },
 { icon: '🙏', title: 'Prayer', desc: 'A guided closing prayer' },
 ].map((item, i) => (
 <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
 <span style={{ fontSize: '24px' }}>{item.icon}</span>
 <div>
 <div style={{ fontWeight: '600' }}>{item.title}</div>
 <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.desc}</div>
 </div>
 </li>
 ))}
 </ul>
 </div>
 </div>
 ) : (
 <div>
 {/* AI Generated Result */}
 <div className="card" style={{ marginBottom: '16px' }}>
 <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--primary)', ...noSelectStyle }} {...noSelectEvents}>
 {devotional.title}
 </h2>

 {/* Verse - always non-selectable */}
 <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: isMobile ? '16px' : '20px', marginBottom: '24px', ...noSelectStyle }} {...noSelectEvents}>
 <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>📖 {devotional.verse.reference}</div>
 <p style={{ fontStyle: 'italic', fontSize: isMobile ? '16px' : '18px', lineHeight: '1.8', color: 'var(--text)', margin: 0 }}>
 &ldquo;{devotional.verse.text}&rdquo;
 </p>
 </div>

 {/* Meditation */}
 <div style={{ marginBottom: '24px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
 <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', margin: 0 }}>💭 Meditation</h3>
 {editingField !== 'meditation' && (
 <button onClick={() => handleEdit('meditation')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px' }}>
 ✏️ Edit
 </button>
 )}
 </div>
 {editingField === 'meditation' ? (
 <textarea
 className="input"
 value={editedMeditation}
 onChange={(e) => setEditedMeditation(e.target.value)}
 style={{ minHeight: isMobile ? '120px' : '150px' }}
 />
 ) : (
 <div style={{
 minHeight: isMobile ? '120px' : '150px',
 background: 'white',
 border: '1px solid var(--border)',
 borderRadius: '8px',
 padding: '12px',
 fontSize: '14px',
 lineHeight: '1.8',
 whiteSpace: 'pre-wrap',
 ...noSelectStyle,
 }} {...noSelectEvents}>
 {devotional.meditation}
 </div>
 )}
 {editingField === 'meditation' && (
 <button onClick={handleSaveEdit} className="btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
 ✅ Save
 </button>
 )}
 </div>

 {/* Application */}
 <div style={{ marginBottom: '24px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
 <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', margin: 0 }}>🎯 Application</h3>
 {editingField !== 'application' && (
 <button onClick={() => handleEdit('application')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px' }}>
 ✏️ Edit
 </button>
 )}
 </div>
 {editingField === 'application' ? (
 <textarea
 className="input"
 value={editedApplication}
 onChange={(e) => setEditedApplication(e.target.value)}
 style={{ minHeight: isMobile ? '100px' : '120px' }}
 />
 ) : (
 <div style={{
 minHeight: isMobile ? '100px' : '120px',
 background: 'white',
 border: '1px solid var(--border)',
 borderRadius: '8px',
 padding: '12px',
 fontSize: '14px',
 lineHeight: '1.8',
 whiteSpace: 'pre-wrap',
 ...noSelectStyle,
 }} {...noSelectEvents}>
 {devotional.application}
 </div>
 )}
 {editingField === 'application' && (
 <button onClick={handleSaveEdit} className="btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
 ✅ Save
 </button>
 )}
 </div>

 {/* Prayer */}
 <div style={{ background: 'rgba(30, 58, 95, 0.05)', borderRadius: '8px', padding: isMobile ? '16px' : '20px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
 <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', margin: 0 }}>🙏 Prayer</h3>
 {editingField !== 'prayer' && (
 <button onClick={() => handleEdit('prayer')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px' }}>
 ✏️ Edit
 </button>
 )}
 </div>
 {editingField === 'prayer' ? (
 <textarea
 className="input"
 value={editedPrayer}
 onChange={(e) => setEditedPrayer(e.target.value)}
 style={{ minHeight: isMobile ? '120px' : '150px' }}
 />
 ) : (
 <div style={{
 minHeight: isMobile ? '120px' : '150px',
 background: 'white',
 border: '1px solid var(--border)',
 borderRadius: '8px',
 padding: '12px',
 fontSize: '14px',
 lineHeight: '1.8',
 whiteSpace: 'pre-wrap',
 fontStyle: 'italic',
 ...noSelectStyle,
 }} {...noSelectEvents}>
 {devotional.prayer}
 </div>
 )}
 {editingField === 'prayer' && (
 <button onClick={handleSaveEdit} className="btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
 ✅ Save
 </button>
 )}
 </div>
 </div>

 {/* Action buttons */}
 <div style={{ display: 'flex', gap: '12px' }}>
 <button onClick={handleCopy} className="btn-primary" style={{ flex: 1 }}>
 {copied ? '✓ Copied!' : '📋 Copy Devotional'}
 </button>
 <button onClick={handleReset} className="btn-secondary" style={{ flex: 1 }}>
 Generate Another
 </button>
 </div>
 </div>
 )}
 </div>
 );
}

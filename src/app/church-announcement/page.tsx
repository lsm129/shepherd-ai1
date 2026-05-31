'use client';

import { useState, useEffect } from 'react';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';

function getSupabase() {
 const url = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
 const key = ((process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I');
 const { createClient } = require('@supabase/supabase-js');
 return createClient(url, key);
}

interface Announcement {
 title: string;
 content: string;
 summary: string;
}

export default function ChurchAnnouncementPage() {
 const [mounted, setMounted] = useState(false);
 const [isMobile, setIsMobile] = useState(false);
 const [keyPoints, setKeyPoints] = useState('');
 const [announcementType, setAnnouncementType] = useState<'sunday' | 'special' | 'urgent'>('sunday');
 const [churchName, setChurchName] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [announcement, setAnnouncement] = useState<Announcement | null>(null);
 const [editedContent, setEditedContent] = useState('');
 const [isEditing, setIsEditing] = useState(false);
 const [copied, setCopied] = useState(false);
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
 if (!emailVerified) { setError('Please verify your email first.'); return; }
 setLoading(true);
 setAnnouncement(null);
 setIsEditing(false);

 try {
 const response = await fetch('/api/generate/announcement', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
 body: JSON.stringify({ key_points: keyPoints, announcement_type: announcementType, church_name: churchName, userId }),
 });
 const data = await response.json();
 if (response.status === 429) { throw new Error('Monthly AI generation limit reached!'); }
 if (!response.ok) { throw new Error(data.error || 'Failed to generate announcement'); }
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
 setIsEditing(false);
 setKeyPoints('');
 setError('');
 }

 const typeOptions = [
 { value: 'sunday', label: '⛪ Sunday Service', desc: 'Regular weekly service' },
 { value: 'special', label: '🎉 Special Event', desc: 'Events, programs, celebrations' },
 { value: 'urgent', label: '🚨 Urgent Notice', desc: 'Emergency or time-sensitive' },
 ];

 return (
 <div style={{ padding: isMobile ? '16px' : '0' }}>
 <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
 <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
 Church Announcement Generator
 </h1>
 <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
 Enter key points and let AI create a polished church announcement.
 </p>
 </div>

 {error && (
 <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>
 {error}
 </div>
 )}

 {!announcement ? (
 <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
 <div className="card">
 <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Create Announcement</h2>
 <form onSubmit={handleGenerate}>
 <div className="form-group">
 <label className="form-label">Church Name</label>
 <input type="text" className="input" value={churchName} onChange={(e) => setChurchName(e.target.value)} placeholder="Grace Community Church" />
 </div>
 <div className="form-group">
 <label className="form-label">Announcement Type</label>
 <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap' }}>
 {typeOptions.map((opt) => (
 <button key={opt.value} type="button" onClick={() => setAnnouncementType(opt.value as any)}
 style={{ flex: 1, minWidth: isMobile ? '90px' : '120px', padding: isMobile ? '8px 4px' : '12px', border: announcementType === opt.value ? '2px solid var(--primary)' : '2px solid var(--border)', borderRadius: '8px', background: announcementType === opt.value ? 'rgba(30, 58, 95, 0.05)' : 'white', cursor: 'pointer', textAlign: 'center' }}>
 <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600' }}>{opt.label}</div>
 <div style={{ fontSize: isMobile ? '10px' : '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{opt.desc}</div>
 </button>
 ))}
 </div>
 </div>
 <div className="form-group">
 <label className="form-label">Key Points *</label>
 <textarea className="input textarea" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} placeholder="Enter the main points..." style={{ minHeight: '120px' }} required />
 </div>
 <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
 {loading ? 'Generating...' : 'Generate Announcement'}
 </button>
 </form>
 </div>
 {!isMobile && (
 <div className="card" style={{ background: 'var(--surface)' }}>
 <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Tips for Great Announcements</h3>
 <ul style={{ listStyle: 'none', padding: 0 }}>
 {['Include date, time, and location', 'Mention who the announcement is for', 'Add contact information', 'Keep key points clear and concise', 'Specify any preparation needed'].map((tip, i) => (
 <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-start' }}>
 <span style={{ color: 'var(--success)' }}>✓</span>
 <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{tip}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 ) : (
 <div>
 <div className="card" style={{ marginBottom: '16px' }}>
 {/* Title - not selectable */}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
 <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold', color: 'var(--primary)', ...noSelectStyle }} {...noSelectEvents}>
 {announcement.title}
 </h3>
 <span className="badge badge-primary">
 {announcementType === 'sunday' ? 'Sunday Service' : announcementType === 'special' ? 'Special Event' : 'Urgent Notice'}
 </span>
 </div>

 {/* Summary - not selectable */}
 {announcement.summary && (
 <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px', marginBottom: '16px', ...noSelectStyle }} {...noSelectEvents}>
 <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Summary</div>
 <p style={{ fontSize: '14px', fontStyle: 'italic', margin: 0 }}>{announcement.summary}</p>
 </div>
 )}

 {/* Content - div when not editing, textarea when editing */}
 <div className="form-group">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <label className="form-label">Announcement Content</label>
 {!isEditing && (
 <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px' }}>
 ✏️ Edit
 </button>
 )}
 </div>
 {isEditing ? (
 <textarea className="input" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} style={{ minHeight: isMobile ? '200px' : '300px' }} />
 ) : (
 <div style={{ minHeight: isMobile ? '200px' : '300px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', ...noSelectStyle }} {...noSelectEvents}>
 {editedContent}
 </div>
 )}
 </div>
 {isEditing && (
 <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
 ✅ Save
 </button>
 )}
 </div>

 <div style={{ display: 'flex', gap: '12px' }}>
 <button onClick={handleCopy} className="btn-primary" style={{ flex: 1 }}>
 {copied ? '✓ Copied!' : '📋 Copy Announcement'}
 </button>
 <button onClick={handleReset} className="btn-secondary" style={{ flex: 1 }}>
 Create Another
 </button>
 </div>
 </div>
 )}
 </div>
 );
}

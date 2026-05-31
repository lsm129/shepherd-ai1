'use client';

import { useState, useEffect, useRef } from 'react';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';

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
 const [isMobile, setIsMobile] = useState(false);
 const [entries, setEntries] = useState<PrayerEntry[]>([]);
 const [generating, setGenerating] = useState<string | null>(null);
 const [error, setError] = useState('');
 const [userId, setUserId] = useState('');
 const [filter, setFilter] = useState<'all' | 'pending' | 'high'>('all');
 const [shareLink, setShareLink] = useState('');
 const [ocrLoading, setOcrLoading] = useState(false);
 const [ocrProgress, setOcrProgress] = useState(0);
 const [editingEntry, setEditingEntry] = useState<string | null>(null);
 const [editedResponse, setEditedResponse] = useState('');
 const fileInputRef = useRef<HTMLInputElement>(null);

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
 const baseUrl = window.location.origin;
 setShareLink(`${baseUrl}/prayer/submit`);
 }
 } catch {}
 })();
 return () => window.removeEventListener('resize', checkMobile);
 }, []);

 // Demo entries for first-time users
 useEffect(() => {
 if (entries.length === 0) {
 setEntries([
 {
 id: 'demo1',
 requester_name: 'Sister Mary',
 request_text: 'Please pray for my husband who is having surgery next Tuesday. We are trusting God for a successful outcome.',
 urgency: 'high',
 status: 'pending',
 ai_response: '',
 verse: { reference: '', text: '' },
 created_at: new Date(Date.now() - 3600000).toISOString(),
 },
 {
 id: 'demo2',
 requester_name: 'Anonymous',
 request_text: 'I have been struggling with anxiety and depression. Please pray for peace and healing.',
 urgency: 'high',
 status: 'pending',
 ai_response: '',
 verse: { reference: '', text: '' },
 created_at: new Date(Date.now() - 7200000).toISOString(),
 },
 {
 id: 'demo3',
 requester_name: 'Brother David',
 request_text: 'Pray for our youth group mission trip next month. We need safe travels and open hearts.',
 urgency: 'medium',
 status: 'pending',
 ai_response: '',
 verse: { reference: '', text: '' },
 created_at: new Date(Date.now() - 86400000).toISOString(),
 },
 ]);
 }
 }, []);

 if (!mounted) return null;

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

 async function handleRespondAll() {
 const pending = filteredEntries.filter(e => e.status === 'pending');
 for (const entry of pending) {
 await handleGenerateResponse(entry.id);
 }
 }

 async function handleCopy(text: string) {
 await navigator.clipboard.writeText(text);
 }

 function handleCopyShareLink() {
 navigator.clipboard.writeText(shareLink);
 }

 function handleEditResponse(entryId: string, currentResponse: string) {
 setEditingEntry(entryId);
 setEditedResponse(currentResponse);
 }

 function handleSaveResponse(entryId: string) {
 setEntries(prev => prev.map(e => e.id === entryId ? { ...e, ai_response: editedResponse } : e));
 setEditingEntry(null);
 }

 async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
 const file = e.target.files?.[0];
 if (!file) return;
 setOcrLoading(true);
 setOcrProgress(0);
 try {
 const Tesseract = await import('tesseract.js');
 const { data: { text } } = await Tesseract.recognize(file, 'eng', {
 logger: (m: any) => {
 if (m.status === 'recognizing text') {
 setOcrProgress(Math.round(m.progress * 100));
 }
 }
 });
 if (text.trim()) {
 const newEntry: PrayerEntry = {
 id: Date.now().toString(),
 requester_name: 'From Paper',
 request_text: text.trim(),
 urgency: 'medium',
 status: 'pending',
 ai_response: '',
 verse: { reference: '', text: '' },
 created_at: new Date().toISOString(),
 };
 setEntries(prev => [newEntry, ...prev]);
 } else {
 setError('Could not read text from photo. Try a clearer image or enter manually.');
 }
 } catch (err: any) {
 setError('Photo recognition failed: ' + (err.message || 'Unknown error'));
 } finally {
 setOcrLoading(false);
 setOcrProgress(0);
 if (fileInputRef.current) fileInputRef.current.value = '';
 }
 }

 const urgencyColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
 const statusLabels = { pending: '⏳ Pending', responded: '✅ Responded', 'follow-up': '🔄 Follow-up' };
 const pendingCount = entries.filter(e => e.status === 'pending').length;
 const highUrgencyCount = entries.filter(e => e.urgency === 'high' && e.status === 'pending').length;
 const filteredEntries = filter === 'all' ? entries : filter === 'pending' ? entries.filter(e => e.status === 'pending') : entries.filter(e => e.urgency === 'high' && e.status === 'pending');

 return (
 <div style={{ padding: isMobile ? '16px' : '0' }}>
 <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
 <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>🙏 Prayer Request Manager</h1>
 <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>Congregation members submit prayer requests via your shareable link. You review and AI helps you respond.AI</p>
 </div>

 {/* Share Link */}
 <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', borderRadius: '12px', padding: isMobile ? '16px' : '24px', marginBottom: '24px', color: 'white' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
 <div style={{ flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
 <div style={{ fontWeight: '600', marginBottom: '4px' }}>📢 Share This Link With Your Congregation</div>
 <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>Members submit prayer requests themselves — no login needed</div>
 <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6px', padding: '8px 14px', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>{shareLink}</div>
 </div>
 <button onClick={handleCopyShareLink} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }}>
 📋 Copy Link
 </button>
 </div>
 </div>

 {error && (
 <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>{error}</div>
 )}

 {/* Quick Add from Paper */}
 <div style={{ background: 'white', borderRadius: '12px', padding: isMobile ? '16px' : '20px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
 <div>
 <span style={{ fontWeight: '600', color: '#1e3a5f' }}>📝 Got paper prayer requests?</span>
 <span style={{ color: '#666', fontSize: '14px' }}> Take a photo and AI reads the text. Image stays on your device.AI</span>
 </div>
 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
 {ocrLoading && <span style={{ fontSize: '13px', color: '#6366f1' }}>Reading... {ocrProgress}%</span>}
 <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
 <button onClick={() => fileInputRef.current?.click()} disabled={ocrLoading} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: ocrLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>
 {ocrLoading ? '⏳ Reading......' : '📸 Take Photo / Upload/Upload'}
 </button>
 </div>
 </div>

 {/* Stats Bar */}
 <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
 <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
 <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: '#f59e0b' }}>{pendingCount}</div>
 <div style={{ fontSize: '13px', color: '#666' }}>Pending</div>
 </div>
 <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
 <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: '#ef4444' }}>{highUrgencyCount}</div>
 <div style={{ fontSize: '13px', color: '#666' }}>High Urgency</div>
 </div>
 <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
 <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: '#22c55e' }}>{entries.filter(e => e.status === 'responded').length}</div>
 <div style={{ fontSize: '13px', color: '#666' }}>Responded</div>
 </div>
 </div>

 {/* Filter + Actions */}
 <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
 {(['all', 'pending', 'high'] as const).map(f => (
 <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', background: filter === f ? 'var(--primary)' : '#f3f4f6', color: filter === f ? 'white' : '#333', fontSize: '13px' }}>
 {f === 'all' ? '📋 All' : f === 'pending' ? `⏳ Pending (${pendingCount})` : `🔴 High Urgency (${highUrgencyCount})`}
 </button>
 ))}
 {pendingCount > 1 && (
 <button onClick={handleRespondAll} disabled={!!generating} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', background: '#6366f1', color: 'white', fontSize: '13px', marginLeft: 'auto' }}>
 🤖 AI Respond to AllAI
 </button>
 )}
 </div>

 {/* Prayer Request List */}
 {filteredEntries.length === 0 ? (
 <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
 <div style={{ fontSize: '48px', marginBottom: '16px' }}>🙏</div>
 <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px' }}>No Prayer Requests Yet</h3>
 <p style={{ color: '#666', marginBottom: '16px' }}>Share the link above with your congregation to start receiving prayer requests.</p>
 </div>
 ) : (
 filteredEntries.map(entry => (
 <div key={entry.id} className="card" style={{ marginBottom: '16px', borderLeft: `4px solid ${urgencyColors[entry.urgency]}` }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{entry.requester_name}</span>
 <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: `${urgencyColors[entry.urgency]}20`, color: urgencyColors[entry.urgency], fontWeight: '600' }}>{entry.urgency.toUpperCase()}</span>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <span style={{ fontSize: '13px', color: '#999' }}>{new Date(entry.created_at).toLocaleDateString()}</span>
 <span style={{ fontSize: '13px', fontWeight: '500' }}>{statusLabels[entry.status]}</span>
 </div>
 </div>
 
 {/* Request text - non-selectable */}
 <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '12px', fontStyle: 'italic', ...noSelectStyle }} {...noSelectEvents}>"{entry.request_text}"</p>
 
 {entry.ai_response ? (
 <div>
 <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <div style={{ fontWeight: '600', color: '#16a34a' }}>✉️ AI Drafted Response AI</div>
 {editingEntry !== entry.id && (
 <button
 onClick={() => handleEditResponse(entry.id, entry.ai_response)}
 style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px' }}
 >
 ✏️ Edit
 </button>
 )}
 </div>
 {editingEntry === entry.id ? (
 <textarea
 className="input"
 value={editedResponse}
 onChange={(e) => setEditedResponse(e.target.value)}
 style={{ minHeight: isMobile ? '120px' : '150px' }}
 />
 ) : (
 <div style={{
 minHeight: isMobile ? '80px' : '100px',
 lineHeight: '1.8',
 whiteSpace: 'pre-wrap',
 color: '#333',
 background: 'white',
 border: '1px solid var(--border)',
 borderRadius: '8px',
 padding: '12px',
 fontSize: '14px',
 ...noSelectStyle,
 }} {...noSelectEvents}>
 {entry.ai_response}
 </div>
 )}
 {editingEntry === entry.id && (
 <button onClick={() => handleSaveResponse(entry.id)} className="btn-secondary" style={{ width: '100%', marginTop: '8px' }}>
 ✅ Save
 </button>
 )}
 </div>
 {entry.verse.reference && (
 <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px', marginBottom: '12px', ...noSelectStyle }} {...noSelectEvents}>
 <span style={{ fontWeight: '600', color: 'var(--primary)' }}>📖 {entry.verse.reference}</span>
 <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>"{entry.verse.text}"</p>
 </div>
 )}
 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
 <button onClick={() => handleCopy(`${entry.ai_response}\n\n— ${entry.verse.reference}: "${entry.verse.text}"`)} className="btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }}>📋 Copy Response</button>
 <button onClick={() => setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'follow-up' } : e))} className="btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }}>🔄 Mark for Follow-up</button>
 </div>
 </div>
 ) : (
 <button onClick={() => handleGenerateResponse(entry.id)} disabled={generating === entry.id} className="btn-primary" style={{ fontSize: '14px' }}>
 {generating === entry.id ? '🤖 Generating Response......' : '🤖 Generate AI ResponseAI'}
 </button>
 )}
 </div>
 ))
 )}
 </div>
 );
}

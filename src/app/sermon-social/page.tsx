'use client';
import { useState, useEffect } from 'react';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';

function getSupabase() {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
 const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
 const { createClient } = require('@supabase/supabase-js');
 return createClient(url, key);
}

interface SocialContent {
 facebook: { post: string };
 instagram: { caption: string; hashtags: string };
 twitter: { tweet: string };
}

export default function SermonSocialPage() {
 const [mounted, setMounted] = useState(false);
 const [mobile, setMobile] = useState(false);
 const [sermonNotes, setSermonNotes] = useState('');
 const [churchName, setChurchName] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [socialContent, setSocialContent] = useState<SocialContent | null>(null);
 const [copiedField, setCopiedField] = useState('');
 const [userId, setUserId] = useState<string>('');
 const [emailVerified, setEmailVerified] = useState(true);
 
 // Habit tracking state
 const [approvedPlatforms, setApprovedPlatforms] = useState<Set<string>>(new Set());
 const [editingPlatform, setEditingPlatform] = useState<string>('');
 const [editTexts, setEditTexts] = useState<Record<string, string>>({});
 const [recording, setRecording] = useState(false);

 // Template prefill state
 const [templateContent, setTemplateContent] = useState('');
 const [templateTitle, setTemplateTitle] = useState('');

 useEffect(() => {
 setMounted(true);
 const checkMobile = () => setMobile(window.innerWidth < 768);
 checkMobile();
 window.addEventListener('resize', checkMobile);

 // Check for template prefill from URL params
 const params = new URLSearchParams(window.location.search);
 const tc = params.get('templateContent');
 const tt = params.get('templateTitle');
 if (tc) {
 setTemplateContent(tc);
 setTemplateTitle(tt || '');
 // Parse template content and pre-fill sermon notes
 try {
 const parsed = JSON.parse(tc);
 if (parsed.outline) {
 setSermonNotes(typeof parsed.outline === 'string' ? parsed.outline : JSON.stringify(parsed.outline, null, 2));
 } else if (parsed.main_points) {
 setSermonNotes(typeof parsed.main_points === 'string' ? parsed.main_points : JSON.stringify(parsed.main_points, null, 2));
 } else if (parsed.sections) {
 setSermonNotes(typeof parsed.sections === 'string' ? parsed.sections : JSON.stringify(parsed.sections, null, 2));
 } else {
 setSermonNotes(tc);
 }
 } catch {
 setSermonNotes(tc);
 }
 }

 (async () => {
 try {
 const supabase = getSupabase();
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 setUserId(session.user.id);
 setEmailVerified(!!session.user.email_confirmed_at);
 // Load church name
 const { data: csData } = await supabase.from('church_settings').select('church_name').eq('user_id', session.user.id).single();
 if (csData?.church_name) setChurchName(csData.church_name);
 }
 } catch {}
 })();
 }, []);

 if (!mounted) return null;

 async function handleGenerate(e: React.FormEvent) {
 e.preventDefault();
 setError('');
 if (!emailVerified) { setError('Please verify your email first.'); return; }
 setLoading(true);
 setSocialContent(null);
 setApprovedPlatforms(new Set());
 setEditingPlatform('');
 setEditTexts({});

 try {
 const response = await fetch('/api/generate/sermon-social', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
 body: JSON.stringify({
 sermon_notes: sermonNotes,
 church_name: churchName,
 userId,
 template_content: templateContent || undefined,
 template_title: templateTitle || undefined,
 }),
 });
 const data = await response.json();
 if (response.status === 429) { throw new Error('Monthly AI generation limit reached! Upgrade your plan for more generations.'); }
 if (!response.ok) { throw new Error(data.error || 'Failed to generate social media content'); }
 setSocialContent(data);
 } catch (err: any) {
 setError(err.message || 'Something went wrong');
 } finally {
 setLoading(false);
 }
 }

 // Approve & Copy - the key habit signal
 async function handleApproveAndCopy(platform: string, text: string) {
 setRecording(true);
 try {
 await navigator.clipboard.writeText(text);
 setCopiedField(platform);
 setTimeout(() => setCopiedField(''), 2000);
 
 setApprovedPlatforms(prev => new Set([...prev, platform]));
 if (userId) {
 await fetch('/api/ai-habits', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 userId,
 action: 'approve',
 platform,
 originalText: text,
 toolType: 'sermon_social',
 }),
 });
 }
 } catch (e) {
 console.error('Approve error:', e);
 } finally {
 setRecording(false);
 }
 }

 // Edit then Approve - even stronger signal
 async function handleEditApprove(platform: string, originalText: string, editedText: string) {
 if (editedText.trim() === originalText.trim()) {
 handleApproveAndCopy(platform, editedText);
 return;
 }
 setRecording(true);
 try {
 await navigator.clipboard.writeText(editedText);
 setCopiedField(platform);
 setApprovedPlatforms(prev => new Set([...prev, platform]));
 setEditingPlatform('');
 if (userId) {
 await fetch('/api/ai-habits', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 userId,
 action: 'edit_approve',
 platform,
 originalText,
 editedText,
 toolType: 'sermon_social',
 }),
 });
 }
 } catch (e) {
 console.error('Edit approve error:', e);
 } finally {
 setRecording(false);
 }
 }

 // Reject and regenerate
 async function handleReject(platform: string, text: string) {
 if (userId) {
 await fetch('/api/ai-habits', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 userId,
 action: 'reject',
 platform,
 originalText: text,
 toolType: 'sermon_social',
 }),
 });
 }
 setLoading(true);
 try {
 const response = await fetch('/api/generate/sermon-social', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
 body: JSON.stringify({ sermon_notes: sermonNotes, church_name: churchName, userId, regenerate_platform: platform }),
 });
 const data = await response.json();
 if (response.ok && socialContent) {
 setSocialContent({
 ...socialContent,
 [platform]: data[platform] || socialContent[platform as keyof SocialContent],
 });
 }
 } catch (e) {
 console.error('Regenerate error:', e);
 } finally {
 setLoading(false);
 }
 }

 function handleReset() {
 setSocialContent(null);
 setSermonNotes('');
 setChurchName('');
 setError('');
 setApprovedPlatforms(new Set());
 setEditingPlatform('');
 setEditTexts({});
 setTemplateContent('');
 setTemplateTitle('');
 }

 function getTextForPlatform(platform: string): string {
 if (!socialContent) return '';
 switch (platform) {
 case 'facebook': return socialContent.facebook.post;
 case 'instagram': return `${socialContent.instagram.caption}\n\n${socialContent.instagram.hashtags}`;
 case 'twitter': return socialContent.twitter.tweet;
 default: return '';
 }
 }

 function renderContentCard(
 platform: string, 
 icon: string, 
 title: string, 
 color: string, 
 content: string,
 extraContent?: React.ReactNode
 ) {
 const isApproved = approvedPlatforms.has(platform);
 const isEditing = editingPlatform === platform;
 const editText = editTexts[platform] ?? content;
 return (
 <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
 {/* Header */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <h3 style={{ fontSize: '18px', fontWeight: 'bold', color }}>{icon} {title}</h3>
 {isApproved && <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 500 }}>✓ Copied</span>}
 </div>
 {/* Content - always non-selectable (use div when not editing, textarea when editing) */}
 {isEditing ? (
 <textarea
 value={editText}
 onChange={(e) => setEditTexts({ ...editTexts, [platform]: e.target.value })}
 style={{
 width: '100%', minHeight: mobile ? '100px' : '120px', padding: '12px',
 borderRadius: '8px', border: '1px solid #ddd',
 fontSize: '14px', lineHeight: '1.8', resize: 'vertical',
 fontFamily: 'inherit',
 }}
 />
 ) : (
 <div style={{
 minHeight: mobile ? '100px' : '120px',
 lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '14px',
 background: 'white',
 border: '1px solid var(--border)',
 borderRadius: '8px',
 padding: '12px',
 ...noSelectStyle,
 }} {...noSelectEvents}>
 {content}
 </div>
 )}
 {extraContent && (
 <div style={{ ...noSelectStyle }} {...noSelectEvents}>
 {extraContent}
 </div>
 )}
 {/* Action buttons */}
 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
 {!isApproved && !isEditing && (
 <>
 {/* Primary: Approve & Copy */}
 <button
 onClick={() => handleApproveAndCopy(platform, content)}
 disabled={recording}
 style={{
 flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
 background: '#1e3a5f', color: 'white', fontWeight: 600,
 fontSize: '13px', cursor: recording ? 'wait' : 'pointer',
 }}
 >
 {recording ? '...' : copiedField === platform ? '✓ Copied!' : '📋 Copy'}
 </button>
 {/* Edit first */}
 <button
 onClick={() => { setEditingPlatform(platform); setEditTexts({ ...editTexts, [platform]: content }); }}
 style={{
 padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd',
 background: 'white', color: '#333', fontSize: '13px', cursor: 'pointer',
 }}
 >
 ✏️ Edit
 </button>
 {/* Reject & retry */}
 <button
 onClick={() => handleReject(platform, content)}
 disabled={loading}
 style={{
 padding: '10px 16px', borderRadius: '8px', border: '1px solid #fee2e2',
 background: 'white', color: '#ef4444', fontSize: '13px', cursor: loading ? 'wait' : 'pointer',
 }}
 >
 🔄 Retry
 </button>
 </>
 )}
 {isEditing && (
 <>
 <button
 onClick={() => handleEditApprove(platform, content, editText)}
 disabled={recording}
 style={{
 flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
 background: '#22c55e', color: 'white', fontWeight: 600,
 fontSize: '13px', cursor: recording ? 'wait' : 'pointer',
 }}
 >
 {recording ? '...' : '✓ Save & Copy'}
 </button>
 <button
 onClick={() => { setEditingPlatform(''); setEditTexts({ ...editTexts, [platform]: '' }); }}
 style={{
 padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd',
 background: 'white', color: '#666', fontSize: '13px', cursor: 'pointer',
 }}
 >
 Cancel
 </button>
 </>
 )}
 {isApproved && (
 <button
 onClick={() => { navigator.clipboard.writeText(isEditing ? editText : content); setCopiedField(platform); setTimeout(() => setCopiedField(''), 2000); }}
 style={{
 padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd',
 background: 'white', color: '#333', fontSize: '13px', cursor: 'pointer',
 }}
 >
 {copiedField === platform ? '✓ Copied!' : '📋 Copy Again'}
 </button>
 )}
 </div>
 {/* Habit learning hint */}
 {!isApproved && (
 <div style={{ fontSize: '11px', color: '#999', borderTop: '1px solid #f0f0f0', paddingTop: '8px', ...noSelectStyle }} {...noSelectEvents}>
 💡 Copying tells AI you like this style — it learns your preferences over timeAI
 </div>
 )}
 </div>
 );
 }

 return (
 <div style={{ padding: mobile ? '16px' : '0' }}>
 <div style={{ marginBottom: mobile ? '20px' : '32px' }}>
 <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
 Sermon to Social Media
 </h1>
 <p style={{ color: 'var(--text-secondary)', fontSize: mobile ? '14px' : '16px' }}>
 Transform your sermon notes into engaging content. AI learns your style every time you approve.AI
 </p>
 </div>

 {/* Template indicator */}
 {templateContent && !socialContent && (
 <div style={{
 background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: '12px',
 padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between',
 alignItems: 'center',
 }}>
 <div>
 <span style={{ fontSize: '20px', marginRight: '8px' }}>📖</span>
 <strong style={{ color: '#1e3a5f' }}>Using Template:</strong>{' '}
 <span style={{ color: '#6366f1' }}>{templateTitle || 'Custom Template'}</span>
 <p style={{ color: '#999', fontSize: '13px', margin: '4px 0 0 0' }}>
 Template content has been pre-filled. AI will personalize it for your church.
 AI
 </p>
 </div>
 <button
 onClick={() => { setTemplateContent(''); setTemplateTitle(''); setSermonNotes(''); }}
 style={{ background: 'none', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', color: '#999' }}
 >
 Clear
 </button>
 </div>
 )}

 {error && (
 <div style={{ background: '#fee2e2', border: '1px solid var(--error)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--error)', fontSize: '14px' }}>
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
 <label className="form-label">
 Sermon Notes / Summary */summary
 {templateContent && <span style={{ color: '#6366f1', marginLeft: '8px', fontSize: '12px' }}>(Pre-filled from template)</span>}
 </label>
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
 {loading ? 'Generating......' : templateContent ? '🚀 Generate from Template' : 'Generate Social Media Posts'}
 </button>
 </form>
 </div>
 ) : (
 <div style={{ display: mobile ? 'block' : 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr', gap: mobile ? '16px' : '24px' }}>
 {renderContentCard(
 'facebook', '📘', 'Facebook Post', '#1877F2',
 socialContent.facebook.post
 )}
 {renderContentCard(
 'instagram', '📸', 'Instagram', '#E4405F',
 socialContent.instagram.caption,
 <p style={{ color: 'var(--secondary)', fontSize: '14px', margin: 0 }}>{socialContent.instagram.hashtags}</p>
 )}
 {renderContentCard(
 'twitter', '🐦', 'Twitter / X', '#000000',
 socialContent.twitter.tweet,
 <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
 {socialContent.twitter.tweet.length}/280 characters
 </div>
 )}
 <div style={{ gridColumn: mobile ? '1' : '1 / -1', textAlign: 'center' }}>
 <button onClick={handleReset} className="btn-primary">Create Another</button>
 </div>
 </div>
 )}
 </div>
 );
}

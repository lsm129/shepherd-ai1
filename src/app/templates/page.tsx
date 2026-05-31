'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';

interface Template {
 id: string;
 user_id: string;
 tool_type: string;
 input_summary: string;
 content: string;
 created_at: string;
 creator_name?: string;
 // Parsed from content JSON
 template_title?: string;
 template_description?: string;
 category?: string;
 usage_count?: number;
 avg_rating?: number;
}

const CATEGORIES = [
 { value: '', label: 'All Categories' },
 { value: 'holiday', label: '🎄 Holiday' },
 { value: 'topical', label: '💡 Topical' },
 { value: 'verse-by-verse', label: '📖 Verse-by-Verse' },
 { value: 'series', label: '📚 Series' },
 { value: 'special-occasion', label: '🎊 Special Occasion' },
];

const SORT_OPTIONS = [
 { value: 'popular', label: 'Most Popular' },
 { value: 'newest', label: 'Newest' },
];

export default function TemplatesPage() {
 const [mounted, setMounted] = useState(false);
 const [mobile, setMobile] = useState(false);
 const [templates, setTemplates] = useState<Template[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [category, setCategory] = useState('');
 const [sortBy, setSortBy] = useState('popular');
 const [userId, setUserId] = useState('');
 const [emailVerified, setEmailVerified] = useState(true);

 // Share template modal state
 const [showShareModal, setShowShareModal] = useState(false);
 const [userGenerations, setUserGenerations] = useState<any[]>([]);
 const [selectedGeneration, setSelectedGeneration] = useState<string>('');
 const [shareForm, setShareForm] = useState({
 template_title: '',
 template_description: '',
 category: 'topical',
 });
 const [sharing, setSharing] = useState(false);
 const [shareMessage, setShareMessage] = useState('');

 // Detail modal state
 const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
 const [usingTemplate, setUsingTemplate] = useState(false);

 const router = useRouter();

 useEffect(() => {
 setMounted(true);
 const checkMobile = () => setMobile(window.innerWidth < 768);
 checkMobile();
 window.addEventListener('resize', checkMobile);

 (async () => {
 try {
 const { createClient } = await import('@supabase/supabase-js');
 const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co');
 const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I');
 if (!supabaseUrl || !supabaseKey) return;
 const supabase = createClient(supabaseUrl, supabaseKey);
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 setUserId(session.user.id);
 setEmailVerified(!!session.user.email_confirmed_at);
 }
 } catch {}
 })();
 }, []);

 useEffect(() => {
 loadTemplates();
 }, [searchQuery, category, sortBy]);

 async function loadTemplates() {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 if (searchQuery) params.set('q', searchQuery);
 if (category) params.set('category', category);
 params.set('sort', sortBy);
 const res = await fetch(`/api/templates?${params.toString()}`);
 if (res.ok) {
 const data = await res.json();
 setTemplates(data.templates || []);
 }
 } catch (e) {
 console.error('Load templates error:', e);
 } finally {
 setLoading(false);
 }
 }

 async function loadUserGenerations() {
 try {
 const { createClient } = await import('@supabase/supabase-js');
 const supabase = createClient(((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co'), ((process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I'));
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) return;
 const { data } = await supabase
 .from('generations')
 .select('id, tool_type, input_summary, content, created_at')
 .eq('user_id', session.user.id)
 .in('tool_type', ['sermon_social', 'sermon_template'])
 .order('created_at', { ascending: false })
 .limit(20);
 setUserGenerations(data || []);
 } catch (e) {
 console.error('Load generations error:', e);
 }
 }

 async function handleShareTemplate() {
 if (!selectedGeneration) {
 setShareMessage('Please select a sermon to share');
 return;
 }
 if (!shareForm.template_title.trim()) {
 setShareMessage('Please enter a template title');
 return;
 }
 setSharing(true);
 setShareMessage('');
 try {
 const res = await fetch('/api/templates', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 userId,
 generationId: selectedGeneration,
 template_title: shareForm.template_title,
 template_description: shareForm.template_description,
 category: shareForm.category,
 }),
 });
 const data = await res.json();
 if (data.success) {
 setShareMessage('✅ Template shared! +50 points！+50points');
 setShareForm({ template_title: '', template_description: '', category: 'topical' });
 setSelectedGeneration('');
 loadTemplates();
 setTimeout(() => {
 setShowShareModal(false);
 setShareMessage('');
 }, 2000);
 } else {
 setShareMessage(data.error || 'Failed to share template');
 }
 } catch (e) {
 setShareMessage('Failed to share template');
 } finally {
 setSharing(false);
 }
 }

 function handleUseTemplate(template: Template) {
 // Redirect to sermon-social with template content pre-filled
 const templateContent = template.input_summary || '';
 const params = new URLSearchParams();
 params.set("templateContent", templateContent);
 params.set('templateTitle', template.template_title || '');
 router.push(`/sermon-social?${params.toString()}`);
 }

 if (!mounted) return null;

 // Email not verified
 if (!emailVerified) {
 return (
 <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
 <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
 <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
 <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Verify Your Email</h1>
 <p style={{ color: '#666', lineHeight: '1.6' }}>Please verify your email to access the Template Marketplace.</p>
 </div>
 </div>
 );
 }

 const getCategoryEmoji = (cat?: string) => {
 switch (cat) {
 case 'holiday': return '🎄';
 case 'topical': return '💡';
 case 'verse-by-verse': return '📖';
 case 'series': return '📚';
 case 'special-occasion': return '🎊';
 default: return '📝';
 }
 };

 const getCategoryLabel = (cat?: string) => {
 const found = CATEGORIES.find(c => c.value === cat);
 return found ? found.label : cat || 'General';
 };

 return (
 <div style={{ padding: mobile ? '16px' : '0' }}>
 {/* Header */}
 <div style={{ marginBottom: mobile ? '20px' : '32px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: mobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '12px' }}>
 <div>
 <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
 📖 Template Marketplace
 </h1>
 <p style={{ color: 'var(--text-secondary)', fontSize: mobile ? '14px' : '16px', fontStyle: 'italic' }}>
 &quot;Your sermons blessed hundreds. Now let them bless thousands.&quot;
 </p>
 <p style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>
 
 </p>
 </div>
 <button
 onClick={() => { setShowShareModal(true); loadUserGenerations(); }}
 style={{
 background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px',
 padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
 boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
 }}
 >
 ✨ Share Your Gift
 </button>
 </div>
 </div>

 {/* Search & Filters */}
 <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search templates......"
 style={{
 flex: 1, minWidth: '200px', padding: '12px 16px', borderRadius: '12px',
 border: '1px solid #ddd', fontSize: '14px', outline: 'none',
 }}
 />
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value)}
 style={{
 padding: '12px 16px', borderRadius: '12px', border: '1px solid #ddd',
 fontSize: '14px', background: 'white', cursor: 'pointer',
 }}
 >
 {CATEGORIES.map(c => (
 <option key={c.value} value={c.value}>{c.label}</option>
 ))}
 </select>
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 style={{
 padding: '12px 16px', borderRadius: '12px', border: '1px solid #ddd',
 fontSize: '14px', background: 'white', cursor: 'pointer',
 }}
 >
 {SORT_OPTIONS.map(s => (
 <option key={s.value} value={s.value}>{s.label}</option>
 ))}
 </select>
 </div>

 {/* Templates Grid */}
 {loading ? (
 <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
 <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
 <p>Loading templates......</p>
 </div>
 ) : templates.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '60px 0' }}>
 <div style={{ fontSize: '60px', marginBottom: '16px' }}>📖</div>
 <h3 style={{ color: '#1e3a5f', marginBottom: '8px' }}>No templates found</h3>
 <p style={{ color: '#999', marginBottom: '20px' }}>Be the first to share your gift!</p>
 <button
 onClick={() => { setShowShareModal(true); loadUserGenerations(); }}
 style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
 >
 ✨ Share Your Gift
 </button>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
 {templates.map((template) => {
 const parsed = (() => {
 try {
 return JSON.parse(template.input_summary || '{}');
 } catch { return {}; }
 })();
 const title = template.template_title || parsed.template_title || 'Untitled Template';
 const desc = template.template_description || parsed.template_description || '';
 const cat = template.category || parsed.category || '';
 const usage = template.usage_count ?? parsed.usage_count ?? 0;
 const rating = template.avg_rating ?? parsed.avg_rating ?? 0;
 const creatorName = template.creator_name || 'A Fellow Pastor';

 return (
 <div
 key={template.id}
 className="dashboard-card"
 style={{ cursor: 'pointer', position: 'relative' }}
 onClick={() => setSelectedTemplate(template)}
 >
 {/* Category badge */}
 <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
 <span style={{
 background: '#f0f4ff', color: '#1e3a5f', borderRadius: '20px',
 padding: '4px 12px', fontSize: '12px', fontWeight: 600,
 }}>
 {getCategoryEmoji(cat)} {getCategoryLabel(cat)}
 </span>
 </div>

 <div style={{ marginBottom: '12px' }}>
 <span style={{ fontSize: '36px' }}>{getCategoryEmoji(cat)}</span>
 </div>

 <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f', paddingRight: '80px' }}>
 {title}
 </h3>

 <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
 {desc}
 </p>

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
 <div style={{ fontSize: '13px', color: '#999' }}>
 👤 {creatorName}
 </div>
 <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#999' }}>
 <span>👥 {usage}</span>
 {rating > 0 && <span>⭐ {rating.toFixed(1)}</span>}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Inspirational CTA at bottom */}
 <div style={{
 background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)',
 borderRadius: '16px', padding: mobile ? '20px' : '32px',
 textAlign: 'center', border: '1px dashed #c7d2fe', marginBottom: '24px',
 }}>
 <span style={{ fontSize: '40px' }}>✨</span>
 <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>
 Bless Others With Your Wisdom
 </h3>
 <p style={{ color: '#666', marginBottom: '16px' }}>
 Share a sermon template and earn 50 points. Your outline could help a fellow pastor prepare their Sunday message.
 </p>
 <p style={{ color: '#999', fontSize: '13px', marginBottom: '16px' }}>
 50points。Your outline can help other pastors prepare Sunday messages。
 </p>
 <button
 onClick={() => { setShowShareModal(true); loadUserGenerations(); }}
 style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
 >
 ✨ Share Your Gift
 </button>
 </div>

 {/* Share Template Modal */}
 {showShareModal && (
 <div style={{
 position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
 background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
 justifyContent: 'center', zIndex: 1000, padding: '16px',
 }}>
 <div style={{
 background: 'white', borderRadius: '16px', padding: mobile ? '20px' : '32px',
 maxWidth: '560px', width: '100%', maxHeight: '90vh', overflow: 'auto',
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
 <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f' }}>
 ✨ Share Your Gift
 </h2>
 <button onClick={() => { setShowShareModal(false); setShareMessage(''); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
 </div>

 <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
 Select one of your past sermons to share as a template. You&apos;ll earn <strong>50 points</strong> for sharing!
 </p>
 <p style={{ color: '#999', fontSize: '13px', marginBottom: '20px' }}>
 <strong>50points</strong>！
 </p>

 {/* Select generation */}
 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>
 Select a Sermon
 </label>
 {userGenerations.length === 0 ? (
 <p style={{ color: '#999', fontSize: '13px' }}>No past sermons found. Generate some first!</p>
 ) : (
 <select
 value={selectedGeneration}
 onChange={(e) => setSelectedGeneration(e.target.value)}
 style={{
 width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
 fontSize: '14px', background: 'white',
 }}
 >
 <option value="">-- Select --</option>
 {userGenerations.map((g) => (
 <option key={g.id} value={g.id}>
 {g.input_summary?.substring(0, 60) || g.tool_type} ({new Date(g.created_at).toLocaleDateString()})
 </option>
 ))}
 </select>
 )}
 </div>

 {/* Template Title */}
 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>
 Template Title *
 </label>
 <input
 type="text"
 value={shareForm.template_title}
 onChange={(e) => setShareForm({ ...shareForm, template_title: e.target.value })}
 placeholder="e.g., Christmas Eve Service Outline"
 style={{
 width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
 fontSize: '14px',
 }}
 />
 </div>

 {/* Template Description */}
 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>
 Description
 </label>
 <textarea
 value={shareForm.template_description}
 onChange={(e) => setShareForm({ ...shareForm, template_description: e.target.value })}
 placeholder="Describe what makes this template special, what Scripture it covers, etc."
 style={{
 width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px',
 border: '1px solid #ddd', fontSize: '14px', resize: 'vertical',
 }}
 />
 </div>

 {/* Category */}
 <div style={{ marginBottom: '20px' }}>
 <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>
 Category
 </label>
 <select
 value={shareForm.category}
 onChange={(e) => setShareForm({ ...shareForm, category: e.target.value })}
 style={{
 width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
 fontSize: '14px', background: 'white',
 }}
 >
 {CATEGORIES.filter(c => c.value).map(c => (
 <option key={c.value} value={c.value}>{c.label}</option>
 ))}
 </select>
 </div>

 {shareMessage && (
 <div style={{
 padding: '12px', borderRadius: '8px', marginBottom: '16px',
 background: shareMessage.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
 color: shareMessage.startsWith('✅') ? '#16a34a' : '#dc2626',
 fontSize: '14px',
 }}>
 {shareMessage}
 </div>
 )}

 <button
 onClick={handleShareTemplate}
 disabled={sharing || !selectedGeneration}
 style={{
 width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
 background: sharing ? '#ccc' : '#22c55e', color: 'white',
 fontSize: '16px', fontWeight: 600, cursor: sharing ? 'not-allowed' : 'pointer',
 }}
 >
 {sharing ? 'Sharing......' : '✨ Share & Earn 50 Points50points'}
 </button>
 </div>
 </div>
 )}

 {/* Template Detail Modal */}
 {selectedTemplate && (
 <div style={{
 position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
 background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
 justifyContent: 'center', zIndex: 1000, padding: '16px',
 }}>
 <div style={{
 background: 'white', borderRadius: '16px', padding: mobile ? '20px' : '32px',
 maxWidth: '640px', width: '100%', maxHeight: '90vh', overflow: 'auto',
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
 <div>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '4px' }}>
 {selectedTemplate.template_title || 'Untitled Template'}
 </h2>
 <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#999', flexWrap: 'wrap' }}>
 <span>{getCategoryEmoji(selectedTemplate.category)} {getCategoryLabel(selectedTemplate.category)}</span>
 <span>👥 {selectedTemplate.usage_count ?? 0} uses</span>
 {selectedTemplate.avg_rating ? <span>⭐ {selectedTemplate.avg_rating.toFixed(1)}</span> : null}
 <span>👤 {selectedTemplate.creator_name || 'A Fellow Pastor'}</span>
 </div>
 </div>
 <button onClick={() => setSelectedTemplate(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
 </div>

 {selectedTemplate.template_description && (
 <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>
 {selectedTemplate.template_description}
 </p>
 )}

 {/* Template Content - protected with noSelect */}
 <div
 style={{
 background: '#f8fafc', borderRadius: '12px', padding: '20px',
 marginBottom: '24px', border: '1px solid #e2e8f0',
 lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '14px',
 color: '#334155', maxHeight: '400px', overflow: 'auto',
 ...noSelectStyle,
 }}
 {...noSelectEvents}
 >
 {(() => {
 try {
 const parsed = JSON.parse(selectedTemplate.input_summary || '{}');
 if (parsed.outline || parsed.sections || parsed.main_points) {
 return (
 <div>
 {parsed.scripture && <div style={{ marginBottom: '12px' }}><strong>Scripture:</strong> {parsed.scripture}</div>}
 {parsed.theme && <div style={{ marginBottom: '12px' }}><strong>Theme:</strong> {parsed.theme}</div>}
 {parsed.outline && <div style={{ marginBottom: '12px' }}><strong>Outline:</strong>{'\n'}{typeof parsed.outline === 'string' ? parsed.outline : JSON.stringify(parsed.outline, null, 2)}</div>}
 {parsed.main_points && <div style={{ marginBottom: '12px' }}><strong>Main Points:</strong>{'\n'}{typeof parsed.main_points === 'string' ? parsed.main_points : JSON.stringify(parsed.main_points, null, 2)}</div>}
 {parsed.sections && <div style={{ marginBottom: '12px' }}><strong>Sections:</strong>{'\n'}{typeof parsed.sections === 'string' ? parsed.sections : JSON.stringify(parsed.sections, null, 2)}</div>}
 {parsed.conclusion && <div><strong>Conclusion:</strong> {parsed.conclusion}</div>}
 </div>
 );
 }
 return JSON.stringify(parsed, null, 2);
 } catch {
 return selectedTemplate.input_summary || 'No content';
 }
 })()}
 </div>

 <div style={{ display: 'flex', gap: '12px' }}>
 <button
 onClick={() => handleUseTemplate(selectedTemplate)}
 disabled={usingTemplate}
 style={{
 flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
 background: '#1e3a5f', color: 'white', fontSize: '16px', fontWeight: 600,
 cursor: usingTemplate ? 'wait' : 'pointer',
 }}
 >
 {usingTemplate ? 'Loading...' : '🚀 Use This Template'}
 </button>
 <button
 onClick={() => setSelectedTemplate(null)}
 style={{
 padding: '14px 20px', borderRadius: '12px', border: '1px solid #ddd',
 background: 'white', color: '#666', fontSize: '14px', cursor: 'pointer',
 }}
 >
 Close
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

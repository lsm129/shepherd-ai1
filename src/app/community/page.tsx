'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { usePlan, canAccess } from '@/lib/plan-gate';


interface CommunityPost {
 id: string;
 user_id: string;
 input_summary: string;
 content: string;
 created_at: string;
 title: string;
 body: string;
 category: string;
 tags: string[];
 likes: number;
 views: number;
 author_name: string;
 church_name: string;
 liked_by: string[];
}

const CATEGORIES = [
 { value: '', label: 'All' },
 { value: 'ministry-tips', label: '💡 Ministry Tips' },
 { value: 'leadership', label: '👑 Leadership' },
 { value: 'outreach', label: '🤝 Outreach' },
 { value: 'worship', label: '🎵 Worship' },
 { value: 'youth', label: '🧒 Youth Ministry' },
 { value: 'tech', label: '💻 Church Tech' },
 { value: 'pastor-care', label: '❤️ Pastor Care' },
 { value: 'testimony', label: '🌟 Testimony' },
 { value: 'general', label: '📝 General' },
];

const SORT_OPTIONS = [
 { value: 'popular', label: 'Most Helpful' },
 { value: 'newest', label: 'Newest' },
];

export default function CommunityPage() {
  const { plan } = usePlan();

 const [mounted, setMounted] = useState(false);
 const [mobile, setMobile] = useState(false);
 const [posts, setPosts] = useState<CommunityPost[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [category, setCategory] = useState('');
 const [sortBy, setSortBy] = useState('popular');
 const [userId, setUserId] = useState('');
 const [emailVerified, setEmailVerified] = useState(true);

 // New post modal
 const [showNewPost, setShowNewPost] = useState(false);
 const [newForm, setNewForm] = useState({ title: '', body: '', category: 'general', tags: '' });
 const [publishing, setPublishing] = useState(false);
 const [publishMsg, setPublishMsg] = useState('');

 // Detail modal
 const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

 const router = useRouter();

 useEffect(() => {
 setMounted(true);
 const checkMobile = () => setMobile(window.innerWidth < 768);
 checkMobile();
 window.addEventListener('resize', checkMobile);

 (async () => {
 try {
 const { createClient } = await import('@supabase/supabase-js');
 if (!supabaseUrl || !supabaseAnonKey) return;
 const supabase = createClient(supabaseUrl, supabaseAnonKey);
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 setUserId(session.user.id);
 setEmailVerified(!!session.user.email_confirmed_at);
 }
 } catch {}
 })();
 }, []);

 useEffect(() => { loadPosts(); }, [searchQuery, category, sortBy]);

 async function loadPosts() {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 if (searchQuery) params.set('q', searchQuery);
 if (category) params.set('category', category);
 params.set('sort', sortBy);
 const res = await fetch(`/api/community?${params.toString()}`);
 if (res.ok) {
 const data = await res.json();
 setPosts(data.posts || []);
 }
 } catch (e) {
 console.error('Load posts error:', e);
 } finally {
 setLoading(false);
 }
 }

 async function handlePublish() {
 if (!newForm.title.trim() || !newForm.body.trim()) {
 setPublishMsg('Title and content are required');
 return;
 }
 setPublishing(true);
 setPublishMsg('');
 try {
 const tags = newForm.tags.split(',').map(t => t.trim()).filter(Boolean);
 const res = await fetch('/api/community', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 userId,
 title: newForm.title,
 body: newForm.body,
 category: newForm.category,
 tags,
 }),
 });
 const data = await res.json();
 if (data.success) {
 setPublishMsg('✅ Published! +50 points');
 setNewForm({ title: '', body: '', category: 'general', tags: '' });
 loadPosts();
 setTimeout(() => { setShowNewPost(false); setPublishMsg(''); }, 2000);
 } else {
 setPublishMsg(data.error || 'Failed to publish');
 }
 } catch {
 setPublishMsg('Failed to publish');
 } finally {
 setPublishing(false);
 }
 }

 async function handleLike(post: CommunityPost) {
 if (!userId) return;
 const isLiked = post.liked_by?.includes(userId);
 try {
 const res = await fetch('/api/community', {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ userId, postId: post.id, action: isLiked ? 'unlike' : 'like' }),
 });
 if (res.ok) {
 const data = await res.json();
 if (data.success) {
 setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: data.likes, liked_by: isLiked ? (p.liked_by || []).filter(id => id !== userId) : [...(p.liked_by || []), userId] } : p));
 if (selectedPost?.id === post.id) {
 setSelectedPost(prev => prev ? { ...prev, likes: data.likes, liked_by: isLiked ? (prev.liked_by || []).filter(id => id !== userId) : [...(prev.liked_by || []), userId] } : prev);
 }
 }
 }
 } catch {}
 }

 async function handleView(post: CommunityPost) {
 try {
 await fetch('/api/community', {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ userId: userId || 'anonymous', postId: post.id, action: 'view' }),
 });
 } catch {}
 }

 async function handleDelete(postId: string) {
 if (!confirm('Delete this post?')) return;
 try {
 const res = await fetch(`/api/community?userId=${userId}&postId=${postId}`, { method: 'DELETE' });
 if (res.ok) {
 setPosts(prev => prev.filter(p => p.id !== postId));
 setSelectedPost(null);
 }
 } catch {}
 }

 function openDetail(post: CommunityPost) {
 setSelectedPost(post);
 handleView(post);
 }

 if (!mounted) return null;

 if (!emailVerified) {
 return (
 <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
 <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
 <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
 <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Verify Your Email</h1>
 <p style={{ color: '#666', lineHeight: '1.6' }}>Please verify your email to access the Community Knowledge Base.</p>
 </div>
 </div>
 );
 }

 const getCategoryEmoji = (cat?: string) => {
 const map: Record<string, string> = {
 'ministry-tips': '💡', leadership: '👑', outreach: '🤝', worship: '🎵',
 youth: '🧒', tech: '💻', 'pastor-care': '❤️', testimony: '🌟', general: '📝',
 };
 return map[cat || ''] || '📝';
 };

 const getCategoryLabel = (cat?: string) => {
 const found = CATEGORIES.find(c => c.value === cat);
 return found ? found.label : cat || 'General';
 };

 const timeAgo = (dateStr: string) => {
 const diff = Date.now() - new Date(dateStr).getTime();
 const mins = Math.floor(diff / 60000);
 if (mins < 60) return `${mins}m ago`;
 const hrs = Math.floor(mins / 60);
 if (hrs < 24) return `${hrs}h ago`;
 const days = Math.floor(hrs / 24);
 if (days < 30) return `${days}d ago`;
 return new Date(dateStr).toLocaleDateString();
 };

 return (
 <div style={{ padding: mobile ? '16px' : '0' }}>
 {/* Header */}
 <div style={{ marginBottom: mobile ? '20px' : '32px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: mobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '12px' }}>
 <div>
 <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
 🌍 Community Knowledge Base
 </h1>
 <p style={{ color: 'var(--text-secondary)', fontSize: mobile ? '14px' : '16px', fontStyle: 'italic' }}>
 "Iron sharpens iron" — Share what works, learn from others.
 </p>
 <p style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>
  </p>
 </div>
 {userId && (
 <button
 onClick={() => { if (!canAccess(plan, 'starter')) { setPublishMsg('🔒 Publishing requires Starter plan or higher. Upgrade to share your wisdom!'); return; } setShowNewPost(true); }}
 style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
 >
 ✍️ Share Wisdom
 </button>
 )}
 </div>
 </div>

 {/* Search & Filters */}
 <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
 <input
 type="text"
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 placeholder="Search tips, ideas, experiences...ideas, experiences..."
 style={{ flex: 1, minWidth: '200px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '14px' }}
 />
 <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '14px', background: 'white' }}>
 {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
 </select>
 <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '14px', background: 'white' }}>
 {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
 </select>
 </div>

 {/* Stats Bar */}
 <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
 <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '12px', padding: '16px 20px', flex: 1, minWidth: '140px' }}>
 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>{posts.length}</div>
 <div style={{ fontSize: '13px', color: '#666' }}>Posts</div>
 </div>
 <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '12px', padding: '16px 20px', flex: 1, minWidth: '140px' }}>
 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{posts.reduce((s, p) => s + (p.likes || 0), 0)}</div>
 <div style={{ fontSize: '13px', color: '#666' }}>Helpful</div>
 </div>
 <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)', borderRadius: '12px', padding: '16px 20px', flex: 1, minWidth: '140px' }}>
 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>+50</div>
 <div style={{ fontSize: '13px', color: '#666' }}>Points per post</div>
 </div>
 </div>

 {/* Posts List */}
 {loading ? (
 <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
 <div style={{ fontSize: '40px', marginBottom: '16px' }}>📖</div>
 Loading community wisdom...
 </div>
 ) : posts.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
 <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
 <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>
 Be the First to Share!
 </h3>
 <p style={{ color: '#666', marginBottom: '20px' }}>
 Your ministry experience can help another pastor. Share a tip, idea, or testimony.
 </p>
 <p style={{ color: '#999', fontSize: '13px' }}>
 Your experience can bless another ministry.
 </p>
 {userId && (
 <button
 onClick={() => { if (!canAccess(plan, 'starter')) { setPublishMsg('🔒 Publishing requires Starter plan or higher. Upgrade to share your wisdom!'); return; } setShowNewPost(true); }}
 style={{ marginTop: '16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
 >
 ✍️ Share Now
 </button>
 )}
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 {posts.map(post => {
 const isLiked = userId && post.liked_by?.includes(userId);
 return (
 <div
 key={post.id}
 onClick={() => openDetail(post)}
 style={{
 background: 'white', borderRadius: '16px', padding: mobile ? '16px' : '24px',
 border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s',
 }}
 onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#cbd5e1'; }}
 onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; }}
 >
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
 <div style={{ flex: 1 }}>
 <h3 style={{ fontSize: mobile ? '16px' : '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '6px', lineHeight: '1.4' }}>
 {getCategoryEmoji(post.category)} {post.title}
 </h3>
 <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#999', flexWrap: 'wrap' }}>
 <span>👤 {post.author_name}</span>
 {post.church_name && <span>⛪ {post.church_name}</span>}
 <span>📅 {timeAgo(post.created_at)}</span>
 </div>
 </div>
 </div>

 <p style={{ color: '#444', fontSize: '14px', lineHeight: '1.7', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
 {post.body}
 </p>

 {post.tags && post.tags.length > 0 && (
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
 {(post.tags || []).map((tag, i) => (
 <span key={i} style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '4px 10px', borderRadius: '20px' }}>
 #{tag}
 </span>
 ))}
 </div>
 )}

 <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#999', alignItems: 'center' }}>
 <button
 onClick={e => { e.stopPropagation(); handleLike(post); }}
 style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', color: isLiked ? '#ef4444' : '#999', fontWeight: isLiked ? 600 : 400 }}
 >
 {isLiked ? '❤️' : '🤍'} {post.likes}
 </button>
 <span>👁️ {post.views}</span>
 <span>{getCategoryLabel(post.category)}</span>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* New Post Modal */}
 {showNewPost && (
 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
 <div style={{ background: 'white', borderRadius: '16px', padding: mobile ? '20px' : '32px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
 <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f' }}>✍️ Share Your Wisdom</h2>
 <button onClick={() => { setShowNewPost(false); setPublishMsg(''); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
 </div>

 <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px', lineHeight: '1.6' }}>
 Share a ministry tip, leadership lesson, outreach idea, or anything that could bless another pastor. Earn <strong>50 points</strong> for sharing!
 </p>
 <p style={{ color: '#999', fontSize: '13px', marginBottom: '20px' }}>
 </p>

 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>
 Title *
 </label>
 <input
 type="text"
 value={newForm.title}
 onChange={e => setNewForm({ ...newForm, title: e.target.value })}
 placeholder="e.g., How I Grew Our Youth Group from 5 to 50"
 maxLength={200}
 style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
 />
 </div>

 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>
 Content *
 </label>
 <textarea
 value={newForm.body}
 onChange={e => setNewForm({ ...newForm, body: e.target.value })}
 placeholder="Share your experience, tips, or lessons learned. Be specific and practical — your insights could transform another pastor's ministry!"
 maxLength={10000}
 style={{ width: '100%', minHeight: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', lineHeight: '1.7' }}
 />
 <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
 {newForm.body.length} / 10,000
 </div>
 </div>

 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>
 Category
 </label>
 <select
 value={newForm.category}
 onChange={e => setNewForm({ ...newForm, category: e.target.value })}
 style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', background: 'white' }}
 >
 {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
 </select>
 </div>

 <div style={{ marginBottom: '20px' }}>
 <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>
 Tags (comma-separated)
 </label>
 <input
 type="text"
 value={newForm.tags}
 onChange={e => setNewForm({ ...newForm, tags: e.target.value })}
 placeholder="e.g., youth, growth, volunteer"
 style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
 />
 </div>

 {publishMsg && (
 <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: publishMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: publishMsg.startsWith('✅') ? '#16a34a' : '#dc2626', fontSize: '14px' }}>
 {publishMsg}
 </div>
 )}

 <button
 onClick={handlePublish}
 disabled={publishing}
 style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: publishing ? '#ccc' : '#22c55e', color: 'white', fontSize: '16px', fontWeight: 600, cursor: publishing ? 'not-allowed' : 'pointer' }}
 >
 {publishing ? 'Publishing...' : '✨ Publish & Earn 50 Points'}
 </button>
 </div>
 </div>
 )}

 {/* Detail Modal */}
 {selectedPost && (
 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
 <div style={{ background: 'white', borderRadius: '16px', padding: mobile ? '20px' : '32px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
 <div>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px', lineHeight: '1.4' }}>
 {getCategoryEmoji(selectedPost.category)} {selectedPost.title}
 </h2>
 <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#999', flexWrap: 'wrap' }}>
 <span>👤 {selectedPost.author_name}</span>
 {selectedPost.church_name && <span>⛪ {selectedPost.church_name}</span>}
 <span>📅 {new Date(selectedPost.created_at).toLocaleDateString()}</span>
 <span>👁️ {selectedPost.views} views</span>
 </div>
 </div>
 <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
 </div>

 {selectedPost.tags && selectedPost.tags.length > 0 && (
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
 {(selectedPost.tags || []).map((tag, i) => (
 <span key={i} style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '4px 10px', borderRadius: '20px' }}>
 #{tag}
 </span>
 ))}
 </div>
 )}

 <div
 style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0', lineHeight: '1.8', fontSize: '15px', color: '#334155', whiteSpace: 'pre-wrap', ...noSelectStyle }}
 {...noSelectEvents}
 >
 {selectedPost.body}
 </div>

 <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
 <button
 onClick={() => handleLike(selectedPost)}
 style={{ background: (selectedPost.liked_by?.includes(userId)) ? '#fef2f2' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: (selectedPost.liked_by?.includes(userId)) ? '#ef4444' : '#666', fontWeight: (selectedPost.liked_by?.includes(userId)) ? 600 : 400 }}
 >
 {(selectedPost.liked_by?.includes(userId)) ? '❤️' : '🤍'} Helpful ({selectedPost.likes})
 </button>
 {userId && selectedPost.user_id === userId && (
 <button
 onClick={() => handleDelete(selectedPost.id)}
 style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', color: '#dc2626' }}
 >
 🗑️ Delete
 </button>
 )}
 <button
 onClick={() => setSelectedPost(null)}
 style={{ marginLeft: 'auto', padding: '12px 20px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', color: '#666', fontSize: '14px', cursor: 'pointer' }}
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

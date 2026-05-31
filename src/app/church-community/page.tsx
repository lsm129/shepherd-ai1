'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  author_name: string;
  likes: number;
  liked_by: string[];
}

const CATEGORIES = [
  { value: 'announcement', label: '📢 Announcements', icon: '📢' },
  { value: 'devotional', label: '📖 Devotionals', icon: '📖' },
  { value: 'prayer', label: '🙏 Prayer Wall', icon: '🙏' },
  { value: 'event', label: '📅 Events', icon: '📅' },
  { value: 'sermon', label: '⛪ Sermon Notes', icon: '⛪' },
  { value: 'general', label: '💬 General', icon: '💬' },
];

export default function ChurchCommunityPage() {
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('pastor');
  const [plan, setPlan] = useState('free');
  const [churchName, setChurchName] = useState('');
  const [churchCode, setChurchCode] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', body: '', category: 'announcement' });
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
          const meta = session.user.user_metadata || {};
          setUserRole(meta.role || 'pastor');
          setChurchCode(meta.church_code || '');
          setChurchName(meta.church_name || '');
        }
        // Check plan
        try {
          const r = await fetch('/api/subscription?userId=' + session?.user?.id);
          const d = await r.json();
          setPlan(d.plan || 'free');
        } catch {}
        // Load church posts
        await loadPosts(session?.user?.id);
      } catch {}
    })();
  }, []);

  async function loadPosts(uid?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('scope', 'church');
      params.set('userId', uid || userId);
      const res = await fetch(`/api/community?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { if (mounted) loadPosts(); }, [category]);

  async function handlePublish() {
    if (!newForm.title.trim() || !newForm.body.trim()) { setPublishMsg('Title and content are required'); return; }
    setPublishing(true);
    setPublishMsg('');
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title: newForm.title, body: newForm.body, category: newForm.category, scope: 'church', churchCode }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishMsg('✅ Published to your church community!');
        setNewForm({ title: '', body: '', category: 'announcement' });
        loadPosts();
        setTimeout(() => { setShowNewPost(false); setPublishMsg(''); }, 2000);
      } else { setPublishMsg(data.error || 'Failed to publish'); }
    } catch { setPublishMsg('Failed to publish'); }
    setPublishing(false);
  }

  async function handleLike(post: Post) {
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
        }
      }
    } catch {}
  }

  function getCategoryIcon(cat?: string) {
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.icon : '💬';
  }

  function getCategoryLabel(cat?: string) {
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.label : cat || 'General';
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  if (!mounted) return null;

  // Growth plan check
  if (plan !== 'growth') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '48px', maxWidth: '500px', width: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⛪</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Church Private Community</h1>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '8px' }}>Your own church hub — announcements, devotionals, prayer wall, all in one place.</p>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>Connect your congregation. Build deeper engagement. Make your church stick.</p>
          <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>🔒 Available on Growth Plan</div>
            <div style={{ fontSize: '13px', color: '#78350f' }}>Unlimited AI + Church Private Community + Prayer Tap + more</div>
          </div>
          <Link href="/settings" style={{ background: '#1e3a5f', color: 'white', padding: '14px 32px', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', fontSize: '16px', display: 'inline-block' }}>Upgrade to Growth — $79/mo</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', borderRadius: '16px', padding: '32px', color: 'white', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>⛪ {churchName || 'My Church'} Community</h1>
        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '16px' }}>Your church, your people, your space. Everything in one place.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setCategory(category === cat.value ? '' : cat.value)} style={{ background: category === cat.value ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              {cat.icon} {cat.label.split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '12px', padding: '16px 20px', flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>{posts.filter(p => p.category === 'announcement').length}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Announcements</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '12px', padding: '16px 20px', flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{posts.filter(p => p.category === 'prayer').length}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Prayers</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)', borderRadius: '12px', padding: '16px 20px', flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>{posts.filter(p => p.category === 'devotional').length}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Devotionals</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #faf5ff, #e9d5ff)', borderRadius: '12px', padding: '16px 20px', flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b21a8' }}>{posts.reduce((s, p) => s + (p.likes || 0), 0)}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Amen</div>
        </div>
      </div>

      {/* Pastor: New Post Button */}
      {userRole === 'pastor' && (
        <button onClick={() => setShowNewPost(true)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px' }}>
          ✍️ Post to Church
        </button>
      )}

      {/* Posts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📖</div>
          Loading your church community...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛪</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Start Your Church Community</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Post your first announcement, devotional, or prayer. Your congregation will see it here.</p>
          {userRole === 'pastor' && (
            <button onClick={() => setShowNewPost(true)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              ✍️ Create First Post
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map(post => {
            const isLiked = userId && post.liked_by?.includes(userId);
            return (
              <div key={post.id} onClick={() => setSelectedPost(post)} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '6px' }}>{getCategoryIcon(post.category)} {post.title}</h3>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#999' }}>
                      <span>👤 {post.author_name}</span>
                      <span>📅 {timeAgo(post.created_at)}</span>
                    </div>
                  </div>
                </div>
                <p style={{ color: '#444', fontSize: '14px', lineHeight: '1.7', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.body}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#999', alignItems: 'center' }}>
                  <button onClick={e => { e.stopPropagation(); handleLike(post); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', color: isLiked ? '#ef4444' : '#999', fontWeight: isLiked ? 600 : 400 }}>
                    {isLiked ? '🙏' : '🤍'} {post.likes} Amen
                  </button>
                  <span>{getCategoryLabel(post.category)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={() => setShowNewPost(false)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f' }}>✍️ Post to {churchName || 'Your Church'}</h2>
              <button onClick={() => setShowNewPost(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Share an announcement, devotional, prayer request, or event with your congregation.</p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>Title *</label>
              <input type="text" value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} placeholder="e.g., Sunday Service Update" maxLength={200} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>Category</label>
              <select value={newForm.category} onChange={e => setNewForm({ ...newForm, category: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', background: 'white' }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#1e3a5f', fontSize: '14px' }}>Content *</label>
              <textarea value={newForm.body} onChange={e => setNewForm({ ...newForm, body: e.target.value })} placeholder="Write your announcement, devotional, or prayer here..." maxLength={10000} style={{ width: '100%', minHeight: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', lineHeight: '1.7' }} />
            </div>

            {publishMsg && <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: publishMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: publishMsg.startsWith('✅') ? '#16a34a' : '#dc2626', fontSize: '14px' }}>{publishMsg}</div>}

            <button onClick={handlePublish} disabled={publishing} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: publishing ? '#ccc' : '#1e3a5f', color: 'white', fontSize: '16px', fontWeight: 600, cursor: publishing ? 'not-allowed' : 'pointer' }}>
              {publishing ? 'Publishing...' : '✨ Publish to Church'}
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPost && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={() => setSelectedPost(null)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>{getCategoryIcon(selectedPost.category)} {selectedPost.title}</h2>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#999' }}>
                  <span>👤 {selectedPost.author_name}</span>
                  <span>📅 {new Date(selectedPost.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0', lineHeight: '1.8', fontSize: '15px', color: '#334155', whiteSpace: 'pre-wrap' }}>
              {selectedPost.body}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={() => handleLike(selectedPost)} style={{ background: selectedPost.liked_by?.includes(userId) ? '#fef2f2' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: selectedPost.liked_by?.includes(userId) ? '#ef4444' : '#666' }}>
                🙏 Amen ({selectedPost.likes})
              </button>
              <button onClick={() => setSelectedPost(null)} style={{ marginLeft: 'auto', padding: '12px 20px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', color: '#666', fontSize: '14px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

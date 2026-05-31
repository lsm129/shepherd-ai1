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

interface ChurchInfo {
  church_name: string;
  pastor_name: string;
  address: string;
  mission_statement: string;
  service_times: string;
  church_logo: string;
  website: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  denomination: string;
}

interface NearbyChurch {
  user_id: string;
  church_name: string;
  address: string;
  church_logo: string;
  denomination: string;
  referral_code: string;
}

const CATEGORIES = [
  { value: 'announcement', label: 'Announcements', icon: '📢' },
  { value: 'devotional', label: 'Devotionals', icon: '📖' },
  { value: 'prayer', label: 'Prayer Wall', icon: '🙏' },
  { value: 'event', label: 'Events', icon: '📅' },
  { value: 'sermon', label: 'Sermon Notes', icon: '⛪' },
  { value: 'general', label: 'General', icon: '💬' },
];

export default function ChurchCommunityPage() {
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('pastor');
  const [plan, setPlan] = useState('free');
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', body: '', category: 'announcement' });
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [nearbyChurches, setNearbyChurches] = useState<NearbyChurch[]>([]);
  const [showNearby, setShowNearby] = useState(false);

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
        if (!session) return;
        setUserId(session.user.id);
        const meta = session.user.user_metadata || {};
        setUserRole(meta.role || 'pastor');

        // Determine pastor ID
        let pastorId: string = session.user.id;
        if (meta.role === 'congregant') {
          const joined: string[] = meta.joined_churches || [];
          if (joined.length > 0) pastorId = joined[0];
        }

        // Check plan
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
        if (profile?.plan) setPlan(profile.plan);

        // Load church info
        const { data: cs } = await supabase.from('church_settings').select('*').eq('user_id', pastorId).single();
        if (cs) {
          setChurchInfo({
            church_name: cs.church_name || '', pastor_name: cs.pastor_name || '',
            address: cs.address || '', mission_statement: cs.mission_statement || '',
            service_times: cs.service_times || '', church_logo: cs.church_logo || '',
            website: cs.website || '', social_facebook: cs.social_facebook || '',
            social_instagram: cs.social_instagram || '', social_youtube: cs.social_youtube || '',
            denomination: cs.denomination || '',
          });
        }

        // Load posts
        const { data: postsData } = await supabase.from('church_community_posts').select('*').eq('church_user_id', pastorId).order('created_at', { ascending: false });
        if (postsData) setPosts(postsData);

        // Load nearby churches (same state)
        const addr = cs?.address || '';
        const stateMatch = (addr as string).match(/,\s*([A-Z]{2})\s/);
        const state = stateMatch ? stateMatch[1] : (meta.address_state || '');
        if (state) {
          const { data: nearbyData } = await supabase.from('church_settings').select('user_id, church_name, address, church_logo, denomination').neq('user_id', pastorId).ilike('address', `%${state}%`).limit(10);
          if (nearbyData) {
            const withCodes: NearbyChurch[] = [];
            for (const n of nearbyData) {
              const { data: ref } = await supabase.from('referrals').select('referral_code').eq('referrer_id', n.user_id).limit(1).single();
              withCodes.push({ user_id: n.user_id, church_name: n.church_name || '', address: n.address || '', church_logo: n.church_logo || '', denomination: n.denomination || '', referral_code: ref?.referral_code || '' });
            }
            setNearbyChurches(withCodes);
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handlePublish = async () => {
    if (!newForm.title.trim() || !newForm.body.trim()) return;
    setPublishing(true); setPublishMsg('');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      let pastorId: string = session.user.id;
      if (session.user.user_metadata?.role === 'congregant') {
        const joined: string[] = session.user.user_metadata.joined_churches || [];
        if (joined.length > 0) pastorId = joined[0];
      }
      const { error } = await supabase.from('church_community_posts').insert({
        church_user_id: pastorId, user_id: session.user.id,
        title: newForm.title, body: newForm.body, category: newForm.category,
        author_name: session.user.user_metadata?.pastor_name || session.user.user_metadata?.full_name || session.user.email || 'Anonymous',
        likes: 0, liked_by: [],
      });
      if (error) throw error;
      setNewForm({ title: '', body: '', category: 'announcement' }); setShowNewPost(false); setPublishMsg('Published!');
      const { data: postsData } = await supabase.from('church_community_posts').select('*').eq('church_user_id', pastorId).order('created_at', { ascending: false });
      if (postsData) setPosts(postsData);
      setTimeout(() => setPublishMsg(''), 3000);
    } catch (e) { setPublishMsg('Failed to publish'); }
    finally { setPublishing(false); }
  };

  const handleAmen = async (post: Post) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const alreadyLiked = (post.liked_by || []).includes(userId);
      const newLikedBy = alreadyLiked ? (post.liked_by || []).filter((id: string) => id !== userId) : [...(post.liked_by || []), userId];
      await supabase.from('church_community_posts').update({ likes: newLikedBy.length, liked_by: newLikedBy }).eq('id', post.id);
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes: newLikedBy.length, liked_by: newLikedBy } : p));
      if (selectedPost?.id === post.id) setSelectedPost({ ...selectedPost, likes: newLikedBy.length, liked_by: newLikedBy });
    } catch (e) {}
  };

  if (!mounted) return null;

  // Non-Growth upgrade prompt
  if (plan !== 'growth' && userRole === 'pastor') {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>⛪ My Church Community</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your private congregation hub</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏘️</div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>Unlock Your Private Church Community</h2>
          <p style={{ color: '#666', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>Give your members a private space to connect, share prayer requests, and stay engaged.</p>
          <ul style={{ textAlign: 'left', maxWidth: '360px', margin: '0 auto 24px', listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>📢 Post announcements, devotionals, and events</li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>🙏 Prayer wall with Amen button</li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>📍 Church profile with logo, address, and service times</li>
            <li style={{ padding: '8px 0' }}>🔍 Members discover your church by location</li>
          </ul>
          <Link href="/settings" className="btn-primary" style={{ display: 'inline-block', padding: '12px 32px', fontSize: '16px' }}>Upgrade to Growth — $79/mo →</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading your community...</div>;

  const filteredPosts = category ? posts.filter(p => p.category === category) : posts;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>⛪ {churchInfo?.church_name || 'My Church Community'}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your private congregation hub</p>
      </div>

      {/* Church Profile Card */}
      {churchInfo && (
        <div className="card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90a4 100%)', padding: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
            {churchInfo.church_logo ? (
              <img src={churchInfo.church_logo} alt="Church Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>⛪</div>
            )}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>{churchInfo.church_name}</h2>
              {churchInfo.pastor_name && <p style={{ opacity: 0.9, fontSize: '14px' }}>Pastor: {churchInfo.pastor_name}</p>}
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            {churchInfo.mission_statement && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>📜 Our Mission</div>
                <p style={{ color: '#555', fontSize: '14px', fontStyle: 'italic' }}>&ldquo;{churchInfo.mission_statement}&rdquo;</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px' }}>
              {churchInfo.address && <div>📍 {churchInfo.address}</div>}
              {churchInfo.website && <a href={churchInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f' }}>🌐 Website</a>}
              {churchInfo.social_facebook && <a href={churchInfo.social_facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f' }}>Facebook</a>}
              {churchInfo.social_instagram && <a href={churchInfo.social_instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f' }}>Instagram</a>}
              {churchInfo.social_youtube && <a href={churchInfo.social_youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f' }}>YouTube</a>}
            </div>
            {churchInfo.service_times && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>⏰ Service Times</div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, color: '#555' }}>{churchInfo.service_times}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nearby Churches */}
      {nearbyChurches.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <button onClick={() => setShowNearby(!showNearby)} className="btn-secondary" style={{ marginBottom: '12px' }}>
            {showNearby ? 'Hide' : 'Show'} Nearby Churches ({nearbyChurches.length})
          </button>
          {showNearby && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {nearbyChurches.map(nc => (
                <div key={nc.user_id} className="card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {nc.church_logo ? (
                    <img src={nc.church_logo} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>⛪</div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{nc.church_name}</div>
                    {nc.address && <div style={{ fontSize: '12px', color: '#888' }}>📍 {nc.address}</div>}
                    {nc.denomination && <div style={{ fontSize: '12px', color: '#888' }}>{nc.denomination}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Post */}
      {userRole === 'pastor' && (
        <div style={{ marginBottom: '16px' }}>
          {showNewPost ? (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '12px' }}>New Post</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setNewForm({ ...newForm, category: c.value })} style={{ padding: '6px 12px', borderRadius: '8px', border: newForm.category === c.value ? '2px solid #1e3a5f' : '1px solid #ddd', background: newForm.category === c.value ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', fontSize: '13px' }}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
              <input type="text" className="input" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} placeholder="Title" style={{ marginBottom: '8px' }} />
              <textarea className="input textarea" value={newForm.body} onChange={(e) => setNewForm({ ...newForm, body: e.target.value })} placeholder="Write your message..." style={{ minHeight: '100px', marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowNewPost(false)} className="btn-secondary">Cancel</button>
                <button onClick={handlePublish} className="btn-primary" disabled={publishing || !newForm.title.trim()}>{publishing ? 'Publishing...' : 'Publish'}</button>
              </div>
              {publishMsg && <div style={{ marginTop: '8px', fontSize: '13px', color: '#16a34a' }}>{publishMsg}</div>}
            </div>
          ) : (
            <button onClick={() => setShowNewPost(true)} className="btn-primary">+ New Post</button>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setCategory('')} style={{ padding: '6px 14px', borderRadius: '8px', border: !category ? '2px solid #1e3a5f' : '1px solid #ddd', background: !category ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', fontSize: '13px' }}>All</button>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)} style={{ padding: '6px 14px', borderRadius: '8px', border: category === c.value ? '2px solid #1e3a5f' : '1px solid #ddd', background: category === c.value ? 'rgba(30,58,95,0.05)' : 'white', cursor: 'pointer', fontSize: '13px' }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p>No posts yet. {userRole === 'pastor' ? 'Share your first announcement!' : 'Check back soon!'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredPosts.map(post => (
            <div key={post.id} className="card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setSelectedPost(post)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', padding: '3px 8px', borderRadius: '6px', background: '#f0f0f0' }}>
                  {CATEGORIES.find(c => c.value === post.category)?.icon} {CATEGORIES.find(c => c.value === post.category)?.label}
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '6px' }}>{post.title}</h3>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5 }}>{post.body.length > 150 ? post.body.substring(0, 150) + '...' : post.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                <button onClick={(e) => { e.stopPropagation(); handleAmen(post); }} style={{ background: (post.liked_by || []).includes(userId) ? '#fef3c7' : '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}>
                  🙏 Amen {(post.likes || 0) > 0 ? `(${post.likes})` : ''}
                </button>
                <span style={{ fontSize: '12px', color: '#999' }}>by {post.author_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }} onClick={() => setSelectedPost(null)}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', padding: '3px 8px', borderRadius: '6px', background: '#f0f0f0' }}>
                {CATEGORIES.find(c => c.value === selectedPost.category)?.icon} {CATEGORIES.find(c => c.value === selectedPost.category)?.label}
              </span>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{selectedPost.title}</h2>
            <p style={{ color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedPost.body}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <button onClick={() => handleAmen(selectedPost)} style={{ background: (selectedPost.liked_by || []).includes(userId) ? '#fef3c7' : '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                🙏 Amen {(selectedPost.likes || 0) > 0 ? `(${selectedPost.likes})` : ''}
              </button>
              <span style={{ fontSize: '13px', color: '#999' }}>by {selectedPost.author_name} · {new Date(selectedPost.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

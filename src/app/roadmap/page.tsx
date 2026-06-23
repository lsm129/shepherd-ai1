'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planned' | 'in_progress' | 'shipped';
  votes: number;
  userVoted: boolean;
}

const initialRoadmapItems: RoadmapItem[] = [
  {
    id: 'donation-tracking',
    title: 'Donation & Giving Tracking',
    description: 'Track online and offline donations, generate giving statements, and manage pledge campaigns.',
    category: 'Finance',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'financial-reports',
    title: 'Financial Reports & Budgeting',
    description: 'Auto-generate monthly/annual financial reports, set department budgets, and track expenses with AI insights.',
    category: 'Finance',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'member-attendance',
    title: 'Member Attendance & Check-in',
    description: 'Digital check-in for services and events, attendance trends, and automatic follow-up for absent members.',
    category: 'People',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'volunteer-management',
    title: 'Volunteer Scheduling & Management',
    description: 'Schedule volunteers for services and events, track serving hours, and send automatic reminders.',
    category: 'People',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'member-database',
    title: 'Member Directory & Profiles',
    description: 'Complete member database with contact info, family relationships, spiritual journey milestones, and notes.',
    category: 'People',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'small-groups',
    title: 'Small Group Management',
    description: 'Create and manage small groups, track attendance, assign leaders, and share resources within groups.',
    category: 'Community',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'event-calendar',
    title: 'Church Event Calendar & Registration',
    description: 'Public church calendar with event registration, ticketing, and automatic reminder emails.',
    category: 'Community',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'ai-sermon-assistant',
    title: 'AI Sermon Writing Assistant',
    description: 'Full sermon writing assistant with scripture research, illustration suggestions, and outline generation based on your style.',
    category: 'AI',
    status: 'in_progress',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'multilingual',
    title: 'Multi-language Support',
    description: 'Generate content in Spanish, Korean, Chinese, and other languages to serve diverse congregations.',
    category: 'AI',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
  {
    id: 'church-app',
    title: 'White-label Church App',
    description: 'Your own branded church app for iOS and Android — sermons, events, prayer, giving, all in one place.',
    category: 'Platform',
    status: 'planned',
    votes: 0,
    userVoted: false,
  },
];

const categoryColors: Record<string, string> = {
  Finance: '#10b981',
  People: '#6366f1',
  Community: '#f59e0b',
  AI: '#ec4899',
  Platform: '#0ea5e9',
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  planned: { label: 'Planned', color: '#6366f1', bg: '#eef2ff' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  shipped: { label: 'Shipped', color: '#10b981', bg: '#f0fdf4' },
};

export default function RoadmapPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [items, setItems] = useState<RoadmapItem[]>(initialRoadmapItems);
  const [filter, setFilter] = useState<string>('all');
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDesc, setSuggestionDesc] = useState('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        if (session) {
          const votedIds = JSON.parse(localStorage.getItem('roadmap_votes') || '[]');
          setItems(prev => prev.map(item => ({ ...item, userVoted: votedIds.includes(item.id) })));
        }
        const storedVotes = JSON.parse(localStorage.getItem('roadmap_vote_counts') || '{}');
        if (Object.keys(storedVotes).length > 0) {
          setItems(prev => prev.map(item => ({ ...item, votes: storedVotes[item.id] || 0 })));
        }
      } catch (e) {}
    }
    checkAuth();
  }, []);

  function handleVote(itemId: string) {
    if (!isLoggedIn) return;
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const newVoted = !item.userVoted;
          return { ...item, votes: newVoted ? item.votes + 1 : item.votes - 1, userVoted: newVoted };
        }
        return item;
      });
      const votedIds = updated.filter(i => i.userVoted).map(i => i.id);
      localStorage.setItem('roadmap_votes', JSON.stringify(votedIds));
      const voteCounts: Record<string, number> = {};
      updated.forEach(i => { voteCounts[i.id] = i.votes; });
      localStorage.setItem('roadmap_vote_counts', JSON.stringify(voteCounts));
      return updated;
    });
  }

  function handleSuggestionSubmit() {
    if (!suggestionTitle.trim() || !isLoggedIn) return;
    setSuggestionSubmitted(true);
    setSuggestionTitle('');
    setSuggestionDesc('');
    setTimeout(() => setSuggestionSubmitted(false), 3000);
  }

  const filteredItems = filter === 'all' ? items : items.filter(i => i.category === filter);
  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <nav style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="/" className="nav-link">Home</a>
            <a href="/#pricing" className="nav-link">Pricing</a>
            <a href="/faq" className="nav-link">FAQ</a>
            <a href="/roadmap" className="nav-link" style={{ color: '#1e3a5f', fontWeight: '700' }}>Roadmap</a>
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Dashboard</Link>
            ) : (
              <Link href="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started Free</Link>
            )}
          </div>
        </div>
      </nav>

      <section style={{ padding: '80px 0 40px', textAlign: 'center', background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="page-container">
          <div className="badge badge-primary" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px' }}>Product Roadmap</div>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>Shape the Future of ShepherdAI</h1>
          <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>Vote on features you need most. Your voice directly influences what we build next.</p>
        </div>
      </section>

      <section style={{ padding: '0 0 32px' }}>
        <div className="page-container">
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '8px 20px', borderRadius: '20px', border: filter === cat ? '2px solid #1e3a5f' : '2px solid #e2e8f0', background: filter === cat ? '#1e3a5f' : 'white', color: filter === cat ? 'white' : '#666', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}>
                {cat === 'all' ? 'All Features' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 60px' }}>
        <div className="page-container" style={{ maxWidth: '800px' }}>
          {filteredItems.map(item => {
            const status = statusConfig[item.status];
            return (
              <div key={item.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', alignItems: 'flex-start', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1e3a5f'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(30,58,95,0.08)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div style={{ textAlign: 'center', minWidth: '64px' }}>
                  <button onClick={() => handleVote(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '12px', border: item.userVoted ? '2px solid #1e3a5f' : '2px solid #e2e8f0', background: item.userVoted ? '#eef2ff' : 'white', cursor: isLoggedIn ? 'pointer' : 'default', transition: 'all 0.2s', minWidth: '60px' }}>
                    <span style={{ fontSize: '16px', color: item.userVoted ? '#1e3a5f' : '#999' }}>▲</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: item.userVoted ? '#1e3a5f' : '#666' }}>{item.votes}</span>
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f', margin: 0 }}>{item.title}</h3>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: status.bg, color: status.color }}>{status.label}</span>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: `${categoryColors[item.category]}15`, color: categoryColors[item.category] }}>{item.category}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', margin: 0 }}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: '60px 0', background: '#f8fafc' }}>
        <div className="page-container" style={{ maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Have a Feature Idea?</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>Tell us what you need. We build for pastors, not investors.</p>
          </div>
          {suggestionSubmitted && (
            <div style={{ background: '#f0fdf4', border: '1px solid #10b981', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#15803d', textAlign: 'center' }}>✅ Thank you! Your suggestion has been submitted.</div>
          )}
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>Feature Title *</label>
              <input type="text" value={suggestionTitle} onChange={(e) => setSuggestionTitle(e.target.value)} placeholder="e.g., Online Giving Integration" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>Description</label>
              <textarea value={suggestionDesc} onChange={(e) => setSuggestionDesc(e.target.value)} placeholder="Describe what you'd like this feature to do..." style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', minHeight: '100px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <button onClick={handleSuggestionSubmit} disabled={!isLoggedIn || !suggestionTitle.trim()} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: (!isLoggedIn || !suggestionTitle.trim()) ? '#e2e8f0' : '#1e3a5f', color: (!isLoggedIn || !suggestionTitle.trim()) ? '#999' : 'white', border: 'none', fontSize: '16px', fontWeight: '600', cursor: (!isLoggedIn || !suggestionTitle.trim()) ? 'not-allowed' : 'pointer' }}>
              {!isLoggedIn ? 'Log in to Suggest' : 'Submit Suggestion'}
            </button>
          </div>
        </div>
      </section>

            <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>© 2026 ShepherdAI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</a>
            <a href="/privacy" style={{ color: '#999', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#999', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/contact" style={{ color: '#999', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

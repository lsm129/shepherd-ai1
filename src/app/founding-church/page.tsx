'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export default function FoundingChurchPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [userPlan, setUserPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    churchName: '',
    cityState: '',
    congregationSize: '',
    currentTools: [] as string[],
    weeklyContentHours: '',
    podcastYoutubeUrl: '',
    willingToShare: true,
    biggestNeed: '',
  });

  const sizeOptions = ['< 50', '50 - 200', '200 - 500', '500 - 1000', '1000+'];
  const hoursOptions = ['< 2 hours', '2 - 5 hours', '5 - 10 hours', '10+ hours'];
  const toolOptions = [
    'Planning Center',
    'Church Community Builder',
    'Subsplash',
    'Tithe.ly',
    'None — just spreadsheets/paper',
    'Other',
  ];

  useEffect(() => {
    setMounted(true);
    async function check() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        if (session) {
          const { data } = await supabase
            .from('founding_church_applications')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          if (data) {
            setExistingApp(data);
            setSubmitted(true);
          }
        }
      } catch (e) {}
    }
    check();
  }, []);

  function toggleTool(tool: string) {
    setForm(prev => ({
      ...prev,
      currentTools: prev.currentTools.includes(tool)
        ? prev.currentTools.filter(t => t !== tool)
        : [...prev.currentTools, tool],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    if (userPlan !== 'growth') {
      alert('This feature requires the Growth plan ($79/mo). Please upgrade to access the Founding Church Program.');
      return;
    }
    e.preventDefault();
    if (!isLoggedIn) return;
    setError('');
    setLoading(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in first.'); setLoading(false); return; }

      // Calculate score
      let score = 0;
      // Congregation size score
      const sizeIdx = sizeOptions.indexOf(form.congregationSize);
      if (sizeIdx >= 0) score += 5 + sizeIdx * 5; // 5,10,15,20,25
      // Weekly hours score
      const hoursIdx = hoursOptions.indexOf(form.weeklyContentHours);
      if (hoursIdx >= 0) score += [5, 15, 20, 25][hoursIdx];
      // Podcast/YT score
      if (form.podcastYoutubeUrl.trim()) score += 15;
      // Tools score
      if (form.currentTools.some(t => ['Planning Center', 'Church Community Builder', 'Subsplash', 'Tithe.ly'].includes(t))) score += 10;
      else if (form.currentTools.includes('None — just spreadsheets/paper')) score += 5;
      // Need alignment score
      const coreKeywords = ['email', 'follow-up', 'newsletter', 'announcement', 'devotional', 'sermon', 'content', 'social media', 'prayer'];
      const needLower = form.biggestNeed.toLowerCase();
      if (coreKeywords.some(k => needLower.includes(k))) score += 10; else score += 3;
      // Willing to share
      if (form.willingToShare) score += 5;

      const { error: insertError } = await supabase
        .from('founding_church_applications')
        .upsert({
          user_id: session.user.id,
          church_name: form.churchName,
          city_state: form.cityState,
          congregation_size: form.congregationSize,
          current_tools: form.currentTools.join(', '),
          weekly_content_hours: form.weeklyContentHours,
          podcast_youtube_url: form.podcastYoutubeUrl || null,
          willing_to_share: form.willingToShare,
          biggest_need: form.biggestNeed,
          score,
          status: 'pending',
        }, { onConflict: 'user_id' });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  // Already applied
  if (submitted && existingApp) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
        <nav style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
          <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </div>
        </nav>
        <div className="page-container" style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '48px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>Application Submitted!</h1>
            <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '8px' }}>
              Your church <strong>{existingApp.church_name}</strong> has been submitted for the Founding Church Program.
            </p>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
              Status: <span style={{ padding: '4px 12px', borderRadius: '12px', background: existingApp.status === 'approved' ? '#f0fdf4' : existingApp.status === 'active' ? '#eef2ff' : '#fffbeb', color: existingApp.status === 'approved' ? '#15803d' : existingApp.status === 'active' ? '#4338ca' : '#b45309', fontWeight: '600' }}>{existingApp.status === 'approved' ? '✅ Approved' : existingApp.status === 'active' ? '🟢 Active' : '⏳ Under Review'}</span>
            </p>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              We review applications weekly. You will receive an email when your application is approved.
            </p>
            <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 32px' }}>Go to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

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
            <a href="/roadmap" className="nav-link">Roadmap</a>
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Dashboard</Link>
            ) : (
              <Link href="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started Free</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 0 40px', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', color: 'white', textAlign: 'center' }}>
        <div className="page-container">
          <div style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '2px', marginBottom: '16px', color: '#f5a623' }}>LIMITED TO 10 CHURCHES</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 'bold', marginBottom: '16px' }}>Founding Church Program</h1>
          <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', opacity: 0.9 }}>
            Get ShepherdAI Pro — free for one full year. In return, share your experience to help us serve pastors better.
          </p>
        </div>
      </section>

      {/* Upgrade banner for non-Growth users */}
      {isLoggedIn && userPlan !== 'growth' && (
        <section style={{ padding: '0 16px', marginTop: '-20px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🔒</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold', color: '#92400e' }}>Growth Plan Required</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#78350f' }}>The Founding Church Program is exclusive to Growth plan members. Upgrade to unlock this feature + unlimited AI generations.</p>
            </div>
            <Link href="/dashboard" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }}>Upgrade Now</Link>
          </div>
        </section>
      )}

      {/* How it works */}
      <section style={{ padding: '60px 0', background: 'white' }}>
        <div className="page-container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '32px', textAlign: 'center' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { step: '1', title: 'Month 1: Explore Free', desc: 'Full Pro access. No strings attached. Use every feature, see the results.', icon: '🚀' },
              { step: '2', title: 'Month 2: Share Feedback', desc: 'Write a short usage review (200+ words). Tell us what worked, what didn\'t. Skip this? Your spot goes to the next church.', icon: '📝' },
              { step: '3', title: 'Month 3: Give Testimonial', desc: 'Write a recommendation + let us use your church name on our site. Skip? Your spot goes to the next church.', icon: '⭐' },
              { step: '4', title: 'Months 4-12: Stay Active', desc: 'Keep using ShepherdAI (5+ logins/month). Go inactive for 2 months? Spot goes to someone else.', icon: '💪' },
            ].map(item => (
              <div key={item.step} style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      {!isLoggedIn ? (
        <section style={{ padding: '60px 0', background: '#f8fafc', textAlign: 'center' }}>
          <div className="page-container" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>Apply Now</h2>
            <p style={{ color: '#666', marginBottom: '32px' }}>Create a free account first, then come back to apply.</p>
            <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: '16px' }}>Create Free Account</Link>
          </div>
        </section>
      ) : submitted ? (
        <section style={{ padding: '60px 0', background: '#f0fdf4', textAlign: 'center' }}>
          <div className="page-container">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', marginBottom: '16px' }}>Application Submitted!</h2>
            <p style={{ color: '#166534' }}>We review applications weekly. Check your email for updates.</p>
          </div>
        </section>
      ) : (
        <section style={{ padding: '60px 0', background: '#f8fafc' }}>
          <div className="page-container" style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px', textAlign: 'center' }}>Apply for Founding Church</h2>
            <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>Only 10 spots. Apply now to secure yours.</p>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#b91c1c' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0' }}>
              {/* Church Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>Church Name *</label>
                <input type="text" required value={form.churchName} onChange={e => setForm(p => ({...p, churchName: e.target.value}))} placeholder="e.g., Grace Community Church" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* City + State */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>City & State *</label>
                <input type="text" required value={form.cityState} onChange={e => setForm(p => ({...p, cityState: e.target.value}))} placeholder="e.g., Dallas, TX" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Congregation Size */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>Congregation Size *</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {sizeOptions.map(opt => (
                    <button key={opt} type="button" onClick={() => setForm(p => ({...p, congregationSize: opt}))} style={{ padding: '8px 16px', borderRadius: '20px', border: form.congregationSize === opt ? '2px solid #1e3a5f' : '2px solid #e2e8f0', background: form.congregationSize === opt ? '#1e3a5f' : 'white', color: form.congregationSize === opt ? 'white' : '#666', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* Current Tools */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>Current Church Management Tools (select all that apply)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {toolOptions.map(opt => (
                    <button key={opt} type="button" onClick={() => toggleTool(opt)} style={{ padding: '8px 14px', borderRadius: '20px', border: form.currentTools.includes(opt) ? '2px solid #1e3a5f' : '2px solid #e2e8f0', background: form.currentTools.includes(opt) ? '#eef2ff' : 'white', color: form.currentTools.includes(opt) ? '#1e3a5f' : '#666', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* Weekly Content Hours */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>Hours/week on content (emails, announcements, newsletters, etc.) *</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {hoursOptions.map(opt => (
                    <button key={opt} type="button" onClick={() => setForm(p => ({...p, weeklyContentHours: opt}))} style={{ padding: '8px 16px', borderRadius: '20px', border: form.weeklyContentHours === opt ? '2px solid #1e3a5f' : '2px solid #e2e8f0', background: form.weeklyContentHours === opt ? '#1e3a5f' : 'white', color: form.weeklyContentHours === opt ? 'white' : '#666', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* Podcast/YouTube */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>Podcast or YouTube Channel (optional)</label>
                <input type="url" value={form.podcastYoutubeUrl} onChange={e => setForm(p => ({...p, podcastYoutubeUrl: e.target.value}))} placeholder="https://..." style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Willing to share */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" id="willing" checked={form.willingToShare} onChange={e => setForm(p => ({...p, willingToShare: e.target.checked}))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="willing" style={{ fontSize: '14px', color: '#444', cursor: 'pointer' }}>I am willing to share my experience after 30 days *</label>
              </div>

              {/* Biggest Need */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', display: 'block' }}>What is the #1 problem you hope AI can solve for your ministry? *</label>
                <textarea required value={form.biggestNeed} onChange={e => setForm(p => ({...p, biggestNeed: e.target.value}))} placeholder="e.g., I spend 8 hours a week writing follow-up emails and newsletters..." style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', minHeight: '80px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              <button type="submit" disabled={userPlan !== 'growth' || loading || !form.churchName || !form.cityState || !form.congregationSize || !form.weeklyContentHours || !form.biggestNeed} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: (userPlan !== 'growth' || loading || !form.churchName || !form.cityState || !form.congregationSize || !form.weeklyContentHours || !form.biggestNeed) ? '#e2e8f0' : 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', color: (userPlan !== 'growth' || loading || !form.churchName || !form.cityState || !form.congregationSize || !form.weeklyContentHours || !form.biggestNeed) ? '#999' : 'white', border: 'none', fontSize: '16px', fontWeight: '600', cursor: (userPlan !== 'growth' || loading || !form.churchName || !form.cityState || !form.congregationSize || !form.weeklyContentHours || !form.biggestNeed) ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Submitting...' : 'Apply for Founding Church Program'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Footer */}
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

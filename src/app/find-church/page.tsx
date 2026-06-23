'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { cities, denominations } from '@/data/church-seo-data';

const navy = '#1e3a5f';
const blue = '#4a90a4';

function fmtCitySlug(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Group cities by state for the SEO listing
function groupedCities() {
  const map: Record<string, { stateFull: string; cities: typeof cities }> = {};
  for (const c of cities) {
    if (!map[c.state]) map[c.state] = { stateFull: c.stateFull, cities: [] };
    map[c.state].cities.push(c);
  }
  return Object.entries(map).sort(([, a], [, b]) => a.stateFull.localeCompare(b.stateFull));
}

interface ChurchItem {
  user_id: string;
  church_name: string;
  pastor_name: string;
  address: string;
  denomination: string;
  referral_code: string;
  church_logo: string;
}

export default function FindChurchPage() {
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [userId, setUserId] = useState('');
  const [joinedChurches, setJoinedChurches] = useState<string[]>([]);
  const [churches, setChurches] = useState<ChurchItem[]>([]);
  const [filtered, setFiltered] = useState<ChurchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    async function init() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        const meta = session.user.user_metadata || {};
        if (meta.role === 'pastor') { router.push('/dashboard'); return; }
        setUserId(session.user.id);
        setJoinedChurches(meta.joined_churches || []);

        // Fetch all churches with their referral codes
        const { data: churchData } = await supabase
          .from('church_settings')
          .select('user_id, church_name, pastor_name, address, denomination, church_logo')
          .not('church_name', 'is', null)
          .neq('church_name', '');

        if (churchData && churchData.length > 0) {
          // Fetch referral codes for each church
          const pastorIds = churchData.map((c: any) => c.user_id);
          const { data: refData } = await supabase
            .from('referrals')
            .select('referrer_id, referral_code')
            .in('referrer_id', pastorIds);

          const refMap: Record<string, string> = {};
          (refData || []).forEach((r: any) => { refMap[r.referrer_id] = r.referral_code; });

          const items: ChurchItem[] = churchData.map((c: any) => ({
            user_id: c.user_id,
            church_name: c.church_name || '',
            pastor_name: c.pastor_name || '',
            address: c.address || '',
            denomination: c.denomination || '',
            referral_code: refMap[c.user_id] || '',
            church_logo: c.church_logo || '',
          }));
          setChurches(items);
          setFiltered(items);
        }
      } catch (e) { console.error('Init error:', e); }
      setLoading(false);
    }
    init();
    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(churches);
      return;
    }
    const q = searchQuery.toLowerCase();
    const result = churches.filter(c =>
      c.church_name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.denomination.toLowerCase().includes(q) ||
      c.pastor_name.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [searchQuery, churches]);

  const handleJoin = async (church: ChurchItem) => {
    if (!userId) return;
    setJoiningId(church.user_id);
    setJoinResult(null);
    try {
      const body: any = { userId };
      if (church.referral_code) {
        body.referralCode = church.referral_code;
      } else {
        body.pastorId = church.user_id;
      }
      const res = await fetch('/api/join-church', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setJoinedChurches(prev => [...prev, church.user_id]);
        setJoinResult({ success: true, message: `Joined ${data.churchName}! +${data.userPoints} points` });
      } else {
        setJoinResult({ success: false, message: data.error || 'Failed to join' });
      }
    } catch (e) {
      setJoinResult({ success: false, message: 'Something went wrong' });
    }
    setJoiningId(null);
  };

  if (!mounted) return null;

  return (
    <div style={{ padding: mobile ? '16px' : '0' }}>
      {/* Header */}
      <div style={{ marginBottom: mobile ? '16px' : '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '4px' }}>
              ⛪ Find a Church
            </h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Discover and join churches near you
            </p>
          </div>
          <Link href="/member/dashboard" style={{ color: '#4a90a4', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: mobile ? '16px' : '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, city, state, or denomination"
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
              fontSize: '15px', outline: 'none', color: '#1a202c',
            }}
          />
        </div>
      </div>

      {/* Join Result Banner */}
      {joinResult && (
        <div style={{
          background: joinResult.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${joinResult.success ? '#86efac' : '#fca5a5'}`,
          borderRadius: '12px', padding: '16px', marginBottom: '16px',
          color: joinResult.success ? '#166534' : '#991b1b', fontSize: '14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{joinResult.message}</span>
          <button onClick={() => setJoinResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* Church List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⛪</div>
          <p>Loading churches...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No churches found</p>
          <p style={{ fontSize: '14px' }}>Try a different search term</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {filtered.map(church => {
            const isJoined = joinedChurches.includes(church.user_id);
            return (
              <div key={church.user_id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {church.church_logo ? (
                    <img src={church.church_logo} alt={church.church_name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e3a5f, #4a90a4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⛪</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f', marginBottom: '2px' }}>{church.church_name}</h3>
                    {church.pastor_name && <p style={{ fontSize: '13px', color: '#666' }}>Pastor: {church.pastor_name}</p>}
                  </div>
                </div>
                {church.address && (
                  <div style={{ fontSize: '13px', color: '#666' }}>📍 {church.address}</div>
                )}
                {church.denomination && (
                  <div style={{ fontSize: '13px', color: '#666' }}>🕊️ {church.denomination}</div>
                )}
                {church.referral_code && (
                  <div style={{ fontSize: '12px', color: '#999', fontFamily: 'monospace' }}>
                    Invite Code {church.referral_code}
                  </div>
                )}
                <div>
                  {isJoined ? (
                    <span style={{ display: 'inline-block', background: '#f0fdf4', color: '#16a34a', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                      ✓ Joined
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoin(church)}
                      disabled={joiningId === church.user_id}
                      style={{
                        background: joiningId === church.user_id ? '#e2e8f0' : '#1e3a5f',
                        color: joiningId === church.user_id ? '#999' : 'white',
                        border: 'none', padding: '10px 20px', borderRadius: '8px',
                        fontWeight: '600', fontSize: '14px', cursor: joiningId === church.user_id ? 'not-allowed' : 'pointer',
                        width: '100%',
                      }}
                    >
                      {joiningId === church.user_id ? 'Joining...' : 'Join Church'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SEO HUB: Browse churches by city – state‑grouped ── */}
      <section style={{ marginTop: 48 }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${navy}, #2d5a87)`,
            borderRadius: 16,
            padding: '40px 32px',
            marginBottom: 32,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            🏙️ Browse Churches by City
          </h2>
          <p style={{ fontSize: 15, opacity: 0.9, margin: 0 }}>
            Find churches by denomination in major US cities — free pastor & church finder
          </p>
        </div>

        {groupedCities().map(([stateAbbr, { stateFull, cities: stateCities }]) => (
          <div key={stateAbbr} style={{ marginBottom: 32 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: navy,
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: `2px solid ${blue}`,
              }}
            >
              {stateFull}
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}
            >
              {stateCities.map((city) => {
                const sampleSlug = denominations[0].slug;
                return (
                  <Link
                    key={city.city}
                    href={`/find-church/${city.state}/${city.city}/${sampleSlug}`}
                    style={{
                      display: 'block',
                      padding: '16px 20px',
                      background: 'white',
                      borderRadius: 10,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: '1px solid #e2e8f0',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: navy,
                        marginBottom: 4,
                      }}
                    >
                      Churches in {fmtCitySlug(city.city)}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {denominations.length} denominations · Pop {city.population}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Bottom hint */}
      <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px', color: '#999', fontSize: '13px' }}>
        <p>Can&apos;t find your church? Ask your pastor for their invite code!</p>
        <Link href="/member/dashboard" style={{ color: blue, textDecoration: 'none', fontWeight: '600' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* SEO Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'ShepherdAI Church Finder',
            url: 'https://shepherdai.com',
            description: 'Find churches by city and denomination in the United States. Free church finder for visitors and members.',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://shepherdai.com/find-church?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </div>
  );
}

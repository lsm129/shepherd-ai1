'use client';
import Link from 'next/link';

const resources = [
  {
    icon: '💰',
    title: 'Church Budget Template',
    desc: 'Generate a professional church budget worksheet with income and expense categories. Print or download instantly.',
    href: '/free-tools/church-budget-template',
    tag: 'AI-Powered',
    color: '#10b981',
  },
  {
    icon: '👋',
    title: 'Visitor Follow-Up Checklist',
    desc: 'A proven 6-week visitor follow-up plan with action items, scripts, and best practices. Print-ready.',
    href: '/free-tools/visitor-followup-checklist',
    tag: 'Free Download',
    color: '#8b5cf6',
  },
  {
    icon: '📰',
    title: 'Weekly Bulletin Template',
    desc: 'Create a beautiful weekly church bulletin with your service details, announcements, and scripture. AI-generated in seconds.',
    href: '/free-tools/weekly-bulletin-template',
    tag: 'AI-Powered',
    color: '#f59e0b',
  },
  {
    icon: '📢',
    title: 'Church Announcement Generator',
    desc: 'Generate polished church announcements for services, events, and special occasions in seconds.',
    href: '/free-tools/church-announcement',
    tag: 'AI-Powered',
    color: '#1e3a5f',
  },
];

export default function FreeResourcesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Header */}
      <div style={{ background: '#1e3a5f', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: '700' }}>
          ShepherdAI
        </Link>
        <Link href="/register" style={{ background: '#10b981', color: 'white', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          Sign Up Free
        </Link>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎁</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e3a5f', marginBottom: '12px', lineHeight: '1.2' }}>
            Free Church Resources & Templates
          </h1>
          <p style={{ fontSize: '17px', color: '#64748b', lineHeight: '1.6', maxWidth: '560px', margin: '0 auto' }}>
            Professional church tools — no sign-up required. Generate, customize, and download in seconds.
          </p>
        </div>
      </div>

      {/* Resource Cards */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 48px' }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          {resources.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              style={{
                display: 'block',
                background: 'white',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                textDecoration: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
                border: '1.5px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ fontSize: '40px', flexShrink: 0, width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: `${r.color}12` }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f', margin: 0 }}>{r.title}</h2>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: `${r.color}18`, color: r.color, letterSpacing: '0.02em' }}>
                      {r.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                    {r.desc}
                  </p>
                </div>
                <div style={{ flexShrink: 0, color: '#94a3b8', fontSize: '24px', alignSelf: 'center' }}>→</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', borderRadius: '16px', padding: '36px 28px', textAlign: 'center', color: 'white', marginTop: '36px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤖</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
            Want AI to do all of this automatically?
          </h2>
          <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '20px', lineHeight: '1.5' }}>
            ShepherdAI generates budgets, bulletins, follow-ups, devotionals, sermons, and more — all personalized for your church.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}
            >
              Start Free — No Credit Card
            </Link>
            <Link
              href="/pricing"
              style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600', fontSize: '16px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              See Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

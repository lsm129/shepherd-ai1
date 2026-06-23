import { Metadata } from 'next';
import Link from 'next/link';
import AuthCTA from '@/components/AuthCTA';

export const metadata: Metadata = {
  title: { absolute: 'Donation Management — ShepherdAI' },
  description: 'Track tithes, offerings, and donations with AI-powered giving statements, pledge campaigns, and donor reports. Built for churches and religious organizations.',
  alternates: { canonical: 'https://www.shepherdaitech.com/donation-management' },
};

const features = [
  {
    emoji: '💰',
    title: 'Donation & Tithe Tracking',
    desc: 'Record all types of giving — tithes, offerings, special donations, and building fund contributions. Categorize by fund, date, and payment method.',
  },
  {
    emoji: '📊',
    title: 'Giving Statements & Reports',
    desc: 'Auto-generate annual giving statements for your congregation. Monthly and yearly donation summaries with export to PDF.',
  },
  {
    emoji: '🎯',
    title: 'Pledge Campaigns',
    desc: 'Create and manage pledge campaigns. Set goals, track progress, and send automated reminders to help your church meet its financial targets.',
  },
  {
    emoji: '📋',
    title: 'Donor Management',
    desc: 'View complete giving history per member. Track recurring givers, lapsed donors, and first-time contributors — all in one dashboard.',
  },
  {
    emoji: '🔒',
    title: 'Secure & Compliant',
    desc: '256-bit AES encryption. Role-based access so only authorized staff see financial data. Full audit trail for every transaction.',
  },
  {
    emoji: '📈',
    title: 'Trend Analysis',
    desc: 'AI-powered insights into giving patterns. Spot seasonal trends, compare year-over-year, and get smart recommendations to grow generosity.',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Record Donations',
    desc: 'Log tithes, offerings, and special gifts by member, date, category, and payment method. Or let members give through your church community page.',
  },
  {
    step: 2,
    title: 'Track & Report',
    desc: 'View real-time dashboards. Generate giving statements with one click. Export reports for your finance team or board meetings.',
  },
  {
    step: 3,
    title: 'Grow Generosity',
    desc: 'Run pledge campaigns, track goals, and use AI insights to understand giving trends. ShepherdAI helps you steward resources wisely.',
  },
];

export default function DonationManagementPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          Donation Management
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 'bold', color: '#1e3a5f', lineHeight: 1.2, marginBottom: 16 }}>
          Track Every Tithe, Offering & Gift — Effortlessly
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 700, margin: '0 auto 24px', lineHeight: 1.7 }}>
          AI-powered donation management built for churches. Record giving, generate statements, run pledge campaigns, and understand your church&apos;s financial health — all from one place.
        </p>
        <AuthCTA
          featureHref="/church-accounting"
          style={{ display: 'inline-block', padding: '14px 32px', background: '#16a34a', color: 'white', borderRadius: 8, fontWeight: 600, marginRight: 12 }}
        >
          Start Tracking Donations →
        </AuthCTA>
        <Link
          href="#features"
          style={{ display: 'inline-block', padding: '14px 32px', background: 'white', color: '#1e3a5f', borderRadius: 8, fontWeight: 600, border: '1px solid #e2e8f0' }}
        >
          Explore Features ↓
        </Link>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>
          Everything for Church Giving
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
          Complete donation management — without the complexity or cost of enterprise software.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                padding: '32px 28px',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                background: 'white',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.emoji}</div>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 48 }}>
            How Donation Management Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {howItWorks.map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: '24px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#16a34a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    margin: '0 auto 20px',
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>
          Why ShepherdAI for Church Giving?
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
          Compare how ShepherdAI handles donation management vs. traditional church software.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#1e3a5f', fontWeight: 700 }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', background: '#f0fdf4', color: '#16a34a', fontWeight: 700, borderRadius: '8px 8px 0 0' }}>
                  ShepherdAI
                </th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>
                  Other ChMS
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Tithe & Offering Tracking', '✓ Included', '✓ Included'],
                ['Pledge Campaign Management', '✓ AI-Powered', 'Manual'],
                ['Auto Giving Statements', '✓ 1-Click', 'Manual setup'],
                ['Donor Giving History', '✓ Full dashboard', 'Limited'],
                ['AI Trend Analysis', '✓ Smart insights', '✗'],
                ['Export to PDF/Excel', '✓ Instant', 'Delayed'],
                ['Multi-Fund Tracking', '✓ Unlimited funds', 'Usually limited'],
                ['Starting Price', '$0', '$49-72/mo'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 500 }}>{row[0]}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>
                    {row[1]}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1e3a5f', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
          Ready to Simplify Your Church&apos;s Giving?
        </h2>
        <p style={{ fontSize: 18, color: '#cbd5e1', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Start tracking donations, generating statements, and running pledge campaigns — all with AI that works while you minister.
        </p>
        <AuthCTA
          featureHref="/church-accounting"
          style={{ display: 'inline-block', padding: '16px 40px', background: '#16a34a', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 18 }}
        >
          Start Your Free Account
        </AuthCTA>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 16 }}>✅ Free forever plan · 🔒 No credit card · ⚡ Setup in 2 minutes</p>
      </section>
    </>
  );
}

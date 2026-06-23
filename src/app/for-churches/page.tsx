import { Metadata } from 'next';
import Link from 'next/link';
import AuthCTA from '@/components/AuthCTA';

export const metadata: Metadata = {
  title: { absolute: 'Church Management Software for Religious Organizations — ShepherdAI' },
  description: 'AI-powered church management software built for churches, denominations, and religious organizations. Supports 13+ denominations including Baptist, Methodist, Catholic, Lutheran, and more.',
  alternates: { canonical: 'https://www.shepherdaitech.com/for-churches' },
};

const denominationSupport = [
  { name: 'Baptist', features: 'Sermon outlines, baptism tracking, congregational polity' },
  { name: 'Methodist', features: 'Lectionary-aware, Wesleyan tradition, connectional structure' },
  { name: 'Lutheran', features: 'Liturgical calendar, lectionary-based content, sacramental records' },
  { name: 'Presbyterian', features: 'Session management, reformed theology, committee structure' },
  { name: 'Pentecostal', features: 'Spirit-filled language, testimony sharing, altar call tools' },
  { name: 'Catholic', features: 'Mass readings, sacramental tracking, parish life management' },
  { name: 'Non-Denominational', features: 'Flexible theology, modern worship, seeker-sensitive options' },
  { name: 'Anglican', features: 'Book of Common Prayer, liturgy planning, parish council tools' },
  { name: 'Orthodox', features: 'Byzantine lectionary, icon-friendly, fasting calendar awareness' },
  { name: 'Adventist', features: 'Sabbath-aware scheduling, health ministry, prophecy study tools' },
  { name: 'Reformed', features: 'Confessional content, catechism references, covenantal theology' },
  { name: 'Nazarene', features: 'Holiness tradition, district structure, compassionate ministry' },
  { name: 'Assemblies of God', features: 'Pentecostal distinctives, missions focus, credential tracking' },
];

const churchFeatures = [
  {
    emoji: '🙏',
    title: 'Denomination-Aware AI',
    desc: 'ShepherdAI adapts to your tradition. Whether you follow the lectionary, preach verse-by-verse, or use a catechism — our AI speaks your theological language.',
  },
  {
    emoji: '⛪',
    title: 'Built for Church Workflows',
    desc: 'Visitor follow-up, sermon prep, prayer chains, worship planning, announcements, newsletters — every feature is designed around how churches actually operate.',
  },
  {
    emoji: '📖',
    title: 'Scripture-Centered Content',
    desc: 'All AI-generated content is grounded in Scripture. Sermons, devotionals, prayer responses, and pastoral messages are Bible-based and theologically sound.',
  },
  {
    emoji: '🤝',
    title: 'Pastor-Led Design',
    desc: 'Every feature is shaped by feedback from pastors and church leaders. We build for ministry, not for investors.',
  },
  {
    emoji: '🔐',
    title: 'Church-Grade Privacy',
    desc: '256-bit AES encryption, role-based access, and GDPR compliance. Your congregation&apos;s data belongs to you — we never sell or share it.',
  },
  {
    emoji: '🌍',
    title: 'Multi-Church & Multi-Site',
    desc: 'Support for churches with multiple campuses, church plants, and denominational networks. Centralized management with local flexibility.',
  },
];

const useCases = [
  {
    church: 'Small Church (50-200 members)',
    icon: '🏘️',
    desc: 'One pastor doing everything. ShepherdAI automates admin so you can focus on preaching and pastoral care instead of spreadsheets.',
    features: ['Visitor follow-up automation', 'Sermon prep AI', 'Church announcements', 'Free plan available'],
  },
  {
    church: 'Mid-Size Church (200-1000 members)',
    icon: '⛪',
    desc: 'Growing church with staff team. ShepherdAI scales with you — add team collaboration, batch content, and member engagement tools.',
    features: ['Team collaboration (Pro plan)', 'Batch content studio', 'Member pastoral plans', 'Unlimited congregant seats'],
  },
  {
    church: 'Large Church / Multi-Site (1000+ members)',
    icon: '🏰',
    desc: 'Complex organization with multiple campuses. Full automation, white-label pages, dedicated account manager, and enterprise-grade features.',
    features: ['Full auto AI ministry', 'White-label church pages', 'Multi-campus support', 'Dedicated account manager'],
  },
];

export default function ForChurchesPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          For Religious Organizations
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 'bold', color: '#1e3a5f', lineHeight: 1.2, marginBottom: 16 }}>
          Church Management SoftwareBuilt for Your Ministry
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 700, margin: '0 auto 24px', lineHeight: 1.7 }}>
          ShepherdAI is purpose-built for churches, denominations, and religious organizations. AI that understands your theology, respects your tradition, and serves your congregation.
        </p>
        <AuthCTA
          featureHref="/dashboard"
          style={{ display: 'inline-block', padding: '14px 32px', background: '#7c3aed', color: 'white', borderRadius: 8, fontWeight: 600, marginRight: 12 }}
        >
          Start for Free →
        </AuthCTA>
        <Link
          href="#denominations"
          style={{ display: 'inline-block', padding: '14px 32px', background: 'white', color: '#1e3a5f', borderRadius: 8, fontWeight: 600, border: '1px solid #e2e8f0' }}
        >
          See Denomination Support ↓
        </Link>
      </section>

      {/* Denomination Support */}
      <section id="denominations" style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>
            13+ Denominations Supported
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
            ShepherdAI adapts its AI to your theological tradition. Select your denomination and the AI adjusts its language, Scripture references, and content style.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {denominationSupport.map((d) => (
              <div
                key={d.name}
                style={{
                  padding: '20px 24px',
                  borderRadius: 12,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 4 }}>{d.name}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{d.features}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 32 }}>
            Don&apos;t see your denomination? ShepherdAI learns from your content and adapts. <Link href="/contact" style={{ color: '#7c3aed', textDecoration: 'underline' }}>Tell us what you need →</Link>
          </p>
        </div>
      </section>

      {/* Church-Specific Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>
          Designed for Religious Organizations
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
          Unlike generic tools, every ShepherdAI feature is built around church ministry needs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {churchFeatures.map((f) => (
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

      {/* Use Cases by Church Size */}
      <section style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 48 }}>
            For Churches of Every Size
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {useCases.map((uc) => (
              <div
                key={uc.church}
                style={{
                  padding: '32px 28px',
                  borderRadius: 16,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{uc.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 }}>{uc.church}</h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>{uc.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {uc.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, color: '#334155', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#7c3aed' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Church Management vs Generic Tools */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 8 }}>
          Why Not a Generic Tool?
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
          Churches have unique needs that generic business tools can&apos;t address. Here&apos;s how ShepherdAI is different.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#1e3a5f', fontWeight: 700 }}>Church Need</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', background: '#f5f3ff', color: '#7c3aed', fontWeight: 700, borderRadius: '8px 8px 0 0' }}>
                  ShepherdAI
                </th>
                <th style={{ textAlign: 'center', padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>
                  Generic Tool
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Visitor Follow-up', 'AI writes 6 personalized emails', 'Manual template only'],
                ['Sermon Preparation', 'AI sermon outlines + illustrations', 'Not available'],
                ['Prayer Management', 'AI responses with Scripture', 'Not available'],
                ['Worship Planning', 'Full service plan generation', 'Not available'],
                ['Denomination Awareness', '13+ denominations, adaptive AI', 'No religious context'],
                ['Church Announcements', 'AI-generated, service-ready', 'Generic templates'],
                ['Daily Devotionals', 'Scripture + meditation + prayer', 'Not available'],
                ['Member Care Plans', 'AI-generated pastoral plans', 'Not available'],
                ['Giving Statements', 'Auto-generated for members', 'Manual only'],
                ['Theological Accuracy', 'Scripture-grounded AI content', 'No safeguards'],
                ['Starting Price', '$0/month', '$30-100+/month'],
                ['Setup Time', '2 minutes', 'Days to weeks'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 500 }}>{row[0]}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', background: '#f5f3ff', color: '#7c3aed', fontWeight: 600 }}>
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
      <section style={{ background: '#7c3aed', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
          Built for Ministry. Powered by AI.
        </h2>
        <p style={{ fontSize: 18, color: '#e9d5ff', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Join pastors and church leaders worldwide who are saving 15+ hours every week with AI designed specifically for religious organizations.
        </p>
        <AuthCTA
          featureHref="/dashboard"
          style={{ display: 'inline-block', padding: '16px 40px', background: 'white', color: '#7c3aed', borderRadius: 8, fontWeight: 600, fontSize: 18 }}
        >
          Start Your Free Account
        </AuthCTA>
        <p style={{ color: '#d8b4fe', fontSize: 14, marginTop: 16 }}>✅ Free forever plan · 🔒 No credit card · ⚡ Setup in 2 minutes</p>
      </section>
    </>
  );
}

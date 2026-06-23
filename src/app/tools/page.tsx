import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Free Church Tools & AI Generators | ShepherdAI' },
  description:
    'Free AI-powered tools for pastors and church leaders. Sermon outline generator, visitor follow-up emails, daily devotionals, and more. No credit card required.',
  alternates: {
    canonical: 'https://www.shepherdaitech.com/tools',
  },
};

const allTools = [
  {
    icon: '📖',
    title: 'Sermon Outline Generator',
    description:
      'Generate Bible-based, denomination-aware sermon outlines in seconds. Includes main points, subpoints, illustrations, and application. Works with Baptist, Methodist, Presbyterian, Pentecostal, and more.',
    href: '/tools/sermon-outline-generator',
    tag: 'AI-Powered',
    tagColor: '#1e3a5f',
    features: [
      '10+ denomination support',
      'Cross-references included',
      'Illustrations & applications',
      '3-5 point outlines',
    ],
  },
  {
    icon: '📧',
    title: 'Visitor Follow-Up Email Generator',
    description:
      'AI writes personalized 6-email follow-up sequences for church visitors. Each email tailored to the visitor\'s background — 70% of visitors never return without follow-up.',
    href: '/tools/visitor-followup-email',
    tag: 'AI-Powered',
    tagColor: '#10b981',
    features: [
      '6-email sequence',
      '100% personalized',
      'Auto-send or manual',
      '21-day follow-up plan',
    ],
  },
  {
    icon: '🙏',
    title: 'Daily Devotional Generator',
    description:
      'Send personalized daily devotionals to your congregation. AI-generated Bible verses, meditation prompts, prayers, and reflection questions. Fresh content every single day.',
    href: '/tools/daily-devotional-generator',
    tag: 'AI-Powered',
    tagColor: '#8b5cf6',
    features: [
      'Fresh content daily',
      'Multiple translations',
      'Email or in-app delivery',
      'Denomination-specific',
    ],
  },
];

export default function ToolsIndexPage() {
  return (
    <>
      {/* Hero */}
      <section
        style={{
          backgroundColor: '#1e3a5f',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%)',
          padding: '80px 24px 60px',
          textAlign: 'center',
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: 'uppercase',
              opacity: 0.8,
              marginBottom: 16,
            }}
          >
            Free Tools for Church Leaders
          </p>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800,
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            Free Church Tools & AI Generators
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 8, lineHeight: 1.6 }}>
            AI-powered tools designed to save pastors time and serve congregations better.
            Every tool is free to try — no credit card required.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section style={{ padding: '80px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {allTools.map((tool, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  padding: '40px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: 32,
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#f0f4f8',
                    borderRadius: 16,
                    minWidth: 72,
                    height: 72,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                  }}
                >
                  {tool.icon}
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <h2
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#1e3a5f',
                      }}
                    >
                      {tool.title}
                    </h2>
                    <span
                      style={{
                        backgroundColor: tool.tagColor,
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {tool.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>
                    {tool.description}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 16,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {tool.features.map((feat, j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: 13,
                            color: '#475569',
                            backgroundColor: '#f1f5f9',
                            padding: '4px 12px',
                            borderRadius: 6,
                          }}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                  <Link
                    href={tool.href}
                    style={{
                      backgroundColor: '#1e3a5f',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 14,
                      padding: '12px 24px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Free Tools Matter */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 16,
            }}
          >
            Why We Built Free Tools for Pastors
          </h2>
          <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.8, marginBottom: 32 }}>
            The average pastor works 55-75 hours a week. Too much of that time goes to
            administration — writing emails, preparing bulletins, crafting announcements — instead of
            people. ShepherdAI exists to change that. Our free tools handle the administrative busywork
            so you can do what only you can do: shepherd your congregation.
          </p>
          <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.8, marginBottom: 48 }}>
            Every tool on this page is free to try. Start with 20 free AI generations per month.
            When you&apos;re ready, upgrade for unlimited access. No pressure. No credit card
            required to begin.
          </p>
          <Link
            href="/register"
            style={{
              backgroundColor: '#1e3a5f',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 16,
              padding: '14px 40px',
              borderRadius: 8,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Start Free — No Credit Card Required
          </Link>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', textAlign: 'center' }}>
        <nav style={{ fontSize: 13, color: '#64748b' }}>
          <Link href="/" style={{ color: '#1e3a5f', textDecoration: 'none' }}>
            Home
          </Link>
          {' / '}
          <span style={{ color: '#94a3b8' }}>Free Church Tools</span>
        </nav>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Free AI Sermon Outline Generator for Pastors | ShepherdAI' },
  description:
    'Generate sermon outlines in seconds with AI. Bible-based, denomination-aware sermon preparation for busy pastors. Start free — no credit card required.',
  alternates: {
    canonical: 'https://www.shepherdaitech.com/tools/sermon-outline-generator',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'AI Sermon Outline Generator',
  description:
    'Generate sermon outlines in seconds with AI. Bible-based, denomination-aware sermon preparation for busy pastors.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Enter Your Scripture & Theme',
      text: 'Select your Bible passage, sermon theme, and denomination. ShepherdAI understands your theological tradition and tailors the outline accordingly.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'AI Generates the Outline',
      text: 'Our AI analyzes the scripture context, cross-references, and denominational distinctives to produce a structured sermon outline with main points, subpoints, illustrations, and application.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Review & Customize',
      text: 'Review the AI-generated outline. Add your personal touch, adjust points, insert your own illustrations, and finalize your sermon.',
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'ShepherdAI Sermon Outline Generator',
    },
  ],
};

const steps = [
  {
    number: '1',
    icon: '📖',
    title: 'Enter Your Scripture & Theme',
    description:
      'Select your Bible passage, sermon theme, and denomination. ShepherdAI understands your theological tradition — Baptist, Methodist, Presbyterian, Pentecostal, Lutheran, and more — and tailors the outline accordingly.',
  },
  {
    number: '2',
    icon: '✨',
    title: 'AI Generates the Outline',
    description:
      'Our AI analyzes the scripture context, cross-references, and denominational distinctives to produce a structured sermon outline with 3-5 main points, supporting subpoints, illustrations, life application, and closing prayer.',
  },
  {
    number: '3',
    icon: '✏️',
    title: 'Review & Customize',
    description:
      'Review the AI-generated outline. Add your personal touch, adjust points, insert your own illustrations, and finalize your sermon. Export, print, or save to your ShepherdAI library.',
  },
];

const exampleOutlines = [
  {
    scripture: 'Psalm 23',
    title: 'The Lord Is My Shepherd',
    points: [
      'The Shepherd Who Provides (vv. 1-2) — Green pastures and still waters',
      'The Shepherd Who Guides (v. 3) — Paths of righteousness for His name\'s sake',
      'The Shepherd Who Protects (v. 4) — Walking through the valley with no fear',
      'The Shepherd Who Welcomes (vv. 5-6) — A table prepared in the presence of enemies',
    ],
  },
  {
    scripture: 'Ephesians 2:1-10',
    title: 'Saved by Grace',
    points: [
      'Our Condition: Dead in Sin (vv. 1-3) — The life we lived before Christ',
      'God\'s Intervention: Made Alive in Christ (vv. 4-7) — Rich in mercy, great in love',
      'Our Response: Created for Good Works (vv. 8-10) — Saved through faith, not by works',
    ],
  },
  {
    scripture: 'John 15:1-17',
    title: 'Abiding in the True Vine',
    points: [
      'Connection to the Vine (vv. 1-4) — Apart from Christ we can do nothing',
      'The Fruit of Abiding (vv. 5-8) — Bearing much fruit that glorifies the Father',
      'The Cost of Love (vv. 9-17) — Loving one another as Christ loves us',
    ],
  },
];

const faqItems = [
  {
    question: 'Is this sermon outline generator really free?',
    answer:
      'Yes! ShepherdAI offers 20 free AI generations per month on our Free plan. You can generate sermon outlines, visitor emails, devotionals, and more — all without a credit card.',
  },
  {
    question: 'Does the AI understand my church denomination?',
    answer:
      'Absolutely. ShepherdAI supports 10+ denominational traditions including Baptist, Methodist, Presbyterian, Pentecostal, Lutheran, Anglican, Catholic, Reformed, Nazarene, and non-denominational. Each tradition shapes the theological framing, language, and application points.',
  },
  {
    question: 'How long does it take to generate a sermon outline?',
    answer:
      'Typically 10-30 seconds. Enter your scripture, select your theme and tradition, and the AI produces a structured outline with main points, subpoints, illustrations, and application.',
  },
  {
    question: 'Can I edit the generated outline?',
    answer:
      'Yes — every outline is fully editable. Add your personal touch, move points around, insert your own stories and illustrations, and adjust the tone to match your preaching style.',
  },
  {
    question: 'What Bible translations do you use?',
    answer:
      'ShepherdAI is trained on context from many major translations. You can specify your preferred translation (NIV, ESV, KJV, NLT, NASB, CSB, NKJV, etc.) when generating content.',
  },
  {
    question: 'Is this just for Sundays, or for other services too?',
    answer:
      'ShepherdAI supports outlines for Sunday sermons, midweek Bible studies, small group discussions, youth group messages, funeral sermons, wedding homilies, and special occasion messages.',
  },
];

export default function SermonOutlineGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section
        style={{
          backgroundColor: '#1e3a5f',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%)',
          padding: '80px 24px',
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
            Free AI Tool for Pastors
          </p>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800,
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            Free AI Sermon Outline Generator for Pastors
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32, lineHeight: 1.6 }}>
            Generate sermon outlines in seconds with AI. Bible-based, denomination-aware sermon
            preparation for busy pastors. Start free — no credit card required.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/sermon-prep"
              style={{
                backgroundColor: '#ffffff',
                color: '#1e3a5f',
                fontWeight: 700,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Start Generating Free Sermon Outlines
            </Link>
            <Link
              href="/register"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 8,
                border: '2px solid rgba(255,255,255,0.5)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Create Free Account
            </Link>
          </div>
          <p style={{ fontSize: 13, marginTop: 16, opacity: 0.65 }}>
            No credit card required · 20 free generations/month · Cancel anytime
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 12,
            }}
          >
            How It Works
          </h2>
          <p
            style={{
              textAlign: 'center',
              fontSize: 17,
              color: '#64748b',
              marginBottom: 48,
              lineHeight: 1.6,
            }}
          >
            From scripture to sermon outline in three simple steps.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {steps.map((step) => (
              <div
                key={step.number}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 36,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    marginBottom: 16,
                  }}
                >
                  {step.icon}
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#1e3a5f',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '4px 12px',
                    borderRadius: 20,
                    marginBottom: 16,
                  }}
                >
                  Step {step.number}
                </div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1e3a5f',
                    marginBottom: 12,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Outlines */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 12,
            }}
          >
            Example Sermon Outlines
          </h2>
          <p
            style={{
              textAlign: 'center',
              fontSize: 17,
              color: '#64748b',
              marginBottom: 48,
              lineHeight: 1.6,
            }}
          >
            See what ShepherdAI generates in seconds. These are real outlines our AI has produced.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {exampleOutlines.map((example, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  padding: 36,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
                  <span
                    style={{
                      backgroundColor: '#1e3a5f',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '4px 12px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {example.scripture}
                  </span>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#1e3a5f',
                    }}
                  >
                    {example.title}
                  </h3>
                </div>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {example.points.map((point, j) => (
                    <li
                      key={j}
                      style={{
                        fontSize: 15,
                        color: '#334155',
                        lineHeight: 1.8,
                        marginBottom: 6,
                      }}
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Pastors Love It */}
      <section style={{ padding: '80px 24px', backgroundColor: '#1e3a5f' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', color: '#ffffff' }}>
          <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 48 }}>
            Why Pastors Love Our Sermon Outline Generator
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              {
                title: 'Save 4-8 Hours Per Week',
                desc: 'Cut sermon prep time by 70%. Spend less time researching and more time ministering.',
              },
              {
                title: 'Denomination-Specific',
                desc: 'Outlines reflect your theological tradition, from Baptist to Pentecostal to Reformed.',
              },
              {
                title: 'Biblically Grounded',
                desc: 'Every outline includes cross-references, word studies, and contextual analysis.',
              },
              {
                title: 'Fresh Ideas Every Time',
                desc: 'Break out of writer\'s block. Get fresh angles, illustrations, and applications you may not have considered.',
              },
              {
                title: 'Service-Ready Format',
                desc: 'Outlines come structured with transitions, illustrations, and closing applications — ready to preach.',
              },
              {
                title: 'Works on Any Device',
                desc: 'Use on desktop, tablet, or phone. Generate outlines anywhere, anytime.',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 28,
                }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#1e3a5f',
              marginBottom: 48,
            }}
          >
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {faqItems.map((faq, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 10,
                  padding: '28px 32px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>
                  {faq.question}
                </h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            textAlign: 'center',
            backgroundColor: '#1e3a5f',
            borderRadius: 16,
            padding: '56px 40px',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(22px, 4vw, 32px)',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: 16,
            }}
          >
            Ready to Spend Less Time Prepping and More Time Preaching?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', marginBottom: 32, lineHeight: 1.6 }}>
            Join thousands of pastors who trust ShepherdAI for sermon preparation. Start generating
            free sermon outlines today — no credit card required.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/sermon-prep"
              style={{
                backgroundColor: '#ffffff',
                color: '#1e3a5f',
                fontWeight: 700,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Start Generating Free Sermon Outlines
            </Link>
            <Link
              href="/register"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 8,
                border: '2px solid rgba(255,255,255,0.5)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', textAlign: 'center' }}>
        <nav style={{ fontSize: 13, color: '#64748b' }}>
          <Link href="/" style={{ color: '#1e3a5f', textDecoration: 'none' }}>
            Home
          </Link>
          {' / '}
          <Link href="/tools" style={{ color: '#1e3a5f', textDecoration: 'none' }}>
            Free Church Tools
          </Link>
          {' / '}
          <span style={{ color: '#94a3b8' }}>Sermon Outline Generator</span>
        </nav>
      </div>
    </>
  );
}

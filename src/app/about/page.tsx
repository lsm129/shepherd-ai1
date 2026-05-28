'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

function FadeInOnScroll({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
      }}
    >
      {children}
    </div>
  );
}

const advantages = {
  trust: {
    emoji: '🛡️',
    title: 'Trust & Integrity',
    items: [
      {
        emoji: '🛡️',
        title: 'Faith-Neutral by Design',
        desc: 'No denominational bias. We serve Baptist, Methodist, Pentecostal, and non-denominational churches with equal dedication. Your theology stays yours \u2014 we never try to shape it.',
      },
      {
        emoji: '🐑',
        title: "We'll Never Compete for Your Flock",
        desc: "Some church tech companies have their own ministry agendas. We don't. We're here to serve your ministry, not build our own. Your congregation is yours \u2014 always.",
      },
      {
        emoji: '🏛️',
        title: 'No Church Politics',
        desc: "We're not part of any denomination, network, or church headquarters. We'll never get caught in American church politics. Our loyalty is to serving you \u2014 period.",
      },
      {
        emoji: '🤝',
        title: 'A Promise Is Everything',
        desc: "In Chinese culture, your word is your bond. We built ShepherdAI to serve churches for decades, not for a quick exit. When we make a commitment, we honor it \u2014 completely.",
      },
      {
        emoji: '🔒',
        title: 'Your Data, Truly Protected',
        desc: 'We have zero incentive to monetize your church data. No ads, no data selling, no conflicts of interest. Your trust is not our product \u2014 it is our foundation.',
      },
      {
        emoji: '🕊️',
        title: 'No Culture Wars',
        desc: "American companies often pick sides. We don't. Your church will never be \"canceled\" by our platform. We serve all churches \u2014 without exception, without judgment.",
      },
    ],
  },
  partnership: {
    emoji: '🤝',
    title: 'Partnership & Culture',
    items: [
      {
        emoji: '🙏',
        title: 'Reverence for the Sacred',
        desc: "In Chinese culture, even those who don't practice religion hold deep respect for the divine. We never take sacred things lightly. Your faith is honored here.",
      },
      {
        emoji: '⛪',
        title: 'Respect for Pastoral Authority',
        desc: "Our AI is designed to assist, never replace. The pastor is always the spiritual leader. That's non-negotiable. Technology serves the shepherd \u2014 never the other way around.",
      },
      {
        emoji: '🏮',
        title: 'Understanding Heritage',
        desc: "China's 5,000-year civilization shares something with the church: a deep commitment to passing wisdom from generation to generation. We understand the weight of tradition.",
      },
      {
        emoji: '👨\u200d👩\u200d👧\u200d👦',
        title: 'Community-First Mindset',
        desc: 'Chinese culture values the collective over the individual \u2014 just like the church values the body over one member. Our product is designed for congregations, not just individuals.',
      },
      {
        emoji: '💪',
        title: 'The Spirit of Perseverance',
        desc: "When challenges arise, we don't give up. We work through them. That's the Chinese way \u2014 and it's what your church deserves. We are committed for the long haul.",
      },
      {
        emoji: '❤️',
        title: 'Honoring Sacrifice',
        desc: 'We know pastors sacrifice daily for their congregations. We sacrifice for you in return \u2014 with affordable pricing and relentless dedication. Your service inspires ours.',
      },
    ],
  },
  value: {
    emoji: '💡',
    title: 'Value & Impact',
    items: [
      {
        emoji: '📊',
        title: 'Better Pricing Through Efficiency',
        desc: 'Our lean operation means enterprise-grade AI tools at a fraction of the cost. Small churches deserve great tools too \u2014 and we make that possible.',
      },
      {
        emoji: '💰',
        title: 'Savings That Serve the Kingdom',
        desc: "Save $840/year vs. competitors. That's a missionary supported, a community fed, a family helped, a child sponsored. Every dollar saved is a dollar for ministry.",
      },
      {
        emoji: '🌙',
        title: '7\u00d724 Watchfulness',
        desc: "While you sleep, we're maintaining, improving, and guarding your system. Cross-timezone means non-stop protection. Your church never goes unwatched.",
      },
      {
        emoji: '⚡',
        title: 'Relentless Improvement',
        desc: 'Chinese developers are known for speed and dedication. Bugs get fixed fast. Features ship weekly. We treat your feedback as a gift \u2014 and act on it immediately.',
      },
      {
        emoji: '🌍',
        title: 'A Global Perspective',
        desc: "We understand ministry looks different across cultures. We're ready to serve English-speaking churches today \u2014 and the world tomorrow. Ministry is universal.",
      },
      {
        emoji: '🔧',
        title: 'From "Made in China" to "Crafted with Purpose"',
        desc: 'Just as Huawei and BYD evolved from budget to premium, ShepherdAI represents the new chapter: world-class software built with Chinese craftsmanship and global heart.',
      },
    ],
  },
};

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', zIndex: 100,
      }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#1e3a5f" />
              <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white" />
              <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="/" className="nav-link">Home</a>
            <a href="/#features" className="nav-link">Features</a>
            <a href="/#pricing" className="nav-link">Pricing</a>
            <a href="/faq" className="nav-link">FAQ</a>
            <Link href="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        paddingTop: '160px', paddingBottom: '100px',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
        color: 'white', textAlign: 'center',
      }}>
        <div className="page-container fade-in">
          <div className="badge" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px', background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            Our Story
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 'bold',
            lineHeight: '1.15', marginBottom: '24px', maxWidth: '800px',
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            Built to Serve. Driven by Purpose.
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', opacity: 0.9,
            maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto',
            lineHeight: '1.7',
          }}>
            The story behind ShepherdAI \u2014 and why a team from China is uniquely positioned to serve the global church.
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <section style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="page-container" style={{ maxWidth: '800px' }}>
          <FadeInOnScroll>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                The Story
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>
                A Heritage of Service
              </h2>
              <div style={{ width: '60px', height: '3px', background: 'var(--accent)', margin: '0 auto' }} />
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll>
            <div style={{
              background: 'white', borderRadius: '20px', padding: 'clamp(24px, 4vw, 48px)',
              border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(30,58,95,0.06)',
            }}>
              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>
                In the ancient city of Foshan, China \u2014 a place where thousand-year traditions of craftsmanship and community still breathe in every street \u2014 a young boy named Shuming grew up watching his grandfather.
              </p>

              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>
                His grandfather was known throughout the neighborhood as <em>&ldquo;Xiansheng&rdquo;</em> \u2014 the respected one. Not a man of wealth or titles, but a man people turned to when life got hard. A broken marriage, a business on the edge of collapse, a family torn by disagreement \u2014 neighbors came to his small courtyard, and he would listen, advise, and stay until things were better. He never charged a single yuan. When people tried to pay, he would smile and say: <strong>&ldquo;Helping others is the best reward there is.&rdquo;</strong>
              </p>

              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>
                Young Shuming didn&rsquo;t understand it then. Why work so hard for nothing? But as he grew, the answer became clear: <em>service itself was the reward</em>. His grandfather wasn&rsquo;t poor because he gave freely \u2014 he was rich in something money couldn&rsquo;t buy.
              </p>

              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>
                As an adult, Shuming built a career in business consulting, helping companies navigate crises and find their footing. He was good at it. But something was missing. The businesses he helped would grow, profits would rise \u2014 and yet, the ache in his chest never went away. He wanted to serve people whose work truly mattered. People who gave of themselves, not for profit, but for purpose.
              </p>

              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>
                Then one evening, a friend who worked with American churches shared something that changed everything. He described the life of a typical small-church pastor in America: working 60 to 80 hours a week, juggling sermon preparation, pastoral care, administration, community outreach, and family life \u2014 all while earning barely enough to get by. And when it came to tools that could help, the software they needed was either unaffordable or designed for megachurch budgets.
              </p>

              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>
                Shuming sat in silence for a long time. These pastors reminded him of someone \u2014 his grandfather. People who poured themselves out for others, day after day, with little support and less recognition. The very people most deserving of help, often the last to receive it.
              </p>

              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>
                That night, he made a decision. He would build something for them \u2014 an AI assistant that was affordable, reliable, and deeply respectful of the sacred work pastors do. Not to replace the shepherd, but to carry the load so the shepherd could focus on what matters most: tending to souls.
              </p>

              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>
                He assembled a small team in Foshan \u2014 people who shared his belief that great technology should not be a privilege of the wealthy, and that serving those who serve others is the highest form of craftsmanship.
              </p>

              <div style={{
                margin: '32px 0 24px', padding: '24px 32px',
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
                borderRadius: '12px', borderLeft: '4px solid var(--accent)',
              }}>
                <p style={{ fontSize: '20px', lineHeight: '1.7', color: 'white', fontStyle: 'italic', margin: 0 }}>
                  &ldquo;My grandfather taught me that the greatest calling is to serve those who serve others. ShepherdAI is my heritage.&rdquo;
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '12px', marginBottom: 0 }}>
                  \u2014 Shuming, Founder of ShepherdAI
                </p>
              </div>

              <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#444', marginBottom: 0 }}>
                ShepherdAI isn&rsquo;t just software. It&rsquo;s a bridge between cultures, built on the belief that service transcends borders, and that the best technology is the kind you barely notice \u2014 because it simply works, quietly, faithfully, so you can do what you were called to do.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* 18 Advantages */}
      <section style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <FadeInOnScroll>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                Why Us
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>
                18 Reasons Pastors Trust ShepherdAI
              </h2>
              <p style={{ color: '#666', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                Built differently. Built for you.
              </p>
            </div>
          </FadeInOnScroll>

          {Object.entries(advantages).map(([key, group], gi) => (
            <FadeInOnScroll key={key}>
              <div style={{ marginBottom: gi < 2 ? '72px' : 0 }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <span style={{ fontSize: '32px', marginRight: '12px' }}>{group.emoji}</span>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', display: 'inline' }}>
                    {group.title}
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}>
                  {group.items.map((item, i) => (
                    <div key={i} style={{
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '28px',
                      border: '1px solid var(--border)',
                      transition: 'all 0.3s ease',
                    }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(30,58,95,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                        <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a5f', margin: 0 }}>
                          {item.title}
                        </h4>
                      </div>
                      <p style={{ color: '#555', lineHeight: '1.7', fontSize: '15px', margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 0',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
        color: 'white', textAlign: 'center',
      }}>
        <div className="page-container">
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px' }}>
            Ready to let us serve your ministry?
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px' }}>
            Start for free \u2014 and experience the difference purpose-driven technology makes.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: 'white', color: '#1e3a5f',
              padding: '16px 32px', borderRadius: '8px',
              fontWeight: '600', textDecoration: 'none', fontSize: '18px',
            }}>
              Start Free Today \u2192
            </Link>
            <a href="mailto:hello@shepherdai.app" style={{
              background: 'transparent', color: 'white',
              padding: '16px 32px', borderRadius: '8px',
              fontWeight: '600', textDecoration: 'none', fontSize: '18px',
              border: '2px solid rgba(255,255,255,0.4)',
            }}>
              Contact Us
            </a>
          </div>
          <p style={{ marginTop: '16px', opacity: 0.7, fontSize: '14px' }}>
            Free plan available forever \u2022 No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>\u00a9 2026 ShepherdAI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</a>
            <a href="/faq" style={{ color: '#999', textDecoration: 'none' }}>FAQ</a>
            <a href="/#pricing" style={{ color: '#999', textDecoration: 'none' }}>Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

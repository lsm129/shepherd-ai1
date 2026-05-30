import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* 导航栏 */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 100,
      }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
              <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 12C17.105 12 18 12.895 18 14C18 15.105 17.105 16 16 16C14.895 16 14 15.105 14 14C14 12.895 14.895 12 16 12Z" fill="white"/>
              <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>ShepherdAI</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link href="/login" className="btn-ghost">Log In</Link>
            <Link href="/register" className="btn-primary">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '160px',
        paddingBottom: '120px',
        background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)',
      }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px' }}>
            ✨ AI-Powered Church Management
          </div>
          
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'var(--primary)',
            lineHeight: '1.2',
            marginBottom: '24px',
            maxWidth: '800px',
            margin: '0 auto 24px',
          }}>
            Your AI Assistant for
            <br />
            <span style={{ color: 'var(--secondary)' }}>Growing Church Community</span>
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
          }}>
            Stop spending hours on visitor follow-up and newsletter writing. 
            ShepherdAI handles the busywork so you can focus on what matters — shepherding your flock.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ fontSize: '18px', padding: '16px 32px' }}>
              Start Free Today
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#features" className="btn-secondary" style={{ fontSize: '18px', padding: '16px 32px' }}>
              See How It Works
            </a>
          </div>
          
          <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            No credit card required • Free plan available forever
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>
              Everything You Need to Serve Better
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Powerful AI tools designed specifically for small church pastors
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
            {/* Feature 1 */}
            <div className="dashboard-card" style={{ textAlign: 'left' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(30, 58, 95, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 22V8L14 4L24 8V22L14 26L4 22Z" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 12L14 14L18 10" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14V22" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
                Visitor Follow-Up Agent
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Enter a new visitor&apos;s info and get a personalized 6-week email sequence. 
                Warm, welcoming messages that make guests feel valued and encourage them to return.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Personalized email content
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> 6-week engagement sequence
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> One-click sending
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="dashboard-card" style={{ textAlign: 'left' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(74, 144, 164, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="6" width="20" height="18" rx="2" stroke="#4a90a4" strokeWidth="2"/>
                  <path d="M4 10H24" stroke="#4a90a4" strokeWidth="2"/>
                  <circle cx="7" cy="8" r="1" fill="#4a90a4"/>
                  <circle cx="10" cy="8" r="1" fill="#4a90a4"/>
                  <path d="M8 14H20M8 18H16" stroke="#4a90a4" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
                Weekly Newsletter Agent
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Just share your weekly highlights — sermon points, events, prayer requests. 
                Our AI transforms them into beautiful, professional newsletters in seconds.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Professional formatting
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Event highlights
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Ready to send
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="dashboard-card" style={{ textAlign: 'left' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(245, 166, 35, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 4L18 10H24L19 14L21 21L14 17L7 21L9 14L4 10H10L14 4Z" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
                Made for Small Churches
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Built specifically for pastors of 50-300 member churches. 
                No complex features you&apos;ll never use. Just the tools that actually matter.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Simple & intuitive
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> No training needed
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Affordable pricing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '100px 0', background: 'var(--surface)' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>
              How ShepherdAI Works
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
              Three simple steps to transform your church communications
            </p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', flex: '1', minWidth: '250px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto 16px',
              }}>1</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Enter Your Info</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Fill in visitor details or weekly highlights in our simple forms</p>
            </div>
            
            <div style={{ textAlign: 'center', flex: '1', minWidth: '250px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto 16px',
              }}>2</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>AI Generates Content</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Our AI creates personalized, professional content in seconds</p>
            </div>
            
            <div style={{ textAlign: 'center', flex: '1', minWidth: '250px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto 16px',
              }}>3</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Review & Send</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Edit if needed, then send with one click</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Start free, upgrade when you need more. Save 2 months with annual billing!
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Monthly</span>
              <button
                id="billing-toggle"
                onClick={() => {
                  const cards = document.querySelectorAll('.plan-amount');
                  const annuals = document.querySelectorAll('.plan-annual');
                  const toggle = document.getElementById('billing-toggle') as HTMLButtonElement | null;
                  if (!toggle) return;
                  const isAnnual = toggle?.getAttribute('data-annual') === 'true';
                  cards.forEach((el: any) => { el.style.display = isAnnual ? 'block' : 'none'; })
                  annuals.forEach((el: any) => { el.style.display = isAnnual ? 'none' : 'block'; })
                  toggle?.setAttribute('data-annual', isAnnual ? 'false' : 'true');
                  toggle.style.background = isAnnual ? '#e2e8f0' : '#1e3a5f';
                  toggle.querySelector('.toggle-knob')?.setAttribute('style', `transform: translateX(${isAnnual ? '0' : '24px'})`);
                }}
                data-annual="false"
                style={{ width: '52px', height: '28px', borderRadius: '14px', background: '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}
              >
                <div className="toggle-knob" style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: '3px', transition: 'transform 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
              </button>
              <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Annual <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '13px' }}>Save 17%</span></span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Free Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Free</h3>
              <div className="plan-amount" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$0</div>
              <div className="plan-annual" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px', display: 'none' }}>$0</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Forever free</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> 10 AI generations/month
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Visitor follow-up agent
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Sermon outline generator
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Prayer request management
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Church announcements
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#94a3b8' }}>✗</span> <span style={{ color: '#94a3b8' }}>Congregant portal (5 seats)</span>
                </li>
              </ul>
              <Link href="/register" className="btn-secondary" style={{ width: '100%' }}>Get Started</Link>
            </div>

            {/* Starter Plan - $19/mo */}
            <div className="pricing-card featured">
              <div className="badge badge-primary" style={{ marginBottom: '12px' }}>Most Popular</div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Starter</h3>
              <div className="plan-amount" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$19<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mo</span></div>
              <div className="plan-annual" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px', display: 'none' }}>$190<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/yr</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>For individual pastors</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> <strong>100 AI generations/month</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Everything in Free
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Sermon social media content
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Daily devotional generator
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Newsletter agent
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Template marketplace
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Congregant portal (25 seats)
                </li>
              </ul>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>
            </div>

            {/* Pro Plan - $39/mo */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Pro</h3>
              <div className="plan-amount" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$39<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mo</span></div>
              <div className="plan-annual" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px', display: 'none' }}>$390<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/yr</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>For growing ministries</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> <strong>300 AI generations/month</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Everything in Starter
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> AI habit learning
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Correctable AI memory
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Paper prayer OCR
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Batch content generation
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Share templates & earn
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Unlimited congregant seats
                </li>
              </ul>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>
            </div>

            {/* Growth Plan - $79/mo */}
            <div className="pricing-card">
              <div style={{ marginBottom: '12px' }}>
                <span style={{ background: 'linear-gradient(135deg, #f5a623, #f7c948)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>BEST VALUE</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Growth</h3>
              <div className="plan-amount" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$79<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mo</span></div>
              <div className="plan-annual" style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px', display: 'none' }}>$790<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/yr</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Full ministry automation</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> <strong>Unlimited AI generations</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Everything in Pro
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> AI runs your ministry
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> AI diagnosis on signup
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Proactive AI suggestions
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Prayer Tap for congregants
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Community knowledge base
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Dedicated account manager
                </li>
              </ul>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>
            </div>
          </div>

          {/* Competitor comparison */}
          <div style={{ textAlign: 'center', marginTop: '48px', padding: '24px', background: '#f0fdf4', borderRadius: '16px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            <p style={{ fontSize: '16px', color: '#166534', fontWeight: '600', marginBottom: '8px' }}>
              💰 Why pay $997/year for Gloo+ when ShepherdAI Growth is just $790/year?
            </p>
            <p style={{ fontSize: '14px', color: '#16a34a' }}>
              Same AI power. More features for pastors. 1/3 the price. That&apos;s the DeepSeek advantage.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
            Ready to Serve Your Flock Better?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>
            Join hundreds of pastors who are saving hours every week with ShepherdAI
          </p>
          <Link href="/register" className="btn-primary" style={{ 
            fontSize: '18px', 
            padding: '16px 40px',
            background: 'white',
            color: 'var(--primary)',
          }}>
            Start Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 0', background: '#0a1929', color: 'rgba(255,255,255,0.7)' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="white"/>
                <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 12C17.105 12 18 12.895 18 14C18 15.105 17.105 16 16 16C14.895 16 14 15.105 14 14C14 12.895 14.895 12 16 12Z" fill="#1e3a5f"/>
                <path d="M16 22V26M12 24H20" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>ShepherdAI</span>
            </div>
            <p style={{ fontSize: '14px' }}>AI-powered church management for modern pastors.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>Terms of Service</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>Contact</a>
          </div>
        </div>
        
        <div className="page-container" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '14px' }}>
          <p>© 2024 ShepherdAI. All rights reserved. Built with ❤️ for church pastors.</p>
        </div>
      </footer>
    </div>
  );
}

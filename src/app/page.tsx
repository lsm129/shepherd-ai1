import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
            {/* Feature 1 - Visitor Follow-up */}
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
                fontSize: '28px',
              }}>
                📧
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

            {/* Feature 2 - Newsletter */}
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
                fontSize: '28px',
              }}>
                📰
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
                Weekly Newsletter Agent
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Transform weekly highlights into professional newsletters. Include events, prayer requests, 
                and community updates in a beautiful format.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Auto-generated sections
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Editable content
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> One-click send
                </li>
              </ul>
            </div>

            {/* Feature 3 - Prayer Requests */}
            <div className="dashboard-card" style={{ textAlign: 'left' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '28px',
              }}>
                🙏
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
                Prayer Requests
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Submit prayer requests and receive AI-generated warm prayer responses with relevant Bible verses. 
                Support for anonymous submissions.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> AI-generated prayer responses
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Relevant Bible verses included
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Anonymous option available
                </li>
              </ul>
            </div>

            {/* Feature 4 - Sermon Social */}
            <div className="dashboard-card" style={{ textAlign: 'left' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(236, 72, 153, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '28px',
              }}>
                📱
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
                Sermon to Social Media
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Transform your sermon notes into engaging content for Facebook, Instagram, and Twitter/X. 
                Reach your community where they are.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Facebook posts
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Instagram captions with hashtags
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Twitter/X tweets
                </li>
              </ul>
            </div>

            {/* Feature 5 - Church Announcement */}
            <div className="dashboard-card" style={{ textAlign: 'left' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '28px',
              }}>
                📢
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
                Church Announcement Generator
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Generate polished church announcements for Sunday services, special events, or urgent notices. 
                Professional and welcoming.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Multiple announcement types
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Editable content
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> One-click copy
                </li>
              </ul>
            </div>

            {/* Feature 6 - Daily Devotional */}
            <div className="dashboard-card" style={{ textAlign: 'left' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '28px',
              }}>
                📖
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>
                Daily Devotional
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                Generate daily devotionals with Bible verses, meditation, practical application, 
                and guided prayer. Choose from preset topics or create your own.
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Bible verse with reference
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Meditation & application
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Guided closing prayer
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
              <p style={{ color: 'var(--text-secondary)' }}>Fill in visitor details, sermon notes, or prayer requests in our simple forms</p>
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
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Review & Share</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Edit if needed, then share with one click</p>
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
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
              Start free, upgrade when you need more
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Free Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Free</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>$0</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Forever free</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', textAlign: 'left' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> 10 AI generations/month
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Visitor follow-up agent
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Newsletter generator
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Prayer requests & devotionals
                </li>
              </ul>
              <Link href="/register" className="btn-secondary" style={{ width: '100%' }}>Get Started</Link>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card featured">
              <div className="badge badge-primary" style={{ marginBottom: '12px' }}>Most Popular</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Pro</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>$19<span style={{ fontSize: '18px', fontWeight: 'normal' }}>/month</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>For individual pastors</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', textAlign: 'left' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> <strong>100 AI generations/month</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Everything in Free
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Priority support
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Advanced customization
                </li>
              </ul>
              <button className="btn-primary" style={{ width: '100%' }} disabled>
                Coming Soon
              </button>
            </div>

            {/* Church Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Church</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>$99<span style={{ fontSize: '18px', fontWeight: 'normal' }}>/month</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>For full church team</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', textAlign: 'left' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> <strong>Unlimited AI generations</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Everything in Pro
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Multiple team members
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Bulk email sending
                </li>
              </ul>
              <button className="btn-primary" style={{ width: '100%' }} disabled>
                Coming Soon
              </button>
            </div>
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

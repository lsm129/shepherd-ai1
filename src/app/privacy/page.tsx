'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export default function PrivacyPolicy() {
 const [isLoggedIn, setIsLoggedIn] = useState(false);

 useEffect(() => {
 async function checkAuth() {
 try {
 const { createClient } = await import('@supabase/supabase-js');
 if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url') return;
 const supabase = createClient(supabaseUrl, supabaseAnonKey);
 const { data: { session } } = await supabase.auth.getSession();
 setIsLoggedIn(!!session);
 } catch (e) {}
 }
 checkAuth();
 }, []);

 return (
 <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
 <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
 <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
 <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
 <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
 <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
 </Link>
 <a href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Home</a>
 <a href="/#pricing" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Pricing</a>
 <Link href={isLoggedIn ? '/dashboard' : '/register'} className="btn-primary" style={{ textDecoration: 'none', fontSize: '14px' }}>{isLoggedIn ? 'Dashboard' : 'Get Started'}</Link>
 </div>
 </nav>
 <div className="page-container" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px' }}>
 <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Privacy Policy</h1>
 <p style={{ color: '#999', marginBottom: '40px', fontSize: '14px' }}>Last updated: May 29, 2026</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>1. Information We Collect</h2>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
 <li><strong>Account Information:</strong> Name, email address, and church name when you register.</li>
 <li><strong>Content Data:</strong> Information you input to generate AI content (sermon notes, visitor details, prayer requests, etc.).</li>
 <li><strong>Usage Data:</strong> How you interact with our platform, including features used and time spent.</li>
 <li><strong>Payment Information:</strong> Processed by Creem (Merchant of Record). We do not store credit card details.</li>
 </ul>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>2. How We Use Your Information</h2>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
 <li>To provide and maintain our AI-powered church management services</li>
 <li>To improve and personalize your experience</li>
 <li>To process subscription payments and manage your account</li>
 <li>To send important updates about your account or our services</li>
 <li>To respond to your support requests</li>
 </ul>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>3. Data Protection</h2>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
 <li>All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
 <li>We use Supabase for secure, enterprise-grade data storage</li>
 <li>Your church data is never shared with third parties</li>
 <li>We do not use your content to train AI models</li>
 </ul>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>4. Third-Party Services</h2>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
 <li><strong>Supabase:</strong> Database and authentication</li>
 <li><strong>Creem:</strong> Payment processing (Merchant of Record)</li>
 <li><strong>AI Providers:</strong> To generate content based on your inputs</li>
 </ul>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>5. Cookies</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>We use essential cookies to maintain your session. We do not use tracking cookies or sell data to advertisers.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>6. Your Rights</h2>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
 <li>Access your personal data at any time</li>
 <li>Request correction or deletion of your data</li>
 <li>Export your data in a portable format</li>
 <li>Opt out of non-essential communications</li>
 </ul>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>7. Data Retention</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>We retain your data while your account is active. Upon deletion, personal data is removed within 30 days.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>8. Children&apos;s Privacy</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>ShepherdAI is not intended for individuals under 18. We do not knowingly collect data from children.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>9. Changes</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>We may update this policy. Material changes will be notified via email or platform notification.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>10. Contact</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>Questions? Contact us at: <strong>464930272@qq.com</strong></p>
 </div>
 <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>© 2026 ShepherdAI. All rights reserved.</footer>
 </div>
 );
}

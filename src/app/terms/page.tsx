'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export default function TermsOfService() {
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
 <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Terms of Service</h1>
 <p style={{ color: '#999', marginBottom: '40px', fontSize: '14px' }}>Last updated: May 29, 2026</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>By accessing or using ShepherdAI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>2. Description of Service</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>ShepherdAI is an AI-powered church management platform that helps pastors and ministry leaders generate content including visitor follow-up emails, newsletters, prayer responses, social media posts, announcements, and devotionals.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>3. Account Registration</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use this service.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>4. Subscription and Payments</h2>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
 <li>Free plan includes 20 AI generations per month</li>
 <li>Paid plans are billed monthly or annually as selected</li>
 <li>Payments are processed securely through Creem (Merchant of Record)</li>
 <li>You may cancel your subscription at any time</li>
 <li>Refund requests must be submitted within 7 days of purchase</li>
 </ul>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>5. AI-Generated Content</h2>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
 <li>AI-generated content is provided as a draft for your review</li>
 <li>You are responsible for reviewing and approving all content before distribution</li>
 <li>We do not guarantee theological accuracy — pastors maintain full editorial control</li>
 <li>You retain ownership of your input data and generated content</li>
 </ul>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>6. AI Model Disclosure</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>ShepherdAI uses <strong>DeepSeek AI (deepseek-chat model)</strong> as the underlying AI service to power our content generation features. This includes:</p>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
   <li>Sermon and devotional generation</li>
   <li>Prayer responses and personalized pastoral care plans</li>
   <li>Newsletter and church announcement drafting</li>
   <li>Visitor follow-up email sequences</li>
   <li>Member departure analysis and pastoral insights</li>
 </ul>
 <p style={{ color: '#555', lineHeight: '1.8' }}>DeepSeek AI is a third-party service operated by DeepSeek AI. Your input data is transmitted to DeepSeek servers for processing. ShepherdAI is an independent product and is not affiliated with, endorsed by, or sponsored by DeepSeek AI. For more information about DeepSeek, visit <a href="https://www.deepseek.com" style={{ color: '#4a90a4' }}>deepseek.com</a>.</p>

 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>7. Acceptable Use</h2>
 <p style={{ color: '#555', lineHeight: '1.8', marginBottom: '12px' }}>You agree not to:</p>
 <ul style={{ color: '#555', lineHeight: '2', paddingLeft: '24px' }}>
 <li>Use the service for illegal or harmful purposes</li>
 <li>Generate content that promotes hate, violence, or discrimination</li>
 <li>Generate or distribute NSFW, explicit, or sexually suggestive content</li>
 <li>Use AI features to create harmful, deceptive, or misleading content</li>
 <li>Attempt to bypass usage limits or security measures</li>
 <li>Share your account with unauthorized users</li>
 <li>Reverse engineer or copy our platform</li>
 </ul>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>8. Intellectual Property</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>The ShepherdAI platform, including its design, code, and branding, is our intellectual property. Content you generate using the service belongs to you.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>9. Limitation of Liability</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>ShepherdAI is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to the accuracy of AI-generated content.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>10. Termination</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>We may suspend or terminate your account for violations of these terms. You may delete your account at any time. Upon termination, your right to use the service ceases immediately.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>11. Changes to Terms</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>We may update these terms from time to time. Material changes will be notified via email. Continued use after changes constitutes acceptance.</p>
 <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '32px', marginBottom: '12px' }}>12. Contact</h2>
 <p style={{ color: '#555', lineHeight: '1.8' }}>Questions? Contact us at: <strong><a href="mailto:support@shepherdaitech.com" style={{ color: '#2563eb' }}>support@shepherdaitech.com</a></strong></p>
 </div>
       <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>© 2026 ShepherdAI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</a>
            <a href="/privacy" style={{ color: '#999', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#999', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/contact" style={{ color: '#999', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
 </div>
 );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


export default function FAQPage() {
 const [mounted, setMounted] = useState(false);
 const [openIndex, setOpenIndex] = useState<number | null>(null);
 const [isLoggedIn, setIsLoggedIn] = useState(false);

 useEffect(() => {
 setMounted(true);
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

 const ctaHref = isLoggedIn ? '/dashboard' : '/register';

 if (!mounted) return null;

 const faqs = [
 {
 q: 'Will AI replace my pastor role?',
 a: 'Absolutely not. ShepherdAI is designed to handle administrative busywork — follow-up emails, newsletters, announcements — so pastors can spend more time on shepherding, counseling, and ministry. AI is a tool that serves your mission, not a replacement for the human heart of pastoral care.',
 },
 {
 q: 'Is my data safe?',
 a: 'Yes. We use enterprise-grade encryption (AES-256) for all data at rest and in transit. Your church data is never shared with third parties or used to train AI models. We are fully compliant with data privacy best practices, and you can delete your data at any time.',
 },
 {
 q: 'Do I need to replace my existing church software?',
 a: 'No! ShepherdAI works alongside your current tools. Whether you use Planning Center, Church Community Builder, or simple spreadsheets, ShepherdAI integrates smoothly. Think of it as an add-on assistant, not a replacement.',
 },
 {
 q: 'How quickly can I get started?',
 a: 'Under 5 minutes. Sign up, enter your church name, and start generating content immediately. No complex setup, no training required. Our AI learns your church\'s voice from day one.',
 },
 {
 q: 'How much does it cost?',
 a: 'ShepherdAI offers a generous Free plan with 10 AI generations per month. Starter is $19/mo for 100 generations and 3 core tools. Pro is $39/mo for 300 generations and all 7 AI tools. Growth is $79/mo for unlimited generations, multi-campus support, and priority assistance. No credit card required to start.',
 },
 {
 q: 'Can I cancel anytime?',
 a: 'Yes, you can cancel your subscription at any time with no penalties or hidden fees. Your access continues through the end of your billing period, and you can always downgrade to the Free plan.',
 },
 {
 q: 'What about theological accuracy?',
 a: 'ShepherdAI is trained to reference scripture accurately and generate content that respects theological nuance. You always review and edit before anything is sent. Pastors remain in full control of the message — AI just does the heavy lifting of drafting.',
 },
 ];

 return (
 <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
 {/* Header */}
 <nav style={{
 position: 'sticky', top: 0,
 background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
 borderBottom: '1px solid var(--border)', zIndex: 100,
 }}>
 <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
 <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
 <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
 <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
 <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
 <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
 </svg>
 <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
 </Link>
 <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
 {isLoggedIn ? (<Link href="/dashboard" className="btn-ghost">Dashboard</Link>) : (<Link href="/login" className="btn-ghost">Log In</Link>)}
 <Link href={ctaHref} className="btn-primary" style={{ textDecoration: 'none' }}>{isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}</Link>
 </div>
 </div>
 </nav>

 {/* Hero */}
 <section style={{ padding: '80px 0 40px', textAlign: 'center' }}>
 <div className="page-container">
 <div className="badge badge-primary" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px' }}>
 Help Center
 </div>
 <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '16px' }}>
 Frequently Asked Questions
 </h1>
 <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
 Common concerns, honest answers — about AI, data safety, pricing, and more.
 </p>
 </div>
 </section>

 {/* FAQ List */}
 <section style={{ padding: '40px 0 80px' }}>
 <div className="page-container" style={{ maxWidth: '800px' }}>
 <div style={{ display: 'grid', gap: '12px' }}>
 {faqs.map((faq, i) => (
 <div
 key={i}
 className="card"
 style={{
 overflow: 'hidden',
 padding: 0,
 border: openIndex === i ? '2px solid var(--primary)' : '1px solid var(--border)',
 transition: 'all 0.2s',
 }}
 >
 <button
 onClick={() => setOpenIndex(openIndex === i ? null : i)}
 style={{
 width: '100%', padding: '24px', background: openIndex === i ? '#f8fafc' : 'white',
 border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
 alignItems: 'center', textAlign: 'left', fontSize: '17px', fontWeight: '600',
 color: '#1e3a5f', transition: 'all 0.2s',
 }}
 >
 {faq.q}
 <span style={{
 fontSize: '24px', transition: 'transform 0.3s',
 transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)',
 flexShrink: 0, marginLeft: '16px', color: openIndex === i ? 'var(--primary)' : '#999',
 }}>
 +
 </span>
 </button>
 {openIndex === i && (
 <div className="fade-in" style={{ padding: '0 24px 24px', color: '#555', lineHeight: '1.8', fontSize: '15px' }}>
 {faq.a}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Still have questions CTA */}
 <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', color: 'white', textAlign: 'center' }}>
 <div className="page-container">
 <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Still have questions?</h2>
 <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
 Try ShepherdAI free and see for yourself — no commitment required.
 </p>
 <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
 <Link href="/register" style={{ background: 'white', color: '#1e3a5f', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px' }}>
 Start Free →
 </Link>
 <Link href="/" style={{ background: 'transparent', color: 'white', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '18px', border: '2px solid rgba(255,255,255,0.4)' }}>
 Back to Home
 </Link>
 </div>
 </div>
 </section>

 {/* Footer */}
 <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: '#999', fontSize: '14px', background: 'white' }}>
 <p>© 2026 ShepherdAI. All rights reserved.</p>
 </footer>
 </div>
 );
}

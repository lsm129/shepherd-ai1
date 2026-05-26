'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [churchName, setChurchName] = useState('');
  const [generationsUsed] = useState(0);

  const features = [
    {
      title: 'Visitor Follow-up Agent',
      description: 'Create personalized 6-week email sequences for new visitors with just a few clicks.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="8" width="40" height="32" rx="4" stroke="#1e3a5f" strokeWidth="3"/>
          <path d="M4 16H44" stroke="#1e3a5f" strokeWidth="3"/>
          <circle cx="12" cy="12" r="2" fill="#1e3a5f"/>
          <circle cx="18" cy="12" r="2" fill="#1e3a5f"/>
          <path d="M12 26L20 32L36 22" stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      href: '/visitor-followup',
      color: '#1e3a5f',
    },
    {
      title: 'Weekly Newsletter Agent',
      description: 'Transform your weekly highlights into beautiful, professional newsletters instantly.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="6" y="4" width="36" height="40" rx="4" stroke="#4a90a4" strokeWidth="3"/>
          <path d="M14 16H34M14 24H28M14 32H22" stroke="#4a90a4" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="36" cy="36" r="10" fill="#4a90a4"/>
          <path d="M36 32V40M32 36H40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      href: '/weekly-newsletter',
      color: '#4a90a4',
    },
  ];

  const tips = [
    { title: 'Welcome New Visitors Warmly', tip: 'Send your first follow-up email within 24 hours of their visit. First impressions matter!' },
    { title: 'Keep Newsletters Consistent', tip: 'Try to send your newsletter on the same day each week to build reader expectations.' },
    { title: 'Personalize When Possible', tip: 'Edit the AI-generated content to add personal touches — your congregation will appreciate it.' },
  ];

  return (
    <div>
      {/* 欢迎横幅 */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', borderRadius: '16px', padding: '40px', color: 'white', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Welcome{churchName ? `, ${churchName}` : ''}! 👋</h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>Your AI-powered church assistant is ready to help you serve better.</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/visitor-followup" style={{ background: 'white', color: 'var(--primary)', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>📧</span> New Visitor Follow-up
          </Link>
          <Link href="/weekly-newsletter" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>📰</span> Create Newsletter
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>{generationsUsed}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>AI Generations Used</div>
          <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px' }}>10 free per month</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>{10 - generationsUsed}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Remaining This Month</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>Free</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Current Plan</div>
        </div>
      </div>

      {/* AI Agent 卡片 */}
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>Your AI Assistants</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} style={{ textDecoration: 'none' }}>
            <div className="dashboard-card" style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ marginBottom: '20px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text)' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>{feature.description}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: feature.color, fontWeight: '600' }}>
                Get Started
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 提示卡片 */}
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>💡 Quick Tips</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {tips.map((tip, index) => (
          <div key={index} className="card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)', border: '1px solid #f59e0b' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#92400e' }}>{tip.title}</h4>
            <p style={{ fontSize: '14px', color: '#a16207', lineHeight: '1.5' }}>{tip.tip}</p>
          </div>
        ))}
      </div>

      {/* 配置提示 */}
      <div style={{ marginTop: '32px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#92400e', marginBottom: '12px' }}>⚠️ Configuration Required</h3>
        <p style={{ color: '#a16207', marginBottom: '16px' }}>To enable all features, please configure your environment variables in <code>.env.local</code>:</p>
        <ul style={{ color: '#a16207', listStyle: 'none', padding: 0, fontSize: '14px' }}>
          <li style={{ marginBottom: '8px' }}>• <code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL</li>
          <li style={{ marginBottom: '8px' }}>• <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anonymous key</li>
          <li style={{ marginBottom: '8px' }}>• <code>OPENAI_API_KEY</code> - Your OpenAI API key</li>
          <li>• <code>RESEND_API_KEY</code> - Your Resend API key (for sending emails)</li>
        </ul>
      </div>
    </div>
  );
}

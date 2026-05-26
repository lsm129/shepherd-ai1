'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Supabase not configured. Please set up your .env.local file.');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
              <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 12C17.105 12 18 12.895 18 14C18 15.105 17.105 16 16 16C14.895 16 14 15.105 14 14C14 12.895 14.895 12 16 12Z" fill="white"/>
              <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>ShepherdAI</span>
          </Link>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>Sign in to your account</p>

          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '14px', color: '#92400e' }}>
            <strong>⚠️ Configuration Required</strong>
            <p style={{ marginTop: '8px' }}>Supabase is not configured. Please add your credentials to <code>.env.local</code> to enable authentication.</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '24px', fontSize: '14px', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pastor@church.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

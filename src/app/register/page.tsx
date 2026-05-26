'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('Supabase not configured. Please set up your .env.local file.');
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Check Your Email</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>We&apos;ve sent a confirmation link to <strong>{email}</strong>. Please click the link to activate your account.</p>
            <Link href="/login" className="btn-primary">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>Create Your Account</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>Start free, upgrade anytime</p>

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
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? <><span className="spinner"></span> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

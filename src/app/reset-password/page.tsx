'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 const router = useRouter();

 useEffect(() => {
 const checkSession = async () => {
 const { createClient } = await import('@supabase/supabase-js');
 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if (!supabaseUrl || !supabaseKey) return;
 const supabase = createClient(supabaseUrl, supabaseKey);
 const { data } = await supabase.auth.getSession();
 if (!data.session) {
 router.push('/login');
 }
 };
 checkSession();
 }, [router]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');

 if (password.length < 6) {
 setError('Password must be at least 6 characters');
 return;
 }

 if (password !== confirmPassword) {
 setError('Passwords do not match');
 return;
 }

 setLoading(true);

 try {
 const { createClient } = await import('@supabase/supabase-js');
 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 
 if (!supabaseUrl || !supabaseKey) {
 setError('System not configured. Please contact support.');
 setLoading(false);
 return;
 }

 const supabase = createClient(supabaseUrl, supabaseKey);
 const { error } = await supabase.auth.updateUser({ password });
 
 if (error) throw error;
 
 setSuccess(true);
 setTimeout(() => router.push('/login'), 3000);
 } catch (err: any) {
 setError(err.message || 'Failed to reset password');
 } finally {
 setLoading(false);
 }
 };

 if (success) {
 return (
 <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
 <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
 <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
 <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
 <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Password Reset!</h1>
 <p style={{ color: '#666', marginBottom: '24px' }}>Your password has been updated. Redirecting to login...</p>
 <Link href="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 24px' }}>
 Go to Login
 </Link>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
 <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
 <div style={{ textAlign: 'center', marginBottom: '32px' }}>
 <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
 <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
 <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
 <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
 <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
 </svg>
 <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
 </Link>
 </div>

 <div className="card" style={{ padding: '32px' }}>
 <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>Reset Password</h1>
 <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>Enter your new password</p>

 {error && (
 <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '24px', fontSize: '14px', color: '#dc2626' }}>
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit}>
 <div className="form-group">
 <label className="form-label">New Password</label>
 <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password (min 6 characters)" required />
 </div>
 <div className="form-group">
 <label className="form-label">Confirm Password</label>
 <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
 </div>
 <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
 {loading ? 'Updating...' : 'Update Password'}
 </button>
 </form>

 <div style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '14px' }}>
 Remember your password? <Link href="/login" style={{ color: '#1e3a5f', fontWeight: '600' }}>Sign in</Link>
 </div>
 </div>
 </div>
 </div>
 );
}

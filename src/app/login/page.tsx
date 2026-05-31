'use client';
import { useState } from 'react';
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
 setError('');
 setLoading(true);
 try {
 const { createClient } = await import('@supabase/supabase-js');
 const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co');
 const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I');
 
 if (!supabaseUrl || !supabaseKey) {
 setError('System not configured. Please contact support.');
 setLoading(false);
 return;
 }
 const supabase = createClient(supabaseUrl, supabaseKey);
 const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 if (error) throw error;

 // Redirect based on role
 const meta = data.user?.user_metadata || {};
 const role = meta.role || 'pastor';
 if (role === 'congregant') {
 router.push('/member/dashboard');
 } else {
 router.push('/dashboard');
 }
 } catch (err: any) {
 setError(err.message || 'Failed to sign in');
 } finally {
 setLoading(false);
 }
 };

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
 <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h1>
 <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>Sign in to your account</p>

 {error && (
 <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '24px', fontSize: '14px', color: '#dc2626' }}>
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit}>
 <div className="form-group">
 <label className="form-label">Email</label>
 <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
 </div>
 <div className="form-group">
 <label className="form-label">Password</label>
 <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
 </div>
 <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
 <button type="button" onClick={async () => {
 if (!email) { setError('Please enter your email first'); return; }
 try {
 const { createClient } = await import('@supabase/supabase-js');
 const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co');
 const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I');
 if (supabaseUrl && supabaseKey) {
 const supabase = createClient(supabaseUrl, supabaseKey);
 await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
 setError('');
 alert('Password reset email sent! Check your inbox.');
 }
 } catch (err: any) { setError(err.message || 'Failed to send reset email'); }
 }} style={{ background: 'none', border: 'none', color: '#1e3a5f', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: 0 }}>
 Forgot Password?
 </button>
 </div>
 <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
 {loading ? 'Signing in...' : 'Sign In'}
 </button>
 </form>

 <div style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '14px' }}>
 Don&apos;t have an account?{' '}
 <Link href="/register" style={{ color: '#1e3a5f', fontWeight: '600' }}>Sign up free</Link>
 </div>
 </div>
 </div>
 </div>
 );
}

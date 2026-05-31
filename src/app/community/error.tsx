'use client';

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔄</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Something went wrong</h1>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>We had trouble loading the Community page. Please try again.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={reset} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer' }}>Try Again</button>
          <a href="/dashboard" style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer', color: '#666', textDecoration: 'none' }}>Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}

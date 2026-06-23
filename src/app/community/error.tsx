'use client';
import { useEffect } from 'react';

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Auto-recover: clean up translation <font> tags and retry
    const fonts = document.querySelectorAll('font');
    if (fonts.length > 0) {
      fonts.forEach(font => {
        const parent = font.parentNode;
        if (parent) {
          while (font.firstChild) {
            parent.insertBefore(font.firstChild, font);
          }
          parent.removeChild(font);
        }
      });
    }
    // Auto-retry after brief delay
    const timer = setTimeout(() => {
      reset();
    }, 300);
    return () => clearTimeout(timer);
  }, [error, reset]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔄</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Loading...</h1>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>Recovering, please wait...</p>
        <button onClick={reset} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  );
}

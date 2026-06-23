'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SocialProofBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 9999,
        maxWidth: 340,
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 4px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)',
        padding: '16px 18px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        animation: 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          background: 'none',
          border: 'none',
          fontSize: 18,
          color: '#9ca3af',
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>

      {/* Avatar stack */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a56db, #7c3aed)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 700,
          marginRight: -10,
          border: '2px solid #fff',
          zIndex: 3,
        }}>
          PK
        </div>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 700,
          border: '2px solid #fff',
          zIndex: 2,
        }}>
          MR
        </div>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          marginLeft: -10,
          border: '2px solid #fff',
          zIndex: 1,
        }}>
          +37
        </div>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
          <strong style={{ color: '#1e3a5f' }}>40+ pastors</strong> signed up this week.
          {' '}
          <span style={{ color: '#6b7280' }}>
            They&apos;re saving 15+ hours a week with AI.
          </span>
        </p>
        <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Star rating */}
          <span style={{ color: '#f59e0b', fontSize: 12, letterSpacing: 1 }}>★★★★★</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>4.9</span>
          <Link
            href="/register"
            style={{
              fontSize: 12,
              color: '#1a56db',
              fontWeight: 600,
              textDecoration: 'none',
              marginLeft: 'auto',
            }}
          >
            Try free →
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class AppShellErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AppShell Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
            </a>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="/dashboard" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#666', textDecoration: 'none' }}>Dashboard</a>
              <a href="/community" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#666', textDecoration: 'none' }}>Community</a>
              <a href="/" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#666', textDecoration: 'none' }}>Home</a>
            </div>
          </nav>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
            {this.props.children}
          </div>
        </>
      );
    }
    return this.props.children;
  }
}

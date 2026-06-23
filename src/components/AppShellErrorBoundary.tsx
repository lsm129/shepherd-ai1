'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class AppShellErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message || String(error) };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Page Error:', error.message, errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>This page encountered an error.</p>
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: '#991b1b', fontFamily: 'monospace', wordBreak: 'break-word', textAlign: 'left' }}>
              {this.state.errorMessage}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
              style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

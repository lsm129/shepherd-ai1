'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Global error boundary that auto-recovers from translation-induced errors.
 * When Chrome's translation inserts <font> tags that break React's reconciliation,
 * this boundary catches the error, cleans up the foreign elements, and retries.
 */
export default class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 5;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('[GlobalErrorBoundary] Caught error:', error.message);

    // Clean up any translation <font> tags
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

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.retryTimer = setTimeout(() => {
        this.setState({ hasError: false });
      }, 150);
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  handleManualRetry = () => {
    this.retryCount = 0;
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.retryCount >= this.maxRetries) {
        return (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔄</div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '12px' }}>Something went wrong</h1>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>This may be caused by browser translation. Try reloading the page.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => window.location.reload()} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer' }}>
                  Reload Page
                </button>
                <button onClick={this.handleManualRetry} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer', color: '#666' }}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        );
      }
      // Still retrying — show nothing briefly
      return null;
    }

    return this.props.children;
  }
}

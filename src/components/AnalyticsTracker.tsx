'use client';
import { useEffect, useRef } from 'react';
import { trackPageView } from '@/lib/analytics';

/**
 * Auto-tracks page views on route changes.
 * Simplified version - no MutationObserver to avoid performance issues.
 */
export default function AnalyticsTracker({ children }: { children: React.ReactNode }) {
  const lastPath = useRef('');

  useEffect(() => {
    // Track initial page view
    const currentPath = window.location.pathname;
    lastPath.current = currentPath;
    trackPageView();

    // Track on browser back/forward
    const onPopState = () => {
      const newPath = window.location.pathname;
      if (newPath !== lastPath.current) {
        lastPath.current = newPath;
        trackPageView();
      }
    };
    window.addEventListener('popstate', onPopState);

    // Poll for path changes (lightweight, every 2 seconds)
    const interval = setInterval(() => {
      const newPath = window.location.pathname;
      if (newPath !== lastPath.current) {
        lastPath.current = newPath;
        trackPageView();
      }
    }, 2000);

    return () => {
      window.removeEventListener('popstate', onPopState);
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}

'use client';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

/**
 * Auto-tracks page views on route changes.
 * Replaces PostHog with self-hosted Supabase analytics.
 */
export default function AnalyticsTracker({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Track initial page view
    trackPageView();

    // Track on route changes (Next.js App Router)
    const observer = new MutationObserver(() => {
      // Debounce to avoid tracking too frequently
      clearTimeout((observer as any)._timer);
      (observer as any)._timer = setTimeout(() => {
        trackPageView();
      }, 500);
    });

    // Observe title changes (happens on route change)
    const titleEl = document.querySelector('title');
    if (titleEl) {
      observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    }

    // Also listen for popstate (browser back/forward)
    const onPopState = () => {
      setTimeout(() => trackPageView(), 300);
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return <>{children}</>;
}

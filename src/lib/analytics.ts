/**
 * ShepherdAI Analytics - Self-hosted via Supabase
 * Tracks user behavior for conversion funnel optimization
 * No external service required!
 */

// Generate a session ID for this browser session
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('_sa_sid');
  if (!sid) {
    sid = 's_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    sessionStorage.setItem('_sa_sid', sid);
  }
  return sid;
}

// Get user info from localStorage (set during login)
function getUserInfo(): { userId: string; plan: string; role: string } {
  if (typeof window === 'undefined') return { userId: '', plan: '', role: '' };
  try {
    const info = localStorage.getItem('_sa_user');
    if (info) return JSON.parse(info);
  } catch {}
  return { userId: '', plan: '', role: '' };
}

// Batch events to reduce API calls
let eventQueue: Array<{ type: string; data: Record<string, any> }> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flushQueue() {
  if (eventQueue.length === 0) return;
  const batch = [...eventQueue];
  eventQueue = [];
  
  // Send each event (batching would need a batch API endpoint)
  for (const event of batch) {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {}); // Never let analytics break the app
  }
}

function queueEvent(type: string, data: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  const userInfo = getUserInfo();
  const enriched = {
    ...data,
    userId: data.userId || userInfo.userId,
    sessionId: getSessionId(),
    plan: data.plan || userInfo.plan,
    role: data.role || userInfo.role,
    pagePath: data.pagePath || window.location.pathname,
    userAgent: navigator.userAgent.substring(0, 200),
    referrer: document.referrer.substring(0, 200),
  };

  eventQueue.push({ type, data: enriched });

  // Flush after 2 seconds of inactivity or if queue is large
  if (flushTimer) clearTimeout(flushTimer);
  if (eventQueue.length >= 10) {
    flushQueue();
  } else {
    flushTimer = setTimeout(flushQueue, 2000);
  }
}

/** Set user info after login (stored in localStorage) */
export function identifyUser(userId: string, email: string, plan: string, role: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('_sa_user', JSON.stringify({ userId, plan, role }));
  // Also track the login event
  queueEvent('event', { eventName: 'user_login', eventData: { email, plan, role } });
}

/** Reset identity on logout */
export function resetIdentity() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('_sa_user');
  sessionStorage.removeItem('_sa_sid');
  queueEvent('event', { eventName: 'user_logout' });
}

/** Track a page view */
export function trackPageView(pageName?: string) {
  queueEvent('pageview', { pageName: pageName || document.title });
}

// ============ FUNNEL EVENTS ============

/** Step: User views pricing/upgrade page */
export function trackPricingViewed(source: string) {
  queueEvent('event', { eventName: 'pricing_viewed', eventData: { source } });
}

/** Step: User starts checkout */
export function trackCheckoutStarted(plan: string, billing: string) {
  queueEvent('event', { eventName: 'checkout_started', eventData: { plan, billing } });
}

/** Registration completed */
export function trackRegistered(role: string, referred: boolean) {
  queueEvent('event', { eventName: 'user_registered', eventData: { role, referred: String(referred) } });
}

/** Email verified */
export function trackEmailVerified(role: string) {
  queueEvent('event', { eventName: 'email_verified', eventData: { role } });
}

/** Upgrade prompt shown (free user hit a paywall) */
export function trackUpgradePromptShown(feature: string) {
  queueEvent('event', { eventName: 'upgrade_prompt_shown', eventData: { feature } });
}

/** User clicked upgrade from prompt */
export function trackUpgradePromptClicked(feature: string) {
  queueEvent('event', { eventName: 'upgrade_prompt_clicked', eventData: { feature } });
}

/** Content generated */
export function trackContentGenerated(type: string, plan: string) {
  queueEvent('event', { eventName: 'content_generated', eventData: { type, plan } });
}

/** Community post published */
export function trackCommunityPublished(plan: string) {
  queueEvent('event', { eventName: 'community_published', eventData: { plan } });
}

/** Invite button clicked */
export function trackInviteClicked(source: string) {
  queueEvent('event', { eventName: 'invite_clicked', eventData: { source } });
}

/** Daily check-in */
export function trackDailyCheckin(plan: string) {
  queueEvent('event', { eventName: 'daily_checkin', eventData: { plan } });
}

/** Payment completed (called from server-side webhook) */
export function trackCheckoutCompleted(userId: string, plan: string, billing: string) {
  queueEvent('event', { eventName: 'checkout_completed', eventData: { plan, billing }, userId });
}

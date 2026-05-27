// Quota wrapper for AI generation API routes
// Usage: wrap your POST handler with withQuotaCheck()
import { NextRequest, NextResponse } from 'next/server';

// We'll use a simple approach: each route imports and calls checkQuota itself
// to avoid complex wrapper patterns

export const QUOTA_EXCEEDED_RESPONSE = NextResponse.json(
  {
    error: 'AI generation limit reached',
    message: 'You have used all your AI generations for this month. Upgrade your plan for more.',
    upgradeUrl: '/settings#billing',
  },
  { status: 429 }
);

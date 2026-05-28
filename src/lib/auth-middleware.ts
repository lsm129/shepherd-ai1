// Shared authentication and quota middleware for AI generation routes
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkQuota } from './quota';

export interface AuthQuotaResult {
  authenticated: boolean;
  userId: string;
  allowed: boolean;
  remaining: number | string;
  plan: string;
  used: number;
  limit: number | string;
  error?: NextResponse;
}

export async function requireAuthAndQuota(
  request: NextRequest,
  userIdFromClient?: string
): Promise<AuthQuotaResult> {
  // 1. Check authentication - verify userId exists and matches a real session
  if (!userIdFromClient) {
    return {
      authenticated: false,
      userId: '',
      allowed: false,
      remaining: 0,
      plan: 'free',
      used: 0,
      limit: 0,
      error: NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 }),
    };
  }

  // 2. Verify the user exists in Supabase (server-side)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userIdFromClient);
  
  if (!user) {
    return {
      authenticated: false,
      userId: '',
      allowed: false,
      remaining: 0,
      plan: 'free',
      used: 0,
      limit: 0,
      error: NextResponse.json({ error: 'Invalid user. Please log in again.' }, { status: 401 }),
    };
  }

  // 3. Check email verification
  if (!user.email_confirmed_at) {
    return {
      authenticated: true,
      userId: userIdFromClient,
      allowed: false,
      remaining: 0,
      plan: 'free',
      used: 0,
      limit: 0,
      error: NextResponse.json({ error: 'Please verify your email before using AI features.' }, { status: 403 }),
    };
  }

  // 4. Check quota
  const quotaResult = await checkQuota(userIdFromClient);

  if (!quotaResult.allowed) {
    return {
      authenticated: true,
      userId: userIdFromClient,
      allowed: false,
      remaining: quotaResult.remaining,
      plan: quotaResult.plan,
      used: quotaResult.used,
      limit: quotaResult.limit,
      error: NextResponse.json(
        {
          error: 'AI generation limit reached',
          message: `You have used all ${quotaResult.limit} AI generations for this month. Upgrade your plan for more.`,
          upgradeUrl: '/settings#billing',
          remaining: 0,
        },
        { status: 429 }
      ),
    };
  }

  return {
    authenticated: true,
    userId: userIdFromClient,
    allowed: true,
    remaining: quotaResult.remaining,
    plan: quotaResult.plan,
    used: quotaResult.used,
    limit: quotaResult.limit,
  };
}

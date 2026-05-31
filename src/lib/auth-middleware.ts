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

  const supabaseUrl = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
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

  // Congregant role cannot access AI generation APIs
  const userRole = user.user_metadata?.role || 'pastor';
  if (userRole === 'congregant') {
    return {
      authenticated: true,
      userId: userIdFromClient,
      allowed: false,
      remaining: 0,
      plan: 'free',
      used: 0,
      limit: 0,
      error: NextResponse.json(
        { error: 'Church members cannot access AI generation features. Only pastors have access.' },
        { status: 403 }
      ),
    };
  }

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

// Congregant auth middleware
export interface CongregantAuthResult {
  authenticated: boolean;
  userId: string;
  role: string;
  churchCode: string;
  joinedChurches: string[];
  error?: NextResponse;
}

export async function requireCongregantAuth(
  userIdFromClient: string
): Promise<CongregantAuthResult> {
  if (!userIdFromClient) {
    return {
      authenticated: false,
      userId: '',
      role: '',
      churchCode: '',
      joinedChurches: [],
      error: NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 }),
    };
  }

  const supabaseUrl = ((process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hsunvuixqesjcoohbrmp.supabase.co') || 'https://hsunvuixqesjcoohbrmp.supabase.co');
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userIdFromClient);
  
  if (!user) {
    return {
      authenticated: false,
      userId: '',
      role: '',
      churchCode: '',
      joinedChurches: [],
      error: NextResponse.json({ error: 'Invalid user. Please log in again.' }, { status: 401 }),
    };
  }

  const meta = user.user_metadata || {};
  const role = meta.role || 'pastor';

  if (role !== 'congregant') {
    return {
      authenticated: false,
      userId: userIdFromClient,
      role,
      churchCode: '',
      joinedChurches: [],
      error: NextResponse.json({ error: 'This feature is only available for church members.' }, { status: 403 }),
    };
  }

  return {
    authenticated: true,
    userId: userIdFromClient,
    role,
    churchCode: meta.church_code || '',
    joinedChurches: meta.joined_churches || [],
  };
}

import { earnPoints, getTodayEarned, getPointsBalance, getAdminClient } from '@/lib/points';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Verify user exists
    const supabaseUrl = (supabaseUrl);
    const supabaseAuth = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user } } = await supabaseAuth.auth.admin.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if already checked in today
    const todayEarned = await getTodayEarned(userId, 'daily_login');
    const alreadyCheckedIn = todayEarned >= 3; // daily_login cap is 3

    if (alreadyCheckedIn) {
      const balance = await getPointsBalance(userId);
      return NextResponse.json({
        success: false,
        alreadyCheckedIn: true,
        pointsEarned: 0,
        newBalance: balance,
        streakDays: 0,
      });
    }

    // Calculate streak (how many consecutive days the user checked in)
    const supabase = getAdminClient();
    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const startOfDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate()).toISOString();
      const endOfDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() + 1).toISOString();

      const { data } = await supabase
        .from('points_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('action', 'daily_login')
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay)
        .limit(1);

      if (data && data.length > 0) {
        streakDays++;
      } else {
        break;
      }
    }

    // Earn points
    const result = await earnPoints(userId, 'daily_login');

    return NextResponse.json({
      success: result.success,
      alreadyCheckedIn: false,
      pointsEarned: result.pointsEarned,
      newBalance: result.newBalance,
      streakDays: result.success ? streakDays + 1 : streakDays,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check in';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

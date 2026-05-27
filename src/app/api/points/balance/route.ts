import { getPointsBalance, getAdminClient } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const balance = await getPointsBalance(userId);

    // Get recent transactions
    const supabase = getAdminClient();
    const { data: recentTransactions } = await supabase
      .from('points_transactions')
      .select('action, points, balance_after, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ balance, recentTransactions: recentTransactions || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get balance';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

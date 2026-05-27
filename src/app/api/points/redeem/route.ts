import { redeemReward } from '@/lib/points';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, rewardType } = await request.json();

    if (!userId || !rewardType) {
      return NextResponse.json({ error: 'userId and rewardType are required' }, { status: 400 });
    }

    const result = await redeemReward(userId, rewardType);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to redeem reward';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

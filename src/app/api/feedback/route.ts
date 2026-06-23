import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';
import { earnPoints } from '@/lib/points';

export async function POST(request: NextRequest) {
  try {
    const { userId, experience, favoriteFeature, consideringUpgrade } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Verify user exists
    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8');
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if already submitted feedback (only award points once)
    const { data: existing } = await supabaseAdmin
      .from('feedback_submissions')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    const alreadySubmitted = existing && existing.length > 0;

    // Insert feedback submission
    const { error: insertError } = await supabaseAdmin
      .from('feedback_submissions')
      .insert({
        user_id: userId,
        experience,
        favorite_feature: favoriteFeature,
        considering_upgrade: consideringUpgrade,
        points_awarded: !alreadySubmitted,
      });

    if (insertError) {
      console.error('Failed to insert feedback:', insertError);
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }

    // Award 100 points for first feedback
    let pointsResult = null;
    if (!alreadySubmitted) {
      pointsResult = await earnPoints(userId, 'feedback_bonus');
    }

    return NextResponse.json({
      success: true,
      pointsAwarded: pointsResult?.success ? pointsResult.pointsEarned : 0,
      newBalance: pointsResult?.newBalance || 0,
      alreadySubmitted,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit feedback';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

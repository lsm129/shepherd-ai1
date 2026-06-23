import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';
import { earnPoints } from '@/lib/points';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function POST(request: NextRequest) {
  try {
    const { userId, referralCode, pastorId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (!referralCode && !pastorId) {
      return NextResponse.json({ error: 'referralCode or pastorId is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, SUPABASE_SERVICE_KEY);

    // Verify the user exists
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Prevent pastors from joining other churches
    const meta = user.user_metadata || {};
    if (meta.role === 'pastor') {
      return NextResponse.json({ error: 'Pastors cannot join other churches' }, { status: 403 });
    }

    let targetPastorId = pastorId;

    // If referralCode provided, look up the pastor
    if (referralCode && !pastorId) {
      const { data: referrals } = await supabaseAdmin
        .from('referrals')
        .select('referrer_id')
        .eq('referral_code', referralCode.trim())
        .limit(1);
      if (!referrals || referrals.length === 0) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
      }
      targetPastorId = referrals[0].referrer_id;
    }

    if (!targetPastorId) {
      return NextResponse.json({ error: 'Could not determine church pastor' }, { status: 400 });
    }

    // Verify the pastor has a church_settings entry
    const { data: churchData } = await supabaseAdmin
      .from('church_settings')
      .select('church_name, pastor_name')
      .eq('user_id', targetPastorId)
      .single();
    if (!churchData) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    // Check if already joined
    const joinedChurches: string[] = meta.joined_churches || [];
    if (joinedChurches.includes(targetPastorId)) {
      return NextResponse.json({ error: 'Already a member of this church', alreadyJoined: true }, { status: 409 });
    }

    // Update user metadata with new joined_churches
    const updatedChurches = [...joinedChurches, targetPastorId];
    const updatedMeta = { ...meta, joined_churches: updatedChurches };

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: updatedMeta,
    });

    if (updateError) {
      console.error('Failed to update user metadata:', updateError);
      return NextResponse.json({ error: 'Failed to join church' }, { status: 500 });
    }

    // Award referral bonus points to both user and pastor (50 each)
    let userPointsResult = null;
    let pastorPointsResult = null;
    try {
      userPointsResult = await earnPoints(userId, 'referral_bonus');
      pastorPointsResult = await earnPoints(targetPastorId, 'referral_bonus');
    } catch (e) {
      console.error('Points award error:', e);
    }

    // AI Analysis: Generate insights for the pastor about the new member (async, non-blocking)
    (async () => {
      try {
        const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';
        const RESEND_KEY = process.env.RESEND_API_KEY || 're_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91';

        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('created_at, plan, points_balance')
          .eq('id', userId)
          .single();

        const memberName = meta.full_name || meta.pastor_name || user.email?.split('@')[0] || 'New Member';
        const joinedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const daysSinceJoin = profileData?.created_at
          ? Math.floor((Date.now() - new Date(profileData.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${DEEPSEEK_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{
              role: 'system',
              content: 'You are a church ministry assistant. Generate a brief, warm member insight report for a pastor. Keep it under 200 words. Be encouraging and practical.'
            }, {
              role: 'user',
              content: `A new member "${memberName}" just joined ${churchData.church_name}. They have been on our platform for ${daysSinceJoin} day(s). Current plan: ${profileData?.plan || 'free'}. Points: ${profileData?.points_balance || 0}. Please provide: 1) A brief welcome note 2) Suggested pastoral care directions 3) One practical next step for the pastor.`
            }],
            max_tokens: 300,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(15000),
        });

        let aiInsight = 'Welcome this new member with a personal message and consider scheduling a get-to-know-you conversation.';
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          aiInsight = aiData.choices?.[0]?.message?.content || aiInsight;
        }

        const pastorResult = await supabaseAdmin.auth.admin.getUserById(targetPastorId);
        const pastorEmail = pastorResult.data?.user?.email;
        if (pastorEmail) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'ShepherdAI <hello@shepherdaitech.com>',
              to: pastorEmail,
              subject: `New Member Joined ${churchData.church_name} — AI Insights`,
              html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px;">
                <div style="text-align:center;margin-bottom:24px;"><h1 style="color:#1e3a5f;">ShepherdAI</h1></div>
                <div style="background:#f9f9f9;border-radius:12px;padding:24px;">
                  <h2 style="color:#333;">New Member Joined Your Church!</h2>
                  <p style="color:#666;"><strong>${memberName}</strong> joined <strong>${churchData.church_name}</strong> on ${joinedDate}.</p>
                  <div style="background:white;border-radius:8px;padding:16px;margin-top:16px;border-left:4px solid #1e3a5f;">
                    <h3 style="color:#1e3a5f;margin-top:0;">AI Member Insight</h3>
                    <p style="color:#444;line-height:1.7;white-space:pre-line;">${aiInsight}</p>
                  </div>
                  <p style="color:#999;font-size:12px;margin-top:16px;">Powered by ShepherdAI</p>
                </div></div>`,
            }),
            signal: AbortSignal.timeout(10000),
          });
        }
      } catch (e) {
        console.error('AI analysis/email error (non-blocking):', e);
      }
    })();

    return NextResponse.json({
      success: true,
      pastorId: targetPastorId,
      churchName: churchData.church_name,
      pastorName: churchData.pastor_name,
      userPoints: userPointsResult?.pointsEarned || 0,
      pastorPoints: pastorPointsResult?.pointsEarned || 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to join church';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

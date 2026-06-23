import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, gender, birthYear, maritalStatus, spouseOccupation,
            hasChildren, childrenCount, childrenInfo, education, occupation,
            location, ethnicity, yearsBeliever, baptized, churchInvolvement,
            currentChallenges, hopeForHelp } = body;

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8');

    // Get user to find joined churches
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const meta = user.user_metadata || {};
    const joinedChurches: string[] = meta.joined_churches || [];

    // If user has joined churches, trigger AI analysis and notify pastors
    if (joinedChurches.length > 0) {
      const profileSummary = [
        fullName && `Name: ${fullName}`,
        gender && `Gender: ${gender}`,
        birthYear && `Born: ${birthYear}`,
        location && `Location: ${location}`,
        ethnicity && `Background: ${ethnicity}`,
        maritalStatus && `Marital Status: ${maritalStatus}`,
        spouseOccupation && `Spouse Occupation: ${spouseOccupation}`,
        hasChildren === 'yes' && `Children: ${childrenCount || 'Yes'} - ${childrenInfo || ''}`,
        education && `Education: ${education}`,
        occupation && `Occupation: ${occupation}`,
        yearsBeliever && `Believer for: ${yearsBeliever} years`,
        baptized && `Baptized: ${baptized}`,
        churchInvolvement && `Church Involvement: ${churchInvolvement}`,
        currentChallenges && `Current Challenges: ${currentChallenges}`,
        hopeForHelp && `Seeking Help With: ${hopeForHelp}`,
      ].filter(Boolean).join('\n');

      for (const pastorId of joinedChurches) {
        try {
          // Get pastor info
          const { data: pastorUser } = await supabase.auth.admin.getUserById(pastorId);
          const pastorMeta = pastorUser?.user?.user_metadata || {};
          const pastorEmail = pastorUser?.user?.email;
          const churchName = pastorMeta.church_name || 'the church';

          // Generate AI analysis
          const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [{
                role: 'system',
                content: `You are a Christian ministry consultant AI. A new member has joined ${churchName} and completed their profile. Based on their profile, generate a detailed, actionable ministry plan for the pastor. Include:
1. Key insights about this person (2-3 sentences)
2. Recommended outreach approach (specific to their background)
3. Spiritual growth suggestions (based on their faith level)
4. Practical support recommendations (based on their challenges and needs)
5. Suggested small group or ministry fit
6. Any cultural or demographic considerations

Be specific, warm, and practical. Write in English.`
              }, {
                role: 'user',
                content: `New member profile:\n${profileSummary}\n\nGenerate a ministry plan for this member.`
              }],
              max_tokens: 1200,
            }),
          });

          const aiData = await aiResponse.json();
          const analysis = aiData.choices?.[0]?.message?.content || 'Profile analysis will be available shortly.';

          // Save analysis to founding_church_reports (or a dedicated table)
          await supabase.from('founding_church_reports').insert({
            church_user_id: pastorId,
            report_type: 'member_analysis',
            title: `New Member Analysis: ${fullName || 'New Member'}`,
            content: analysis,
            metadata: { member_id: userId, profile: profileSummary },
          });

          // Email the pastor
          if (pastorEmail) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY },
                body: JSON.stringify({
                  from: 'ShepherdAI <support@shepherdaitech.com>',
                  to: pastorEmail,
                  subject: `📋 New Member Profile: ${fullName || 'New Member'} - AI Ministry Plan`,
                  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                    <div style="background:#1e3a5f;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center">
                      <h2 style="margin:0">New Member Ministry Plan</h2>
                    </div>
                    <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px">
                      <p style="font-size:16px;color:#333"><strong>${fullName || 'A new member'}</strong> has completed their profile at ${churchName}.</p>
                      <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:16px 0">
                        <h3 style="color:#1e3a5f;margin-top:0">🤖 AI Ministry Analysis</h3>
                        <div style="white-space:pre-wrap;font-size:14px;color:#444;line-height:1.8">${analysis}</div>
                      </div>
                      <a href="https://www.shepherdaitech.com/church-community" style="display:inline-block;background:#1e3a5f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View in Dashboard →</a>
                    </div>
                  </div>`,
                }),
              });
            } catch (e) { console.error('Email error:', e); }
          }
        } catch (e) { console.error('Analysis error for pastor:', pastorId, e); }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

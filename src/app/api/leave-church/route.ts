import { NextRequest, NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const reason = body.reason || '';
    const churchName = body.churchName || '';
    const pastorName = body.pastorName || '';

    // Verify user
    const verifyRes = await fetch(supabaseUrl + '/auth/v1/user', {
      headers: { 'apikey': supabaseAnonKey, 'Authorization': 'Bearer ' + token },
    });
    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const user = await verifyRes.json();
    const userId = user.id;
    const userName = (user.user_metadata?.full_name) || (user.email ? user.email.split('@')[0] : 'A member');

    const joinedChurches: string[] = user.user_metadata?.joined_churches || [];
    if (joinedChurches.length === 0) {
      return NextResponse.json({ error: 'Not in any church' }, { status: 400 });
    }

    const pastorId = joinedChurches[0];

    // Get pastor info
    let pastorEmail = '';
    let pastorFullName = pastorName || 'Pastor';
    try {
      const pastorRes = await fetch(supabaseUrl + '/auth/v1/admin/users/' + pastorId, {
        headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY },
      });
      if (pastorRes.ok) {
        const pd = await pastorRes.json();
        pastorEmail = pd.email || '';
        pastorFullName = pd.user_metadata?.full_name || pastorFullName;
      }
    } catch (e) {
      console.error('Fetch pastor error:', e);
    }

    // Clear joined_churches
    const updateRes = await fetch(supabaseUrl + '/auth/v1/admin/users/' + userId, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_metadata: { joined_churches: [] } }),
    });
    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('Update failed:', errText);
      return NextResponse.json({ error: 'Failed to leave church' }, { status: 500 });
    }

    // AI analysis
    let aiAnalysis = '';
    if (DEEPSEEK_KEY) {
      try {
        const aiRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + DEEPSEEK_KEY },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'You are a church growth consultant. Given the reason a member left a church, provide a brief practical analysis (2-3 sentences) and 3 specific actionable suggestions. Under 150 words.' },
              { role: 'user', content: 'A member named "' + userName + '" left "' + (churchName || 'the church') + '" (Pastor: ' + pastorFullName + '). Reason: "' + (reason || 'No reason provided') + '"' }
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          aiAnalysis = aiData.choices?.[0]?.message?.content || '';
        }
      } catch (e) {
        console.error('AI error:', e);
      }
    }

    // Send email to pastor
    if (pastorEmail && RESEND_KEY) {
      try {
        const analysisBlock = aiAnalysis
          ? '<div style="background:white;border-left:4px solid #4a90a4;padding:16px;border-radius:8px;margin:16px 0;"><p style="margin:0 0 8px;font-size:13px;color:#4a90a4;font-weight:600;">🤖 AI PASTORAL INSIGHT</p><p style="margin:0;font-size:14px;color:#333;line-height:1.6;">' + aiAnalysis.replace(/\n/g, '<br>') + '</p></div>'
          : '';

        const emailHtml = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">'
          + '<div style="background:linear-gradient(135deg,#1e3a5f,#4a90a4);padding:24px;border-radius:12px 12px 0 0;text-align:center;">'
          + '<h1 style="color:white;margin:0;font-size:22px;">🚪 Member Has Left Your Church</h1></div>'
          + '<div style="padding:24px;background:#f9fafb;border-radius:0 0 12px 12px;">'
          + '<p style="font-size:16px;color:#333;">Dear ' + pastorFullName + ',</p>'
          + '<p style="font-size:14px;color:#555;">We wanted to let you know that <strong>' + userName + '</strong> has left <strong>' + (churchName || 'your church') + '</strong>.</p>'
          + '<div style="background:white;border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:16px 0;">'
          + '<p style="margin:0 0 8px;font-size:13px;color:#999;font-weight:600;">LEAVE REASON</p>'
          + '<p style="margin:0;font-size:15px;color:#333;">' + (reason || 'No reason provided') + '</p></div>'
          + analysisBlock
          + '<p style="font-size:13px;color:#888;margin-top:24px;">This insight was generated by ShepherdAI.</p></div></div>';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + RESEND_KEY },
          body: JSON.stringify({
            from: 'ShepherdAI <support@shepherdaitech.com>',
            to: pastorEmail,
            subject: userName + ' has left ' + (churchName || 'your church') + ' — Pastoral Insight',
            html: emailHtml,
          }),
        });
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Leave church error:', e instanceof Error ? e.stack : String(e));
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

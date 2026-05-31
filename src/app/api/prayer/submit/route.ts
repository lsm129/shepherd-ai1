import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, request: prayerRequest, anonymous, churchId, userId } = body;
    if (!prayerRequest) return NextResponse.json({ error: 'Prayer request is required' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store in generations table (using tool_type='prayer_request' since prayer_requests table doesn't exist)
    const inputSummary = JSON.stringify({
      requester_name: anonymous ? 'Anonymous' : (name || 'Anonymous'),
      request_text: prayerRequest,
      anonymous: !!anonymous,
      status: 'pending',
      urgency: 'medium',
      church_id: churchId || null,
    });

    const insertData: Record<string, unknown> = {
      tool_type: 'prayer_request',
      input_summary: inputSummary,
    };

    // If we have a userId, link it
    if (userId) {
      insertData.user_id = userId;
    }

    const { error } = await supabase.from('generations').insert(insertData);

    if (error) {
      console.error('Prayer insert error:', error);
      return NextResponse.json({ error: 'Failed to submit prayer request' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prayer submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

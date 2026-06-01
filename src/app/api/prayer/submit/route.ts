import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


// Default system user for anonymous prayer submissions
const SYSTEM_USER_ID = '7cd1f0bf-d4c6-4b15-bbc3-eb2fa49a1969';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, request: prayerRequest, anonymous, churchId, userId } = body;
    if (!prayerRequest) return NextResponse.json({ error: 'Prayer request is required' }, { status: 400 });

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store in generations table (prayer_requests table requires DDL which is blocked by MFA)
    const inputSummary = JSON.stringify({
      requester_name: anonymous ? 'Anonymous' : (name || 'Anonymous'),
      request_text: prayerRequest,
      anonymous: !!anonymous,
      status: 'pending',
      urgency: 'medium',
      church_id: churchId || null,
    });

    const { error } = await supabase.from('generations').insert({
      user_id: userId || SYSTEM_USER_ID,
      tool_type: 'prayer_request',
      input_summary: inputSummary,
    });

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

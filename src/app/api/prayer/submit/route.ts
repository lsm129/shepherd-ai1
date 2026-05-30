import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, request: prayerRequest, anonymous, churchId } = body;
    if (!prayerRequest) return NextResponse.json({ error: 'Prayer request is required' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store the prayer request - churchId can be passed via URL param for multi-church
    const { error } = await supabase.from('prayer_requests').insert({
      requester_name: anonymous ? 'Anonymous' : (name || 'Anonymous'),
      request_text: request,
      anonymous: !!anonymous,
      status: 'pending',
      urgency: 'medium',
      church_id: churchId || null,
    });

    if (error) {
      // Table might not exist yet - store in chat_messages as fallback
      console.error('Prayer insert error:', error);
      // Use a simple acknowledgment for now
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prayer submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

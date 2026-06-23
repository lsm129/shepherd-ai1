import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, email, full_name, avatar_url, provider } = body;

    if (!user_id || !email) {
      return NextResponse.json({ error: 'Missing user_id or email' }, { status: 400 });
    }

    // Check if profile already exists
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}&select=id`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    const existing = await checkRes.json();

    if (existing && existing.length > 0) {
      // Profile exists, update avatar if provided
      if (avatar_url) {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ avatar_url }),
        });
      }
      return NextResponse.json({ ok: true, action: 'updated' });
    }

    // Create new profile
    const newProfile = {
      id: user_id,
      email,
      full_name: full_name || '',
      avatar_url: avatar_url || '',
      role: 'pastor',
      plan: 'free',
      points: 100,
      created_at: new Date().toISOString(),
    };

    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(newProfile),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('Profile creation failed:', err);
      return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 });
    }

    // Also create church_settings with reply_email set to registration email
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/church_settings`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ user_id, reply_email: email }),
      });
    } catch (settingsErr) {
      console.error('Church settings creation failed (non-critical):', settingsErr);
    }

    return NextResponse.json({ ok: true, action: 'created' });
  } catch (e) {
    console.error('ensure-profile error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

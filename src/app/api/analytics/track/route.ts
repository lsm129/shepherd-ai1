import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const adminHeaders = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'pageview') {
      await fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          user_id: data.userId || null,
          session_id: data.sessionId || null,
          page_path: data.pagePath,
          page_name: data.pageName || null,
          referrer: data.referrer || null,
          user_agent: data.userAgent || null,
          plan: data.plan || null,
          role: data.role || null,
        }),
      }).catch(() => {});
    } else if (type === 'event') {
      await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          user_id: data.userId || null,
          session_id: data.sessionId || null,
          event_name: data.eventName,
          event_data: data.eventData || {},
          page_path: data.pagePath || null,
          plan: data.plan || null,
          role: data.role || null,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

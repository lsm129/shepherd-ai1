import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CREEM_API_KEY } from '@/lib/creem';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';


const CREEM_API_BASE = 'https://api.creem.io/v1';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!CREEM_API_KEY) {
      return NextResponse.json({ error: 'Payment system not configured.' }, { status: 500 });
    }

    // Get user's Creem customer ID from profile
    const supabaseUrl = (supabaseUrl);
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('creem_customer_id, plan')
      .eq('id', userId)
      .single();

    const customerId = profile?.creem_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 404 }
      );
    }

    // Generate customer portal link via Creem API
    
    const response = await fetch(`CREEM_API_BASE/customers/billing`, {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Creem billing portal error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to generate billing portal link.' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      portalUrl: data.customer_portal_link,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to open billing portal';
    console.error('Billing portal error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

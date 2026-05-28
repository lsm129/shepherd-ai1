import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortal } from '@/lib/creem';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Get user's Creem customer ID from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('creem_customer_id, email')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (!profile.creem_customer_id) {
      return NextResponse.json(
        { error: 'No Creem customer ID found. Please subscribe first.' },
        { status: 400 }
      );
    }

    const portalUrl = await createCustomerPortal(profile.creem_customer_id);

    return NextResponse.json({ portalUrl });
  } catch (error) {
    console.error('Portal creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal link' },
      { status: 500 }
    );
  }
}

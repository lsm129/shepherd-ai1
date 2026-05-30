import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST - Record a consumed AI generation (called when user approves content)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, toolType, inputSummary } = body;
    if (!userId || !toolType) {
      return NextResponse.json({ error: 'Missing userId or toolType' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Record the consumed generation
    const { error } = await supabase.from('generations').insert({
      user_id: userId,
      tool_type: toolType,
      input_summary: inputSummary || '',
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Decrement pending count in user_metadata
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};
    const pendingCount = Math.max(0, (meta.pending_gen_count || 0) - 1);
    
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...meta, pending_gen_count: pendingCount },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Consume error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Record a rejected generation (user didn't like it, doesn't count)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Just decrement pending count, don't record in generations
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const meta = user?.user_metadata || {};
    const pendingCount = Math.max(0, (meta.pending_gen_count || 0) - 1);
    
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { ...meta, pending_gen_count: pendingCount },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

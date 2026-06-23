import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase-config';

export async function POST(request: NextRequest) {
  try {
    const { userId, milestone, experience, favoriteFeature, improvementSuggestions, testimonial, authorizeMarketing } = await request.json();

    if (!userId || !milestone) {
      return NextResponse.json({ error: 'userId and milestone are required' }, { status: 400 });
    }

    if (!['30day', '60day'].includes(milestone)) {
      return NextResponse.json({ error: 'Invalid milestone. Must be 30day or 60day' }, { status: 400 });
    }

    // Verify user exists and is an approved founding church
    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8');
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is an approved founding church
    const { data: application } = await supabaseAdmin
      .from('founding_church_applications')
      .select('status')
      .eq('user_id', userId)
      .single();

    if (!application || application.status !== 'approved') {
      return NextResponse.json({ error: 'Not an approved founding church' }, { status: 403 });
    }

    // Check if report already submitted for this milestone
    const { data: existing } = await supabaseAdmin
      .from('founding_church_reports')
      .select('id')
      .eq('user_id', userId)
      .eq('milestone', milestone)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing report
      const { error: updateError } = await supabaseAdmin
        .from('founding_church_reports')
        .update({
          experience,
          favorite_feature: favoriteFeature,
          improvement_suggestions: improvementSuggestions,
          testimonial: testimonial || null,
          authorize_marketing: authorizeMarketing || false,
        })
        .eq('user_id', userId)
        .eq('milestone', milestone);

      if (updateError) {
        console.error('Failed to update report:', updateError);
        return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'updated' });
    }

    // Insert new report
    const { error: insertError } = await supabaseAdmin
      .from('founding_church_reports')
      .insert({
        user_id: userId,
        milestone,
        experience,
        favorite_feature: favoriteFeature,
        improvement_suggestions: improvementSuggestions,
        testimonial: testimonial || null,
        authorize_marketing: authorizeMarketing || false,
      });

    if (insertError) {
      console.error('Failed to insert report:', insertError);
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: 'created' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8');
    
    // Get reports for this user
    const { data: reports } = await supabaseAdmin
      .from('founding_church_reports')
      .select('*')
      .eq('user_id', userId);

    // Check if approved founding church
    const { data: application } = await supabaseAdmin
      .from('founding_church_applications')
      .select('status, created_at')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({
      reports: reports || [],
      isApproved: application?.status === 'approved',
      applicationDate: application?.created_at || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get reports';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resumeSubscription } from '@/lib/paddle';

// Server-side Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 401 }
      );
    }

    // Get the user's profile to find the subscription ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('paddle_subscription_id, plan_type, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 }
      );
    }

    if (!profile.paddle_subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found to resume.' },
        { status: 400 }
      );
    }

    if (profile.subscription_status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription is not cancelled.' },
        { status: 400 }
      );
    }

    // Resume the subscription via Paddle API
    await resumeSubscription(profile.paddle_subscription_id);

    // Update the profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update profile after resume:', updateError);
    }

    // Create a notification for the user
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'subscription',
        title: '🎉 Subscription Resumed!',
        message: 'Your subscription has been resumed. Welcome back!',
        read: false,
      });

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully.',
    });
  } catch (error) {
    console.error('Resume subscription error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

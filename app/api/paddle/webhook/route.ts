import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature, mapPaddleStatus, priceIdToPlan } from '@/lib/paddle';

// Server-side Supabase client with service role for webhook operations
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

// Map Paddle price IDs to plan types
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.PADDLE_PRO_PRICE_ID ?? '']: 'pro',
  [process.env.PADDLE_PREMIUM_PRICE_ID ?? '']: 'premium',
};

/**
 * Creates a notification for a user.
 */
async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      read: false,
    });

  if (error) {
    console.error('Failed to create notification:', error);
  }
}

/**
 * Records an event in the subscription history.
 */
async function recordSubscriptionHistory(
  userId: string,
  eventType: string,
  data: Record<string, unknown>
) {
  const customerId = data.p_customer_id as string | undefined;
  const subscriptionId = data.p_subscription_id as string | undefined;
  const priceId = data.p_price_id as string | undefined;
  const status = data.canceled_at ? 'cancelled' : (data.status as string | undefined);
  const planType = priceId ? (PRICE_TO_PLAN[priceId] ?? 'free') : 'free';

  await supabaseAdmin
    .from('subscription_history')
    .insert({
      user_id: userId,
      paddle_customer_id: customerId,
      paddle_subscription_id: subscriptionId,
      plan_type: planType,
      status: status ?? 'unknown',
      event_type: eventType,
      amount: data.unit_price ? parseFloat(data.unit_price as string) : null,
      currency: 'EUR',
      raw_payload: data,
    });
}

/**
 * Updates the user profile with Paddle data.
 */
async function updateProfile(
  userId: string,
  updates: Record<string, string | null>
) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}

/**
 * Finds a user by paddle_customer_id.
 */
async function findUserByCustomerId(customerId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, plan_type')
    .eq('paddle_customer_id', customerId)
    .single();

  if (error || !data) {
    console.error('User not found for customer ID:', customerId);
    return null;
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    // Read the raw body for signature verification
    const rawBody = await request.text();

    // Parse the body
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    const signature = body.p_signature as string;
    if (signature) {
      const isValid = verifyWebhookSignature(body, signature);
      if (!isValid) {
        console.error('Webhook signature verification failed.');
        return NextResponse.json(
          { error: 'Invalid webhook signature.' },
          { status: 403 }
        );
      }
    } else {
      console.warn('No webhook signature provided. Skipping verification.');
    }

    const alertName = body.alert_name as string;
    const customerId = body.p_customer_id as string | undefined;
    const subscriptionId = body.p_subscription_id as string | undefined;
    const status = body.status as string | undefined;

    console.log(`[Paddle Webhook] Event received: ${alertName}`);

    // Find the user associated with this Paddle customer
    let userId: string | null = null;

    if (customerId) {
      const user = await findUserByCustomerId(customerId);
      if (user) {
        userId = user.id;
      }
    }

    // If we couldn't find by customer_id, try by subscription_id
    if (!userId && subscriptionId) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('paddle_subscription_id', subscriptionId)
        .single();
      if (data) {
        userId = data.id;
      }
    }

    // Still not found — try looking up user from email
    if (!userId && body.email && typeof body.email === 'string') {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', body.email)
        .single();
      if (data) {
        userId = data.id;
      }
    }

    if (!userId) {
      console.error('Could not find user for webhook event:', alertName);
      // Return 200 to prevent Paddle from retrying
      return NextResponse.json({ received: true, warning: 'User not found' });
    }

    const internalStatus = status ? mapPaddleStatus(status) : undefined;
    const currentPlan = body.price_id ? priceIdToPlan(body.price_id as string) : undefined;

    // Handle different webhook events
    switch (alertName) {
      case 'subscription.created': {
        await updateProfile(userId, {
          paddle_customer_id: customerId ?? null,
          paddle_subscription_id: subscriptionId ?? null,
          subscription_status: internalStatus ?? 'active',
          plan_type: currentPlan ?? 'free',
          ...(body.next_bill_date ? { current_period_end: body.next_bill_date as string } : {}),
        });

        await createNotification(
          userId,
          'subscription',
          '🎉 Subscription Activated!',
          `Welcome to Goalify ${currentPlan ?? 'Pro'}! Your subscription is now active.`
        );

        await recordSubscriptionHistory(userId, 'subscription.created', body);
        break;
      }

      case 'subscription.updated': {
        await updateProfile(userId, {
          paddle_customer_id: customerId ?? null,
          paddle_subscription_id: subscriptionId ?? null,
          subscription_status: internalStatus ?? 'active',
          plan_type: currentPlan ?? 'free',
          ...(body.next_bill_date ? { current_period_end: body.next_bill_date as string } : {}),
        });

        await recordSubscriptionHistory(userId, 'subscription.updated', body);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.canceled': {
        await updateProfile(userId, {
          paddle_customer_id: customerId ?? null,
          paddle_subscription_id: subscriptionId ?? null,
          subscription_status: 'cancelled',
          plan_type: 'free',
        });

        await createNotification(
          userId,
          'subscription',
          '⚠️ Subscription Cancelled',
          'Your subscription has been cancelled. You can continue using your current plan until the end of the billing period.'
        );

        await recordSubscriptionHistory(userId, 'subscription.cancelled', body);
        break;
      }

      case 'subscription.payment.succeeded': {
        // Update the billing period end date
        if (body.next_bill_date) {
          await updateProfile(userId, {
            current_period_end: body.next_bill_date as string,
            subscription_status: 'active',
          });
        }

        await createNotification(
          userId,
          'billing',
          '✅ Payment Successful',
          `Your ${currentPlan ?? 'subscription'} payment has been processed successfully.`
        );

        await recordSubscriptionHistory(userId, 'subscription.payment.succeeded', body);
        break;
      }

      case 'subscription.payment.failed': {
        await updateProfile(userId, {
          subscription_status: 'past_due',
        });

        await createNotification(
          userId,
          'billing',
          '❌ Payment Failed',
          'We couldn&apos;t process your payment. Please update your payment method in settings.'
        );

        await recordSubscriptionHistory(userId, 'subscription.payment.failed', body);
        break;
      }

      default:
        console.log(`[Paddle Webhook] Unhandled event type: ${alertName}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent Paddle from retrying webhook calls
    return NextResponse.json(
      { received: true, error: 'Processing error logged' },
      { status: 200 }
    );
  }
}

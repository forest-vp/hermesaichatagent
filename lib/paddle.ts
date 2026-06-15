/**
 * Paddle API helper functions for Goalify
 *
 * Uses Paddle's server-side API (v2) for checkout link generation,
 * subscription management, and webhook signature verification.
 */

const PADDLE_API_BASE = 'https://api.paddle.com/2.0';
const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID ?? '';
const PADDLE_API_KEY = process.env.PADDLE_API_KEY ?? '';
const PADDLE_PUBLIC_KEY = process.env.PADDLE_PUBLIC_KEY ?? '';

// Price ID mapping
export const PADDLE_PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.PADDLE_PRO_PRICE_ID,
  premium: process.env.PADDLE_PREMIUM_PRICE_ID,
};

export type PlanType = 'free' | 'pro' | 'premium';

export interface PaddleCheckoutOptions {
  plan: PlanType;
  userEmail: string;
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaddleCheckoutResult {
  url: string;
}

export interface PaddleSubscription {
  id: string;
  status: string;
  planType: PlanType;
}

/**
 * Returns a configured fetch wrapper for Paddle API calls.
 */
export function getPaddleClient() {
  if (!PADDLE_VENDOR_ID || !PADDLE_API_KEY) {
    throw new Error(
      'Paddle credentials not configured. Set PADDLE_VENDOR_ID and PADDLE_API_KEY.'
    );
  }

  return {
    baseUrl: PADDLE_API_BASE,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${PADDLE_VENDOR_ID}:${PADDLE_API_KEY}`).toString('base64')}`,
    },
  };
}

/**
 * Generates a Paddle checkout URL for a given plan and user.
 */
export async function createCheckoutUrl(
  plan: PlanType,
  userEmail: string,
  userId: string,
  baseUrl: string
): Promise<string> {
  if (plan === 'free') {
    throw new Error('Cannot create checkout for free plan.');
  }

  const priceId = PADDLE_PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(`No Paddle price ID configured for plan: ${plan}`);
  }

  const client = getPaddleClient();

  const successUrl = `${baseUrl}/dashboard?checkout=success`;
  const cancelUrl = `${baseUrl}/dashboard/pricing?checkout=cancelled`;

  const body = {
    product_id: priceId,
    customer_email: userEmail,
    customer_country: '',
    customer_postcode: '',
    allow_quantity: false,
    disable_logout: true,
    passthrough: JSON.stringify({ user_id: userId, plan }),
    success_url: successUrl,
    cancel_url: cancelUrl,
    marketing_consent: false,
    title: `Goalify ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
  };

  const response = await fetch(`${client.baseUrl}/product/generate-pay-link`, {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Paddle API error:', response.status, errorText);
    throw new Error(`Paddle API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.success && data.response?.url) {
    return data.response.url;
  }

  throw new Error('Failed to generate Paddle checkout URL');
}

/**
 * Cancels a Paddle subscription by subscription ID.
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const client = getPaddleClient();

  const response = await fetch(`${client.baseUrl}/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Paddle cancel error:', response.status, errorText);
    throw new Error(`Paddle cancel error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error('Failed to cancel Paddle subscription');
  }
}

/**
 * Resumes (uncancels) a Paddle subscription.
 */
export async function resumeSubscription(subscriptionId: string): Promise<void> {
  const client = getPaddleClient();

  const response = await fetch(`${client.baseUrl}/subscriptions/${subscriptionId}/resume`, {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Paddle resume error:', response.status, errorText);
    throw new Error(`Paddle resume error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error('Failed to resume Paddle subscription');
  }
}

/**
 * Verifies a Paddle webhook signature using the public key.
 *
 * Paddle sends a signature in the `p_signature` field of the webhook body.
 * We verify it using the public key with RSA-SHA1.
 */
export function verifyWebhookSignature(
  body: Record<string, unknown>,
  signature: string
): boolean {
  try {
    // Paddle webhook verification uses Sodium/Ed25519 signatures
    // The signature is base64-encoded and verified against the public key
    const crypto = require('crypto');

    // Remove the signature from the body for verification
    const { p_signature, ...dataToVerify } = body;

    // Sort the data by key (Paddle requirement)
    const sortedKeys = Object.keys(dataToVerify).sort();
    const sortedData: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      sortedData[key] = dataToVerify[key];
    }

    // Serialize in PHP's serialize format (Paddle uses PHP-style serialization)
    const serialized = phpStyleSerialize(sortedData);

    // Verify using the public key
    const verifier = crypto.createVerify('RSA-SHA1');
    verifier.update(serialized);
    verifier.end();

    const publicKey = formatPublicKey(PADDLE_PUBLIC_KEY);
    return verifier.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Formats the Paddle public key into PEM format.
 */
function formatPublicKey(key: string): string {
  if (key.startsWith('-----BEGIN')) {
    return key;
  }
  const formatted = key.match(/.{1,64}/g)?.join('\n') ?? key;
  return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
}

/**
 * Simple PHP-style serialization for Paddle webhook verification.
 * Handles strings, numbers, booleans, null, and nested objects/arrays.
 */
function phpStyleSerialize(data: unknown): string {
  if (data === null) {
    return 'N;';
  }
  if (typeof data === 'boolean') {
    return `b:${data ? 1 : 0};`;
  }
  if (typeof data === 'number') {
    if (Number.isInteger(data)) {
      return `i:${data};`;
    }
    return `d:${data};`;
  }
  if (typeof data === 'string') {
    return `s:${data.length}:"${data}";`;
  }
  if (Array.isArray(data)) {
    let result = `a:${data.length}:{`;
    data.forEach((item, index) => {
      result += phpStyleSerialize(index) + phpStyleSerialize(item);
    });
    result += '}';
    return result;
  }
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    let result = `a:${keys.length}:{`;
    for (const key of keys) {
      result += phpStyleSerialize(key) + phpStyleSerialize(obj[key]);
    }
    result += '}';
    return result;
  }
  return 'N;';
}

/**
 * Maps a Paddle subscription status to our internal status.
 */
export function mapPaddleStatus(paddleStatus: string): string {
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    paused: 'paused',
    cancelled: 'cancelled',
    expired: 'expired',
  };
  return statusMap[paddleStatus] ?? paddleStatus;
}

/**
 * Maps a Paddle price ID to a plan type.
 */
export function priceIdToPlan(priceId: string): PlanType {
  if (priceId === PADDLE_PRICE_IDS.pro) return 'pro';
  if (priceId === PADDLE_PRICE_IDS.premium) return 'premium';
  return 'free';
}

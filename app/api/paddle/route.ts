import { NextResponse } from 'next/server';

// Paddle checkout link generation
export async function POST(request: Request) {
  try {
    const { plan, userEmail } = await request.json();
    const vendorId = process.env.PADDLE_VENDOR_ID;
    const apiKey = process.env.PADDLE_API_KEY;
    if (!vendorId || !apiKey) return NextResponse.json({ error: 'Paddle not configured' }, { status: 500 });

    const priceIds: Record<string, string> = {
      pro: process.env.PADDLE_PRO_PRICE_ID || '',
      premium: process.env.PADDLE_PREMIUM_PRICE_ID || '',
    };

    const response = await fetch('https://api.paddle.com/2.0/product/generate-pay-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml', Authorization: `Basic ${Buffer.from(`${vendorId}:${apiKey}`).toString('base64')}` },
      body: JSON.stringify({
        product_id: priceIds[plan],
        customer_email: userEmail,
        passthrough: JSON.stringify({ plan, email: userEmail }),
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      }),
    });

    const data = await response.json();
    if (data?.success && data?.response?.url) {
      return NextResponse.json({ url: data.response.url });
    }
    return NextResponse.json({ error: 'Failed to create checkout link' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

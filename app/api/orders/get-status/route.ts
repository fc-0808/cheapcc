// app/api/orders/get-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Determine if the order ID is for Stripe or PayPal
    const isStripeId = typeof orderId === 'string' && orderId.startsWith('pi_');
    const queryColumn = isStripeId ? 'stripe_payment_intent_id' : 'paypal_order_id';

    // Query using the service role client to bypass RLS for this specific check
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, name, email, amount, currency, description, status, created_at, expiry_date, stripe_payment_intent_id, paypal_order_id')
      .eq(queryColumn, orderId)
      .maybeSingle();

    if (error) {
      console.error(`API Error fetching order status for ${orderId}:`, error);
      throw error;
    }

    if (!order) {
      // It's important to return a 404 if the order isn't found *yet*,
      // so the client knows to continue polling.
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Once found, return the order data
    return NextResponse.json(order);

  } catch (err: any) {
    console.error('Error in get-status handler:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
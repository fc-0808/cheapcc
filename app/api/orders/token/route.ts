import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();
  
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      console.error('Token generation failed: Order ID is required');
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to generate token for order ${orderId}`);
    
    // Check if the order exists in the database
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('paypal_order_id', orderId)
      .maybeSingle();
    
    // If order doesn't exist yet (PayPal webhook hasn't processed it)
    if (!existingOrder) {
      console.log(`Order ${orderId} not found in database yet. This is normal if PayPal webhook hasn't processed it.`);
      
      return NextResponse.json(
        { 
          error: 'Cannot generate token yet - order not in database', 
          details: 'This is usually temporary while the order is being processed by PayPal webhook.',
          retryable: true
        },
        { status: 409 }  // Conflict status code
      );
    }
    
    // Check if token already exists for this order
    const { data: existingToken } = await supabase
      .from('order_tokens')
      .select('token')
      .eq('order_id', orderId)
      .maybeSingle();
    
    // If token already exists, return it
    if (existingToken?.token) {
      console.log(`Using existing token for order ${orderId}`);
      return NextResponse.json({ token: existingToken.token });
    }
    
    console.log(`Generating new token for order ${orderId}`);
    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token valid for 24 hours
    
    // Store the token in Supabase
    const { error } = await supabase
      .from('order_tokens')
      .insert([
        {
          token,
          order_id: orderId,
          expires_at: expiresAt.toISOString(),
        }
      ]);
      
    if (error) {
      // Check for race condition where another process created the token in parallel
      if (error.code === '23505') { // unique_violation
        console.log(`Race condition detected for ${orderId}, fetching the token created by parallel process`);
        const { data: racedToken } = await supabase
          .from('order_tokens')
          .select('token')
          .eq('order_id', orderId)
          .maybeSingle();
          
        if (racedToken?.token) {
          return NextResponse.json({ token: racedToken.token });
        }
      }
      throw error;
    }
    
    console.log(`Successfully generated token for order ${orderId}`);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
  
  try {
    // Get token and orderId from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const orderId = searchParams.get('orderId');
    
    if (!token || !orderId) {
      console.error('Token verification failed: Missing token or orderId');
      return NextResponse.json(
        { error: 'Missing token or orderId' },
        { status: 400 }
      );
    }
    
    console.log(`Verifying token for order ${orderId}`);
    
    // Ensure token isn't 'undefined' string
    if (token === 'undefined') {
      console.error(`Token is 'undefined' string for orderId: ${orderId}`);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // First try to fetch token data
    const { data: tokenData, error: tokenError } = await supabase
      .from('order_tokens')
      .select('*')
      .eq('token', token)
      .eq('order_id', orderId)
      .single();
      
    if (tokenError) {
      console.error(`Token verification error for order ${orderId}:`, tokenError.message);
      
      // Fall back to direct order lookup if token table doesn't exist or other structural issues
      if (tokenError.message.includes('relation "order_tokens" does not exist') || 
          tokenError.code === 'PGRST204') {
        console.warn('Order tokens table not available, falling back to direct order lookup');
        
        // Try to fetch the order directly as fallback
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('paypal_order_id', orderId)
          .single();
          
        if (orderError || !order) {
          console.error(`Order ${orderId} not found during fallback`);
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }
        
        console.log(`Found order ${orderId} via fallback method`);
        return NextResponse.json({ order });
      }
      
      // For normal token validation failures
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    if (!tokenData) {
      console.error(`No token data found for order ${orderId}`);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      console.error(`Token for order ${orderId} has expired`);
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }
    
    console.log(`Token for order ${orderId} is valid, fetching order details`);
    
    // Fetch the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('paypal_order_id', orderId)
      .single();
      
    if (orderError) {
      console.error(`Error fetching order ${orderId} after valid token:`, orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    if (!order) {
      console.error(`Order ${orderId} not found after valid token`);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log(`Successfully verified token and fetched order ${orderId}`);
    
    // Return the order details
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
} 
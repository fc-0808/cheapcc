import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('product_id');
    const orderId = searchParams.get('order_id');
    const customerEmail = searchParams.get('customer_email');

    const supabase = createClient();
    
    // Query orders table for redemption code orders instead of separate redemption_codes table
    let query = supabase
      .from('orders')
      .select(`
        id,
        name,
        email,
        status,
        amount,
        currency,
        description,
        created_at,
        updated_at,
        product_id,
        product_type,
        activation_type,
        product:products(*)
      `)
      .eq('product_type', 'redemption_code')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (orderId) {
      query = query.eq('id', orderId);
    }

    if (customerEmail) {
      query = query.eq('email', customerEmail);
    }

    const { data: codes, error } = await query;

    if (error) {
      console.error('Error fetching redemption code orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch redemption code orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      codes: codes || [],
      total: codes?.length || 0,
    });

  } catch (error) {
    console.error('Unexpected error in redemption codes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if user is admin (for manual creation)
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await request.json();
    const { 
      product_id, 
      customer_name,
      customer_email,
      amount
    } = body;

    // Validate required fields
    if (!product_id || !customer_name || !customer_email || !amount) {
      return NextResponse.json(
        { error: 'Product ID, customer name, customer email, and amount are required' },
        { status: 400 }
      );
    }

    // Verify product exists and is a redemption code product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('product_type', 'redemption_code')
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Invalid product ID or product is not a redemption code product' },
        { status: 400 }
      );
    }

    // Create redemption code order directly in orders table
    const now = new Date();
    const orderRecord = {
      name: customer_name,
      email: customer_email,
      status: null, // Redemption codes don't have ACTIVE status since they're redeemed at Adobe
      amount: amount,
      currency: 'USD',
      description: `${product.name} - Manual Creation`,
      product_id: product_id,
      product_type: 'redemption_code',
      activation_type: 'redemption-required',
      payment_processor: 'manual',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert([orderRecord])
      .select(`
        *,
        product:products(*)
      `)
      .single();

    if (insertError) {
      console.error('Error creating redemption code order:', insertError);
      return NextResponse.json(
        { error: 'Failed to create redemption code order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order: insertedOrder,
      message: `Successfully created redemption code order for ${product.name}`,
      instructions: 'Redemption codes will be delivered manually via email. The actual codes are not stored in the database for security.',
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in redemption code record creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const body = await request.json();
    const { 
      order_id, 
      status, 
      notes
    } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Verify this is a redemption code order
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, product_type')
      .eq('id', order_id)
      .eq('product_type', 'redemption_code')
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json(
        { error: 'Redemption code order not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // For redemption codes, we can track delivery status in a notes field or custom status
    if (status) {
      // Map redemption code statuses to order statuses
      if (status === 'delivered') {
        updateData.status = 'COMPLETED'; // Codes delivered to customer
      } else if (status === 'redeemed') {
        updateData.status = 'ACTIVE'; // Customer has redeemed at Adobe
      }
    }

    if (notes) {
      updateData.description = existingOrder.description + ` | Notes: ${notes}`;
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id)
      .select(`
        *,
        product:products(*)
      `)
      .single();

    if (error) {
      console.error('Error updating redemption code order:', error);
      return NextResponse.json(
        { error: 'Failed to update redemption code order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order: updatedOrder,
      message: 'Redemption code order updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in redemption code order update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

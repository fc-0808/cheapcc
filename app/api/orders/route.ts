import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { PRICING_OPTIONS, PricingOption } from '@/utils/products';
import { supabase } from '@/utils/supabase-server';

// PayPal client configuration
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_SECRET_KEY!
);
const client = new paypal.core.PayPalHttpClient(environment);

// Type for PayPal order response
interface PayPalOrderResponse {
  result: {
    id: string;
    status: string;
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get the pricing option ID from the request
    const { priceId, name, email } = await request.json();
    
    // Find the selected pricing option
    const selectedOption = PRICING_OPTIONS.find(option => option.id === priceId);
    
    if (!selectedOption) {
      return NextResponse.json(
        { error: 'Invalid pricing option' },
        { status: 400 }
      );
    }

    // Create order request
    const orderRequest = new paypal.orders.OrdersCreateRequest();
    orderRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: selectedOption.price.toFixed(2),
          },
          description: `Adobe Creative Cloud - ${selectedOption.duration} Subscription`,
        },
      ],
      application_context: {
        brand_name: 'Adobe Creative Cloud',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
      },
    });

    // Call PayPal to create the order
    const order = await client.execute(orderRequest) as PayPalOrderResponse;

    // Store in Supabase
    await supabase.from('orders').insert([
      {
        paypal_order_id: order.result.id,
        name,
        email,
        status: order.result.status,
        amount: selectedOption?.price,
        currency: 'USD',
      }
    ]);

    // Return the order ID and details to the client
    return NextResponse.json({
      id: order.result.id,
      status: order.result.status,
      price: selectedOption.price,
      duration: selectedOption.duration,
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 
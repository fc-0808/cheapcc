import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

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
    // Create order request
    const orderRequest = new paypal.orders.OrdersCreateRequest();
    orderRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '1.00',
          },
          description: 'PayPal Webhook Test Purchase',
        },
      ],
      application_context: {
        brand_name: 'Webhook Test',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        // No need for return_url and cancel_url since we're handling everything via client-side JS
      },
    });

    // Call PayPal to create the order
    const order = await client.execute(orderRequest) as PayPalOrderResponse;

    // Return the order ID to the client
    return NextResponse.json({
      id: order.result.id,
      status: order.result.status,
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// PayPal client configuration
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_SECRET_KEY!
);
const client = new paypal.core.PayPalHttpClient(environment);

// Type for PayPal capture response
interface PayPalCaptureResponse {
  result: {
    id: string;
    status: string;
    payer: any;
    purchase_units: any[];
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get order ID from request body
    const { orderID } = await request.json();
    
    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Create capture request
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({});

    // Call PayPal to capture the order
    const capture = await client.execute(captureRequest) as PayPalCaptureResponse;

    // Return capture details to the client
    return NextResponse.json({
      id: capture.result.id,
      status: capture.result.status,
      payer: capture.result.payer,
      purchase_units: capture.result.purchase_units,
    });
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    
    // Handle specific PayPal errors
    const errorDetails = error.details ? JSON.stringify(error.details) : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to capture order', details: errorDetails },
      { status: 500 }
    );
  }
} 
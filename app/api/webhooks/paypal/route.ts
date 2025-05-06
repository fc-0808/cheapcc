import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';

// PayPal client configuration
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_SECRET_KEY!
);
const client = new paypal.core.PayPalHttpClient(environment);

// Simple in-memory store for demonstration
// In a real app, you would use a database
type Order = {
  id: string;
  status: string;
  customerEmail?: string;
  amount?: string;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
};

// This would typically be stored in a database
const orders: Record<string, Order> = {};

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text();
    
    // Verify the webhook signature
    const isValid = await verifyPayPalWebhookSignature(rawBody, request.headers);
    
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse the JSON body
    const body = JSON.parse(rawBody);
    
    // Get webhook ID and event type
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const eventType = body.event_type;
    
    console.log('Received PayPal webhook:', eventType);
    console.log('Webhook data:', JSON.stringify(body, null, 2));
    
    // Process different event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was successful
        await handlePaymentCompleted(body);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        // Payment was denied
        await handlePaymentDenied(body);
        break;
      
      // Handle other event types as needed
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(body);
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    // Return 200 OK to PayPal
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Helper functions for handling different event types
async function handlePaymentCompleted(webhookData: any) {
  const paymentId = webhookData.resource.id;
  const paymentStatus = webhookData.resource.status;
  const orderId = webhookData.resource.supplementary_data?.related_ids?.order_id;
  
  console.log(`Processing completed payment: ${paymentId} with status: ${paymentStatus}`);
  
  if (orderId && orders[orderId]) {
    // Update order status
    orders[orderId] = {
      ...orders[orderId],
      status: 'COMPLETED',
      updatedAt: new Date()
    };
    
    console.log(`Updated order ${orderId} status to COMPLETED`);
  } else {
    // Create a new order record if we don't have it yet
    const newOrderId = paymentId;
    orders[newOrderId] = {
      id: newOrderId,
      status: 'COMPLETED',
      amount: webhookData.resource.amount?.value,
      currency: webhookData.resource.amount?.currency_code,
      customerEmail: webhookData.resource.payer?.email_address,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`Created new order record for payment ${paymentId}`);
  }
  
  // Here you would also:
  // 1. Send confirmation email to customer
  // 2. Update inventory
  // 3. Generate license keys or access credentials
}

async function handlePaymentDenied(webhookData: any) {
  const paymentId = webhookData.resource.id;
  const orderId = webhookData.resource.supplementary_data?.related_ids?.order_id;
  
  console.log(`Processing denied payment: ${paymentId}`);
  
  if (orderId && orders[orderId]) {
    // Update order status
    orders[orderId] = {
      ...orders[orderId],
      status: 'DENIED',
      updatedAt: new Date()
    };
    
    console.log(`Updated order ${orderId} status to DENIED`);
  }
  
  // Here you would handle the failed payment
  // 1. Notify customer
  // 2. Log the failed transaction
}

async function handleOrderApproved(webhookData: any) {
  const orderId = webhookData.resource.id;
  
  console.log(`Processing approved order: ${orderId}`);
  
  // Store order information
  orders[orderId] = {
    id: orderId,
    status: 'APPROVED',
    amount: webhookData.resource.purchase_units?.[0]?.amount?.value,
    currency: webhookData.resource.purchase_units?.[0]?.amount?.currency_code,
    customerEmail: webhookData.resource.payer?.email_address,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log(`Stored new order: ${JSON.stringify(orders[orderId])}`);
  
  // Here you would:
  // 1. Reserve inventory
  // 2. Prepare for fulfillment when payment completes
} 
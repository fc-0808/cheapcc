import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';
import { supabase } from '@/utils/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';

// PayPal client configuration
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_SECRET_KEY!
);
const client = new paypal.core.PayPalHttpClient(environment);

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
    
    // Get event type
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

// Helper function for handling PAYMENT.CAPTURE.COMPLETED event
async function handlePaymentCompleted(webhookData: any) {
  const paymentId = webhookData.resource.id;
  const paymentStatus = webhookData.resource.status;
  const orderId = webhookData.resource.supplementary_data?.related_ids?.order_id;
  const purchaseUnit = webhookData.resource.supplementary_data?.purchase_units?.[0] || webhookData.resource.purchase_units?.[0];

  // Extract name and email from custom_id
  let name = '';
  let email = '';
  let customId = '';
  try {
    customId = purchaseUnit?.custom_id || webhookData.resource.custom_id;
    if (customId) {
      const parsed = JSON.parse(customId);
      name = parsed.name || '';
      email = parsed.email || '';
    }
  } catch (e) {
    console.error('Failed to parse custom_id:', customId, e);
  }

  // Extract amount and currency
  const amount = webhookData.resource.amount?.value || null;
  const currency = webhookData.resource.amount?.currency_code || null;

  // Duplicate insert protection
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id')
    .eq('paypal_order_id', orderId || paymentId)
    .maybeSingle();
  if (fetchError) {
    console.error('Error checking for existing order:', fetchError);
    return;
  }
  if (existingOrder) {
    console.log('Order already exists, skipping insert.');
    return;
  }

  // Insert new order into Supabase
  const { error: insertError } = await supabase.from('orders').insert([
    {
      paypal_order_id: orderId || paymentId,
      name,
      email,
      status: paymentStatus,
      amount,
      currency,
      paypal_data: webhookData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (insertError) {
    console.error('Failed to insert Supabase order:', insertError);
    return;
  }
  console.log('Inserted new order into Supabase:', orderId || paymentId);
  
  // Fetch the order from Supabase to get name/email
  const { data: order, error } = await supabase
    .from('orders')
    .select('email, name')
    .eq('paypal_order_id', orderId || paymentId)
    .single();

  if (order && order.email && order.name) {
    try {
      await sendConfirmationEmail(order.email, order.name, orderId || paymentId);
      console.log(`Confirmation email sent to ${order.email}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }
  }
}

// Helper function for handling PAYMENT.CAPTURE.DENIED event
async function handlePaymentDenied(webhookData: any) {
  const paymentId = webhookData.resource.id;
  const orderId = webhookData.resource.supplementary_data?.related_ids?.order_id;
  
  console.log(`Processing denied payment: ${paymentId}`);
  
  // Update Supabase order
  if (orderId) {
    const { error: updateError } = await supabase.from('orders')
      .update({
        status: 'DENIED',
        paypal_data: webhookData,
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_order_id', orderId);
    if (updateError) {
      console.error('Failed to update Supabase order (DENIED):', updateError);
      return;
    }
  }
  
  // Here you would handle the failed payment
  // 1. Notify customer
  // 2. Log the failed transaction
} 
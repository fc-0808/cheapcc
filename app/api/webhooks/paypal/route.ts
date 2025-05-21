import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';
import { createClient } from '@/utils/supabase/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';
import { logToFile } from '../../../../utils/logger';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text();
    
    // Verify the webhook signature
    const isValid = await verifyPayPalWebhookSignature(rawBody, request.headers);
    
    if (!isValid) {
      await logToFile('Invalid PayPal webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse the JSON body
    const body = JSON.parse(rawBody);
    
    // Get event type
    const eventType = body.event_type;
    
    await logToFile(`Received PayPal webhook: ${eventType}`);
    await logToFile(`Webhook data: ${JSON.stringify(body, null, 2)}`);
    
    // Process different event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was successful
        await handlePaymentCompleted(body, supabase);
        break;
      default:
        // Log all other events
        await logPayPalWebhookEvent(body, supabase);
        await logToFile(`Unhandled event type: ${eventType}`);
    }
    
    // Return 200 OK to PayPal
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    await logToFile(`PayPal webhook error: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Helper function for handling PAYMENT.CAPTURE.COMPLETED event
async function handlePaymentCompleted(webhookData: any, supabase: any) {
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
    await logToFile(`Failed to parse custom_id: ${customId} ${e}`);
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
    await logToFile(`Error checking for existing order: ${fetchError}`);
    return;
  }
  if (existingOrder) {
    await logToFile('Order already exists, skipping insert.');
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
    await logToFile(`Failed to insert Supabase order: ${insertError}`);
    return;
  }
  await logToFile(`Inserted new order into Supabase: ${orderId || paymentId}`);
  
  // Fetch the order from Supabase to get name/email
  const { data: order } = await supabase
    .from('orders')
    .select('email, name')
    .eq('paypal_order_id', orderId || paymentId)
    .single();

  if (order && order.email && order.name) {
    try {
      await sendConfirmationEmail(order.email, order.name, orderId || paymentId);
      await logToFile(`Confirmation email sent to ${order.email}`);
    } catch (emailError) {
      await logToFile(`Failed to send confirmation email: ${emailError}`);
    }
  }
}

// Helper function to log non-completed PayPal webhook events
async function logPayPalWebhookEvent(webhookData: any, supabase: any) {
  const eventId = webhookData.id;
  const eventType = webhookData.event_type;
  const resource = webhookData.resource || {};
  const resourceId = resource.id || null;

  // Robust extraction for paypal_order_id
  let paypalOrderId = null;
  if (resource.supplementary_data?.related_ids?.order_id) {
    paypalOrderId = resource.supplementary_data.related_ids.order_id;
  } else if (resource.id) {
    paypalOrderId = resource.id;
  }

  // Robust extraction for amount and currency
  let amount = null;
  let currency = null;
  if (resource.amount?.value && resource.amount?.currency_code) {
    amount = resource.amount.value;
    currency = resource.amount.currency_code;
  } else if (Array.isArray(resource.purchase_units) && resource.purchase_units[0]?.amount) {
    amount = resource.purchase_units[0].amount.value || null;
    currency = resource.purchase_units[0].amount.currency_code || null;
  }

  // Robust extraction for name/email from custom_id
  let name = null;
  let email = null;
  let customId = null;
  let purchaseUnit = null;
  if (Array.isArray(resource.purchase_units) && resource.purchase_units[0]) {
    purchaseUnit = resource.purchase_units[0];
  } else if (resource.supplementary_data?.purchase_units?.[0]) {
    purchaseUnit = resource.supplementary_data.purchase_units[0];
  }
  customId = purchaseUnit?.custom_id || resource.custom_id;
  try {
    if (customId) {
      const parsed = JSON.parse(customId);
      name = parsed.name || null;
      email = parsed.email || null;
    }
  } catch (e) {
    await logToFile(`Failed to parse custom_id in webhook event: ${customId} ${e}`);
  }

  const { error: insertError } = await supabase.from('paypal_webhook_events').insert([
    {
      event_id: eventId,
      event_type: eventType,
      paypal_order_id: paypalOrderId,
      resource_id: resourceId,
      name,
      email,
      amount,
      currency,
      payload: webhookData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (insertError) {
    await logToFile(`Failed to log PayPal webhook event: ${insertError}`);
  } else {
    await logToFile(`Logged PayPal webhook event: ${eventType} (${eventId})`);
  }
}
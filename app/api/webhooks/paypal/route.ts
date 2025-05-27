import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';
import { 
  calculateSavings, 
  getStandardPlanDescription, 
  calculateExpiryDate, 
  OrderLike, 
  getPricingOptionById, 
  PRICING_OPTIONS 
} from '@/utils/products';

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text();
    
    // Verify the webhook signature
    const isValid = await verifyPayPalWebhookSignature(rawBody, request.headers);
    
    if (!isValid) {
      console.warn('Invalid webhook signature received');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse the JSON body
    const body = JSON.parse(rawBody);
    
    // Get event type
    const eventType = body.event_type;
    console.log(`Processing PayPal webhook: ${eventType}`);
    
    // Process different event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was successful
        await handlePaymentCompleted(body, supabase);
        break;
      case 'CHECKOUT.ORDER.APPROVED':
        // Order was approved but not yet captured
        await handleOrderApproved(body, supabase);
        break;
      default:
        // Store other events in the database
        await storeWebhookEvent(body, supabase);
    }
    
    // Return 200 OK to PayPal
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Helper function for handling CHECKOUT.ORDER.APPROVED events
async function handleOrderApproved(webhookData: any, supabase: any) {
  const orderId = webhookData.resource.id;
  const status = webhookData.resource.status;

  console.log(`Processing CHECKOUT.ORDER.APPROVED for order ${orderId}`);

  let name = '';
  let email = '';
  let customId = '';
  let paypalDescription = '';
  let amount = null;
  let currency = null;
  let priceId = null;
  try {
    if (webhookData.resource.purchase_units && webhookData.resource.purchase_units[0]) {
      const purchaseUnit = webhookData.resource.purchase_units[0];
      paypalDescription = purchaseUnit.description || '';
      if (purchaseUnit.custom_id) {
        customId = purchaseUnit.custom_id;
        const parsed = JSON.parse(customId);
        name = parsed.name || '';
        email = parsed.email || '';
        priceId = parsed.priceId || null;
      }
      if (purchaseUnit.amount) {
        amount = purchaseUnit.amount.value || null;
        currency = purchaseUnit.amount.currency_code || null;
      }
    }
  } catch (e) {
    console.error('Failed to parse custom_id from order approved webhook:', e);
  }

  const now = new Date();
  const orderDataForUtils: OrderLike = { description: paypalDescription, amount, created_at: now, priceId };
  const standardDescription = getStandardPlanDescription(orderDataForUtils);
  const savings = calculateSavings(orderDataForUtils);
  const expiryDate = calculateExpiryDate(orderDataForUtils);

  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('paypal_order_id', orderId)
    .maybeSingle();
  if (fetchError) {
    console.error(`Error checking for existing order ${orderId}:`, fetchError);
    return;
  }

  let newStatus = 'PENDING';
  if (existingOrder && (existingOrder.status === 'ACTIVE' || existingOrder.status === 'COMPLETED')) {
    newStatus = existingOrder.status;
  }

  const { error: upsertError } = await supabase.from('orders').upsert([
    {
      paypal_order_id: orderId,
      name,
      email,
      status: newStatus,
      amount,
      currency,
      description: standardDescription,
      savings,
      expiry_date: expiryDate ? expiryDate.toISOString() : null,
      paypal_data: webhookData,
      original_status: status,
      updated_at: now.toISOString(),
    },
  ], { onConflict: 'paypal_order_id' });

  if (upsertError) {
    console.error(`Failed to upsert order for ${orderId} in handleOrderApproved:`, upsertError);
  }
  await storeWebhookEvent(webhookData, supabase);
}

// Helper function for handling PAYMENT.CAPTURE.COMPLETED event
async function handlePaymentCompleted(webhookData: any, supabase: any) {
  const paymentId = webhookData.resource.id;
  const paymentStatus = webhookData.resource.status;
  const orderId = webhookData.resource.supplementary_data?.related_ids?.order_id || paymentId;
  const purchaseUnit = webhookData.resource.supplementary_data?.purchase_units?.[0] || webhookData.resource.purchase_units?.[0];

  console.log(`Processing PAYMENT.CAPTURE.COMPLETED for order/payment ${orderId}`);

  let name = '';
  let email = '';
  let customId = '';
  let paypalDescription = '';
  let amount = null;
  let currency = null;
  let priceId = null;
  try {
    paypalDescription = purchaseUnit?.description || '';
    customId = purchaseUnit?.custom_id || webhookData.resource.custom_id;
    if (customId) {
      const parsed = JSON.parse(customId);
      name = parsed.name || '';
      email = parsed.email || '';
      priceId = parsed.priceId || null;
    }
    if (purchaseUnit?.amount) {
      amount = purchaseUnit.amount.value || null;
      currency = purchaseUnit.amount.currency_code || null;
    } else {
      amount = webhookData.resource.amount?.value || null;
      currency = webhookData.resource.amount?.currency_code || null;
    }
  } catch (e) {
    console.error('Failed to parse custom_id:', e);
  }

  const now = new Date();
  const orderDataForUtils: OrderLike = { description: paypalDescription, amount, created_at: now, priceId };
  const standardDescription = getStandardPlanDescription(orderDataForUtils);
  const savings = calculateSavings(orderDataForUtils);
  const expiryDate = calculateExpiryDate(orderDataForUtils);

  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, email, name, created_at')
    .eq('paypal_order_id', orderId)
    .maybeSingle();

  if (fetchError) {
    console.error(`Error checking for existing order ${orderId}:`, fetchError);
    await storeWebhookEvent(webhookData, supabase);
    return;
  }

  let isGuestCheckout = true;

  if (existingOrder) {
    const orderCreationDate = existingOrder.created_at || now;
    const existingOrderDataForUtils: OrderLike = {
      description: standardDescription,
      amount,
      created_at: orderCreationDate,
      priceId,
    };
    const finalDescription = getStandardPlanDescription(existingOrderDataForUtils);
    const finalSavings = calculateSavings(existingOrderDataForUtils);
    const finalExpiryDate = calculateExpiryDate(existingOrderDataForUtils) || expiryDate;

    if (existingOrder.status !== 'ACTIVE' && existingOrder.status !== 'COMPLETED') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'ACTIVE',
          description: finalDescription,
          savings: finalSavings,
          expiry_date: finalExpiryDate ? finalExpiryDate.toISOString() : null,
          updated_at: now.toISOString(),
          paypal_data: webhookData,
          original_status: paymentStatus,
          name: existingOrder.name || name,
          email: existingOrder.email || email,
        })
        .eq('paypal_order_id', orderId);
      if (updateError) {
        console.error(`Failed to update order status for ${orderId}:`, updateError);
        await storeWebhookEvent(webhookData, supabase);
        return;
      }
    } else {
      console.log(`Order ${orderId} already ${existingOrder.status}, only updating PayPal data.`);
      await supabase
        .from('orders')
        .update({ 
          paypal_data: webhookData,
          updated_at: now.toISOString(),
        })
        .eq('paypal_order_id', orderId);
    }
    const finalEmail = existingOrder.email || email;
    const { data: userProfile } = await supabase.from('profiles').select('id').eq('email', finalEmail).maybeSingle();
    isGuestCheckout = !userProfile;

    if (finalEmail && (existingOrder.name || name)) {
      try {
        await sendConfirmationEmail(finalEmail, existingOrder.name || name, orderId, isGuestCheckout);
        console.log(`Confirmation email sent to ${finalEmail} for order ${orderId}`);
      } catch (emailError) {
        console.error(`Failed to send confirmation email for order ${orderId}:`, emailError);
      }
    }
  } else {
    console.log(`No existing order found for ${orderId} from PAYMENT.CAPTURE.COMPLETED, creating new record.`);
    const { error: insertError } = await supabase.from('orders').insert([
      {
        paypal_order_id: orderId,
        name,
        email,
        status: 'ACTIVE',
        amount,
        currency,
        description: standardDescription,
        savings,
        expiry_date: expiryDate ? expiryDate.toISOString() : null,
        paypal_data: webhookData,
        original_status: paymentStatus,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
    ]);

    if (insertError) {
      console.error(`Failed to create new order for ${orderId} from PAYMENT.CAPTURE.COMPLETED:`, insertError);
      await storeWebhookEvent(webhookData, supabase);
      return;
    }
    if (email && name) {
      try {
        const { data: userProfile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
        isGuestCheckout = !userProfile;
        await sendConfirmationEmail(email, name, orderId, isGuestCheckout);
        console.log(`Confirmation email sent to ${email} for order ${orderId}`);
      } catch (emailError) {
        console.error(`Failed to send confirmation email for order ${orderId}:`, emailError);
      }
    }
  }
  await storeWebhookEvent(webhookData, supabase);
}

// Helper function to store non-completed PayPal webhook events in database
async function storeWebhookEvent(webhookData: any, supabase: any) {
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
    console.error('Failed to parse custom_id in webhook event:', e);
  }

  console.log(`Storing webhook event ${eventId} of type ${eventType}`);
  const { error } = await supabase.from('paypal_webhook_events').insert([
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
  
  if (error) {
    console.error(`Failed to store webhook event ${eventId}:`, error);
  }
} 
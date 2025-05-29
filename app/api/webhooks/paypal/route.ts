import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';
import { 
  calculateSavings, 
  getStandardPlanDescription, 
  calculateExpiryDate, 
  OrderLike 
} from '@/utils/products';

// Helper to safely parse JSON, especially custom_id
function safeJsonParse(jsonString: string | null | undefined, defaultValue: any = null) {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e: any) {
    console.warn(JSON.stringify({
      message: "Failed to parse JSON string in webhook.",
      problematicString: typeof jsonString === 'string' ? jsonString.substring(0, 100) + "..." : "Non-string input",
      errorMessage: e.message,
      source: "safeJsonParse_webhook_helper"
    }, null, 2));
    return defaultValue;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();
  const webhookStartTime = Date.now();
  let eventType = 'UNKNOWN_EVENT';
  let paypalEventId = 'UNKNOWN_ID';
  let orderIdForLogging = 'N/A';
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

  let rawBody;
  try {
    rawBody = await request.text();
    const tempParsedBody = JSON.parse(rawBody);
    eventType = tempParsedBody.event_type || eventType;
    paypalEventId = tempParsedBody.id || paypalEventId;
    if (tempParsedBody.resource) {
        orderIdForLogging = tempParsedBody.resource.id || 
                            tempParsedBody.resource.supplementary_data?.related_ids?.order_id ||
                            orderIdForLogging;
    }

    const initialLog = {
        message: `Received PayPal webhook.`, eventType, paypalEventId, orderIdAttempt: orderIdForLogging,
        ip: clientIp, receivedAt: new Date().toISOString(), source: "app/api/webhooks/paypal/route.ts POST"
    };
    console.info(JSON.stringify(initialLog, null, 2));

    const isValid = await verifyPayPalWebhookSignature(rawBody, request.headers);
    
    if (!isValid) {
      console.warn(JSON.stringify({
          ...initialLog, subEvent: 'signature_check_failed',
          message: 'Invalid PayPal webhook signature received.',
          transmissionId: request.headers.get('paypal-transmission-id'),
      }, null, 2));
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const body = tempParsedBody;
    
    console.info(JSON.stringify({
        ...initialLog, subEvent: 'processing_verified_webhook',
        message: `Processing verified PayPal webhook.`,
    }, null, 2));

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(body, supabase, clientIp);
        break;
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(body, supabase, clientIp);
        break;
      default:
        console.info(JSON.stringify({
            ...initialLog, subEvent: 'storing_unhandled_event',
            message: `Storing unhandled/other PayPal webhook event type.`,
        }, null, 2));
        await storeWebhookEvent(body, supabase, clientIp);
    }
    
    const durationMs = Date.now() - webhookStartTime;
    console.info(JSON.stringify({
        ...initialLog, subEvent: 'processing_successful',
        message: `Successfully processed PayPal webhook.`,
        durationMs,
    }, null, 2));
    return NextResponse.json({ status: 'success' });

  } catch (error: any) {
    const durationMs = Date.now() - webhookStartTime;
    console.error(JSON.stringify({
        message: 'Critical error processing PayPal webhook.', eventType, paypalEventId, orderId: orderIdForLogging,
        ip: clientIp, errorMessage: error.message, errorStack: error.stack?.substring(0, 1000),
        rawBodySnippet: rawBody ? rawBody.substring(0, 200) + "..." : "N/A_rawBody_unavailable",
        durationMs, source: "app/api/webhooks/paypal/route.ts POST (catch_all)"
    }, null, 2));
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleOrderApproved(webhookData: any, supabase: any, clientIp?: string) {
  const resource = webhookData.resource || {};
  const orderId = resource.id;
  const status = resource.status;
  const eventId = webhookData.id;

  const logBase = { eventType: "CHECKOUT.ORDER.APPROVED", paypalEventId: eventId, orderId, ip: clientIp, source: "handleOrderApproved" };
  console.info(JSON.stringify({ ...logBase, message: `Processing.`, currentOrderStatus: status }, null, 2));

  let name = '', email = '', paypalDescription = '', priceId = null;
  let amount = null, currency = null;
  
  if (resource.purchase_units && resource.purchase_units[0]) {
    const purchaseUnit = resource.purchase_units[0];
    paypalDescription = purchaseUnit.description || '';
    const customIdData = safeJsonParse(purchaseUnit.custom_id);
    if (customIdData) {
      name = customIdData.name || ''; email = customIdData.email || ''; priceId = customIdData.priceId || null;
    }
    if (purchaseUnit.amount) {
      amount = purchaseUnit.amount.value || null; currency = purchaseUnit.amount.currency_code || null;
    }
  } else {
     console.warn(JSON.stringify({ ...logBase, message: "Purchase units missing or malformed.", resourcePreview: JSON.stringify(resource).substring(0,200) }, null, 2));
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
    console.error(JSON.stringify({ ...logBase, message: `Error checking for existing order.`, dbError: fetchError.message, dbErrorCode: fetchError.code }, null, 2));
    await storeWebhookEvent(webhookData, supabase, clientIp); return;
  }

  let newStatus = 'PENDING';
  if (existingOrder && (existingOrder.status === 'ACTIVE' || existingOrder.status === 'COMPLETED')) {
    newStatus = existingOrder.status;
    console.info(JSON.stringify({ ...logBase, message: `Order already ${existingOrder.status}, preserving status.`}, null, 2));
  }

  const upsertPayload = {
      paypal_order_id: orderId, name, email, status: newStatus, amount, currency,
      description: standardDescription, savings, expiry_date: expiryDate ? expiryDate.toISOString() : null,
      paypal_data: webhookData, original_status: status, updated_at: now.toISOString(),
      ...(existingOrder ? {} : { created_at: now.toISOString() })
  };

  const { error: upsertError } = await supabase.from('orders').upsert([upsertPayload], { onConflict: 'paypal_order_id' });

  if (upsertError) {
    console.error(JSON.stringify({ ...logBase, message: `Failed to upsert order.`, payloadAttemptedEmail: email, dbError: upsertError.message, dbErrorCode: upsertError.code }, null, 2));
  } else {
    console.info(JSON.stringify({ ...logBase, message: `Order upserted/updated successfully.`, newDbStatus: newStatus, emailForOrder: email }, null, 2));
  }
  await storeWebhookEvent(webhookData, supabase, clientIp);
}

async function handlePaymentCompleted(webhookData: any, supabase: any, clientIp?: string) {
  const resource = webhookData.resource || {};
  const paymentId = resource.id;
  const paymentStatus = resource.status;
  const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
  const eventId = webhookData.id;

  const logBase = { eventType: "PAYMENT.CAPTURE.COMPLETED", paypalEventId: eventId, orderId, paymentId, ip: clientIp, source: "handlePaymentCompleted" };
  console.info(JSON.stringify({ ...logBase, message: `Processing.`, paymentCaptureStatus: paymentStatus }, null, 2));

  let name = '', email = '', paypalDescription = '', priceId = null;
  let amount = null, currency = null;

  const purchaseUnit = resource.supplementary_data?.purchase_units?.[0] || resource.purchase_units?.[0];
  if (purchaseUnit) {
    paypalDescription = purchaseUnit.description || '';
    const customIdData = safeJsonParse(purchaseUnit.custom_id || resource.custom_id);
    if (customIdData) { name = customIdData.name || ''; email = customIdData.email || ''; priceId = customIdData.priceId || null; }
    if (purchaseUnit.amount) {
      amount = purchaseUnit.amount.value || null; currency = purchaseUnit.amount.currency_code || null;
    }
  } else if (resource.amount) {
    amount = resource.amount.value || null; currency = resource.amount.currency_code || null;
    const customIdData = safeJsonParse(resource.custom_id);
    if (customIdData) { name = customIdData.name || ''; email = customIdData.email || ''; priceId = customIdData.priceId || null; }
  } else {
    console.warn(JSON.stringify({ ...logBase, message: "Critical data (purchase_units or amount) missing in webhook.", resourcePreview: JSON.stringify(resource).substring(0,200) }, null, 2));
  }

  const now = new Date();
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, email, name, created_at, amount, currency')
    .eq('paypal_order_id', orderId)
    .maybeSingle();

  if (fetchError) {
    console.error(JSON.stringify({ ...logBase, message: `Error checking for existing order.`, dbError: fetchError.message, dbErrorCode: fetchError.code }, null, 2));
    await storeWebhookEvent(webhookData, supabase, clientIp); return;
  }
  
  const orderCreationDate = existingOrder?.created_at ? new Date(existingOrder.created_at) : now;
  const orderDataForUtils: OrderLike = { description: paypalDescription, amount, created_at: orderCreationDate, priceId };
  const finalDescription = getStandardPlanDescription(orderDataForUtils);
  const finalSavings = calculateSavings(orderDataForUtils);
  const finalExpiryDate = calculateExpiryDate(orderDataForUtils);

  let isGuestCheckout = true;
  const finalEmailForNotification = existingOrder?.email || email;
  const finalNameForNotification = existingOrder?.name || name;

  if (existingOrder) {
    if (existingOrder.status !== 'ACTIVE' && existingOrder.status !== 'COMPLETED') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'ACTIVE', description: finalDescription, savings: finalSavings,
          expiry_date: finalExpiryDate ? finalExpiryDate.toISOString() : null,
          updated_at: now.toISOString(), paypal_data: webhookData, original_status: paymentStatus,
          name: finalNameForNotification, email: finalEmailForNotification,
          amount: amount || existingOrder.amount, currency: currency || existingOrder.currency,
        })
        .eq('paypal_order_id', orderId);
      if (updateError) {
        console.error(JSON.stringify({ ...logBase, message: `Failed to update order to ACTIVE.`, finalEmail: finalEmailForNotification, dbError: updateError.message, dbErrorCode: updateError.code }, null, 2));
        await storeWebhookEvent(webhookData, supabase, clientIp); return;
      }
      console.info(JSON.stringify({ ...logBase, message: "Order status updated to ACTIVE.", finalEmail: finalEmailForNotification }, null, 2));
    } else {
      console.info(JSON.stringify({ ...logBase, message: `Order already ${existingOrder.status}, updating PayPal data.`}, null, 2));
      await supabase.from('orders').update({ paypal_data: webhookData, original_status: paymentStatus, updated_at: now.toISOString() }).eq('paypal_order_id', orderId);
    }
  } else {
    console.info(JSON.stringify({ ...logBase, message: `No existing order, creating new.`, emailForOrder: email }, null, 2));
    const { error: insertError } = await supabase.from('orders').insert([{
        paypal_order_id: orderId, name, email, status: 'ACTIVE', amount, currency,
        description: finalDescription, savings: finalSavings, expiry_date: finalExpiryDate ? finalExpiryDate.toISOString() : null,
        paypal_data: webhookData, original_status: paymentStatus,
        created_at: now.toISOString(), updated_at: now.toISOString(),
    }]);
    if (insertError) {
      console.error(JSON.stringify({ ...logBase, message: `Failed to create new order.`, emailForOrder: email, dbError: insertError.message, dbErrorCode: insertError.code }, null, 2));
      await storeWebhookEvent(webhookData, supabase, clientIp); return;
    }
  }

  if(finalEmailForNotification) {
    const { data: userProfile } = await supabase.from('profiles').select('id').eq('email', finalEmailForNotification).maybeSingle();
    isGuestCheckout = !userProfile;
  }

  if (finalEmailForNotification && finalNameForNotification) {
    try {
      await sendConfirmationEmail(finalEmailForNotification, finalNameForNotification, orderId, isGuestCheckout);
      console.info(JSON.stringify({ ...logBase, message: `Confirmation email initiated.`, to: finalEmailForNotification, isGuest: isGuestCheckout }, null, 2));
    } catch (emailError: any) {
      console.error(JSON.stringify({ ...logBase, message: `Failed to send confirmation email.`, to: finalEmailForNotification, emailErrorName: emailError.name, emailErrorMessage: emailError.message }, null, 2));
    }
  } else {
     console.warn(JSON.stringify({ ...logBase, message: `Skipping confirmation email: missing name or email.`, finalName: finalNameForNotification, finalEmail: finalEmailForNotification }, null, 2));
  }
  await storeWebhookEvent(webhookData, supabase, clientIp);
}

async function storeWebhookEvent(webhookData: any, supabase: any, clientIp?: string) {
  const eventId = webhookData.id;
  const eventType = webhookData.event_type;
  const resource = webhookData.resource || {};
  const primaryResourceId = resource.id || null;
  const orderIdFromRelated = resource.supplementary_data?.related_ids?.order_id || null;
  const finalPaypalOrderId = orderIdFromRelated || primaryResourceId;

  let amount = null, currency = null, name = null, email = null;
  const purchaseUnit = resource.supplementary_data?.purchase_units?.[0] || resource.purchase_units?.[0];
  if (purchaseUnit) {
    if (purchaseUnit.amount) { amount = purchaseUnit.amount.value || null; currency = purchaseUnit.amount.currency_code || null; }
    const customIdData = safeJsonParse(purchaseUnit.custom_id || resource.custom_id);
    if (customIdData) { name = customIdData.name || null; email = customIdData.email || null; }
  } else if (resource.amount) {
     amount = resource.amount.value || null; currency = resource.amount.currency_code || null;
     const customIdData = safeJsonParse(resource.custom_id);
     if (customIdData) { name = customIdData.name || null; email = customIdData.email || null; }
  }
  
  const logBase = { eventType, paypalEventId: eventId, orderId: finalPaypalOrderId, ip: clientIp, source: "storeWebhookEvent" };
  
  const { error } = await supabase.from('paypal_webhook_events').insert([{
      event_id: eventId, event_type: eventType, paypal_order_id: finalPaypalOrderId,
      resource_id: primaryResourceId, name, email, amount, currency,
      payload: webhookData, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }]);
  
  if (error) {
    console.error(JSON.stringify({ ...logBase, message: `Failed to store webhook event.`, dbError: error.message, dbErrorCode: error.code }, null, 2));
  } else {
     console.info(JSON.stringify({ ...logBase, message: `Webhook event stored successfully in DB.`}, null, 2));
  }
} 
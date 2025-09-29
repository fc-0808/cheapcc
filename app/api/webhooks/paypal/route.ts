// app/api/webhooks/paypal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';
import { logWebhookEnvironment, getWebhookEnvironment } from '@/utils/ngrokUtils';
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
  const webhookStartTime = Date.now();
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  let eventType = 'UNKNOWN_EVENT';
  let paypalEventId = 'UNKNOWN_ID';
  let orderIdForLogging = 'N/A';
  let rawBody = "NotYetRead"; // Initialize rawBody
  let supabase; // Declare supabase client variable

  // Get request URL info for environment detection
  const url = new URL(request.url);
  const isNgrokEnvironment = url.hostname.includes('ngrok');
  const isVercelProduction = url.hostname.includes('vercel.app') || url.hostname.includes('cheapcc.com');
  
  // Log environment detection
  logWebhookEnvironment('PayPal webhook');
  console.log(`🌍 PayPal Webhook Environment:`, {
    hostname: url.hostname,
    isNgrok: isNgrokEnvironment,
    isVercelProd: isVercelProduction,
    paypalMode: process.env.PAYPAL_API_MODE,
    nodeEnv: process.env.NODE_ENV
  });

  console.info(JSON.stringify({
      message: `Received PayPal webhook. Starting processing...`,
      ip: clientIp,
      receivedAt: new Date().toISOString(),
      environment: isNgrokEnvironment ? 'ngrok' : (isVercelProduction ? 'production' : 'localhost'),
      source: "app/api/webhooks/paypal/route.ts POST (Entry)"
  }, null, 2));

  try {
    // SMART ENVIRONMENT HANDLING
    // If this is a production Vercel environment receiving a sandbox webhook, 
    // gracefully reject it to prevent the FAILURE status in PayPal dashboard
    if (isVercelProduction && process.env.PAYPAL_API_MODE === 'live') {
      // We'll check if this is a sandbox webhook after parsing the body
      console.log('🔍 Production environment detected, will check for sandbox webhook after parsing');
    }

    const supabaseUrlPresent = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKeyPresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrlPresent || !supabaseServiceKeyPresent) {
        console.error(JSON.stringify({
            message: "CRITICAL: Supabase URL or Service Role Key is MISSING from Vercel environment variables.",
            source: "WebhookSupabaseEnvCheckFail"
        }, null, 2));
        return NextResponse.json({ error: 'Server configuration error: Supabase keys missing.' }, { status: 500 });
    }

    supabase = await createServiceClient();
    rawBody = await request.text();
    const tempParsedBody = JSON.parse(rawBody);
    eventType = tempParsedBody.event_type || eventType;
    paypalEventId = tempParsedBody.id || paypalEventId;
    if (tempParsedBody.resource) {
        orderIdForLogging = tempParsedBody.resource.id ||
                              tempParsedBody.resource.supplementary_data?.related_ids?.order_id ||
                              orderIdForLogging;
    }

    // Check for cross-environment webhook delivery
    if (isVercelProduction && process.env.PAYPAL_API_MODE === 'live') {
      // Check if this is a sandbox webhook by examining the webhook data
      const isSandboxWebhook = tempParsedBody.resource?.links?.some((link: any) => 
        link.href?.includes('sandbox.paypal.com')
      ) || false;
      
      if (isSandboxWebhook) {
        console.warn('⚠️ Production environment rejecting sandbox webhook gracefully');
        console.log('💡 This prevents FAILURE status in PayPal dashboard when testing');
        return NextResponse.json({ 
          message: 'Sandbox webhook not processed in production environment',
          environment: 'production',
          webhook_source: 'sandbox'
        }, { status: 200 }); // Return 200 to prevent PayPal FAILURE status
      }
    }
    
    const initialLog = {
        message: `Verified entry checks, proceeding with signature verification.`,
        eventType, paypalEventId, orderIdAttempt: orderIdForLogging,
        ip: clientIp, receivedAt: new Date(webhookStartTime).toISOString(), 
        environment: isNgrokEnvironment ? 'ngrok' : (isVercelProduction ? 'production' : 'localhost'),
        source: "app/api/webhooks/paypal/route.ts POST (MainLogicStart)"
    };
    console.info(JSON.stringify(initialLog, null, 2));

    // Enhanced webhook processing logging
    console.log('='.repeat(80));
    console.log('------ HANDLING PAYPAL WEBHOOK ------');
    console.log(`Event Type: ${eventType}`);
    console.log(`PayPal Event ID: ${paypalEventId}`);
    console.log(`Order ID: ${orderIdForLogging}`);
    console.log(`Processing Environment: ${isNgrokEnvironment ? 'ngrok' : (isVercelProduction ? 'production' : 'localhost')}`);
    console.log('='.repeat(80));

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
        ...initialLog, subEvent: 'processing_successful_final',
        message: `Successfully processed PayPal webhook.`,
        durationMs,
    }, null, 2));
    return NextResponse.json({ status: 'success' });

  } catch (error: any) {
    const durationMs = Date.now() - webhookStartTime;
    console.error(JSON.stringify({
        message: 'CRITICAL ERROR in main PayPal webhook processing.', eventType, paypalEventId, orderId: orderIdForLogging,
        ip: clientIp, errorMessage: error.message, errorStack: error.stack?.substring(0, 1000),
        rawBodyAtError: typeof rawBody === 'string' ? rawBody.substring(0, 200) + "..." : "Raw body not read or error before reading.",
        durationMs, source: "app/api/webhooks/paypal/route.ts POST (MainCatchAll)"
    }, null, 2));
    return NextResponse.json({ error: 'Internal Server Error during webhook processing' }, { status: 500 });
  }
}

async function handleOrderApproved(webhookData: any, supabaseClient: any, clientIp?: string) {
    const resource = webhookData.resource || {};
    const orderId = resource.id;
    const status = resource.status;
    const eventId = webhookData.id;

    const logBase = { eventType: "CHECKOUT.ORDER.APPROVED", paypalEventId: eventId, orderId, ip: clientIp, source: "handleOrderApproved" };
    console.info(JSON.stringify({ ...logBase, message: `Processing.`, currentOrderStatus: status }, null, 2));

    let name = '', email = '', paypalDescription = '', priceId = null;
    let amount = null, currency = null, activationType = 'pre-activated';

    if (resource.purchase_units && resource.purchase_units[0]) {
        const purchaseUnit = resource.purchase_units[0];
        paypalDescription = purchaseUnit.description || '';
        const customIdData = safeJsonParse(purchaseUnit.custom_id);
        if (customIdData) {
          name = customIdData.name || ''; 
          email = customIdData.email || ''; 
          priceId = customIdData.priceId || null;
          activationType = customIdData.activationType || 'pre-activated';
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

    const { data: existingOrder, error: fetchError } = await supabaseClient
        .from('orders')
        .select('id, status')
        .eq('paypal_order_id', orderId)
        .maybeSingle();

    if (fetchError) {
        console.error(JSON.stringify({ ...logBase, message: `Error checking for existing order.`, dbError: fetchError.message, dbErrorCode: fetchError.code }, null, 2));
        await storeWebhookEvent(webhookData, supabaseClient, clientIp); return;
    }

    let newStatus = 'PENDING';
    if (existingOrder && (existingOrder.status === 'ACTIVE' || existingOrder.status === 'COMPLETED')) {
        newStatus = existingOrder.status;
        console.info(JSON.stringify({ ...logBase, message: `Order already ${existingOrder.status}, preserving status.`}, null, 2));
    }

    const upsertPayload = {
        paypal_order_id: orderId, name, email, status: newStatus, amount, currency,
        description: standardDescription, savings, expiry_date: expiryDate ? expiryDate.toISOString() : null,
        activation_type: activationType,
        adobe_email: adobeEmail || null, // Store the Adobe account email for self-activation
        
        // --- UPDATED COLUMNS ---
        payment_processor: 'paypal',
        payment_data: webhookData,
        // --- END OF UPDATES ---
        
        original_status: status, updated_at: now.toISOString(),
        ...(existingOrder ? {} : { created_at: now.toISOString() })
    };

    const { error: upsertError } = await supabaseClient.from('orders').upsert([upsertPayload], { onConflict: 'paypal_order_id' });

    if (upsertError) {
        console.error(JSON.stringify({ ...logBase, message: `Failed to upsert order.`, payloadAttemptedEmail: email, dbError: upsertError.message, dbErrorCode: upsertError.code }, null, 2));
    } else {
        console.info(JSON.stringify({ ...logBase, message: `Order upserted/updated successfully.`, newDbStatus: newStatus, emailForOrder: email }, null, 2));
    }
    await storeWebhookEvent(webhookData, supabaseClient, clientIp);
}

async function handlePaymentCompleted(webhookData: any, supabaseClient: any, clientIp?: string) {
    const resource = webhookData.resource || {};
    const paymentId = resource.id;
    const paymentStatus = resource.status;
    const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
    const eventId = webhookData.id;

    const logBase = { eventType: "PAYMENT.CAPTURE.COMPLETED", paypalEventId: eventId, orderId, paymentId, ip: clientIp, source: "handlePaymentCompleted" };
    console.info(JSON.stringify({ ...logBase, message: `Processing.`, paymentCaptureStatus: paymentStatus }, null, 2));

    let name = '', email = '', paypalDescription = '', priceId = null;
    let amount = null, currency = null, activationType = 'pre-activated', adobeEmail = null;

    const purchaseUnit = resource.supplementary_data?.purchase_units?.[0] || resource.purchase_units?.[0];
    if (purchaseUnit) {
        paypalDescription = purchaseUnit.description || '';
        const customIdData = safeJsonParse(purchaseUnit.custom_id || resource.custom_id);
        if (customIdData) { 
          name = customIdData.name || ''; 
          email = customIdData.email || ''; 
          priceId = customIdData.priceId || null; 
          activationType = customIdData.activationType || 'pre-activated';
          adobeEmail = customIdData.adobeEmail || null; // Extract Adobe email for self-activation
        }
        if (purchaseUnit.amount) {
        amount = purchaseUnit.amount.value || null; currency = purchaseUnit.amount.currency_code || null;
        }
    } else if (resource.amount) {
        amount = resource.amount.value || null; currency = resource.amount.currency_code || null;
        const customIdData = safeJsonParse(resource.custom_id);
        if (customIdData) { name = customIdData.name || null; email = customIdData.email || null; }
    } else {
        console.warn(JSON.stringify({ ...logBase, message: "Critical data (purchase_units or amount) missing in webhook.", resourcePreview: JSON.stringify(resource).substring(0,200) }, null, 2));
    }

    const now = new Date();
    const { data: existingOrder, error: fetchError } = await supabaseClient
        .from('orders')
        .select('id, status, email, name, created_at, amount, currency')
        .eq('paypal_order_id', orderId)
        .maybeSingle();

    if (fetchError) {
        console.error(JSON.stringify({ ...logBase, message: `Error checking for existing order.`, dbError: fetchError.message, dbErrorCode: fetchError.code }, null, 2));
        await storeWebhookEvent(webhookData, supabaseClient, clientIp); return;
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
        const { error: updateError } = await supabaseClient
            .from('orders')
            .update({
              status: 'ACTIVE', description: finalDescription, savings: finalSavings,
              expiry_date: finalExpiryDate ? finalExpiryDate.toISOString() : null,
              updated_at: now.toISOString(),
              adobe_email: adobeEmail || null, // Store the Adobe account email for self-activation
              
              // --- UPDATED COLUMNS ---
              payment_data: webhookData,
              payment_processor: 'paypal',
              // --- END OF UPDATES ---

              original_status: paymentStatus,
              name: finalNameForNotification, email: finalEmailForNotification,
              amount: amount || existingOrder.amount, currency: currency || existingOrder.currency,
            })
            .eq('paypal_order_id', orderId);
        if (updateError) {
            console.error(JSON.stringify({ ...logBase, message: `Failed to update order to ACTIVE.`, finalEmail: finalEmailForNotification, dbError: updateError.message, dbErrorCode: updateError.code }, null, 2));
            await storeWebhookEvent(webhookData, supabaseClient, clientIp); return;
        }
        console.info(JSON.stringify({ ...logBase, message: "Order status updated to ACTIVE.", finalEmail: finalEmailForNotification }, null, 2));
        } else {
        console.info(JSON.stringify({ ...logBase, message: `Order already ${existingOrder.status}, updating PayPal data.`}, null, 2));
        await supabaseClient.from('orders').update({ payment_data: webhookData, original_status: paymentStatus, updated_at: now.toISOString() }).eq('paypal_order_id', orderId);
        }
    } else {
        console.info(JSON.stringify({ ...logBase, message: `No existing order, creating new.`, emailForOrder: email }, null, 2));
        const { error: insertError } = await supabaseClient.from('orders').insert([{
            paypal_order_id: orderId, name, email, status: 'ACTIVE', amount, currency,
            description: finalDescription, savings: finalSavings, expiry_date: finalExpiryDate ? finalExpiryDate.toISOString() : null,
            activation_type: activationType,
            adobe_email: adobeEmail || null, // Store the Adobe account email for self-activation
            
            // --- UPDATED COLUMNS ---
            payment_data: webhookData,
            payment_processor: 'paypal',
            // --- END OF UPDATES ---

            original_status: paymentStatus,
            created_at: now.toISOString(), updated_at: now.toISOString(),
        }]);
        if (insertError) {
        console.error(JSON.stringify({ ...logBase, message: `Failed to create new order.`, emailForOrder: email, dbError: insertError.message, dbErrorCode: insertError.code }, null, 2));
        await storeWebhookEvent(webhookData, supabaseClient, clientIp); return;
        }
    }

    if(finalEmailForNotification) {
        const { data: userProfile } = await supabaseClient.from('profiles').select('id').eq('email', finalEmailForNotification).maybeSingle();
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
    await storeWebhookEvent(webhookData, supabaseClient, clientIp);
}

async function storeWebhookEvent(webhookData: any, supabaseClient: any, clientIp?: string) {
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

    const { error } = await supabaseClient.from('paypal_webhook_events').insert([{
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
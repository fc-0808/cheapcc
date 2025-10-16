// app/api/webhooks/paypal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';
import { calculateExpiryDate, getStandardPlanDescription, calculateSavings, getProductIdFromPriceId, getProductType, getPricingOptionById, getActivationTypeForProduct, getStatusForProduct, OrderLike } from '@/utils/products-supabase';
// Inline ngrok utility functions to avoid build issues
function isNgrokEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname.includes('ngrok');
  }
  
  // Server-side check
  return !!(process.env.NGROK_URL && process.env.NODE_ENV === 'development');
}

function getWebhookEnvironment(): {
  isNgrok: boolean;
  isProduction: boolean;
  isDevelopment: boolean;
  environment: string;
} {
  const isNgrok = isNgrokEnvironment();
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = !isDevelopment;
  
  let environment = 'unknown';
  if (isNgrok && isDevelopment) {
    environment = 'ngrok-development';
  } else if (isDevelopment) {
    environment = 'localhost-development';
  } else if (isProduction) {
    environment = 'production';
  }
  
  return {
    isNgrok,
    isProduction,
    isDevelopment,
    environment
  };
}

function logWebhookEnvironment(context: string = 'webhook'): void {
  const env = getWebhookEnvironment();
  console.log(`🌍 ${context.toUpperCase()} Environment Detection:`, {
    environment: env.environment,
    isNgrok: env.isNgrok,
    isDevelopment: env.isDevelopment,
    isProduction: env.isProduction,
    ngrokUrl: process.env.NGROK_URL || 'not set',
    nodeEnv: process.env.NODE_ENV
  });
}

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
    let amount = null, currency = null, activationType = 'pre-activated', adobeEmail = null;

    if (resource.purchase_units && resource.purchase_units[0]) {
        const purchaseUnit = resource.purchase_units[0];
        paypalDescription = purchaseUnit.description || '';
        const customIdData = safeJsonParse(purchaseUnit.custom_id);
        if (customIdData) {
          priceId = customIdData.priceId || null;
          activationType = customIdData.activationType || 'pre-activated';
        }
        if (purchaseUnit.amount) {
        amount = purchaseUnit.amount.value || null; currency = purchaseUnit.amount.currency_code || null;
        }
    } else {
        console.warn(JSON.stringify({ ...logBase, message: "Purchase units missing or malformed.", resourcePreview: JSON.stringify(resource).substring(0,200) }, null, 2));
    }

    // Try to get order data from database first (for form data)
    let orderDataFromDb = null;
    
    // First try to find by paypal_order_id (most reliable)
    const { data: existingOrderData } = await supabaseClient
        .from('orders')
        .select('name, email, adobe_email, activation_type, product_type, product_id, amount, currency, price_id')
        .eq('paypal_order_id', orderId)
        .maybeSingle();
    
    if (existingOrderData) {
        orderDataFromDb = existingOrderData;
        name = existingOrderData.name || '';
        email = existingOrderData.email || '';
        adobeEmail = existingOrderData.adobe_email;
        activationType = existingOrderData.activation_type || 'pre-activated';
        priceId = existingOrderData.price_id || priceId; // Use priceId from DB if available
    } else if (priceId) {
        // Fallback: try to find by price_id and PENDING status
        const { data: fallbackOrderData } = await supabaseClient
            .from('orders')
            .select('name, email, adobe_email, activation_type, product_type, product_id, amount, currency')
            .eq('price_id', priceId)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (fallbackOrderData) {
            orderDataFromDb = fallbackOrderData;
            name = fallbackOrderData.name || '';
            email = fallbackOrderData.email || '';
            adobeEmail = fallbackOrderData.adobe_email;
            activationType = fallbackOrderData.activation_type || 'pre-activated';
        }
    }

    // Fallback to PayPal payer information if no database data found
    if (!orderDataFromDb && resource.payer) {
        console.warn(JSON.stringify({ ...logBase, message: `No database order found, using PayPal payer data`, paypalName: `${resource.payer.name?.given_name || ''} ${resource.payer.name?.surname || ''}`.trim(), paypalEmail: resource.payer.email_address }, null, 2));
        if (resource.payer.name) {
            name = `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim();
        }
        if (resource.payer.email_address) {
            email = resource.payer.email_address;
        }
    }

    const now = new Date();
    const orderDataForUtils: OrderLike = { description: paypalDescription, amount, created_at: now, priceId };
    const standardDescription = await getStandardPlanDescription(orderDataForUtils);
    const savings = await calculateSavings(orderDataForUtils);
    const expiryDate = await calculateExpiryDate(orderDataForUtils);

    // Get product information from priceId
    const productId = getProductIdFromPriceId(priceId);
    const pricingOption = await getPricingOptionById(priceId);
    const productType = pricingOption ? getProductType(pricingOption) : 'subscription';
    const finalActivationType = pricingOption ? getActivationTypeForProduct(pricingOption, activationType) : (activationType || 'pre-activated');

    const { data: existingOrder, error: fetchError } = await supabaseClient
        .from('orders')
        .select('id, status')
        .eq('paypal_order_id', orderId)
        .maybeSingle();

    if (fetchError) {
        console.error(JSON.stringify({ ...logBase, message: `Error checking for existing order.`, dbError: fetchError.message, dbErrorCode: fetchError.code }, null, 2));
        await storeWebhookEvent(webhookData, supabaseClient, clientIp); return;
    }

    // Determine the appropriate status based on product type
    let finalStatus: string | null;
    if (existingOrder && (existingOrder.status === 'ACTIVE' || existingOrder.status === 'COMPLETED')) {
        finalStatus = existingOrder.status;
        console.info(JSON.stringify({ ...logBase, message: `Order already ${existingOrder.status}, preserving status.`}, null, 2));
    } else {
        // Use product-specific status logic
        if (pricingOption) {
            finalStatus = getStatusForProduct(pricingOption);
        } else {
            finalStatus = 'ACTIVE'; // Default for unknown products
        }
    }

    const upsertPayload = {
        paypal_order_id: orderId, name, email, status: finalStatus, amount, currency,
        description: standardDescription, savings, expiry_date: expiryDate ? expiryDate.toISOString() : null,
        activation_type: finalActivationType,
        adobe_email: adobeEmail || null, // Store the Adobe account email for self-activation
        
        // --- UPDATED COLUMNS ---
        payment_processor: 'paypal',
        payment_data: webhookData,
        product_id: productId,                       // Set the product ID from products table
        product_type: productType,                   // Set the correct product type (subscription/redemption_code)
        // --- END OF UPDATES ---
        
        original_status: status, updated_at: now.toISOString(),
        ...(existingOrder ? {} : { created_at: now.toISOString() })
    };

    const { error: upsertError } = await supabaseClient.from('orders').upsert([upsertPayload], { onConflict: 'paypal_order_id' });

    if (upsertError) {
        console.error(JSON.stringify({ ...logBase, message: `Failed to upsert order.`, payloadAttemptedEmail: email, dbError: upsertError.message, dbErrorCode: upsertError.code }, null, 2));
    } else {
        console.info(JSON.stringify({ ...logBase, message: `Order upserted/updated successfully.`, newDbStatus: finalStatus, emailForOrder: email }, null, 2));
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
          priceId = customIdData.priceId || null; 
          activationType = customIdData.activationType || 'pre-activated';
        }
        if (purchaseUnit.amount) {
        amount = purchaseUnit.amount.value || null; currency = purchaseUnit.amount.currency_code || null;
        }
    } else if (resource.amount) {
        amount = resource.amount.value || null; currency = resource.amount.currency_code || null;
        const customIdData = safeJsonParse(resource.custom_id);
        if (customIdData) { priceId = customIdData.priceId || null; }
    } else {
        console.warn(JSON.stringify({ ...logBase, message: "Critical data (purchase_units or amount) missing in webhook.", resourcePreview: JSON.stringify(resource).substring(0,200) }, null, 2));
    }

    // Try to get order data from database first (for form data)
    let orderDataFromDb = null;
    
    // First try to find by paypal_order_id (most reliable)
    const { data: existingOrderData } = await supabaseClient
        .from('orders')
        .select('name, email, adobe_email, activation_type, product_type, product_id, amount, currency, price_id')
        .eq('paypal_order_id', orderId)
        .maybeSingle();
    
    if (existingOrderData) {
        orderDataFromDb = existingOrderData;
        name = existingOrderData.name || '';
        email = existingOrderData.email || '';
        adobeEmail = existingOrderData.adobe_email;
        activationType = existingOrderData.activation_type || 'pre-activated';
        priceId = existingOrderData.price_id || priceId; // Use priceId from DB if available
    } else if (priceId) {
        // Fallback: try to find by price_id and PENDING status
        const { data: fallbackOrderData } = await supabaseClient
            .from('orders')
            .select('name, email, adobe_email, activation_type, product_type, product_id, amount, currency')
            .eq('price_id', priceId)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (fallbackOrderData) {
            orderDataFromDb = fallbackOrderData;
            name = fallbackOrderData.name || '';
            email = fallbackOrderData.email || '';
            adobeEmail = fallbackOrderData.adobe_email;
            activationType = fallbackOrderData.activation_type || 'pre-activated';
        }
    }

    // Fallback to PayPal payer information if no database data found
    if (!orderDataFromDb && resource.payer) {
        console.warn(JSON.stringify({ ...logBase, message: `No database order found, using PayPal payer data`, paypalName: `${resource.payer.name?.given_name || ''} ${resource.payer.name?.surname || ''}`.trim(), paypalEmail: resource.payer.email_address }, null, 2));
        if (resource.payer.name) {
            name = `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim();
        }
        if (resource.payer.email_address) {
            email = resource.payer.email_address;
        }
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
    const finalDescription = await getStandardPlanDescription(orderDataForUtils);
    const finalSavings = await calculateSavings(orderDataForUtils);
    const finalExpiryDate = await calculateExpiryDate(orderDataForUtils);

    // Get product information from priceId for proper handling
    const productId = getProductIdFromPriceId(priceId);
    const pricingOption = await getPricingOptionById(priceId);
    const productType = pricingOption ? getProductType(pricingOption) : 'subscription';
    const finalActivationType = pricingOption ? getActivationTypeForProduct(pricingOption, activationType) : (activationType || 'pre-activated');

    let isGuestCheckout = true;
    const finalEmailForNotification = existingOrder?.email || email;
    const finalNameForNotification = existingOrder?.name || name;

    if (existingOrder) {
        if (existingOrder.status !== 'ACTIVE' && existingOrder.status !== 'COMPLETED') {
        // Determine appropriate status based on product type
        const finalStatus = pricingOption ? getStatusForProduct(pricingOption) : 'ACTIVE';
        
        const { error: updateError } = await supabaseClient
            .from('orders')
            .update({
              status: finalStatus, 
              description: finalDescription, 
              savings: finalSavings,
              expiry_date: finalExpiryDate ? finalExpiryDate.toISOString() : null,
              updated_at: now.toISOString(),
              adobe_email: adobeEmail || null, // Store the Adobe account email for self-activation
              activation_type: finalActivationType,
              product_id: productId,
              product_type: productType,
              
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
        
        // Get product information from priceId for new order
        const productId = getProductIdFromPriceId(priceId);
        const pricingOption = await getPricingOptionById(priceId);
        const productType = pricingOption ? getProductType(pricingOption) : 'subscription';
        const finalActivationType = pricingOption ? getActivationTypeForProduct(pricingOption, activationType) : (activationType || 'pre-activated');
        const finalStatus = pricingOption ? getStatusForProduct(pricingOption) : 'ACTIVE';
        
        const { data: newOrder, error: insertError } = await supabaseClient.from('orders').insert([{
            paypal_order_id: orderId, name, email, status: finalStatus, amount, currency,
            description: finalDescription, savings: finalSavings, expiry_date: finalExpiryDate ? finalExpiryDate.toISOString() : null,
            activation_type: finalActivationType,
            adobe_email: adobeEmail || null, // Store the Adobe account email for self-activation
            
            // --- UPDATED COLUMNS ---
            payment_data: webhookData,
            payment_processor: 'paypal',
            product_id: productId,                       // Set the product ID from products table
            product_type: productType,                   // Set the correct product type (subscription/redemption_code)
            // --- END OF UPDATES ---

            original_status: paymentStatus,
            created_at: now.toISOString(), updated_at: now.toISOString(),
        }]).select('id');
        
        if (insertError) {
            console.error(JSON.stringify({ ...logBase, message: `Failed to create new order.`, emailForOrder: email, dbError: insertError.message, dbErrorCode: insertError.code }, null, 2));
            await storeWebhookEvent(webhookData, supabaseClient, clientIp); return;
        }

        // Redemption codes are now tracked directly in the orders table via product_type = 'redemption_code'
        if (productType === 'redemption_code') {
            console.info(JSON.stringify({ ...logBase, message: `Redemption code order created successfully in orders table.` }, null, 2));
        }
    }

    if(finalEmailForNotification) {
        const { data: userProfile } = await supabaseClient.from('profiles').select('id').eq('email', finalEmailForNotification).maybeSingle();
        isGuestCheckout = !userProfile;
    }

    if (finalEmailForNotification && finalNameForNotification) {
        try {
        await sendConfirmationEmail(finalEmailForNotification, finalNameForNotification, orderId, isGuestCheckout, finalActivationType, adobeEmail || undefined, priceId);
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
    } else if (resource.amount) {
        amount = resource.amount.value || null; currency = resource.amount.currency_code || null;
    }

    // Extract name and email from payer information if available
    if (resource.payer) {
        if (resource.payer.name) {
            name = `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim();
        }
        if (resource.payer.email_address) {
            email = resource.payer.email_address;
        }
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
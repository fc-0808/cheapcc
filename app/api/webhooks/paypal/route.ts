import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';

// Adobe's regular pricing (for savings calculation)
const ADOBE_REGULAR_PRICING = {
  '14 days': 23.99, // About $1.71/day for trial
  '14-Day': 23.99, // Alternative name format
  '1 month': 54.99,
  '3 months': 164.97, // $54.99 x 3
  '6 months': 329.94, // $54.99 x 6
  '12 months': 599.88, // $54.99 x 12 (annual price for monthly subscription)
};

// Helper to calculate savings for an order based on amount and description
function calculateSavings(amount: string | number | null, description: string): number {
  if (!amount) return 0;
  
  const orderAmount = parseFloat(amount.toString());
  if (isNaN(orderAmount)) return 0;
  
  // Calculate based on duration
  let regularPrice = 0;
  
  if (description.includes('14 days') || description.includes('14-Day')) {
    regularPrice = ADOBE_REGULAR_PRICING['14 days'];
  } else if (description.includes('1 month') || description.includes('30 days')) {
    regularPrice = ADOBE_REGULAR_PRICING['1 month'];
  } else if (description.includes('3 month') || description.includes('90 days')) {
    regularPrice = ADOBE_REGULAR_PRICING['3 months'];
  } else if (description.includes('6 month') || description.includes('180 days')) {
    regularPrice = ADOBE_REGULAR_PRICING['6 months'];
  } else if (description.includes('12 month') || description.includes('1 year') || description.includes('365 days')) {
    regularPrice = ADOBE_REGULAR_PRICING['12 months'];
  } else {
    // Default to 14-day price if we can't determine (instead of monthly)
    regularPrice = ADOBE_REGULAR_PRICING['14 days'];
  }
  
  let savings = regularPrice - orderAmount;
  // Fix floating point precision by rounding to 2 decimal places
  savings = Math.round((savings + Number.EPSILON) * 100) / 100;
  return savings > 0 ? savings : 0;
}

// Helper to get the correct plan description
function getPlanDescription(amount: number | string | null, description: string): string {
  // If the PayPal description is already correct, use it
  if (description && description.startsWith('Adobe Creative Cloud -')) {
    return description;
  }
  // Try to infer from amount
  const amt = parseFloat(amount?.toString() || '0');
  if (amt === 4.99 || /14\s*-?\s*days?/i.test(description)) return 'Adobe Creative Cloud - 14 days Subscription';
  if (amt === 14.99 || /1\s*-?\s*month|30\s*-?\s*days?/i.test(description)) return 'Adobe Creative Cloud - 1 month Subscription';
  if (amt === 39.99 || /3\s*-?\s*months?|90\s*-?\s*days?/i.test(description)) return 'Adobe Creative Cloud - 3 months Subscription';
  if (amt === 64.99 || /6\s*-?\s*months?|180\s*-?\s*days?/i.test(description)) return 'Adobe Creative Cloud - 6 months Subscription';
  if (amt === 124.99 || /12\s*-?\s*months?|1\s*-?\s*year|365\s*-?\s*days?/i.test(description)) return 'Adobe Creative Cloud - 12 months Subscription';
  // Fallback to original description or a generic one
  return description || 'Adobe Creative Cloud Subscription';
}

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

  // Parse custom ID from the purchase unit if available
  let name = '';
  let email = '';
  let customId = '';
  let description = '';
  // Extract amount and currency at the top
  let amount = null;
  let currency = null;
  try {
    if (webhookData.resource.purchase_units && webhookData.resource.purchase_units[0]) {
      const purchaseUnit = webhookData.resource.purchase_units[0];
      description = purchaseUnit.description || '';
      if (purchaseUnit.custom_id) {
        customId = purchaseUnit.custom_id;
        const parsed = JSON.parse(customId);
        name = parsed.name || '';
        email = parsed.email || '';
      }
      if (purchaseUnit.amount) {
        amount = purchaseUnit.amount.value || null;
        currency = purchaseUnit.amount.currency_code || null;
      }
    }
  } catch (e) {
    console.error('Failed to parse custom_id from order approved webhook:', e);
  }
  // Always set description using getPlanDescription
  description = getPlanDescription(amount, description);

  // Calculate savings amount
  const savings = calculateSavings(amount, description);

  // Calculate expiry date based on plan duration (use description for now)
  const expiryDate = calculateExpiryDate('', description);

  // Check if order already exists and its status
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('paypal_order_id', orderId)
    .maybeSingle();
  if (fetchError) {
    console.error(`Error checking for existing order ${orderId}:`, fetchError);
    return;
  }

  // Only set to PENDING if not already ACTIVE or COMPLETED
  let newStatus = 'PENDING';
  if (existingOrder && (existingOrder.status === 'ACTIVE' || existingOrder.status === 'COMPLETED')) {
    newStatus = existingOrder.status;
  }

  // Upsert order into orders table for fast display
  const { error: upsertError } = await supabase.from('orders').upsert([
    {
      paypal_order_id: orderId,
      name,
      email,
      status: newStatus,
      amount,
      currency,
      description: description,
      savings: savings,
      expiry_date: expiryDate.toISOString(),
      paypal_data: webhookData,
      original_status: status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ], { onConflict: 'paypal_order_id' });

  if (upsertError) {
    console.error(`Failed to upsert order for ${orderId} in handleOrderApproved:`, upsertError);
    // Still store the webhook event for reference
    await storeWebhookEvent(webhookData, supabase);
    return;
  }

  // Store the webhook event for reference
  await storeWebhookEvent(webhookData, supabase);
}

// Helper function for handling PAYMENT.CAPTURE.COMPLETED event
async function handlePaymentCompleted(webhookData: any, supabase: any) {
  const paymentId = webhookData.resource.id;
  const paymentStatus = webhookData.resource.status;
  const orderId = webhookData.resource.supplementary_data?.related_ids?.order_id || paymentId;
  const purchaseUnit = webhookData.resource.supplementary_data?.purchase_units?.[0] || webhookData.resource.purchase_units?.[0];

  console.log(`Processing PAYMENT.CAPTURE.COMPLETED for order/payment ${orderId}`);

  // Extract name and email from custom_id
  let name = '';
  let email = '';
  let customId = '';
  let description = '';
  let planDuration = '';
  // Extract amount and currency at the top
  let amount = null;
  let currency = null;
  try {
    description = purchaseUnit?.description || '';
    // Try to extract duration from description
    if (description) {
      const durationMatch = description.match(/(\d+)\s*(day|days|month|months|year|years)/i);
      if (durationMatch) {
        planDuration = durationMatch[0];
      }
    }
    customId = purchaseUnit?.custom_id || webhookData.resource.custom_id;
    if (customId) {
      const parsed = JSON.parse(customId);
      name = parsed.name || '';
      email = parsed.email || '';
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
  // Always set description using getPlanDescription
  description = getPlanDescription(amount, description);

  // Calculate savings amount
  const savings = calculateSavings(amount, description);

  // Calculate expiry date based on plan duration
  const expiryDate = calculateExpiryDate(planDuration, description);

  // Check if order already exists and its status
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, email, name')
    .eq('paypal_order_id', orderId)
    .maybeSingle();
  if (fetchError) {
    console.error(`Error checking for existing order ${orderId}:`, fetchError);
    return;
  }

  // Only update to ACTIVE if not already ACTIVE or COMPLETED
  let shouldUpdate = true;
  if (existingOrder && (existingOrder.status === 'ACTIVE' || existingOrder.status === 'COMPLETED')) {
    shouldUpdate = false;
  }

  if (existingOrder) {
    if (shouldUpdate) {
      // Order exists, update it with payment status
      console.log(`Updating existing order ${orderId} with payment status ACTIVE`);
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'ACTIVE',
          description: description,
          savings: savings,
          expiry_date: expiryDate.toISOString(),
          updated_at: new Date().toISOString(),
          paypal_data: webhookData,
          original_status: paymentStatus
        })
        .eq('paypal_order_id', orderId);
      if (updateError) {
        console.error(`Failed to update order status for ${orderId}:`, updateError);
        return;
      }
  } else {
      console.log(`Order ${orderId} already ACTIVE or COMPLETED, skipping status update.`);
    }
    // Use existing order details for email
    const orderEmail = existingOrder.email || email;
    const orderName = existingOrder.name || name;
    // Assume guest checkout for now (isGuest = true)
    const isGuest = true;
    // Send confirmation email if we have valid email and name
    if (orderEmail && orderName) {
      try {
        await sendConfirmationEmail(orderEmail, orderName, orderId, isGuest);
        console.log(`Confirmation email sent to ${orderEmail} for order ${orderId}`);
      } catch (emailError) {
        console.error(`Failed to send confirmation email for order ${orderId}:`, emailError);
      }
    }
    return;
  }

  // No existing order found, create a new one (this is a fallback in case ORDER.APPROVED wasn't received)
  console.log(`No existing order found for ${orderId}, creating new record`);
  const { error: insertError } = await supabase.from('orders').upsert([
    {
      paypal_order_id: orderId,
      name,
      email,
      status: 'ACTIVE',
      amount,
      currency,
      description: description,
      savings: savings,
      expiry_date: expiryDate.toISOString(),
      paypal_data: webhookData,
      original_status: paymentStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ], { onConflict: 'paypal_order_id' });

  if (insertError) {
    console.error(`Failed to create order for ${orderId}:`, insertError);
    return;
  }

  // Send confirmation email
  if (email && name) {
    try {
      await sendConfirmationEmail(email, name, orderId, true);
      console.log(`Confirmation email sent to ${email} for order ${orderId}`);
    } catch (emailError) {
      console.error(`Failed to send confirmation email for order ${orderId}:`, emailError);
    }
  }
}

// Helper function to calculate expiry date based on plan duration
function calculateExpiryDate(duration: string, description: string): Date {
  const now = new Date();
  
  // Default to 30 days if we can't determine duration
  let days = 30;
  
  // Try to extract duration from the provided string
  if (duration) {
    const match = duration.match(/(\d+)\s*(day|days|month|months|year|years)/i);
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      
      if (unit.startsWith('day')) {
        days = amount;
      } else if (unit.startsWith('month')) {
        days = amount * 30;
      } else if (unit.startsWith('year')) {
        days = amount * 365;
      }
    }
  } else if (description) {
    // Try to extract from description if duration wasn't provided
    if (description.includes('14 days')) {
      days = 14;
    } else if (description.includes('30 days') || description.includes('1 month')) {
      days = 30;
    } else if (description.includes('90 days') || description.includes('3 month')) {
      days = 90;
    } else if (description.includes('180 days') || description.includes('6 month')) {
      days = 180;
    } else if (description.includes('365 days') || description.includes('1 year')) {
      days = 365;
    }
  }
  
  // Add the calculated days to current date
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return expiryDate;
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
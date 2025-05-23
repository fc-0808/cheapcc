import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/utils/paypal-webhook';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';
import crypto from 'crypto';

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
  
  const savings = regularPrice - orderAmount;
  return savings > 0 ? savings : 0;
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
    }
  } catch (e) {
    console.error('Failed to parse custom_id from order approved webhook:', e);
  }
  
  // Extract amount and currency
  let amount = null;
  let currency = null;
  try {
    if (webhookData.resource.purchase_units && webhookData.resource.purchase_units[0]?.amount) {
      amount = webhookData.resource.purchase_units[0].amount.value || null;
      currency = webhookData.resource.purchase_units[0].amount.currency_code || null;
    }
  } catch (e) {
    console.error('Failed to extract amount from webhook:', e);
  }
  
  // Calculate savings amount
  const savings = calculateSavings(amount, description);
  
  // Check for duplicate (idempotency)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('paypal_order_id', orderId)
    .maybeSingle();
  
  if (existingOrder) {
    console.log(`Order ${orderId} already exists, skipping creation`);
    return;
  }
  
  // Create new order record
  console.log(`Creating new order record for ${orderId}`);
  const { data: order, error } = await supabase.from('orders').insert([
    {
      paypal_order_id: orderId,
      name,
      email,
      status: status, // Keep original PayPal status for now (will update to ACTIVE when payment completes)
      amount,
      currency,
      description: description || 'Adobe CC Plan',
      plan_name: description || 'Adobe CC Plan',
      savings: savings, // Store calculated savings
      original_status: status, // Store original PayPal status
      paypal_data: webhookData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]).select().single();
  
  if (error) {
    console.error('Failed to create order from CHECKOUT.ORDER.APPROVED webhook:', error);
    return;
  }
  
  // Generate a token automatically for this order
  await generateTokenForOrder(orderId, supabase);
  
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
  let planDuration = ''; // For tracking subscription length
  
  try {
    // Extract purchase description for duration calculation
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
  } catch (e) {
    console.error('Failed to parse custom_id:', e);
  }

  // Extract amount and currency
  const amount = webhookData.resource.amount?.value || null;
  const currency = webhookData.resource.amount?.currency_code || null;

  // Calculate savings amount
  const savings = calculateSavings(amount, description);

  // Calculate expiry date based on plan duration
  const expiryDate = calculateExpiryDate(planDuration, description);

  // Check if order already exists
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, email, name')
    .eq('paypal_order_id', orderId)
    .maybeSingle();
    
  if (fetchError) {
    console.error(`Error checking for existing order ${orderId}:`, fetchError);
    return;
  }
  
  if (existingOrder) {
    // Order exists, update it with payment status
    console.log(`Updating existing order ${orderId} with payment status ACTIVE`);
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'ACTIVE', // Always set to ACTIVE for completed payments
        description: description || 'Adobe CC Plan',
        plan_name: description || 'Adobe CC Plan',
        savings: savings, // Store calculated savings
        expiry_date: expiryDate.toISOString(),
        updated_at: new Date().toISOString(),
        // Only update payment-specific fields
        payment_id: paymentId,
        payment_data: webhookData,
        original_status: paymentStatus // Store original PayPal status
      })
      .eq('paypal_order_id', orderId);
      
    if (updateError) {
      console.error(`Failed to update order status for ${orderId}:`, updateError);
      return;
    }
    
    // Use existing order details for email
    const orderEmail = existingOrder.email || email;
    const orderName = existingOrder.name || name;
    
    // Check if a token exists for this order, if not create one
    await generateTokenForOrder(orderId, supabase);
    
    // Send confirmation email if we have valid email and name
    if (orderEmail && orderName) {
      try {
        await sendConfirmationEmail(orderEmail, orderName, orderId);
        console.log(`Confirmation email sent to ${orderEmail} for order ${orderId}`);
      } catch (emailError) {
        console.error(`Failed to send confirmation email for order ${orderId}:`, emailError);
      }
    }
    
    return;
  }
  
  // No existing order found, create a new one (this is a fallback in case ORDER.APPROVED wasn't received)
  console.log(`No existing order found for ${orderId}, creating new record`);
  const { error: insertError } = await supabase.from('orders').insert([
    {
      paypal_order_id: orderId,
      name,
      email,
      status: 'ACTIVE', // Set status to ACTIVE for new orders with completed payments
      amount,
      currency,
      description: description || 'Adobe CC Plan',
      plan_name: description || 'Adobe CC Plan',
      savings: savings, // Store calculated savings
      expiry_date: expiryDate.toISOString(),
      payment_id: paymentId,
      paypal_data: webhookData,
      payment_data: webhookData,
      original_status: paymentStatus, // Store original PayPal status
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  
  if (insertError) {
    console.error(`Failed to create order for ${orderId}:`, insertError);
    return;
  }
  
  // Generate a token for this order
  await generateTokenForOrder(orderId, supabase);
  
  // Send confirmation email
  if (email && name) {
    try {
      await sendConfirmationEmail(email, name, orderId);
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

// Helper function to generate a token for an order
async function generateTokenForOrder(orderId: string, supabase: any) {
  try {
    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('order_tokens')
      .select('token')
      .eq('order_id', orderId)
      .maybeSingle();
    
    if (existingToken?.token) {
      console.log(`Token already exists for order ${orderId}`);
      return;
    }
    
    console.log(`Generating new token for order ${orderId}`);
    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token valid for 24 hours
    
    // Store the token
    const { error } = await supabase
      .from('order_tokens')
      .insert([{
        token,
        order_id: orderId,
        expires_at: expiresAt.toISOString(),
      }]);
      
    if (error) {
      console.error(`Error creating token for order ${orderId}:`, error);
    } else {
      console.log(`Successfully created token for order ${orderId}`);
  }
  } catch (error) {
    console.error(`Failed to generate token for order ${orderId}:`, error);
  }
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
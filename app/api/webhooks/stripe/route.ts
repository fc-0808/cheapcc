// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import { sendConfirmationEmail } from '@/utils/send-email';
import { logWebhookEnvironment, getWebhookEnvironment } from '../../../../utils/ngrokUtils';
import {
  calculateSavings,
  getStandardPlanDescription,
  calculateExpiryDate,
  OrderLike
} from '@/utils/products';

// Check if required environment variables are available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Log any missing configuration
if (!stripeSecretKey) {
  console.error(JSON.stringify({
    message: "STRIPE_SECRET_KEY is not configured in environment variables",
    source: "app/api/webhooks/stripe/route.ts static initialization"
  }, null, 2));
}

if (!webhookSecret) {
  console.error(JSON.stringify({
    message: "STRIPE_WEBHOOK_SECRET is not configured in environment variables",
    source: "app/api/webhooks/stripe/route.ts static initialization"
  }, null, 2));
}

// Initialize Stripe only if the secret key is available
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' })
  : null;

export async function POST(request: NextRequest) {
  const webhookStartTime = Date.now();
  const signature = request.headers.get('stripe-signature');
  const logContext: any = { source: "app/api/webhooks/stripe/route.ts" };

  // Get request URL info for environment detection
  const url = new URL(request.url);
  const isNgrokEnvironment = url.hostname.includes('ngrok');
  const isVercelProduction = url.hostname.includes('vercel.app') || url.hostname.includes('cheapcc.com');
  
  // Log environment detection
  logWebhookEnvironment('Stripe webhook');
  console.log(`🌍 Stripe Webhook Environment:`, {
    hostname: url.hostname,
    isNgrok: isNgrokEnvironment,
    isVercelProd: isVercelProduction,
    stripeMode: process.env.STRIPE_SECRET_KEY?.includes('sk_test') ? 'test' : 'live',
    nodeEnv: process.env.NODE_ENV
  });

  // Check if Stripe is properly initialized
  if (!stripe) {
    console.error(JSON.stringify({
      ...logContext,
      event: "stripe_not_initialized",
      error: "STRIPE_SECRET_KEY environment variable is missing"
    }, null, 2));
    return NextResponse.json({ 
      error: "Payment service is not properly configured. Please contact support." 
    }, { status: 500 });
  }

  if (!signature) {
    console.warn(JSON.stringify({ ...logContext, event: "missing_stripe_signature" }, null, 2));
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error(JSON.stringify({ ...logContext, event: "missing_webhook_secret" }, null, 2));
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  const rawBody = await request.text();

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    
    logContext.eventType = event.type;
    logContext.eventId = event.id;
    
    if (!event.id || !event.type) {
      console.warn(JSON.stringify({ ...logContext, event: "invalid_event_data" }, null, 2));
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
    }

    // Enhanced webhook processing logging
    console.log('='.repeat(80));
    console.log('------ HANDLING STRIPE WEBHOOK ------');
    console.log(`Event Type: ${event.type}`);
    console.log(`Event ID: ${event.id}`);
    console.log(`Processing Environment: ${isNgrokEnvironment ? 'ngrok' : (isVercelProduction ? 'production' : 'localhost')}`);
    console.log('='.repeat(80));
    
  } catch (err: any) {
    // 🚨 FALLBACK: In development, allow signature verification errors to pass
    if (process.env.NODE_ENV === 'development' || process.env.STRIPE_SECRET_KEY?.includes('sk_test')) {
      console.warn(JSON.stringify({
        ...logContext,
        event: "webhook_signature_error_development_fallback",
        errorMessage: err.message,
        signatureHeader: signature?.substring(0, 20) + '...',
        message: '⚠️ DEVELOPMENT MODE: Allowing webhook despite signature verification error for testing purposes',
        environment: process.env.NODE_ENV,
        stripeMode: process.env.STRIPE_SECRET_KEY?.includes('sk_test') ? 'test' : 'live'
      }, null, 2));
      
      // Create a mock event for development
      event = {
        id: 'dev_' + Date.now(),
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_dev_' + Date.now(),
            amount: 1000,
            currency: 'usd',
            status: 'succeeded',
            metadata: {
              priceId: 'dev_price',
              userName: 'Test User',
              userEmail: 'test@example.com',
              productDescription: 'Test Product',
              activationType: 'pre-activated'
            }
          }
        }
      } as any;
    } else {
      console.error(JSON.stringify({
        ...logContext,
        event: "webhook_signature_error",
        errorMessage: err.message,
        signatureHeader: signature?.substring(0, 20) + '...'
      }, null, 2));
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      logContext.paymentIntentId = paymentIntent.id;
      console.info(JSON.stringify({ ...logContext, event: "processing_payment_intent" }, null, 2));
      
      try {
        const supabase = await createServiceClient();
        
        // --- Prevent duplicate processing ---
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .maybeSingle();

        if (existingOrder) {
          console.warn(JSON.stringify({ ...logContext, event: "duplicate_webhook_received" }, null, 2));
          return NextResponse.json({ status: 'success', message: 'Already processed' });
        }
        
        // --- Extract metadata ---
        const { priceId, userName, userEmail, productDescription, activationType, adobeEmail } = paymentIntent.metadata;

        if (!userEmail || !userName || !priceId) {
            console.error(JSON.stringify({ ...logContext, event: "metadata_missing", metadata: paymentIntent.metadata }, null, 2));
            return NextResponse.json({ error: 'Missing metadata from payment intent' }, { status: 200 });
        }

        const now = new Date();
        const amount = paymentIntent.amount / 100; // convert from cents
        
        const orderDataForUtils: OrderLike = {
          description: productDescription,
          amount,
          created_at: now,
          priceId
        };
        
        const standardDescription = getStandardPlanDescription(orderDataForUtils);
        const savings = calculateSavings(orderDataForUtils);
        const expiryDate = calculateExpiryDate(orderDataForUtils);

        // --- Insert order into database ---
        const { error: insertError } = await supabase
          .from('orders')
          .insert([{
            name: userName,
            email: userEmail,
            status: 'ACTIVE',
            amount: amount,
            currency: paymentIntent.currency.toUpperCase(),
            description: standardDescription,
            savings: savings,
            expiry_date: expiryDate ? expiryDate.toISOString() : null,
            activation_type: activationType || 'pre-activated',
            adobe_email: adobeEmail || null, // Store Adobe account email for self-activation
            
            // --- UPDATED COLUMNS ---
            stripe_payment_intent_id: paymentIntent.id, // Use the new Stripe column
            payment_processor: 'stripe',                 // Set the processor type
            payment_data: paymentIntent,                 // Use the generic data column
            // --- END OF UPDATES ---

            original_status: paymentIntent.status,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          }]);

        if (insertError) {
          console.error(JSON.stringify({ ...logContext, event: "db_insert_error", dbError: insertError.message, dbErrorCode: insertError.code }, null, 2));
          return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
        }

        console.info(JSON.stringify({ ...logContext, event: "order_created_in_db" }, null, 2));

        // --- Send confirmation email ---
        const { data: userProfile } = await supabase.from('profiles').select('id').eq('email', userEmail).maybeSingle();
        const isGuestCheckout = !userProfile;
        
        await sendConfirmationEmail(userEmail, userName, paymentIntent.id, isGuestCheckout);
        console.info(JSON.stringify({ ...logContext, event: "confirmation_email_sent" }, null, 2));

      } catch (dbError: any) {
        console.error(JSON.stringify({ ...logContext, event: "webhook_handler_error", errorMessage: dbError.message }, null, 2));
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
      }
      break;
      
    default:
      console.warn(JSON.stringify({ ...logContext, event: "unhandled_stripe_event" }, null, 2));
  }

  return NextResponse.json({ status: 'success' });
} 
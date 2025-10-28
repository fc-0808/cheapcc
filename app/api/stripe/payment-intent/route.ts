// app/api/stripe/payment-intent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { getPricingOptions, getPriceForActivationType } from '@/utils/products-supabase';
import { CreatePaymentIntentSchema } from '@/lib/schemas';
import { checkRateLimit, limiters } from '@/utils/rate-limiter';

// Check if Stripe secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error(JSON.stringify({
    message: "STRIPE_SECRET_KEY is not configured in environment variables",
    source: "app/api/stripe/payment-intent/route.ts static initialization"
  }, null, 2));
}

// Initialize Stripe only if the secret key is available
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' })
  : null;

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  let logContext: any = { ip: clientIp, source: "app/api/stripe/payment-intent/route.ts" };

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

  try {
    // Rate Limiting
    const { limited, retryAfter } = await checkRateLimit(request, limiters.orderCreation);
    if (limited) {
      console.warn(JSON.stringify({ ...logContext, event: "rate_limit_exceeded", retryAfter }, null, 2));
      const headers: Record<string, string> = retryAfter ? { 'Retry-After': retryAfter.toString() } : {};
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers });
    }

    // Body Parsing and Validation
    let requestBody;
    try {
      requestBody = await request.json();
      logContext.priceId = requestBody?.priceId;
      logContext.email = requestBody?.email;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const validationResult = CreatePaymentIntentSchema.safeParse(requestBody);
    if (!validationResult.success) {
      console.warn(JSON.stringify({ ...logContext, event: "validation_failed", issues: validationResult.error.format() }, null, 2));
      return NextResponse.json({ error: 'Validation failed.', issues: validationResult.error.format() }, { status: 400 });
    }

    const { priceId, name, email, idempotencyKey, activationType, adobeEmail, basePrice, displayPrice, countryCode, currency } = validationResult.data;
    
    // Get pricing options dynamically
    const pricingOptions = await getPricingOptions();
    const selectedOption = pricingOptions.find(option => option.id === priceId);

    if (!selectedOption) {
      console.error(JSON.stringify({ ...logContext, event: "invalid_price_id" }, null, 2));
      return NextResponse.json({ error: 'Invalid pricing option selected.' }, { status: 400 });
    }

    // Import product utility functions
    const { 
      getProductType, 
      getAdobeProductLine, 
      getActivationTypeForProduct,
      getProductIdFromPriceId 
    } = await import('@/utils/products-supabase');

    // Determine product details
    const productType = getProductType(selectedOption);
    const adobeProductLine = getAdobeProductLine(selectedOption);
    const finalActivationType = getActivationTypeForProduct(selectedOption, activationType);
    const productId = getProductIdFromPriceId(priceId);

    // Calculate final price based on activation type
    const finalPrice = getPriceForActivationType(selectedOption, activationType || 'pre-activated');
    
    // Convert price to cents
    const amountInCents = Math.round(finalPrice * 100);

    // Create appropriate description based on product type and Adobe product line
    let productDescription: string;
    if (productType === 'redemption_code') {
      const productName = adobeProductLine === 'acrobat_pro' ? 'Adobe Acrobat Pro' : 'Adobe Creative Cloud';
      productDescription = `${productName} - ${selectedOption.duration} Redemption Code`;
    } else {
      const productName = adobeProductLine === 'acrobat_pro' ? 'Adobe Acrobat Pro' : 'Adobe Creative Cloud';
      productDescription = `${productName} - ${selectedOption.duration} Subscription`;
    }

    // Determine currency:
    // - Prefer validated client-provided currency (e.g., EUR)
    // - Fallback to USD
    const finalCurrency = (currency || 'USD').toLowerCase();

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: finalCurrency,
      // Enable automatic payment methods for better conversion
      automatic_payment_methods: {
        enabled: true, // Allow Stripe to automatically enable suitable payment methods
      },
      // Note: We've removed payment_method_types as automatic_payment_methods handles this
      metadata: {
        priceId: priceId,
        userName: name,
        userEmail: email,
        productDescription: productDescription,
        activationType: finalActivationType,
        adobeEmail: adobeEmail || null,
        productType: productType,
        adobeProductLine: adobeProductLine,
        productId: productId || '',
        basePrice: basePrice?.toString() || '',
        displayPrice: displayPrice?.toString() || '',
        countryCode: countryCode || 'US',
        currency: finalCurrency.toUpperCase()
      },
      receipt_email: email, // Send receipt emails automatically
      // Set a description that appears on the customer's statement
      statement_descriptor_suffix: 'CheapCC',
    }, {
      idempotencyKey, // Use client-provided idempotency key
    });

    console.info(JSON.stringify({
      ...logContext,
      event: "payment_intent_created",
      paymentIntentId: paymentIntent.id,
      amount: amountInCents / 100,
      productType: productType,
      adobeProductLine: adobeProductLine,
      finalActivationType: finalActivationType,
      productId: productId,
      durationMs: Date.now() - requestStartTime,
    }, null, 2));

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error(JSON.stringify({
      ...logContext,
      event: "payment_intent_creation_error",
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500),
      durationMs: Date.now() - requestStartTime,
    }, null, 2));
    
    // Enhanced error handling with specific status codes based on error type
    if (error.type === 'StripeCardError') {
      // Card errors are declinable by the user
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        decline_code: error.decline_code 
      }, { status: 402 }); // Payment Required
    } else if (error.type === 'StripeInvalidRequestError') {
      // Invalid parameters were supplied to Stripe's API
      return NextResponse.json({ 
        error: 'Invalid payment information provided.',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined 
      }, { status: 400 });
    } else if (error.type === 'StripeAPIError') {
      // Something went wrong on Stripe's end
      return NextResponse.json({ 
        error: 'Payment service temporarily unavailable. Please try again later.' 
      }, { status: 503 }); // Service Unavailable
    } else if (error.type === 'StripeAuthenticationError') {
      // Authentication with Stripe's API failed
      console.error('Stripe authentication error. Check API keys.');
      return NextResponse.json({ 
        error: 'Payment service configuration error. Please contact support.' 
      }, { status: 500 });
    } else if (error.type === 'StripeRateLimitError') {
      // Too many requests made to the API too quickly
      return NextResponse.json({ 
        error: 'Payment service busy. Please try again in a moment.' 
      }, { status: 429 }); // Too Many Requests
    } else {
      // Unknown error type
      return NextResponse.json({ 
        error: 'An unexpected error occurred processing payment. Please try again.' 
      }, { status: 500 });
    }
  }
}
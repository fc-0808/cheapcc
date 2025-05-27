import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  Order,
  CheckoutPaymentIntent
} from '@paypal/paypal-server-sdk';
import { PRICING_OPTIONS } from '@/utils/products';
import { CreateOrderSchema } from '@/lib/schemas';
import { z } from 'zod';
import { checkRateLimit, limiters } from '@/utils/rate-limiter';

const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_SECRET_KEY!;

const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId,
    oAuthClientSecret: clientSecret
  },
  environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true }
  }
});

const ordersController = new OrdersController(paypalClient);

export async function POST(request: NextRequest) {
  const { limited, retryAfter } = await checkRateLimit(request, limiters.orderCreation);
  if (limited) {
    const headers: { [key: string]: string } = {};
    if (retryAfter) {
      headers['Retry-After'] = retryAfter.toString();
    }
    return NextResponse.json(
      { error: 'Too Many Requests. Please try again later.', retryAfter },
      { status: 429, headers }
    );
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (e) {
    console.error('Invalid JSON payload in /api/orders:', e);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const validationResult = CreateOrderSchema.safeParse(requestBody);

  if (!validationResult.success) {
    console.warn('Validation failed for /api/orders:', validationResult.error.format());
    return NextResponse.json(
      { error: 'Validation failed', issues: validationResult.error.format() },
      { status: 400 }
    );
  }

  const { priceId, name, email } = validationResult.data;
  const selectedOption = PRICING_OPTIONS.find(option => option.id === priceId);

  if (!selectedOption) {
    console.error('Invalid pricing option after validation in /api/orders:', priceId);
    return NextResponse.json(
      { error: 'Invalid pricing option selected.' },
      { status: 400 }
    );
  }

  try {
    const paypalRequestBody = {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: 'USD',
            value: selectedOption.price.toFixed(2),
          },
          description: `Adobe Creative Cloud - ${selectedOption.duration} Subscription`,
          customId: JSON.stringify({ name, email, priceId }),
        },
      ],
    };

    const paypalApiResponse = await ordersController.createOrder({ body: paypalRequestBody, prefer: 'return=minimal' });
    const orderData: Order = paypalApiResponse.result;

    return NextResponse.json({
      id: orderData.id,
      status: orderData.status,
      price: selectedOption.price,
      duration: selectedOption.duration,
    });
  } catch (error: any) {
    console.error('Error creating PayPal order in /api/orders:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
    const errorDetails = error.response?.data?.details || error.response?.data;
    const statusCode = error.response?.status || 500;
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
} 
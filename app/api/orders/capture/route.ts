import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  Order
} from '@paypal/paypal-server-sdk';
import { CaptureOrderSchema } from '@/lib/schemas';
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
  const { limited, retryAfter } = await checkRateLimit(request, limiters.orderCapture);
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
    console.error('Invalid JSON payload in /api/orders/capture:', e);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const validationResult = CaptureOrderSchema.safeParse(requestBody);

  if (!validationResult.success) {
    console.warn('Validation failed for /api/orders/capture:', validationResult.error.format());
    return NextResponse.json(
      { error: 'Validation failed', issues: validationResult.error.format() },
      { status: 400 }
    );
  }

  const { orderID } = validationResult.data;

  try {
    const paypalCaptureBody = {
      id: orderID,
    };

    const paypalApiResponse = await ordersController.captureOrder(paypalCaptureBody, {});
    const captureData: Order = paypalApiResponse.result;

    return NextResponse.json({
      id: captureData.id,
      status: captureData.status,
      payer: captureData.payer,
      purchase_units: captureData.purchaseUnits,
    });
  } catch (error: any) {
    console.error('Error capturing PayPal order in /api/orders/capture:', error);
    if (error.response && error.response.data) {
        console.error('PayPal Error Details:', JSON.stringify(error.response.data, null, 2));
    } else if (error.details) {
        console.error('PayPal Error Details (alternative):', JSON.stringify(error.details, null, 2));
    }

    const errorMessage = error.response?.data?.message || error.message || 'Failed to capture order';
    const errorDetails = error.response?.data?.details || error.response?.data || (error.details ? JSON.stringify(error.details) : 'Unknown error details');
    const statusCode = error.response?.status || 500;

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
} 
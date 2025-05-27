import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  Order
} from '@paypal/paypal-server-sdk';
import { CaptureOrderSchema } from '@/lib/schemas';
import { z } from 'zod';

const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_SECRET_KEY!;

const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId,
    oAuthClientSecret: clientSecret
  },
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true }
  }
});

const ordersController = new OrdersController(paypalClient);

export async function POST(request: NextRequest) {
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const validationResult = CaptureOrderSchema.safeParse(requestBody);

  if (!validationResult.success) {
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

    const paypalApiResponse = await ordersController.captureOrder(paypalCaptureBody);
    const captureData: Order = paypalApiResponse.result;

    return NextResponse.json({
      id: captureData.id,
      status: captureData.status,
      payer: captureData.payer,
      purchase_units: captureData.purchaseUnits,
    });
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to capture order';
    const errorDetails = error.response?.data?.details || error.response?.data || (error.details ? JSON.stringify(error.details) : 'Unknown error details');
    const statusCode = error.response?.status || 500;

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
} 
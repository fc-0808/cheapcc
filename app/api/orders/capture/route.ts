import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  Order
} from '@paypal/paypal-server-sdk';

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
  try {
    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const collect = {
      id: orderID,
      prefer: 'return=minimal'
    }

    const paypalApiResponse = await ordersController.captureOrder(collect);
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
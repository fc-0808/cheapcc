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
    const { priceId, name, email } = await request.json();
    const selectedOption = PRICING_OPTIONS.find(option => option.id === priceId);

    if (!selectedOption) {
      return NextResponse.json(
        { error: 'Invalid pricing option' },
        { status: 400 }
      );
    }

    const collect = {
      body: {
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
      },
      prefer: 'return=minimal'
    }

    const paypalApiResponse = await ordersController.createOrder(collect);
    const orderData: Order = paypalApiResponse.result;

    return NextResponse.json({
      id: orderData.id,
      status: orderData.status,
      price: selectedOption.price,
      duration: selectedOption.duration,
    });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
    const errorDetails = error.response?.data?.details || error.response?.data;
    const statusCode = error.response?.status || 500;
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
} 
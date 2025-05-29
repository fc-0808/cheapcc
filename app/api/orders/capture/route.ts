import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  Order,
  OrderCaptureRequest
} from '@paypal/paypal-server-sdk';
import { CaptureOrderSchema } from '@/lib/schemas';
import { checkRateLimit, limiters } from '@/utils/rate-limiter';

const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_SECRET_KEY!;

const paypalEnv = process.env.NODE_ENV === 'production' 
                  ? Environment.Production 
                  : Environment.Sandbox;

if (!clientId || !clientSecret) {
    console.error(JSON.stringify({
        message: "PayPal Client ID or Secret Key is not configured.",
        source: "app/api/orders/capture/route.ts static initialization"
    }, null, 2));
}

const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId,
    oAuthClientSecret: clientSecret
  },
  environment: paypalEnv,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: process.env.NODE_ENV !== 'production' },
    logResponse: { logHeaders: process.env.NODE_ENV !== 'production' }
  }
});

const ordersController = new OrdersController(paypalClient);

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  let orderIdSubmitted = "N/A";
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 
                   '127.0.0.1';

  try {
    const { limited, retryAfter } = await checkRateLimit(request, limiters.orderCapture);
    if (limited) {
      console.warn(JSON.stringify({
        message: "Rate limit exceeded for order capture.",
        ip: clientIp,
        retryAfter,
        source: "app/api/orders/capture/route.ts POST"
      }, null, 2));
      const headers: Record<string, string> = {};
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
      orderIdSubmitted = requestBody?.orderID || orderIdSubmitted;
    } catch (e: any) {
      console.error(JSON.stringify({
        message: 'Invalid JSON payload in /api/orders/capture.',
        ip: clientIp,
        errorMessage: e.message,
        source: "app/api/orders/capture/route.ts POST (parse)"
      }, null, 2));
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const validationResult = CaptureOrderSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.warn(JSON.stringify({
        message: 'Validation failed for /api/orders/capture.',
        ip: clientIp,
        issues: validationResult.error.format(),
        submittedData: { orderID: orderIdSubmitted },
        source: "app/api/orders/capture/route.ts POST (validation)"
      }, null, 2));
      return NextResponse.json(
        { error: 'Validation failed. Invalid Order ID.', issues: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { orderID } = validationResult.data;
    orderIdSubmitted = orderID;

    // Correcting SDK call based on typical usage: pass an object with 'id'
    const paypalApiResponse = await ordersController.captureOrder({ id: orderID });
    const captureData: Order = paypalApiResponse.result;

    const durationMs = Date.now() - requestStartTime;
    console.info(JSON.stringify({
        message: "PayPal order captured successfully.",
        ip: clientIp,
        paypalOrderId: captureData.id,
        captureStatus: captureData.status,
        payerEmail: captureData.payer?.emailAddress, // Log PII carefully
        durationMs,
        source: "app/api/orders/capture/route.ts POST"
    }, null, 2));

    return NextResponse.json({
      id: captureData.id,
      status: captureData.status,
      payer: captureData.payer,
      purchase_units: captureData.purchaseUnits,
    });

  } catch (error: any) {
    const durationMs = Date.now() - requestStartTime;
    const errorContext = {
        message: 'Error capturing PayPal order in /api/orders/capture.',
        ip: clientIp,
        paypalOrderId: orderIdSubmitted,
        errorMessage: error.message,
        errorStack: error.stack?.substring(0,500),
        paypalResponseStatus: error.response?.status,
        paypalResponseData: process.env.NODE_ENV !== 'production' ? error.response?.data : undefined,
        durationMs,
        source: "app/api/orders/capture/route.ts POST (catch)"
    };
    console.error(JSON.stringify(errorContext, null, 2));
    
    if (error.response && error.response.data && process.env.NODE_ENV !== 'production') {
        console.error('PayPal Capture Error Details (Dev):', JSON.stringify(error.response.data, null, 2));
    } else if (error.details && process.env.NODE_ENV !== 'production') {
        console.error('PayPal Capture Error Details (Dev - alternative):', JSON.stringify(error.details, null, 2));
    }

    const userErrorMessage = 'Failed to capture payment. If funds were deducted, please contact support.';
    const errorDetails = process.env.NODE_ENV !== 'production' && error.response?.data?.message ? error.response.data.message : undefined;
    const statusCode = error.response?.status || 500;

    return NextResponse.json(
      { error: userErrorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
} 
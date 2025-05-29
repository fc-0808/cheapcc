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
import { checkRateLimit, limiters } from '@/utils/rate-limiter';

const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_SECRET_KEY!;

// Determine PayPal environment based on Node environment or a specific PayPal env var
const paypalEnv = process.env.NODE_ENV === 'production' 
                  ? Environment.Production 
                  : Environment.Sandbox;

if (!clientId || !clientSecret) {
    console.error(JSON.stringify({
        message: "PayPal Client ID or Secret Key is not configured.",
        source: "app/api/orders/route.ts static initialization"
    }, null, 2));
}

const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId,
    oAuthClientSecret: clientSecret
  },
  environment: paypalEnv,
  logging: {
    logLevel: LogLevel.Info, // Consider LogLevel.Error for production to reduce noise
    logRequest: { logBody: process.env.NODE_ENV !== 'production' }, // Log request body only in dev
    logResponse: { logHeaders: process.env.NODE_ENV !== 'production' } // Log response headers only in dev
  }
});

const ordersController = new OrdersController(paypalClient);

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  let priceIdSubmitted = "N/A";
  let emailSubmitted = "N/A";
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

  try {
    const { limited, retryAfter } = await checkRateLimit(request, limiters.orderCreation);
    if (limited) {
      console.warn(JSON.stringify({
        message: "Rate limit exceeded for order creation.",
        ip: clientIp,
        retryAfter,
        source: "app/api/orders/route.ts POST"
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
      priceIdSubmitted = requestBody?.priceId || priceIdSubmitted;
      emailSubmitted = requestBody?.email || emailSubmitted;
    } catch (e: any) {
      console.error(JSON.stringify({
        message: 'Invalid JSON payload in /api/orders.',
        ip: clientIp,
        errorMessage: e.message,
        source: "app/api/orders/route.ts POST (parse)"
      }, null, 2));
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const validationResult = CreateOrderSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.warn(JSON.stringify({
        message: 'Validation failed for /api/orders.',
        ip: clientIp,
        issues: validationResult.error.format(),
        submittedData: { priceId: priceIdSubmitted, email: emailSubmitted },
        source: "app/api/orders/route.ts POST (validation)"
      }, null, 2));
      return NextResponse.json(
        { error: 'Validation failed. Please check your input.', issues: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { priceId, name, email } = validationResult.data;
    priceIdSubmitted = priceId;
    emailSubmitted = email;

    const selectedOption = PRICING_OPTIONS.find(option => option.id === priceId);
    
    if (!selectedOption) {
      console.error(JSON.stringify({
        message: 'Invalid pricing option selected after validation (logic error).',
        priceId,
        source: "app/api/orders/route.ts POST"
      }, null, 2));
      return NextResponse.json(
        { error: 'Invalid pricing option selected.' },
        { status: 400 }
      );
    }

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

    const durationMs = Date.now() - requestStartTime;
    console.info(JSON.stringify({
        message: "PayPal order created successfully.",
        paypalOrderId: orderData.id,
        status: orderData.status,
        priceId, name, email, // Log PII carefully, consider redacting parts in prod logs
        durationMs,
        source: "app/api/orders/route.ts POST"
    }, null, 2));

    return NextResponse.json({
      id: orderData.id,
      status: orderData.status,
      price: selectedOption.price,
      duration: selectedOption.duration,
    });

  } catch (error: any) {
    const durationMs = Date.now() - requestStartTime;
    const errorContext = {
        message: "Error creating PayPal order in /api/orders.",
        priceId: priceIdSubmitted,
        userEmail: emailSubmitted, // Log PII carefully
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 500), // Truncate stack
        paypalResponseStatus: error.response?.status,
        paypalResponseData: error.response?.data, // Be cautious, could be large/sensitive
        durationMs,
        source: "app/api/orders/route.ts POST (catch)"
    };
    console.error(JSON.stringify(errorContext, null, 2));

    const userErrorMessage = 'Failed to create order. Please try again or contact support if the issue persists.';
    // Only include PayPal's message in details if it's safe and not too verbose
    const errorDetails = process.env.NODE_ENV !== 'production' && error.response?.data?.message ? error.response.data.message : undefined;
    const statusCode = error.response?.status || 500;

    return NextResponse.json(
      { error: userErrorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
} 
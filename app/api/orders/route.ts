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
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

// Updated: Determine PayPal environment based on PAYPAL_API_MODE,
// defaulting to Sandbox if not set or if NODE_ENV is not 'production'.
const paypalApiEnv = process.env.PAYPAL_API_MODE === 'live'
                  ? Environment.Production
                  : Environment.Sandbox;

// Log the environment being used for debugging
console.info(JSON.stringify({
  message: "PayPal API environment configuration",
  environment: process.env.PAYPAL_API_MODE || 'sandbox (default)',
  clientIdExists: !!clientId,
  clientIdFirstChars: clientId ? clientId.substring(0, 10) + '...' : 'undefined',
  clientSecretExists: !!clientSecret,
  clientSecretFirstChars: clientSecret ? clientSecret.substring(0, 5) + '...' : 'undefined',
  source: "app/api/orders/route.ts static initialization"
}, null, 2));

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
  environment: paypalApiEnv,
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

    // Log the request details for debugging
    console.info(JSON.stringify({
      message: "Creating PayPal order",
      priceId,
      price: selectedOption.price,
      duration: selectedOption.duration,
      environment: process.env.PAYPAL_API_MODE || 'sandbox (default)',
      source: "app/api/orders/route.ts POST"
    }, null, 2));

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

    console.log("Sending request to PayPal with:", JSON.stringify({
      environment: process.env.PAYPAL_API_MODE || 'sandbox (default)',
      requestBody: paypalRequestBody
    }, null, 2));
    
    const paypalApiResponse = await ordersController.createOrder({ body: paypalRequestBody, prefer: 'return=minimal' });
    const orderData: Order = paypalApiResponse.result;
    
    console.log("PayPal API response:", JSON.stringify({
      orderId: orderData.id,
      status: orderData.status,
      links: orderData.links
    }, null, 2));

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
    // Ensure full PayPal error is available for logging, especially in production for debugging
    const paypalErrorDetails = error.response?.data || error.details || {};

    const errorContext = {
        message: "Error creating PayPal order in /api/orders.",
        priceId: priceIdSubmitted,
        userEmail: emailSubmitted,
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 500),
        paypalResponseStatus: error.response?.status,
        // Log more detailed PayPal response, even in prod for better debugging
        paypalResponseDataFull: paypalErrorDetails,
        paypalEnvironment: process.env.PAYPAL_API_MODE || 'sandbox (default)',
        durationMs,
        source: "app/api/orders/route.ts POST (catch)"
    };
    console.error(JSON.stringify(errorContext, null, 2));

    const userErrorMessage = 'Failed to create order. Please try again or contact support if the issue persists.';
    // Provide more specific details from PayPal if available and not in production,
    // or if specifically enabled for production debugging.
    const errorDetailsForClient = process.env.NODE_ENV !== 'production' 
                                  ? (paypalErrorDetails.message || error.message || 'Unknown PayPal error')
                                  : undefined;
    const statusCode = error.response?.status || 500;

    return NextResponse.json(
      { 
        error: userErrorMessage, 
        details: errorDetailsForClient,
        environment: process.env.NODE_ENV !== 'production' ? process.env.PAYPAL_API_MODE || 'sandbox (default)' : undefined 
      },
      { status: statusCode }
    );
  }
} 
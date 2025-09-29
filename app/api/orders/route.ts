import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  Order,
  CheckoutPaymentIntent
} from '@paypal/paypal-server-sdk';
import { PRICING_OPTIONS, getPriceForActivationType } from '@/utils/products';
import { CreateOrderSchema } from '@/lib/schemas';
import { checkRateLimit, limiters } from '@/utils/rate-limiter';
import { createClient } from '@/utils/supabase/supabase-server';

// Base environment settings from environment variables
let clientId = process.env.PAYPAL_CLIENT_ID || '';
let clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

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
        source: "app/api/orders/route.ts static initialization",
        missingClientId: !clientId,
        missingClientSecret: !clientSecret
    }, null, 2));
    
    // Throw an error early to prevent attempts to create a client with missing credentials
    if (!clientSecret) {
        throw new Error("PayPal client secret is missing. Please set the PAYPAL_CLIENT_SECRET environment variable.");
    }
    if (!clientId) {
        throw new Error("PayPal client ID is missing. Please set the PAYPAL_CLIENT_ID environment variable.");
    }
}

// Create PayPal client only if we have both required credentials
let paypalClient: Client;
try {
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials missing. Cannot initialize client.");
  }
  
  paypalClient = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret
    },
    environment: paypalApiEnv,
    // Use the correct property name for logging
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: process.env.NODE_ENV !== 'production' },
      logResponse: { logHeaders: process.env.NODE_ENV !== 'production' }
    }
  });
  
  // Implement a custom request interceptor for handling DNS issues
  // Note: This is a workaround since we can't directly customize the HTTP client
  try {
    // Add a DNS resolution test to check connectivity
    const testConnectivity = async () => {
      try {
        const apiHost = process.env.PAYPAL_API_MODE === 'live' 
          ? 'api-m.paypal.com' 
          : 'api-m.sandbox.paypal.com';
          
        // Try a basic DNS lookup
        const response = await fetch(`https://${apiHost}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          },
          body: 'grant_type=client_credentials',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (!response.ok) {
          console.warn(JSON.stringify({
            message: "PayPal connectivity test failed with non-OK response",
            status: response.status,
            statusText: response.statusText,
            source: "app/api/orders/route.ts initialization test"
          }, null, 2));
        } else {
          console.info(JSON.stringify({
            message: "PayPal connectivity test successful",
            source: "app/api/orders/route.ts initialization test"
          }, null, 2));
        }
      } catch (testError: unknown) {
        console.warn(JSON.stringify({
          message: "PayPal connectivity test failed",
          error: testError instanceof Error ? testError.message : String(testError),
          source: "app/api/orders/route.ts initialization test"
        }, null, 2));
      }
    };
    
    // Run the test asynchronously
    testConnectivity().catch(e => console.error("PayPal connectivity test threw:", e));
  } catch (configError) {
    console.error("Error setting up PayPal connectivity test:", configError);
  }
  
  console.info(JSON.stringify({
    message: "PayPal client initialized successfully",
    environment: process.env.PAYPAL_API_MODE || 'sandbox (default)',
    source: "app/api/orders/route.ts client initialization"
  }, null, 2));
} catch (error: any) {
  console.error(JSON.stringify({
    message: "Failed to initialize PayPal client",
    error: error.message,
    errorStack: error.stack?.substring(0, 500),
    source: "app/api/orders/route.ts client initialization"
  }, null, 2));
  throw error;
}

const ordersController = new OrdersController(paypalClient);

// Define cache TTL - 60 seconds
const CACHE_TTL = 60;

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const { limited, retryAfter } = await checkRateLimit(request, limiters.orderCreation);
    
    if (limited) {
      const headers: Record<string, string> = {
        'Retry-After': retryAfter ? retryAfter.toString() : '60',
      };
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers
        }
      );
    }
    
    // Get supabase client
    const supabase = await createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401
        }
      );
    }
    
    // Get orders for this user
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('email', user.email || '')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { 
          status: 500
        }
      );
    }
    
    // Return the orders with cache headers
    return NextResponse.json(
      orders || [],
      { 
        status: 200,
        headers: {
          'Cache-Control': `s-maxage=${CACHE_TTL}, stale-while-revalidate`,
        }
      }
    );
    
  } catch (error) {
    console.error('Unexpected error in orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  let priceIdSubmitted = "N/A";
  let emailSubmitted = "N/A";
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  
  // Check if PayPal client was initialized properly
  if (!clientId || !clientSecret) {
    console.error(JSON.stringify({
      message: "PayPal order creation attempted without proper credentials",
      missingClientId: !clientId,
      missingClientSecret: !clientSecret,
      source: "app/api/orders/route.ts POST"
    }, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Payment system configuration error. Please contact support.', 
        details: 'Missing PayPal API credentials'
      },
      { status: 500 }
    );
  }

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

    const { priceId, name, email, activationType, adobeEmail } = validationResult.data;
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

    const finalPrice = getPriceForActivationType(selectedOption, activationType || 'pre-activated');
    
    const paypalRequestBody = {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: 'USD',
            value: finalPrice.toFixed(2),
          },
          description: `Adobe Creative Cloud - ${selectedOption.duration} Subscription`,
          customId: JSON.stringify({ name, email, priceId, activationType, adobeEmail: adobeEmail || null }),
      },
      ],
    };

    console.log("Sending request to PayPal with:", JSON.stringify({
      environment: process.env.PAYPAL_API_MODE || 'sandbox (default)',
      requestBody: paypalRequestBody
    }, null, 2));
    
    // Create PayPal order with retry logic
    let paypalApiResponse;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        paypalApiResponse = await ordersController.createOrder({ 
          body: paypalRequestBody, 
          prefer: 'return=minimal' 
        });
        // Success - break out of retry loop
        break;
      } catch (error) {
        retryCount++;
        
        // Log the retry attempt with proper type checking
        console.warn(JSON.stringify({
          message: `PayPal API error (attempt ${retryCount}/${maxRetries + 1})`,
          error: error instanceof Error ? error.message : String(error),
          code: typeof error === 'object' && error !== null && 'code' in error ? 
                String((error as any).code) : 'unknown',
          hostname: typeof error === 'object' && error !== null && 'hostname' in error ? 
                    String((error as any).hostname) : 'unknown',
          source: "app/api/orders/route.ts POST (retry)"
        }, null, 2));
        
        // If this was our last retry, rethrow the error
        if (retryCount > maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // The orderData will be defined here because we broke out of the loop on success
    // or threw an error if all retries failed
    const orderData: Order = paypalApiResponse!.result;
    
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
      price: finalPrice,
      duration: selectedOption.duration,
    });

  } catch (error: any) {
    const durationMs = Date.now() - requestStartTime;
    // Ensure full PayPal error is available for logging, especially in production for debugging
    const paypalErrorDetails = error.response?.data || error.details || {};

    // Check if it's a DNS or network error
    const networkErrorCodes = ['ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED'];
    const isNetworkError = 
      (typeof error === 'object' && error !== null && 
       'code' in error && typeof error.code === 'string' && 
       networkErrorCodes.includes(error.code)) ||
      (error instanceof Error && error.message?.includes('getaddrinfo'));

    const errorContext = {
        message: isNetworkError 
          ? "Network connectivity error with PayPal API" 
          : "Error creating PayPal order in /api/orders.",
        priceId: priceIdSubmitted,
        userEmail: emailSubmitted,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500),
        paypalResponseStatus: error.response?.status,
        // Log more detailed PayPal response, even in prod for better debugging
        paypalResponseDataFull: paypalErrorDetails,
        paypalErrorDetails: typeof paypalErrorDetails === 'object' ? JSON.stringify(paypalErrorDetails) : String(paypalErrorDetails),
        paypalEnvironment: process.env.PAYPAL_API_MODE || 'sandbox (default)',
        networkDetails: isNetworkError ? {
          code: error.code,
          syscall: error.syscall,
          hostname: error.hostname
        } : undefined,
        durationMs,
        source: "app/api/orders/route.ts POST (catch)"
    };
    console.error(JSON.stringify(errorContext, null, 2));
    
    // Always log raw error for debugging
    console.error("FULL PAYPAL ERROR:", error);

    // Create a user-friendly error message based on error type
    let userErrorMessage, errorDetailsForClient, statusCode;
    
    if (isNetworkError) {
      userErrorMessage = 'We are currently having trouble connecting to our payment processor. Please try again in a few moments.';
      errorDetailsForClient = 'Connection to payment service temporarily unavailable';
      statusCode = 503; // Service Unavailable
    } else {
      userErrorMessage = 'Failed to create order. Please try again or contact support if the issue persists.';
      errorDetailsForClient = process.env.NODE_ENV !== 'production' 
        ? (paypalErrorDetails.message || error.message || 'Unknown PayPal error')
        : 'Payment processing error';
      statusCode = error.response?.status || 500;
    }

    return NextResponse.json(
      { 
        error: userErrorMessage, 
        details: errorDetailsForClient,
        retry: isNetworkError, // Signal to the client that this is retryable
        environment: process.env.NODE_ENV !== 'production' ? process.env.PAYPAL_API_MODE || 'sandbox (default)' : undefined 
      },
      { status: statusCode }
    );
  }
} 
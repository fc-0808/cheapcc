import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_ID_LENGTH: process.env.PAYPAL_CLIENT_ID?.length || 0,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    // Test if the environment variable is valid
    PAYPAL_CLIENT_ID_VALID: (process.env.PAYPAL_CLIENT_ID?.length || 0) > 50,
  };

  const allPaypalVars = Object.keys(process.env).filter(key => key.includes('PAYPAL'));

  return NextResponse.json({
    envVars,
    allPaypalVars,
    timestamp: new Date().toISOString(),
    domain: request.headers.get('host'),
  });
}

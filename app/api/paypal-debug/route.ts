import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Server-side environment check
  const serverEnvVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID_LENGTH: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.length || 0,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_ID_LENGTH: process.env.PAYPAL_CLIENT_ID?.length || 0,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    // Test if the fallback is working
    PAYPAL_CLIENT_ID_VALID: (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.length || 0) > 50,
    FALLBACK_CLIENT_ID: 'AdnhpzgXSmFsoZv7VDuwS9wJo8czKZy6hBPFMqFuRpgglopk5bT-_tQLsM4hwiHtt_MZOB7Fup4MNTWe',
    FALLBACK_LENGTH: 'AdnhpzgXSmFsoZv7VDuwS9wJo8czKZy6hBPFMqFuRpgglopk5bT-_tQLsM4hwiHtt_MZOB7Fup4MNTWe'.length,
  };

  const allPaypalVars = Object.keys(process.env).filter(key => key.includes('PAYPAL'));

  // Test the PayPal script URL
  const testClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AdnhpzgXSmFsoZv7VDuwS9wJo8czKZy6hBPFMqFuRpgglopk5bT-_tQLsM4hwiHtt_MZOB7Fup4MNTWe';
  const testPaypalUrl = `https://www.paypal.com/sdk/js?client-id=${testClientId}&currency=USD&intent=capture&components=buttons&disable-funding=card`;

  return NextResponse.json({
    serverEnvVars,
    allPaypalVars,
    testPaypalUrl,
    testClientId,
    testClientIdLength: testClientId.length,
    timestamp: new Date().toISOString(),
    domain: request.headers.get('host'),
    userAgent: request.headers.get('user-agent'),
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { PAYPAL_CONFIG } from '@/utils/paypal-config';

export async function GET(request: NextRequest) {
  const clientId = PAYPAL_CONFIG.getClientId();
  const scriptUrl = PAYPAL_CONFIG.getScriptUrl();
  
  return NextResponse.json({
    success: true,
    clientId,
    clientIdLength: clientId.length,
    scriptUrl,
    isValid: clientId.length > 50,
    environment: process.env.NODE_ENV,
    envClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    envClientIdLength: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.length || 0,
    fallbackClientId: process.env.PAYPAL_CLIENT_ID_FALLBACK,
    timestamp: new Date().toISOString(),
    domain: request.headers.get('host'),
  });
}

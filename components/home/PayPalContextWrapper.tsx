'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { getPayPalClientId } from '@/utils/paypal-config';
import React from 'react';

const PayPalContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const clientId = getPayPalClientId();

  // This check now runs consistently on both server and client.
  // During SSR, if the env var isn't perfectly in sync, it will withhold the provider.
  // The crucial part is that the client-side will make the *same decision* initially.
  if (clientId === 'sb' && process.env.NODE_ENV === 'production') {
    console.error("PayPal Client ID not configured for production. PayPal buttons will not be displayed.");
    // We return the children without the provider. An ErrorBoundary should catch the resulting error downstream.
    return <>{children}</>;
  }

  // Additional validation for development
  if (clientId === 'sb') {
    console.warn("PayPal Client ID is 'sb' - this might indicate a configuration issue");
  }

  const initialOptions = {
    'client-id': clientId,
    currency: 'USD',
    intent: 'capture',
  };

  console.log('🔧 PayPalContextWrapper: Using client ID:', clientId.substring(0, 10) + '...');

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalContextWrapper;
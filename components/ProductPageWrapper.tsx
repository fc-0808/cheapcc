"use client";

import React, { ReactNode, Suspense } from 'react';
import { StripePaymentProvider } from './home/StripePaymentContext';
import PayPalContextWrapper from './home/PayPalContextWrapper';

interface ProductPageWrapperProps {
  children: ReactNode;
}

// Lightweight loading indicator for payment providers
const PaymentProvidersFallback = () => (
  <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      <p className="text-gray-400">Loading payment systems...</p>
    </div>
  </div>
);

export default function ProductPageWrapper({ children }: ProductPageWrapperProps) {
  return (
    <StripePaymentProvider>
      <Suspense fallback={<PaymentProvidersFallback />}>
        <PayPalContextWrapper>
          {children}
        </PayPalContextWrapper>
      </Suspense>
    </StripePaymentProvider>
  );
}

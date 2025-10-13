'use client';

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { isClient } from '@/utils/optimizationHelpers';
import { StripePaymentProvider } from './StripePaymentContext';

// Lightweight loading indicators for payment providers
const PayPalFallback = () => (
  <div className="w-full h-12 bg-white/5 backdrop-blur-sm rounded-lg animate-pulse"></div>
);

// Dynamically import payment provider components only when needed on client side
const PayPalContextWrapper = lazy(() => import('./PayPalContextWrapper'));

interface OptimizedPaymentProvidersProps {
  children: React.ReactNode;
}

export default function OptimizedPaymentProviders({ children }: OptimizedPaymentProvidersProps) {
  // Don't render providers at all during SSR to improve performance
  if (!isClient()) {
    return <>{children}</>;
  }
  
  // IMPORTANT: Always render both providers immediately on client-side
  // to ensure they're available for their respective components
  return (
    <StripePaymentProvider>
      <Suspense fallback={<PayPalFallback />}>
        <PayPalContextWrapper>
          {children}
        </PayPalContextWrapper>
      </Suspense>
    </StripePaymentProvider>
  );
} 
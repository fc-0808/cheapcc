'use client';

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { isClient } from '@/utils/optimizationHelpers';
import { StripePaymentProvider } from './StripePaymentContext';

// Lightweight loading indicators for payment providers
const PayPalFallback = () => (
  <div className="w-full h-12 bg-white/5 backdrop-blur-sm rounded-lg animate-pulse"></div>
);

// Dynamically import payment provider components only when needed on client side
const PayPalProvider = lazy(() => {
  // Only import on client side to prevent SSR issues
  if (!isClient()) {
    return Promise.resolve({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> });
  }
  return import('./PayPalContext').then(mod => ({ 
    default: ({ children }: { children: React.ReactNode }) => (
      <mod.PayPalProvider>{children}</mod.PayPalProvider>
    )
  }));
});

interface OptimizedPaymentProvidersProps {
  children: React.ReactNode;
}

export default function OptimizedPaymentProviders({ children }: OptimizedPaymentProvidersProps) {
  // Track whether PayPal provider has loaded
  const [paypalReady, setPaypalReady] = useState(false);
  
  // Delay PayPal rendering to prevent layout shifts
  useEffect(() => {
    if (isClient()) {
      const timer = setTimeout(() => {
        setPaypalReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Don't render providers at all during SSR to improve performance
  if (!isClient()) {
    return <>{children}</>;
  }
  
  // IMPORTANT: Always render StripePaymentProvider immediately on client-side
  // to ensure it's available for the StripePaymentForm component
  return (
    <StripePaymentProvider>
      {paypalReady ? (
        <Suspense fallback={<PayPalFallback />}>
          <PayPalProvider>
            {children}
          </PayPalProvider>
        </Suspense>
      ) : (
        // Initial mounting state - just render children without PayPal provider
        <>{children}</>
      )}
    </StripePaymentProvider>
  );
} 
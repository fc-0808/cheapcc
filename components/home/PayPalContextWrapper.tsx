'use client';

import React from 'react';
import { PayPalProvider } from './PayPalContext';
import { PayPalErrorBoundary } from '../PayPalErrorBoundary';

interface PayPalContextWrapperProps {
  children: React.ReactNode;
}

export default function PayPalContextWrapper({ children }: PayPalContextWrapperProps) {
  return (
    <PayPalErrorBoundary>
      <PayPalProvider>
        {children}
      </PayPalProvider>
    </PayPalErrorBoundary>
  );
}
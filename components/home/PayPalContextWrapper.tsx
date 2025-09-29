'use client';

import React from 'react';
import { PayPalProvider } from './PayPalContext';

interface PayPalContextWrapperProps {
  children: React.ReactNode;
}

export default function PayPalContextWrapper({ children }: PayPalContextWrapperProps) {
  return (
    <PayPalProvider>
      {children}
    </PayPalProvider>
  );
}
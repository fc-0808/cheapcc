'use client';

import React from 'react';
import { PayPalProvider } from './PayPalContext';

export default function PayPalContextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PayPalProvider>
      {children}
    </PayPalProvider>
  );
} 
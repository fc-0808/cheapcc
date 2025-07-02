'use client';

import React from 'react';
import { StripePaymentProvider } from './StripePaymentContext';

export default function StripePaymentContextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StripePaymentProvider>
      {children}
    </StripePaymentProvider>
  );
} 
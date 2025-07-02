'use client';

import React, { useEffect } from 'react';
import { PaymentElement } from '@stripe/react-stripe-js';
import { useStripePayment } from './StripePaymentContext';

interface StripePaymentFormProps {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  paymentStatus: 'idle' | 'loading' | 'success' | 'error' | 'cancel';
  stripe: any;
  elements: any;
  isFormValid: boolean;
  clientSecret: string | null;
  containerId: string;
}

export default function StripePaymentForm({
  handleSubmit,
  paymentStatus,
  stripe,
  elements,
  isFormValid,
  clientSecret,
  containerId
}: StripePaymentFormProps) {
  const { renderForm, renderedId, setRenderedId } = useStripePayment();
  
  // Automatically set this form as active if no form is currently active
  useEffect(() => {
    if (!renderedId) {
      setRenderedId(containerId);
    }
  }, [containerId, renderedId, setRenderedId]);
  
  return renderForm(
    containerId,
    handleSubmit,
    stripe,
    elements,
    isFormValid,
    paymentStatus,
    clientSecret
  );
} 
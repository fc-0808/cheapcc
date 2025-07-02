'use client';

import React, { useEffect } from 'react';
import { PaymentElement } from '@stripe/react-stripe-js';
import { useStripePayment } from './StripePaymentContext';

interface StripePaymentFormProps {
  handleSubmit?: (e: React.FormEvent) => Promise<void>;
  paymentStatus?: 'idle' | 'loading' | 'success' | 'error' | 'cancel';
  stripe?: any;
  elements?: any;
  isFormValid: boolean;
  clientSecret?: string | null;
  containerId?: string;
  email?: string;
  isLoading?: boolean;
}

export default function StripePaymentForm({
  handleSubmit,
  paymentStatus = 'idle',
  stripe,
  elements,
  isFormValid,
  clientSecret,
  containerId = 'default-stripe-container',
  email,
  isLoading = false
}: StripePaymentFormProps) {
  const { renderForm, renderedId, setRenderedId } = useStripePayment();
  
  // Automatically set this form as active if no form is currently active
  useEffect(() => {
    if (!renderedId) {
      setRenderedId(containerId);
    }
  }, [containerId, renderedId, setRenderedId]);
  
  // If we have a new isLoading prop, map it to the paymentStatus
  const effectivePaymentStatus = isLoading ? 'loading' : paymentStatus;
  
  return renderForm(
    containerId,
    handleSubmit,
    stripe,
    elements,
    isFormValid,
    effectivePaymentStatus,
    clientSecret
  );
} 
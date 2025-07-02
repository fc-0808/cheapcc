'use client';

import React from 'react';
import { useStripePayment } from './StripePaymentContext';

interface SafeStripeFormProps {
  containerId: string;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  stripe: any;
  elements: any;
  isFormValid: boolean;
  paymentStatus: string;
  clientSecret: string | null;
}

export default function SafeStripeForm({
  containerId,
  handleSubmit,
  stripe,
  elements,
  isFormValid,
  paymentStatus,
  clientSecret
}: SafeStripeFormProps) {
  const { renderForm } = useStripePayment();

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
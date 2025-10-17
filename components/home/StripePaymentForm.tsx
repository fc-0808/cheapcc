'use client';

import React, { useEffect, useContext } from 'react';
import { PaymentElement } from '@stripe/react-stripe-js';
import { StripePaymentContext } from './StripePaymentContext';

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
  // Use context directly to check if provider exists
  const context = useContext(StripePaymentContext);
  
  // If we have a new isLoading prop, map it to the paymentStatus
  const effectivePaymentStatus = isLoading ? 'loading' : paymentStatus;
  
  // Fallback rendering if context is not available
  if (!context) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        {!clientSecret ? (
          <div className="p-5 h-48 border border-white/20 rounded-lg bg-black/20 text-gray-400 text-sm flex flex-col items-center justify-center">
            <div className="h-6 w-6 border-2 border-fuchsia-500/50 border-t-fuchsia-500 rounded-full animate-spin mb-3"></div>
            <span>Preparing secure terminal...</span>
          </div>
        ) : (
          <PaymentElement 
            id="payment-element" 
            options={{ 
              layout: { type: 'tabs', defaultCollapsed: false } 
            }} 
          />
        )}
        <button 
          disabled={effectivePaymentStatus === 'loading' || !stripe || !elements || !isFormValid || !clientSecret} 
          id="stripe-submit" 
          className="w-full py-3 px-4 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-semibold rounded-lg shadow-lg shadow-fuchsia-500/20 hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-px transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <span className="flex items-center justify-center">
            {effectivePaymentStatus === 'loading' ? <div className="h-5 w-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div> : <i className="fas fa-lock text-xs mr-2"></i>}
            {effectivePaymentStatus === 'loading' ? 'Processing...' : `Pay Securely`}
          </span>
        </button>
      </form>
    );
  }
  
  const { renderForm, renderedId, setRenderedId } = context;
  
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
    effectivePaymentStatus,
    clientSecret
  );
} 
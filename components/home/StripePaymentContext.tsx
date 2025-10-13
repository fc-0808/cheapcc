'use client';

import React, { createContext, useContext, useState } from 'react';
import { PaymentElement } from '@stripe/react-stripe-js';

type StripeContextType = {
  renderForm: (
    containerId: string, 
    handleSubmit: (e: React.FormEvent) => Promise<void>,
    stripe: any,
    elements: any,
    isFormValid: boolean,
    paymentStatus: string,
    clientSecret: string | null
  ) => JSX.Element | null;
  renderedId: string | null;
  setRenderedId: (id: string | null) => void;
};

const StripePaymentContext = createContext<StripeContextType | null>(null);

export const StripePaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const [renderedId, setRenderedId] = useState<string | null>(null);

  const renderForm = (
    containerId: string, 
    handleSubmit: (e: React.FormEvent) => Promise<void>,
    stripe: any,
    elements: any,
    isFormValid: boolean,
    paymentStatus: string,
    clientSecret: string | null
  ) => {
    // Only render the actual form for the active container
    if (renderedId !== containerId) {
      return (
        <div className="p-5 border border-white/20 rounded-lg bg-black/20 text-gray-400 text-sm flex flex-col items-center justify-center h-48">
          <button 
            onClick={() => setRenderedId(containerId)} 
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-medium rounded-lg"
          >
            Show Payment Form
          </button>
        </div>
      );
    }
    
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
          disabled={paymentStatus === 'loading' || !stripe || !elements || !isFormValid || !clientSecret} 
          id="stripe-submit" 
          className="w-full py-3 px-4 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-semibold rounded-lg shadow-lg shadow-fuchsia-500/20 hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-px transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <span className="flex items-center justify-center">
            {paymentStatus === 'loading' ? <div className="h-5 w-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div> : <i className="fas fa-lock text-xs mr-2"></i>}
            {paymentStatus === 'loading' ? 'Processing...' : `Pay Securely`}
          </span>
        </button>
      </form>
    );
  };

  return (
    <StripePaymentContext.Provider value={{ renderForm, renderedId, setRenderedId }}>
      {children}
    </StripePaymentContext.Provider>
  );
};

export const useStripePayment = () => {
  const context = useContext(StripePaymentContext);
  if (!context) {
    throw new Error('useStripePayment must be used within a StripePaymentProvider');
  }
  return context;
}; 
'use client';

import React, { useEffect, useRef, useState } from 'react';
import DirectPayPalButton from '../DirectPayPalButton';

interface PayPalPaymentFormProps {
  selectedProduct: any; // You might want to define a more specific type for product
  email: string;
  onPaymentSuccess: (details: any) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  containerId?: string;
  createPayPalOrderWithRetry?: (priceId: string, name: string, email: string) => Promise<string>;
  adobeEmail?: string | null;
  name?: string; // Added name prop
}

export default function PayPalPaymentForm({
  selectedProduct,
  email,
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  setIsProcessing,
  containerId = 'default-paypal-container',
  createPayPalOrderWithRetry,
  adobeEmail,
  name = 'Customer' // Default name
}: PayPalPaymentFormProps) {
  const uniqueContainerId = `paypal-button-${containerId}`;
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    setLocalError(null);
    try {
      if (createPayPalOrderWithRetry) {
        return await createPayPalOrderWithRetry(selectedProduct.id, name, email);
      } else {
        // Fallback if createPayPalOrderWithRetry is not provided
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: selectedProduct.id,
            name,
            email,
            activationType: selectedProduct.activationType,
            adobeEmail: adobeEmail && adobeEmail.trim() !== '' ? adobeEmail : null,
          }),
        });
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return data.id;
      }
    } catch (error: any) {
      console.error('Error creating PayPal order:', error);
      setLocalError(error.message || 'Failed to create PayPal order.');
      onPaymentError(error.message || 'Failed to create PayPal order.');
      setIsProcessing(false);
      throw error; // Re-throw to stop PayPal flow
    }
  };

  const handleApprove = async (data: any) => {
    setIsProcessing(true);
    setLocalError(null);
    try {
      const response = await fetch('/api/orders/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const details = await response.json();
      if (details.error) {
        throw new Error(details.error);
      }
      onPaymentSuccess(details);
    } catch (error: any) {
      console.error('Error capturing PayPal order:', error);
      setLocalError(error.message || 'Failed to capture PayPal payment.');
      onPaymentError(error.message || 'Failed to capture PayPal payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    console.log('PayPal payment cancelled');
    setIsProcessing(false);
    setLocalError('PayPal payment cancelled.');
    onPaymentError('PayPal payment cancelled.');
  };

  const handleError = (err: any) => {
    console.error('PayPal SDK error:', err);
    setIsProcessing(false);
    setLocalError(err.message || 'An unexpected PayPal error occurred.');
    onPaymentError(err.message || 'An unexpected PayPal error occurred.');
  };

  return (
    <div className="space-y-4">
      {localError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-sm text-red-300 gap-2">
          <i className="fas fa-exclamation-circle text-red-400"></i>
          <span className="flex-1">{localError}</span>
        </div>
      )}
      <DirectPayPalButton
        containerId={uniqueContainerId}
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onCancel={handleCancel}
        onError={handleError}
      />
      <p className="text-xs text-gray-400 text-center">
        Safe & secure payment processing by PayPal
      </p>
    </div>
  );
}
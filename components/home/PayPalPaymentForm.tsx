'use client';

import React, { useEffect, useRef } from 'react';
import { usePayPal } from './PayPalContext';

interface PayPalPaymentFormProps {
  paypalButtonContainerRef: React.RefObject<HTMLDivElement>;
  onPayPalLoad?: () => void;
  onPayPalError?: () => void;
  renderPayPalButton?: () => void;
  paymentStatus?: 'idle' | 'loading' | 'success' | 'error' | 'cancel';
  containerId?: string;
  createOrder?: () => Promise<string>;
  onApprove?: (data: any) => Promise<void>;
  onCancel?: () => void;
  email?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function PayPalPaymentForm({
  paypalButtonContainerRef,
  onPayPalLoad,
  onPayPalError,
  paymentStatus = 'idle',
  containerId = 'default-paypal-container',
  createOrder,
  onApprove,
  onCancel,
  email,
  onLoad,
  onError
}: PayPalPaymentFormProps) {
  const { isPayPalScriptLoaded, renderPayPalButton, cleanupPayPalButton } = usePayPal();
  const mountedRef = useRef(true);
  const renderedRef = useRef(false);
  const uniqueContainerId = `paypal-button-${containerId}`;

  const effectiveOnLoad = onLoad || onPayPalLoad;
  const effectiveOnError = onError || onPayPalError;

  useEffect(() => {
    mountedRef.current = true;
    renderedRef.current = false;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isPayPalScriptLoaded || !mountedRef.current || !paypalButtonContainerRef.current) {
      return;
    }

    const container = document.getElementById(uniqueContainerId);
    if (!container) {
      console.error(`PayPal button container with ID ${uniqueContainerId} not found`);
      return;
    }

    try {
      if (renderedRef.current) {
        cleanupPayPalButton(uniqueContainerId);
      }
    } catch (err) {
      console.error(`Error cleaning up previous PayPal button for ${uniqueContainerId}:`, err);
    }
    
    console.log(`PayPal script loaded, rendering button in container ${uniqueContainerId}`);
    
    try {
      renderPayPalButton(
        uniqueContainerId,
        paypalButtonContainerRef,
        createOrder,
        onApprove,
        onCancel,
        (err) => {
          console.error('PayPal button error:', err);
          if (effectiveOnError && mountedRef.current) effectiveOnError();
        }
      );
      
      renderedRef.current = true;
      
      if (effectiveOnLoad && mountedRef.current) {
        effectiveOnLoad();
      }
    } catch (error) {
      console.error(`Error rendering PayPal button for ${uniqueContainerId}:`, error);
      if (effectiveOnError && mountedRef.current) effectiveOnError();
    }
  }, [
    isPayPalScriptLoaded,
    uniqueContainerId,
    paypalButtonContainerRef,
    createOrder,
    onApprove,
    onCancel,
    renderPayPalButton,
    cleanupPayPalButton,
    effectiveOnLoad,
    effectiveOnError
  ]);

  return (
    <div className="space-y-4">
      <div 
        ref={paypalButtonContainerRef} 
        className={`w-full flex items-center justify-center min-h-14 rounded-md ${paymentStatus === 'loading' ? 'opacity-60 pointer-events-none' : ''}`}
        id={uniqueContainerId}
        data-paypal-container={containerId}
        data-email={email}
      >
        {!isPayPalScriptLoaded && (
          <div className="p-4 text-center">
            <div className="h-6 w-6 border-2 border-blue-400/50 border-t-blue-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-400">Loading PayPal...</p>
          </div>
        )}
        {paymentStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md z-10">
            <div className="h-6 w-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">
        Safe & secure payment processing by PayPal
      </p>
    </div>
  );
} 
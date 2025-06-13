'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { PRICING_OPTIONS } from '@/utils/products';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

interface TestPaymentClientPageProps {
  user: User;
}

export default function AlternateTestPaymentClientPage({ user }: TestPaymentClientPageProps) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [checkoutFormError, setCheckoutFormError] = useState<string | null>(null);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);

  // Find the specific test plan
  const testPlan = PRICING_OPTIONS.find(p => p.id === 'test-live');

  // Details are pre-filled since the user is the logged-in admin
  const name = user.user_metadata?.name || user.email || '';
  const email = user.email || '';
  const selectedPriceId = 'test-live';

  // Use refs to pass the latest data to PayPal callbacks
  const nameRef = useRef(name);
  const emailRef = useRef(email);
  const selectedPriceRef = useRef(selectedPriceId);

  useEffect(() => { nameRef.current = name; }, [name]);
  useEffect(() => { emailRef.current = email; }, [email]);

  const renderPayPalButton = useCallback(() => {
    if (!paypalButtonContainerRef.current || !window.paypal) return;
    paypalButtonContainerRef.current.innerHTML = ''; // Clear previous buttons

    window.paypal.Buttons({
      createOrder: async () => {
        setPaymentStatus('loading');
        setCheckoutFormError(null);
        try {
          console.log('Creating order with:', { 
            priceId: selectedPriceRef.current,
            name: nameRef.current,
            email: emailRef.current
          });
          
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priceId: selectedPriceRef.current,
              name: nameRef.current,
              email: emailRef.current
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to create order';
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorMessage;
              console.error('Order API error response:', errorData);
            } catch (e) {
              console.error('Order API returned non-JSON error:', errorText);
            }
            throw new Error(errorMessage);
          }

          const orderData = await response.json();
          console.log('Response from orders API:', orderData);
          
          if (orderData.error) {
            console.error('Order creation error:', orderData.error, orderData.details);
            throw new Error(orderData.error);
          }
          return orderData.id;
        } catch (error) {
          console.error('Error in createOrder function:', error);
          setCheckoutFormError(error instanceof Error ? error.message : 'Failed to create order');
          throw error;
        }
      },
      onApprove: async (data: any) => {
        try {
          setPaymentStatus('loading');
          await fetch('/api/orders/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          setPaymentStatus('success');
          router.push(`/success/${data.orderID}`);
        } catch (error: any) {
          setCheckoutFormError(error.message);
          setPaymentStatus('error');
        }
      },
      onError: (err: any) => {
        console.error('PayPal button error:', err);
        setCheckoutFormError(err.toString());
        setPaymentStatus('error');
      }
    }).render('#paypal-button-container-test');
  }, [router]);

  useEffect(() => {
    if (sdkReady) {
      renderPayPalButton();
    }
  }, [sdkReady, renderPayPalButton]);

  if (!testPlan) {
    return (
        <div className="min-h-screen bg-red-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-red-700">Configuration Error</h1>
                <p className="text-gray-600 mt-2">The '$0.01 Live Test' plan could not be found. Please ensure it is correctly defined in `utils/products.ts` with an id of 'test-live'.</p>
                <Link href="/dashboard" className="mt-6 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Back to Dashboard</Link>
            </div>
        </div>
    );
  }

  return (
    <>
      {/* HARDCODED PayPal Client ID - doesn't rely on environment variables */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=AdnhpzgXSmFsoZv7VDuwS9wJo8czKZy6hBPFMqFuRpgglopk5bT-_tQLsM4hwiHtt_MZOB7Fup4MNTWe&currency=USD&intent=capture&debug=true`}
        onLoad={() => {
          console.log('PayPal SDK loaded successfully');
          setSdkReady(true);
        }}
        onError={(e) => {
          console.error('PayPal SDK loading error:', e);
          setCheckoutFormError("Failed to load PayPal SDK.");
        }}
      />
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Live Payment Test</h1>
                <p className="text-gray-500 mt-2">This page is for admin use only to test the live payment flow.</p>
                <p className="text-sm text-blue-600 mt-2">(Using alternate implementation with hardcoded credentials)</p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <i className="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                        You are about to make a <strong className="font-bold">real transaction</strong> using the live PayPal environment.
                        </p>
                    </div>
                </div>
            </div>

            <div className="border bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium text-gray-900">{testPlan.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">User:</span>
                        <span className="font-medium text-gray-900">{name} ({email})</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                        <span className="text-lg font-bold text-gray-800">Total:</span>
                        <span className="text-lg font-bold text-green-600">${testPlan.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                {sdkReady ? (
                    <div id="paypal-button-container-test" ref={paypalButtonContainerRef} className="min-h-[50px]"></div>
                ) : (
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"></div>
                        Loading Payment Options...
                    </div>
                )}
            </div>

            {paymentStatus === 'loading' && <div className="text-center text-gray-600 font-medium">Processing...</div>}
            {checkoutFormError && <div className="text-center text-red-600 font-medium p-3 bg-red-50 rounded-md">{checkoutFormError}</div>}
            
            <div className="pt-4 border-t">
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                    <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
                </Link>
            </div>
        </div>
      </div>
    </>
  );
} 
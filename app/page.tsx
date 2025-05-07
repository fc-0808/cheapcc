'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { PRODUCT, PRICING_OPTIONS } from '@/utils/products';

export default function Home() {
  const [selectedPrice, setSelectedPrice] = useState<string>('1m'); // Default to 1 month
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [orderID, setOrderID] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<boolean>(false);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  const scriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to handle when the PayPal SDK is loaded
  const handlePayPalLoad = () => {
    console.log('PayPal SDK loaded successfully');
    setSdkReady(true);
    setSdkError(false);
    
    // Clear timeout if it exists
    if (scriptTimeoutRef.current) {
      clearTimeout(scriptTimeoutRef.current);
      scriptTimeoutRef.current = null;
    }
  };
  
  // Function to handle script load error
  const handlePayPalError = () => {
    console.error('PayPal SDK failed to load');
    setSdkError(true);
  };
  
  // Set a timeout to detect if the script doesn't load in a reasonable time
  useEffect(() => {
    // Set a 5 second timeout to check if the SDK loaded
    scriptTimeoutRef.current = setTimeout(() => {
      if (!sdkReady) {
        console.warn('PayPal SDK is taking too long to load, may be blocked');
        setSdkError(true);
      }
    }, 5000);
    
    // Cleanup timeout on unmount
    return () => {
      if (scriptTimeoutRef.current) {
        clearTimeout(scriptTimeoutRef.current);
      }
    };
  }, [sdkReady]);
  
  // Initialize PayPal buttons when the SDK is loaded
  useEffect(() => {
    if (!sdkReady) return;
    
    // Clear any existing buttons to prevent duplicates
    if (paypalButtonContainerRef.current) {
      paypalButtonContainerRef.current.innerHTML = '';
    }
    
    // Render the PayPal buttons
    if (typeof window !== 'undefined' && window.paypal) {
      window.paypal.Buttons({
        // Create order on the server
        createOrder: async () => {
          try {
            setPaymentStatus('loading');
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ priceId: selectedPrice }),
            });
            const orderData = await response.json();
            
            if (orderData.error) {
              throw new Error(orderData.error);
            }
            
            setOrderID(orderData.id);
            return orderData.id;
          } catch (error) {
            console.error('Error creating order:', error);
            setPaymentStatus('error');
            alert('Could not create PayPal order. Please try again.');
            throw error;
          }
        },
        // Capture the order on the server
        onApprove: async (data: any, actions: any) => {
          try {
            setPaymentStatus('loading');
            const response = await fetch('/api/orders/capture', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            });
            
            const captureData = await response.json();
            
            if (captureData.error) {
              throw new Error(captureData.error);
            }
            
            // Update UI to show success
            setPaymentStatus('success');
            console.log('Payment successful! Order ID:', data.orderID);
            console.log('Check server logs for webhook events');
          } catch (error) {
            console.error('Error capturing order:', error);
            setPaymentStatus('error');
            alert('There was an error processing your payment. Please try again.');
          }
        },
        // Handle cancel or errors
        onCancel: () => {
          setPaymentStatus('cancel');
          console.log('Payment cancelled');
        },
        onError: (err: Error) => {
          console.error('PayPal error:', err);
          setPaymentStatus('error');
          alert('There was an error with PayPal. Please try again.');
        },
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
        },
      }).render('#paypal-button-container');
    }
  }, [sdkReady, selectedPrice]);

  // Function to reset the payment flow
  const handleReset = () => {
    setPaymentStatus('idle');
    setOrderID(null);
    setSdkError(false);
    
    // Attempt to reload the SDK if there was an error
    if (sdkError) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`;
      script.async = true;
      script.onload = handlePayPalLoad;
      script.onerror = handlePayPalError;
      document.head.appendChild(script);
    }
  };

  // Create a simple button alternative for when PayPal is blocked
  const handleAlternativeCheckout = async () => {
    try {
      setPaymentStatus('loading');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const orderData = await response.json() as PayPalOrderResponse;
      
      if (orderData.error) {
        throw new Error(orderData.error);
      }
      
      setOrderID(orderData.id);
      // Show a message before redirecting
      alert('You will now be redirected to PayPal to complete your payment.');
      // Redirect to PayPal checkout
      window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;
    } catch (error) {
      console.error('Error creating order:', error);
      setPaymentStatus('error');
      alert('Could not create PayPal order. Please try again.');
    }
  };

  const selectedPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice)!;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`}
        strategy="afterInteractive"
        onLoad={handlePayPalLoad}
        onError={handlePayPalError}
      />

      <div className="max-w-7xl mx-auto">
        {/* Product Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{PRODUCT.name}</h1>
          <p className="text-xl text-gray-600">{PRODUCT.description}</p>
        </div>

        {/* Pricing Options */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {PRICING_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`relative rounded-lg border-2 p-6 ${
                  selectedPrice === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setSelectedPrice(option.id)}
                  className="absolute inset-0 w-full h-full cursor-pointer"
                  aria-label={`Select ${option.name} plan`}
                />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {option.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{option.duration}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    ${option.price}
                  </p>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Section */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Selected Plan: {selectedPriceOption.name}
              </h2>
              <p className="text-gray-600">
                Duration: {selectedPriceOption.duration}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                Total: ${selectedPriceOption.price}
              </p>
            </div>

            {/* PayPal Button Container */}
            {(paymentStatus === 'idle' || paymentStatus === 'loading') && !sdkError && (
              <div id="paypal-button-container" ref={paypalButtonContainerRef} className="mt-6" />
            )}

            {/* Loading State */}
            {paymentStatus === 'loading' && (
              <div className="flex justify-center items-center my-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}

            {/* Success State */}
            {paymentStatus === 'success' && (
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 text-green-500 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-green-700 font-medium">
                    Payment successful! Check your email for access details.
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {paymentStatus === 'error' && (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 text-red-500 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <p className="text-red-700 font-medium">
                    There was an error processing your payment. Please try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

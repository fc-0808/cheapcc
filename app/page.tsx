'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

export default function Home() {
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
            });
            const orderData = await response.json() as PayPalOrderResponse;
            
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
        onApprove: async (data: PayPalApproveData, actions: any) => {
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
            
            const captureData = await response.json() as PayPalCaptureResponse;
            
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
  }, [sdkReady]);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      {/* Load the PayPal SDK script in the head with async attribute */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`}
        strategy="afterInteractive"
        async
        onLoad={handlePayPalLoad}
        onError={handlePayPalError}
      />
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">PayPal Webhook Test</h1>
          <h2 className="text-lg text-gray-600 mb-4">Simple Test Purchase</h2>
          
          {(paymentStatus === 'idle' || paymentStatus === 'loading') && (
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                This is a simple payment to test PayPal webhook functionality.
                After payment, check your server logs for webhook events.
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Price:</span>
                <span className="font-bold text-lg">$1.00</span>
              </div>
            </div>
          )}
          
          {paymentStatus === 'loading' && (
            <div className="flex justify-center items-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="mb-6">
              <div className="bg-green-50 p-4 rounded-md mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">Payment Successful!</span>
              </div>
              <p className="text-gray-700 mb-3">
                Your payment has been processed. Check your server logs to see the webhook events.
              </p>
              {orderID && (
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mb-4">
                  <p className="font-medium">Order ID:</p>
                  <code className="bg-gray-100 p-1 rounded">{orderID}</code>
                </div>
              )}
              <button 
                onClick={handleReset}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Make Another Test Payment
              </button>
            </div>
          )}
          
          {paymentStatus === 'cancel' && (
            <div className="mb-6">
              <div className="bg-yellow-50 p-4 rounded-md mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-700 font-medium">Payment Cancelled</span>
              </div>
              <p className="text-gray-700 mb-4">
                You've cancelled the payment process. No charges were made.
              </p>
              <button 
                onClick={handleReset}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {paymentStatus === 'error' && (
            <div className="mb-6">
              <div className="bg-red-50 p-4 rounded-md mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">Payment Error</span>
              </div>
              <p className="text-gray-700 mb-4">
                There was an error processing your payment. Please try again.
              </p>
              <button 
                onClick={handleReset}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* PayPal Button Container - only show when in idle state or loading (but loading state shows spinner above) */}
          {(paymentStatus === 'idle' || paymentStatus === 'loading') && !sdkError && (
            <div id="paypal-button-container" ref={paypalButtonContainerRef} className="mt-8"></div>
          )}
          
          {/* Alternative payment button if PayPal SDK fails to load */}
          {sdkError && paymentStatus === 'idle' && (
            <div className="mt-8">
              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <p className="text-yellow-700">
                  PayPal button could not be loaded. You can still checkout with PayPal using the button below.
                </p>
              </div>
              <button 
                onClick={handleAlternativeCheckout}
                className="pp-7NZBCCB8LA938 mt-2"
              >
                Pay with PayPal
              </button>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="font-bold mb-2">Note:</h2>
            <p className="text-sm text-gray-700">
              Make sure you have configured your PayPal webhook in the developer dashboard 
              and have set up a public URL using a service like ngrok to receive webhook events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

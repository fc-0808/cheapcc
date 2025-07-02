// app/success/page.tsx

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPlanDuration } from '@/utils/products';

// This is the inner component that does the work
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const paypalOrderId = searchParams.get('paypal_order_id');
  const orderId = paymentIntentId || paypalOrderId;

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Could not verify payment: No order identifier found.");
      setLoading(false);
      return;
    }

    const pollOrder = async () => {
      if (!orderId) return;

      // Add retry mechanism
      let attempts = 0;
      const maxAttempts = 5;
      const initialDelay = 1000;
      let delay = initialDelay;

      const poll = async (): Promise<void> => {
        try {
          setLoading(true);
          const response = await fetch('/api/orders/get-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          });

          if (!response.ok) {
            if (response.status === 404) {
              // 404 means order not found yet, which is expected initially
              // so we continue polling
              console.log(`Order ${orderId} not found yet, continuing to poll...`);
              return;
            }

            // For other errors like network issues, we'll retry with backoff
            const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.warn(`Error fetching order status (attempt ${attempts+1}/${maxAttempts}):`, errData.error);
            
            // If we've reached max attempts, show error state
            if (attempts >= maxAttempts) {
              console.error(`Max polling attempts (${maxAttempts}) reached for order ${orderId}`);
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 5;
    const initialDelay = 1000;
    let delay = initialDelay;

    const pollOrder = async () => {
      if (!isMounted) return;
      
      console.log(`Polling for order... ID: ${orderId}, Attempt: ${attempts + 1}`);

      try {
        const response = await fetch('/api/orders/get-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        if (response.status === 404) {
          // Order not found yet, continue polling
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(pollOrder, delay);
          } else {
            setError('We could not confirm your order. If you just paid, please wait a moment and then check your email for a confirmation. If you need assistance, please contact support with your order ID.');
            setLoading(false);
          }
          return;
        }

        if (!response.ok) {
          // Handle other server errors
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch order status');
        }

        // Order found!
        const order = await response.json();
        setOrderDetails(order);
        setError(null);
        setLoading(false);

      } catch (err: any) {
        console.error("Polling error:", err);
        setError("An error occurred while fetching your order details. Please contact support.");
        setLoading(false);
      }
    };

    pollOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="text-center">
        <div className="inline-block h-10 w-10 border-4 border-[rgba(255,255,255,0.1)] border-t-[#ff3366] rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-300 font-medium">Finalizing your order, please wait...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="text-center">
        <div className="mb-4 inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20">
          <i className="fas fa-exclamation-circle text-red-400 text-3xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">There was an issue</h1>
        <p className="text-red-300 mb-6">{error || 'Could not display order details.'}</p>
        <div className="mt-6">
          <Link href="/" prefetch={false} className="text-gray-300 hover:text-white transition inline-flex items-center border border-gray-600 hover:border-gray-400 rounded-lg px-4 py-2 bg-white/5 backdrop-blur-sm">
            <i className="fas fa-arrow-left mr-2"></i> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // --- Success UI ---
  return (
    <>
      <div className="text-center mb-8">
        <div className="mb-5 inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
          <i className="fas fa-check-circle text-green-400 text-3xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
        <p className="text-gray-400">Your order has been confirmed.</p>
      </div>
      
      <div className="border-t border-gray-700/40 pt-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5">
            <span className="text-gray-400">Order ID:</span>
            <span className="font-medium text-white truncate ml-4 max-w-[50%]">{orderId}</span>
          </div>
          
          <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5">
            <span className="text-gray-400">Name:</span>
            <span className="font-medium text-white">{orderDetails.name}</span>
          </div>
          
          <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5">
            <span className="text-gray-400">Email:</span>
            <span className="font-medium text-white">{orderDetails.email}</span>
          </div>
          
          <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5">
            <span className="text-gray-400">Amount:</span>
            <span className="font-medium text-white">${orderDetails.amount} {orderDetails.currency?.toUpperCase()}</span>
          </div>
          
          <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5">
            <span className="text-gray-400">Plan:</span>
            <span className="font-medium text-white">{orderDetails.description}</span>
          </div>
          
          <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5">
            <span className="text-gray-400">Duration:</span>
            <span className="font-medium text-white">{getPlanDuration(orderDetails)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6 rounded-xl overflow-hidden">
        <div className="bg-[rgba(234,179,8,0.1)] border-l-4 border-yellow-500 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-300 flex items-center gap-2">
            <i className="fas fa-user-plus"></i>Track your order
          </h3>
          <p className="text-yellow-200/80 text-sm mt-2">Register for a free account using <b className="text-yellow-200">{orderDetails.email}</b> to view your order history and manage your subscription.</p>
          <Link href="/register" className="mt-3 inline-flex items-center text-sm px-4 py-1.5 rounded-md bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-medium transition-colors">
            Register now <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
      
      <div className="mb-8 rounded-xl overflow-hidden">
        <div className="bg-[rgba(59,130,246,0.1)] border-l-4 border-blue-500 p-4 rounded-lg">
          <h3 className="font-medium text-blue-300 flex items-center gap-2">
            <i className="fas fa-info-circle"></i>What happens next?
          </h3>
          <p className="text-blue-200/80 text-sm mt-2">We are processing your access now. You will receive a confirmation email with all your account details shortly. Please check your inbox (and spam folder).</p>
        </div>
      </div>
      
      <div className="text-center">
        <Link href="/" prefetch={false} className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white/5 border border-gray-600 hover:border-gray-400 text-gray-200 hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i> Return to Home
        </Link>
      </div>
    </>
  );
}


// The main page component, wrapping the content in Suspense
export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0f111a] flex justify-center items-center p-4">
      <div className="relative z-10">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"></div>
        
        {/* Main content card */}
        <div className="w-full max-w-2xl rounded-xl p-6 sm:p-8 relative z-10"
          style={{
            background: "rgba(17, 17, 40, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
          }}>
          
          <a href="/" className="w-fit mx-auto mb-6 text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
            Cheap <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">CC</span>
          </a>

          <Suspense fallback={
            <div className="text-center">
              <div className="inline-block h-10 w-10 border-4 border-[rgba(255,255,255,0.1)] border-t-[#ff3366] rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-gray-300 font-medium">Loading details...</p>
            </div>
          }>
            <OrderSuccessContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
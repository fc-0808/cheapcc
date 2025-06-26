'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import Link from 'next/link';
import { getPlanDuration } from '@/utils/products';

/**
 * The main content of the success page.
 * This component reads URL parameters and fetches order details.
 * It's wrapped in a Suspense boundary because useSearchParams can suspend rendering.
 */
function OrderSuccessContent() {
  const searchParams = useSearchParams();

  // Intelligently get the order ID from either Stripe or PayPal redirect parameters
  const orderId = searchParams.get('payment_intent') || searchParams.get('paypal_order_id');

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Abort if no order ID is found in the URL
    if (!orderId) {
      setError("Could not verify payment: No order identifier found in the URL.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 15; // Poll for 30 seconds (15 attempts * 2s)

    const pollOrder = async () => {
      // Check if the ID is from Stripe (starts with 'pi_') or PayPal
      const isStripeId = orderId.startsWith('pi_');
      console.log(`Polling for order... ID: ${orderId}, Type: ${isStripeId ? 'Stripe' : 'PayPal'}, Attempt: ${attempts + 1}`);

      const supabase = createClient();
      const { data: order, error: queryError } = await supabase
        .from('orders')
        .select('*')
        .eq(isStripeId ? 'stripe_payment_intent_id' : 'paypal_order_id', orderId)
        .maybeSingle();
      
      if (!isMounted) return;

      if (queryError) {
        console.error("Supabase query error:", queryError);
        setError("Error fetching your order details. Please contact support.");
        setLoading(false);
        return;
      }
      
      // If the order is found in the database, success!
      if (order) {
        setOrderDetails(order);
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData?.user?.email;
        setIsGuest(!userEmail || (order.email && order.email !== userEmail));
        setLoading(false);
        setError(null);
      } else if (attempts < maxAttempts) {
        // If not found, increment attempts and poll again after a delay
        attempts++;
        setTimeout(pollOrder, 2000);
      } else {
        // If max attempts are reached, show an error
        setLoading(false);
        setError('We could not confirm your order. If you just paid, please wait a moment and then check your email for a confirmation. If you need assistance, please contact support with your order ID.');
      }
    };

    pollOrder();

    // Cleanup function to prevent state updates on unmounted component
    return () => { isMounted = false; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="text-center">
        <div className="inline-block h-8 w-8 border-4 border-gray-200 border-t-[#ff3366] rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600">Finalizing your order, please wait...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="text-center">
        <i className="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h1 className="text-2xl font-bold text-[#2c2d5a]">There was an issue</h1>
        <p className="text-red-600 mt-2">{error || 'Could not display order details.'}</p>
        <div className="mt-8 text-center">
          <Link href="/" prefetch={false} className="text-[#2c2d5a] hover:text-[#ff3366] transition inline-flex items-center">
            <i className="fas fa-arrow-left mr-2"></i> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // This is your existing, well-designed success UI
  return (
    <>
      <div className="text-center mb-6">
        <i className="fas fa-check-circle text-[#10b981] text-5xl mb-4"></i>
        <h1 className="text-2xl font-bold text-[#2c2d5a]">Thank You!</h1>
        <p className="text-gray-600">Your order has been confirmed.</p>
      </div>
      <div className="border-t border-gray-100 pt-6 mb-6">
        <h2 className="text-lg font-semibold text-[#2c2d5a] mb-4">Order Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium truncate ml-4">{orderId}</span>
          </div>
          <div className="flex justify-between"><span className="text-gray-600">Name:</span><span className="font-medium">{orderDetails.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Email:</span><span className="font-medium">{orderDetails.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span className="font-medium">${orderDetails.amount} {orderDetails.currency.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Plan:</span><span className="font-medium">{orderDetails.description}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Duration:</span><span className="font-medium">{getPlanDuration(orderDetails)}</span></div>
        </div>
      </div>
      {isGuest && orderDetails?.email && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-yellow-800">Track your order</h3>
            <p className="text-yellow-700 text-sm mt-1">Register for a free account using <b>{orderDetails.email}</b> to view your order history and manage your subscription.</p>
            <Link href="/register" className="text-[#ff3366] underline font-semibold mt-2 inline-block">Register now</Link>
        </div>
      )}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
                <h3 className="font-medium text-blue-800">What happens next?</h3>
                <p className="text-blue-700 text-sm mt-1">We are processing your access now. You will receive a confirmation email with all your account details shortly. Please check your inbox (and spam folder).</p>
            </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/" prefetch={false} className="text-[#2c2d5a] hover:text-[#ff3366] transition inline-flex items-center">
          <i className="fas fa-arrow-left mr-2"></i> Return to Home
        </Link>
      </div>
    </>
  );
}

/**
 * The main page component, wrapping the content in a Suspense boundary
 * as a best practice for components that use `useSearchParams`.
 */
export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-2xl w-full">
        <Suspense fallback={
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-4 border-gray-200 border-t-[#ff3366] rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-600">Loading details...</p>
          </div>
        }>
          <OrderSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
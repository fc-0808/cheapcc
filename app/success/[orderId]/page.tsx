'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import Link from 'next/link';
import { getPlanDuration } from '@/utils/products';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 15; // 2s * 15 = 30s
    const pollOrder = async () => {
      const supabase = createClient();
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('paypal_order_id', orderId)
        .maybeSingle();
      if (!isMounted) return;
      if (order) {
        setOrderDetails(order);
        // Check if user is authenticated and if order email matches user email
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData?.user?.email;
        setIsGuest(!userEmail || (order && order.email && order.email !== userEmail));
        setIsAuthenticated(!!userData?.user);
        setLoading(false);
        setError(null);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(pollOrder, 2000);
      } else {
        setLoading(false);
        setError('Order not found. If you just completed your payment, please wait a few seconds and refresh this page.');
      }
    };
    pollOrder();
    return () => { isMounted = false; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white to-[#f8f9fa]">
      <div className="text-center relative">
        {/* Logo Animation */}
        <div className="mb-6 flex items-center justify-center">
          <div className="text-4xl font-extrabold text-[#2c2d5a] tracking-tight">
            Cheap
            <span className="text-[#ff3366] relative inline-flex">
              CC
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff3366] rounded-full animate-ping opacity-75"></span>
              <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#2c2d5a] rounded-full animate-ping opacity-75 animation-delay-500"></span>
            </span>
          </div>
        </div>
        
        {/* Savings Tag */}
        <div className="absolute -top-2 -right-16 transform rotate-12 bg-[#ff3366] text-white text-xs px-3 py-1 rounded-full font-bold shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
          75% OFF
        </div>

        {/* Loading Progress Animation */}
        <div className="relative h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#2c2d5a] to-[#ff3366] rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        
        <h2 className="text-xs font-semibold text-[#2c2d5a] mb-1">Loading creative goodness...</h2>
      </div>
      
      {/* Custom keyframes for the loading animation */}
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center">
        <div className="text-red-600 text-lg font-semibold mb-2"><i className="fas fa-exclamation-circle mr-2"></i>{error}</div>
        <button className="mt-4 px-4 py-2 bg-[#ff3366] text-white rounded" onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <i className="fas fa-check-circle text-[#10b981] text-5xl mb-4"></i>
          <h1 className="text-2xl font-bold text-[#2c2d5a]">Thank You!</h1>
          <p className="text-gray-600">Your order is being processed.</p>
        </div>
        <div className="border-t border-gray-100 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c2d5a] mb-4">Order Reference</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            {orderDetails && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{orderDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{orderDetails.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${orderDetails.amount} {orderDetails.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{orderDetails.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{getPlanDuration(orderDetails)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Guest reminder for non-authenticated users or if order email does not match user email */}
        {isGuest && orderDetails?.email && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <i className="fas fa-user-plus text-yellow-500 mt-1 mr-3"></i>
              <div>
                <h3 className="font-medium text-yellow-800">Want to access your order details later?</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Register for a free account using <b>{orderDetails.email}</b> to view your order history and manage your subscription anytime.<br />
                  <a href="/register" className="text-[#ff3366] underline font-semibold">Register now</a>
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
              <h3 className="font-medium text-blue-800">What happens next?</h3>
              <p className="text-blue-700 text-sm mt-1">
                We are processing your payment. You will receive a detailed confirmation email shortly. Please check your inbox (and spam folder).
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="text-[#2c2d5a] hover:text-[#ff3366] transition inline-flex items-center">
            <i className="fas fa-arrow-left mr-2"></i> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
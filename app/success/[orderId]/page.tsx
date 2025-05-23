'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Function to fetch order details with retry capability
  const fetchOrderDetails = async (retry = 0) => {
    try {
      console.log(`Fetching order details for ${orderId}, attempt ${retry + 1}/${maxRetries + 1}`);
      setLoading(true);
      
      const supabase = createClient();
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      // For authenticated users, row-level security will handle access
      // For guests, we'll need to verify the token separately
      if (user) {
        console.log('User is authenticated, fetching order via Supabase client');
        // Fetch order details directly - RLS will restrict to user's orders
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('paypal_order_id', orderId)
          .single();
          
        if (error) {
          console.error('Error fetching order with auth:', error);
          throw error;
        }
        
        if (!data) {
          throw new Error('Order not found');
        }
        
        setOrderDetails(data);
      } else if (token) {
        console.log('User is guest, verifying with token');
        // Guest user with token - call API to verify token and get order
        const response = await fetch(`/api/orders/  -token?orderId=${orderId}&token=${encodeURIComponent(token)}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Token verification failed:', errorData.error || response.statusText);
          throw new Error(errorData.error || 'Invalid or expired token');
        }
        
        const data = await response.json();
        
        if (!data || !data.order) {
          console.error('No order data returned from verify-token endpoint');
          throw new Error('Failed to retrieve order details');
        }
        
        setOrderDetails(data.order);
      } else {
        console.log('No authentication or token provided');
        throw new Error('Authentication required to view this order');
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error in fetchOrderDetails:', err);
      
      // If it's not the final retry, try again
      if (retry < maxRetries) {
        console.log(`Retrying fetch in ${(retry + 1) * 2} seconds...`);
        setRetryCount(retry + 1);
        
        // Wait longer with each retry
        setTimeout(() => {
          fetchOrderDetails(retry + 1);
        }, (retry + 1) * 2000);
        return;
      }
      
      // If we've exhausted all retries, show error
      setError(err.message || 'Failed to fetch order details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3366] mb-4"></div>
        <p className="text-gray-600">
          {retryCount > 0 
            ? `Loading order details (attempt ${retryCount + 1}/${maxRetries + 1})...` 
            : 'Loading order details...'}
        </p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
          <i className="fas fa-exclamation-circle text-[#ff3366] text-5xl mb-4"></i>
          <h1 className="text-2xl font-bold text-[#2c2d5a] mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-4">
            <Link href="/" className="btn py-3 px-6 bg-[#ff3366] text-white rounded-lg hover:bg-[#e62e5c] transition block w-full">
              Return to Home
            </Link>
            
            <div className="text-gray-500 text-sm">
              <p>If you've just completed a purchase, please note your order ID:</p>
              <p className="font-bold my-2">{orderId}</p>
              <p>Contact support at <a href="mailto:support@cheapcc.online" className="text-[#ff3366]">support@cheapcc.online</a> with this ID.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <i className="fas fa-check-circle text-[#10b981] text-5xl mb-4"></i>
          <h1 className="text-2xl font-bold text-[#2c2d5a]">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>
        
        <div className="border-t border-gray-100 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c2d5a] mb-4">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{orderDetails.paypal_order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(orderDetails.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">${orderDetails.amount} {orderDetails.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-[#10b981] font-medium">
                {orderDetails.status?.charAt(0).toUpperCase() + orderDetails.status?.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
              <h3 className="font-medium text-blue-800">What happens next?</h3>
              <p className="text-blue-700 text-sm mt-1">
                We're processing your order. Your Adobe account details will be delivered to your email 
                <strong> {orderDetails.email}</strong> shortly. This usually takes less than 30 minutes.
              </p>
            </div>
          </div>
        </div>
        
        {!isAuthenticated && (
          <div className="border-t border-gray-100 pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-[#2c2d5a] mb-2">Create an account to track your orders</h3>
              <p className="text-gray-600 text-sm mb-4">
                Register now to easily access your purchase history and manage your subscriptions.
              </p>
              <Link 
                href={`/register?email=${encodeURIComponent(orderDetails.email)}`}
                className="py-2 px-4 bg-[#ff3366] text-white rounded-lg hover:bg-[#e62e5c] transition inline-flex items-center"
              >
                <i className="fas fa-user-plus mr-2"></i> Register with this email
              </Link>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-[#2c2d5a] hover:text-[#ff3366] transition inline-flex items-center">
            <i className="fas fa-arrow-left mr-2"></i> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
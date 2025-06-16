'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/supabase-client';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/products';
import Link from 'next/link';

interface TestPaymentClientProps {
  userEmail: string;
  userId: string;
}

export default function TestPaymentClient({ userEmail, userId }: TestPaymentClientProps) {
  const [email, setEmail] = useState(userEmail);
  const [name, setName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();
  
  // Load user information
  useEffect(() => {
    async function loadUserInfo() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      
      if (profileData?.full_name) {
        setName(profileData.full_name);
      }
    }
    
    loadUserInfo();
  }, [supabase, userId]);
  
  // Load PayPal SDK
  useEffect(() => {
    // Add PayPal Script
    const addPayPalScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    if (window.paypal) {
      setSdkReady(true);
    } else {
      addPayPalScript();
    }
  }, []);

  // Render PayPal button when SDK is ready
  useEffect(() => {
    if (sdkReady && paypalButtonRef.current) {
      paypalButtonRef.current.innerHTML = '';
      
      window.paypal
        .Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'pay',
            height: 40,
          },
          // @ts-ignore - PayPal types issue
          createOrder: async () => {
            try {
              setPaymentStatus('loading');
              setErrorMessage(null);

              const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  priceId: 'test-payment',
                  name,
                  email,
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || data.details || 'Failed to create order');
              }

              return data.id;
            } catch (error: any) {
              console.error('Error creating order:', error);
              setPaymentStatus('error');
              setErrorMessage(error.message || 'Error creating order');
              return null;
            }
          },
          onApprove: async (data: any) => {
            try {
              const { orderID } = data;
              setOrderId(orderID);

              const response = await fetch('/api/orders/capture', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderID,
                }),
              });

              const responseData = await response.json();

              if (!response.ok) {
                throw new Error(responseData.error || responseData.details || 'Failed to capture order');
              }

              setPaymentStatus('success');
              router.push(`/success/${orderID}`);
              
            } catch (error: any) {
              console.error('Error capturing payment:', error);
              setPaymentStatus('error');
              setErrorMessage(error.message || 'Error capturing payment');
            }
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            setPaymentStatus('error');
            setErrorMessage('PayPal encountered an error: ' + (err.message || 'Unknown error'));
          },
          onCancel: () => {
            setPaymentStatus('cancel');
            setErrorMessage('Payment was cancelled');
          },
        })
        .render(paypalButtonRef.current as unknown as string);
    }
  }, [sdkReady, email, name, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Test Payment ($0.01)</h1>
          <Link href="/admin/visitors" className="text-blue-600 hover:text-blue-800 font-medium">
            Back to Admin
          </Link>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {errorMessage}
          </div>
        )}
        
        {paymentStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
            Payment successful! Order ID: {orderId}
          </div>
        )}
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-md p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Test Payment Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{formatCurrency(0.01)}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">Test Payment</span>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="font-medium">
                  {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.includes('sb-') ? 'Sandbox' : 'Production'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-md p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Payment Form</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                  required
                  disabled={paymentStatus === 'loading'}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                  required
                  disabled={paymentStatus === 'loading'}
                />
              </div>
            </div>
            
            <div
              ref={paypalButtonRef}
              className={`${!sdkReady || !name || !email ? 'opacity-50 pointer-events-none' : ''}`}
            ></div>
            
            {(!name || !email) && (
              <p className="text-sm text-red-600 mt-2">Please fill in both name and email to enable payment.</p>
            )}
            
            {!sdkReady && (
              <div className="text-center py-4">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <p className="mt-2 text-sm text-gray-600">Loading payment system...</p>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            <p>This is a test payment page for administrators only. It processes a real $0.01 payment to verify the payment flow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

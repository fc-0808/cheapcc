'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { PRODUCT, PRICING_OPTIONS } from '@/utils/products';

export default function Home() {
  const [selectedPrice, setSelectedPrice] = useState<string>('1m');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [orderID, setOrderID] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);

  // Validate email format
  const isValidEmail = (email: string) => /.+@.+\..+/.test(email);

  // Function to handle when the PayPal SDK is loaded
  const handlePayPalLoad = () => {
    setSdkReady(true);
    setSdkError(false);
  };

  const handlePayPalError = () => {
    setSdkError(true);
  };

  // Initialize PayPal buttons when the SDK is loaded
  useEffect(() => {
    if (!sdkReady || !name || !isValidEmail(email)) return;
    if (paypalButtonContainerRef.current) {
      paypalButtonContainerRef.current.innerHTML = '';
    }
    if (typeof window !== 'undefined' && window.paypal) {
      window.paypal.Buttons({
        createOrder: async () => {
          try {
            setPaymentStatus('loading');
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ priceId: selectedPrice, name, email }),
            });
            const orderData = await response.json();
            if (orderData.error) {
              throw new Error(orderData.error);
            }
            setOrderID(orderData.id);
            return orderData.id;
          } catch (error) {
            setPaymentStatus('error');
            throw error;
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            setPaymentStatus('loading');
            const response = await fetch('/api/orders/capture', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            const captureData = await response.json();
            if (captureData.error) {
              throw new Error(captureData.error);
            }
            setPaymentStatus('success');
          } catch (error) {
            setPaymentStatus('error');
          }
        },
        onCancel: () => {
          setPaymentStatus('cancel');
        },
        onError: (err: Error) => {
          setPaymentStatus('error');
        },
      }).render('#paypal-button-container');
    }
  }, [sdkReady, selectedPrice, name, email]);

  const selectedPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice)!;
  const canPay = name.trim() && isValidEmail(email);

  // Color palette
  // dark purple: #2d014d, near-black: #181028

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-2 bg-gradient-to-br from-[#181028] via-[#2d014d] to-[#181028]">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`}
        strategy="afterInteractive"
        onLoad={handlePayPalLoad}
        onError={handlePayPalError}
      />
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-[#181028]/95 rounded-3xl shadow-2xl border border-[#2d014d] p-8 md:p-12">
          {/* Product Header */}
          <div className="flex flex-col items-center mb-8">
            {/* Removed logo image */}
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight text-center drop-shadow-sm">
              {PRODUCT.name}
            </h1>
            <p className="text-lg text-[#b9a7d1] text-center max-w-xl">
              {PRODUCT.description}
            </p>
          </div>

          {/* User Info Form */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#b9a7d1] mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-[#2d014d] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b9a7d1] bg-[#22163a] text-white placeholder-[#b9a7d1] shadow-sm"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#b9a7d1] mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-[#2d014d] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b9a7d1] bg-[#22163a] text-white placeholder-[#b9a7d1] shadow-sm"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
          </div>

          {/* Pricing Options */}
          <div className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {PRICING_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`relative rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg group ${
                    selectedPrice === option.id
                      ? 'border-[#b9a7d1] bg-[#2d014d] scale-105'
                      : 'border-[#22163a] bg-[#181028]'
                  }`}
                  onClick={() => setSelectedPrice(option.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrice === option.id}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedPrice(option.id)}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#b9a7d1]">
                      {option.name}
                    </h3>
                    <p className="text-xs text-[#b9a7d1] mb-2">{option.duration}</p>
                    <p className="text-2xl font-extrabold text-[#b9a7d1] mb-1">
                      ${option.price}
                    </p>
                    <p className="text-xs text-[#b9a7d1]">{option.description}</p>
                  </div>
                  {selectedPrice === option.id && (
                    <div className="absolute top-2 right-2 bg-[#b9a7d1] text-[#2d014d] text-xs px-2 py-1 rounded-full shadow font-semibold">Selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-[#22163a] rounded-2xl p-8 shadow-inner border border-[#2d014d]">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Selected Plan: <span className="font-extrabold text-[#b9a7d1]">{selectedPriceOption.name}</span>
                </h2>
                <p className="text-[#b9a7d1] text-sm">
                  Duration: {selectedPriceOption.duration}
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className="text-2xl font-extrabold text-white">${selectedPriceOption.price}</span>
              </div>
            </div>
            {/* PayPal Button Container */}
            {(paymentStatus === 'idle' || paymentStatus === 'loading') && !sdkError && (
              <div>
                <div
                  id="paypal-button-container"
                  ref={paypalButtonContainerRef}
                  className={`mt-4 ${!canPay ? 'opacity-50 pointer-events-none' : ''}`}
                />
                {!canPay && (
                  <p className="text-red-400 text-sm mt-2">Please enter your name and a valid email to continue.</p>
                )}
              </div>
            )}
            {/* Loading State */}
            {paymentStatus === 'loading' && (
              <div className="flex justify-center items-center my-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b9a7d1]"></div>
              </div>
            )}
            {/* Success State */}
            {paymentStatus === 'success' && (
              <div className="bg-green-900/20 p-4 rounded-md flex items-center">
                <svg
                  className="h-6 w-6 text-green-400 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="text-green-200 font-medium">
                  Payment successful! Check your email for access details.
                </p>
              </div>
            )}
            {/* Error State */}
            {paymentStatus === 'error' && (
              <div className="bg-red-900/20 p-4 rounded-md flex items-center">
                <svg
                  className="h-6 w-6 text-red-400 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p className="text-red-200 font-medium">
                  There was an error processing your payment. Please try again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

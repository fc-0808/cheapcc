// components/home/CheckoutSection.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { PRICING_OPTIONS } from '@/utils/products';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface TimeInfo {
  currentTime: Date;
  expiryTime: Date | null;
  timezone: string | null;
  // locationName is no longer needed or available with this method
  isLoading: boolean;
}

interface CheckoutSectionProps {
  selectedPrice: string;
  isUserSignedIn: boolean;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  canPay?: boolean;
  paymentStatus: 'idle' | 'loading' | 'success' | 'error' | 'cancel';
  setPaymentStatus: (status: 'idle' | 'loading' | 'success' | 'error' | 'cancel') => void;
  checkoutFormError: string | null;
  setCheckoutFormError: (error: string | null) => void;
  paypalButtonContainerRef: React.RefObject<HTMLDivElement | null>;
  sdkReady?: boolean;
  onPayPalLoad?: () => void;
  onPayPalError?: () => void;
  renderPayPalButton: () => void;
  clientSecret: string | null;
}

const isValidEmail = (email: string) => /.+@.+\..+/.test(email);

export default function CheckoutSection({
  selectedPrice,
  isUserSignedIn,
  name,
  setName,
  email,
  setEmail,
  canPay,
  paymentStatus,
  setPaymentStatus,
  checkoutFormError,
  setCheckoutFormError,
  paypalButtonContainerRef,
  sdkReady,
  onPayPalLoad,
  onPayPalError,
  renderPayPalButton,
  clientSecret,
}: CheckoutSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal'>('stripe');
  const [timeInfo, setTimeInfo] = useState<TimeInfo>({
    currentTime: new Date(),
    expiryTime: null,
    timezone: 'UTC', // Default value
    isLoading: true
  });
  
  const stripe = useStripe();
  const elements = useElements();

  const isFormValid = name.trim() !== '' && isValidEmail(email);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  useEffect(() => {
    const container = paypalButtonContainerRef.current;
    if (container && activeTab === 'paypal') {
      if (sdkReady && canPay && isVisible) {
        renderPayPalButton();
        container.style.display = 'block';
      } else {
        container.innerHTML = '';
        container.style.display = 'none';
      }
    } else if (container) {
        container.style.display = 'none';
    }
  }, [sdkReady, canPay, isVisible, renderPayPalButton, paypalButtonContainerRef, activeTab]);
  
  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setCheckoutFormError("Stripe is not ready yet. Please try again in a moment.");
      setPaymentStatus('error');
      return;
    }

    if (!name || !email) {
      setCheckoutFormError('Please fill out all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setCheckoutFormError('Please enter a valid email address.');
      return;
    }
    
    if (!clientSecret) {
      setCheckoutFormError("Payment session not initialized. Please refresh the page and try again.");
      setPaymentStatus('error');
      return;
    }
    
    setCheckoutFormError(null);
    setPaymentStatus('loading');

    // Submit the form data to Stripe.js
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setCheckoutFormError(submitError.message || "An error occurred while validating your information.");
      setPaymentStatus('error');
      return;
    }
    
    // Now, confirm the payment and let Stripe handle the redirect.
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/success`, // Stripe redirects here on success/failure
        receipt_email: email,
        payment_method_data: {
          billing_details: {
            name: name,
            email: email,
          }
        }
      },
      redirect: 'always', // Use 'always' to simplify the flow
    });

    // This point will only be reached if there is an immediate error during confirmation,
    // or if the user closes the payment modal before completion.
    if (error) {
      const errorMessage = error.message || "Your payment could not be processed.";
      console.error("Stripe Payment Confirmation Error:", error.type, error.message);
      
      if (error.type === "card_error" || error.type === "validation_error") {
        setCheckoutFormError(errorMessage);
      } else {
        setCheckoutFormError("An unexpected error occurred. Please try again.");
      }
      
      setPaymentStatus('error');
    } 
    // No need for a success block here. Stripe handles the successful redirection.
    // The loading state will remain until the user is navigated away from the page.
  };

  useEffect(() => {
    // This effect now runs synchronously and doesn't need to be async.
    // It gets the timezone from the browser without asking for permission.
    const setTimeData = () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const now = new Date();
      
      const currentPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice) || PRICING_OPTIONS[0];
      let expiryDate = new Date();
      
      if (currentPriceOption.duration.includes('month')) {
        const months = parseInt(currentPriceOption.duration.split(' ')[0]);
        expiryDate.setMonth(expiryDate.getMonth() + months);
      } else if (currentPriceOption.duration.includes('year')) {
        const years = parseInt(currentPriceOption.duration.split(' ')[0]);
        expiryDate.setFullYear(expiryDate.getFullYear() + years);
      } else if (currentPriceOption.duration.includes('day')) {
        const days = parseInt(currentPriceOption.duration.split(' ')[0]);
        expiryDate.setDate(expiryDate.getDate() + days);
      }
      
      setTimeInfo({
        currentTime: now,
        expiryTime: expiryDate,
        timezone,
        isLoading: false, // Data is loaded instantly.
      });

      console.info(`Using browser timezone for display: ${timezone}`);
    };
    
    setTimeData();
    
    // This timer just updates the current time display every minute, which is fine to keep.
    const timer = setInterval(() => {
      setTimeInfo(prev => ({
        ...prev,
        currentTime: new Date()
      }));
    }, 60000);
    
    return () => clearInterval(timer);
  }, [selectedPrice]);

  // FIX: Corrected "Ubisoft" typo to "yyyy" for the year.
  const formatDateTime = (date: Date | null) => {
    if (!date) return 'N/A';
    return timeInfo.timezone ? 
      formatInTimeZone(date, timeInfo.timezone, 'MMM d, yyyy \'at\' h:mm a') :
      format(date, 'MMM d, yyyy \'at\' h:mm a');
  };

  const selectedPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice) || PRICING_OPTIONS[1];

  return (
    <section className="checkout py-16 md:py-24 bg-[#f8f9fa]" id="checkout">
      <div className="container px-4 sm:px-6 lg:px-8" ref={sectionRef}>
        <div className={`section-heading text-center mb-10 sm:mb-14 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c2d5a] mb-3 relative inline-block hero-3d-text">
            Complete Your Order
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">You're just moments away from accessing Adobe Creative Cloud</p>
        </div>
        <div className={`checkout-container flex flex-col md:flex-row flex-wrap gap-8 justify-center items-start stagger-item ${isVisible ? 'visible' : ''}`}>
          <div className="checkout-form w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200/80">
            <div className="space-y-5">
                <div>
                  <label htmlFor="email-checkout" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address {isUserSignedIn && <span className="text-emerald-500 text-xs ml-1">(Autofilled)</span>}
                  </label>
                  <div className="relative">
                    <i className="far fa-envelope text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"></i>
                    <input 
                      type="email" 
                      id="email-checkout" 
                      name="email" 
                      required 
                      placeholder="Where we'll send your account details" 
                      value={email} 
                      onChange={e => { if (!isUserSignedIn) setEmail(e.target.value); }} 
                      autoComplete="email" 
                      disabled={isUserSignedIn} 
                      className={`${isUserSignedIn ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"} w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-gray-800 shadow-sm placeholder:text-gray-400`}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="name-checkout" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name {isUserSignedIn && <span className="text-emerald-500 text-xs ml-1">(Autofilled)</span>}
                  </label>
                  <div className="relative">
                    <i className="far fa-user text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"></i>
                    <input 
                      type="text" 
                      id="name-checkout" 
                      name="name" 
                      required 
                      placeholder="Your name" 
                      value={name} 
                      onChange={e => { if (!isUserSignedIn) setName(e.target.value); }} 
                      autoComplete="name" 
                      disabled={isUserSignedIn} 
                      className={`${isUserSignedIn ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"} w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-gray-800 shadow-sm placeholder:text-gray-400`}
                    />
                  </div>
                </div>
            </div>
            
            {!isFormValid && (
              <div className="mt-5 p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                Please enter a name and valid email to continue.
              </div>
            )}

            <div className="flex border-b border-gray-200 my-6">
              <button 
                onClick={() => setActiveTab('stripe')} 
                className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'stripe' 
                    ? 'border-b-2 border-[#ff3366] text-[#ff3366]' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <i className="fas fa-credit-card"></i>Card
              </button>
              <button 
                onClick={() => setActiveTab('paypal')} 
                className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'paypal' 
                    ? 'border-b-2 border-[#ff3366] text-[#ff3366]' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <i className="fab fa-paypal"></i>PayPal
              </button>
            </div>
            
            <div style={{ display: activeTab === 'stripe' ? 'block' : 'none' }}>
              <form id="stripe-payment-form" onSubmit={handleStripeSubmit} className="space-y-5">
                {!clientSecret && isFormValid ? (
                  <div className="p-5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm flex flex-col items-center justify-center">
                    <div className="h-6 w-6 border-2 border-pink-200 border-t-[#ff3366] rounded-full animate-spin mb-3"></div>
                    <p>Preparing secure payment...</p>
                  </div>
                ) : (
                  <div style={{ opacity: isFormValid ? 1 : 0.5 }} className="transition-opacity duration-300">
                    <PaymentElement 
                      id="payment-element" 
                      options={{ 
                        layout: { type: 'tabs', defaultCollapsed: false },
                        readOnly: !isFormValid
                      }} 
                    />
                  </div>
                )}
                
                <button 
                  disabled={paymentStatus === 'loading' || !stripe || !elements || !isFormValid || !clientSecret} 
                  id="stripe-submit" 
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#ff3366] to-[#ff6b8b] text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-[#ff2050] hover:to-[#ff4575] hover:translate-y-[-1px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md cursor-pointer"
                >
                  <span className="flex items-center justify-center">
                    {paymentStatus === 'loading' ? 
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : 
                      <i className="fas fa-lock text-xs mr-2"></i>
                    }
                    {paymentStatus === 'loading' ? 'Processing...' : `Pay $${selectedPriceOption.price.toFixed(2)}`}
                  </span>
                </button>
                <div className="text-center">
                  <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" title="Secure payments by Stripe" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition">
                      <i className="fas fa-lock"></i>
                      <span>Powered by</span>
                      <span className="font-semibold text-gray-600">Stripe</span>
                  </a>
                </div>
              </form>
            </div>
            
            <div style={{ display: activeTab === 'paypal' ? 'block' : 'none' }}>
              {isFormValid && (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <i className="fab fa-paypal text-blue-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pay with PayPal</p>
                    <p className="text-xs text-gray-500">You will be redirected to PayPal to complete your payment securely.</p>
                  </div>
                </div>
              )}
              <div style={{ opacity: isFormValid ? 1 : 0.5, pointerEvents: isFormValid ? 'auto' : 'none' }} className="transition-opacity duration-300">
                <Script src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture&components=buttons&disable-funding=card`} strategy="afterInteractive" onLoad={onPayPalLoad} onError={onPayPalError} />
                {!sdkReady && isFormValid && (
                  <div className="text-center py-8">
                    <div className="inline-block h-6 w-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-gray-600">Loading PayPal...</p>
                  </div>
                )}
                <div ref={paypalButtonContainerRef} id="paypal-button-container" className="w-full mt-2" />
              </div>
            </div>

            {checkoutFormError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-600 gap-2">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                {checkoutFormError}
              </div>
            )}
          </div>
          
          {/* =========== UPDATED PLAN SUMMARY SECTION =========== */}
          <div className="selected-plan-summary w-full max-w-sm bg-white rounded-xl p-6 shadow-lg border border-gray-200/80">
            <h3 className="text-lg font-semibold text-[#2c2d5a] mb-5">Your Plan</h3>
            
            {/* --- Plan Details Group --- */}
            <div className="space-y-3.5 pb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-800">{selectedPriceOption.duration}</span>
              </div>

              {timeInfo.isLoading ? (
                <div className="flex items-center py-2 justify-center">
                  <div className="h-4 w-4 border-2 border-gray-200 border-t-[#ff3366] rounded-full animate-spin mr-2"></div>
                  <span className="text-xs text-gray-500">Getting plan details...</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <i className="far fa-calendar text-[#ff3366] text-xs mr-2 w-4 text-center"></i>
                        <span className="text-xs text-gray-500">Starts</span>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{format(timeInfo.currentTime, 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <i className="far fa-calendar-check text-[#ff3366] text-xs mr-2 w-4 text-center"></i>
                        <span className="text-xs text-gray-500">Expires</span>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{timeInfo.expiryTime ? format(timeInfo.expiryTime, 'MMM d, yyyy') : 'N/A'}</span>
                  </div>
                </>
              )}
            </div>

            {/* --- Cost Breakdown Group --- */}
            <div className="space-y-3 text-sm py-4 border-t border-dashed border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Regular Price</span>
                <span className="line-through text-gray-400">${(selectedPriceOption.price * 4).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Savings</span>
                <span className="font-medium text-green-500">{Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}%</span>
              </div>
            </div>
            
            {/* --- Final Total --- */}
            <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-base font-semibold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-[#ff3366]">${selectedPriceOption.price.toFixed(2)}
                <span className="text-sm font-medium text-gray-500 ml-1">USD</span>
              </span>
            </div>
          </div>
          {/* =========== END OF UPDATED SECTION =========== */}

        </div>
      </div>
    </section>
  );  
}
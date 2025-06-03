"use client";
import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { PRICING_OPTIONS } from '@/utils/products';

interface CheckoutSectionProps {
  selectedPrice: string;
  isUserSignedIn: boolean;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  canPay: boolean;
  paymentStatus: 'idle' | 'loading' | 'success' | 'error' | 'cancel';
  setPaymentStatus: (status: 'idle' | 'loading' | 'success' | 'error' | 'cancel') => void;
  checkoutFormError: string | null;
  setCheckoutFormError: (error: string | null) => void;
  paypalButtonContainerRef: React.RefObject<HTMLDivElement | null>;
  sdkReady: boolean;
  onPayPalLoad: () => void;
  onPayPalError: () => void;
  renderPayPalButton: () => void;
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
  renderPayPalButton
}: CheckoutSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null); // Ref for Intersection Observer for this section
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Unobserve after becoming visible
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  // Control PayPal button visibility and rendering
  useEffect(() => {
    const container = paypalButtonContainerRef.current;
    if (container) {
      if (sdkReady && canPay && isVisible) {
        renderPayPalButton();
        container.style.display = 'block'; // Ensure container is visible
      } else {
        container.innerHTML = ''; // Clear buttons if conditions not met
        container.style.display = 'none'; // Hide container
      }
    }
  }, [sdkReady, canPay, isVisible, renderPayPalButton, paypalButtonContainerRef]);

  const selectedPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice) || PRICING_OPTIONS[0];

  return (
    <section className="checkout py-10 sm:py-16 md:py-20 bg-[#f3f4f6]" id="checkout">
      <div className="container px-4 sm:px-6 lg:px-8" ref={sectionRef}>
        <div className={`section-heading text-center mb-8 sm:mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2c2d5a] mb-2">Complete Your Order</h2>
          <p className="text-base sm:text-lg text-gray-500">You're just moments away from accessing Adobe Creative Cloud</p>
        </div>
        <div className={`checkout-container flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 justify-center items-center md:items-start stagger-item ${isVisible ? 'visible' : ''}`}>
          <div className="checkout-form w-full max-w-md">
            <form id="checkout-form" onSubmit={e => e.preventDefault()} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email-checkout" className="block text-sm font-medium text-gray-700 mb-1">Email Address {isUserSignedIn && <span className="text-[#10b981] text-xs">(Autofilled)</span>}</label>
                <input
                  type="email"
                  id="email-checkout"
                  name="email"
                  required
                  placeholder="Where we'll send your account details"
                  value={email}
                  onChange={e => {
                    if (!isUserSignedIn) setEmail(e.target.value);
                  }}
                  autoComplete="email"
                  disabled={isUserSignedIn}
                  className={`${isUserSignedIn ? "bg-gray-100 cursor-not-allowed" : ""} w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]`}
                />
              </div>
              <div className="form-group">
                <label htmlFor="name-checkout" className="block text-sm font-medium text-gray-700 mb-1">Name {isUserSignedIn && <span className="text-[#10b981] text-xs">(Autofilled)</span>}</label>
                <input
                  type="text"
                  id="name-checkout"
                  name="name"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={e => {
                    if (!isUserSignedIn) setName(e.target.value);
                  }}
                  autoComplete="name"
                  disabled={isUserSignedIn}
                  className={`${isUserSignedIn ? "bg-gray-100 cursor-not-allowed" : ""} w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]`}
                />
              </div>
              <div className="form-group">
                <Script
                  src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`}
                  strategy="afterInteractive"
                  onLoad={onPayPalLoad}
                  onError={onPayPalError}
                />
                
                {/* PayPal Button Container - Always in DOM */}
                <div
                  id="paypal-button-container"
                  ref={paypalButtonContainerRef}
                  className="mt-4 w-full"
                  // style.display is controlled by the useEffect hook
                />

                {/* Separate error message for when name/email are not filled */}
                {!canPay && isVisible && (
                  <div className="form-note flex items-center gap-2 bg-[#fff0f3] text-[#b91c1c] py-3 px-2 rounded-lg shadow border border-[#ffd6db] animate-fade-in my-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#ffe4ea] mr-1 flex-shrink-0">
                      <i className="fas fa-exclamation-circle text-[#ff3366] text-sm"></i>
                    </span>
                    <span className="font-semibold text-xs sm:text-sm">
                      Please enter a name and a valid email to continue.
                    </span>
                  </div>
                )}
              </div>
              
              {/* Payment Status & General Error Messages */}
              {paymentStatus === 'loading' && (
                <div className="form-note flex items-center gap-2 text-gray-600">
                  <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#b9a7d1] border-b-transparent rounded-full animate-spin"></span>
                  <span className="text-sm sm:text-base">Processing payment...</span>
                </div>
              )}
              
              {paymentStatus === 'success' && (
                <div className="form-note bg-[#d1fae5] text-[#065f46] p-3 sm:p-4 rounded-md text-sm sm:text-base">
                  Payment successful! Redirecting...
                </div>
              )}
              
              {/* Specific error from PayPal onClick/onApprove etc. */}
              {checkoutFormError && (
                <div className="form-note bg-red-100 text-red-700 p-3 rounded-md text-xs sm:text-sm my-2">
                  {checkoutFormError}
                </div>
              )}
              
              <p className="form-disclaimer text-xs text-gray-500">
                By completing your purchase, you agree to our
                <a href="/terms" className="text-[#2c2d5a] hover:text-[#ff3366] underline mx-1">Terms of Service</a> and
                <a href="/privacy" className="text-[#2c2d5a] hover:text-[#ff3366] underline mx-1">Privacy Policy</a>.
              </p>
            </form>
            <div className="flex flex-col items-center gap-3 mt-6 mb-6">
              <div className="flex items-center pt-4 sm:pt-5 gap-2 text-[#10b981] text-sm sm:text-base font-semibold">
                <i className="fas fa-lock" /> Secure Payment with PayPal
              </div>
              <div className="flex gap-3 mt-1 text-xl sm:text-2xl text-gray-400">
                <i className="fab fa-cc-paypal" title="PayPal" style={{color:'#003087'}}></i>
                <i className="fab fa-cc-visa" title="Visa" style={{color:'#1a1f71'}}></i>
                <i className="fab fa-cc-mastercard" title="Mastercard" style={{color:'#eb001b'}}></i>
                <i className="fab fa-cc-amex" title="Amex" style={{color:'#2e77bb'}}></i>
              </div>
            </div>
          </div>
          <div className="selected-plan-summary w-full max-w-sm bg-white rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-[#2c2d5a] mb-4 flex justify-between items-center">
              Your Selected Plan 
              <span className="text-xs bg-[#2c2d5a] text-white px-2 py-1 rounded-full font-bold">{selectedPriceOption.name}</span>
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <p className="flex justify-between text-gray-600">Subscription Duration <span className="font-medium text-gray-700">{selectedPriceOption.duration}</span></p>
              <p className="flex justify-between text-gray-600">Regular Price <span className="line-through text-gray-400">${(selectedPriceOption.price * 4).toFixed(2)}</span></p>
              <p className="flex justify-between text-gray-600">Your Savings <span className="font-medium text-[#10b981]">{Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}%</span></p>
            </div>
            <hr className="my-3 sm:my-4 border-gray-200"/>
            <p className="flex justify-between text-base sm:text-lg font-bold text-[#2c2d5a]">Total <span className="text-[#ff3366]">${selectedPriceOption.price.toFixed(2)}</span></p>
            <div className="trust-guarantee mt-3 sm:mt-4 text-xs text-gray-600 space-y-1">
              <div className="guarantee-badge"><i className="fas fa-check-circle text-[#10b981] mr-1" /> 100% Satisfaction Guarantee</div>
              <div className="guarantee-badge"><i className="fas fa-check-circle text-[#10b981] mr-1" /> 24/7 Customer Support</div>
              <div className="guarantee-badge"><i className="fas fa-check-circle text-[#10b981] mr-1" /> Email Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
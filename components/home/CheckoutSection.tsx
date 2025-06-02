"use client";
import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { PRICING_OPTIONS, PricingOption } from '@/utils/products'; // Make sure PricingOption is exported or defined

interface CheckoutSectionProps {
  selectedPrice: string;
  isUserSignedIn: boolean;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  nameRef: React.MutableRefObject<string>;
  emailRef: React.MutableRefObject<string>;
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
  nameRef,
  emailRef,
  canPay,
  paymentStatus,
  setPaymentStatus, // Received as prop
  checkoutFormError,
  setCheckoutFormError, // Received as prop
  paypalButtonContainerRef,
  sdkReady,
  onPayPalLoad,
  onPayPalError,
  renderPayPalButton
}: CheckoutSectionProps) {
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

    if (checkoutRef.current) {
      observer.observe(checkoutRef.current);
    }
    return () => {
      if (checkoutRef.current) {
        observer.unobserve(checkoutRef.current);
      }
    };
  }, []);
  
  // Effect to re-render PayPal button when sdkReady or canPay changes
  // This assumes renderPayPalButton clears the container correctly
  useEffect(() => {
    if (sdkReady && canPay && isVisible) {
      renderPayPalButton();
    } else if (paypalButtonContainerRef.current) {
        // Clear button if conditions not met
        paypalButtonContainerRef.current.innerHTML = '';
    }
  }, [sdkReady, canPay, isVisible, renderPayPalButton, selectedPrice]); // Added selectedPrice

  const selectedPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice) || PRICING_OPTIONS[0];


  return (
    <section className="checkout py-20 bg-[#f3f4f6]" id="checkout">
      <div className="container" ref={checkoutRef}>
        <div className={`section-heading text-center mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">Complete Your Order</h2>
          <p className="text-lg text-gray-500">You're just moments away from accessing Adobe Creative Cloud</p>
        </div>
        <div className={`checkout-container flex flex-wrap gap-8 justify-center items-start stagger-item ${isVisible ? 'visible' : ''}`}>
          <div className="checkout-form w-full max-w-md">
            <form id="checkout-form" onSubmit={e => e.preventDefault()} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email-checkout">Email Address {isUserSignedIn && <span className="text-[#10b981] text-xs">(Autofilled)</span>}</label>
                <input
                  type="email"
                  id="email-checkout" // Unique ID
                  name="email"
                  required
                  placeholder="Where we'll send your account details"
                  value={email}
                  onChange={e => {
                    if (!isUserSignedIn) {
                      const val = e.target.value;
                      setEmail(val);
                      emailRef.current = val;
                    }
                  }}
                  autoComplete="email"
                  disabled={isUserSignedIn}
                  className={isUserSignedIn ? "bg-gray-100 cursor-not-allowed" : ""}
                />
              </div>
              <div className="form-group">
                <label htmlFor="name-checkout">Name {isUserSignedIn && <span className="text-[#10b981] text-xs">(Autofilled)</span>}</label>
                <input
                  type="text"
                  id="name-checkout" // Unique ID
                  name="name"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={e => {
                    if (!isUserSignedIn) {
                      const val = e.target.value;
                      setName(val);
                      nameRef.current = val;
                    }
                  }}
                  autoComplete="name"
                  disabled={isUserSignedIn}
                  className={isUserSignedIn ? "bg-gray-100 cursor-not-allowed" : ""}
                />
              </div>
              <div className="form-group">
                <Script
                  src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`}
                  strategy="afterInteractive"
                  onLoad={onPayPalLoad}
                  onError={onPayPalError}
                />
                {canPay ? (
                  <div
                    id="paypal-button-container"
                    ref={paypalButtonContainerRef}
                    className="mt-4"
                  />
                ) : (
                  <div className="form-note flex items-center gap-2 bg-[#fff0f3] text-[#b91c1c] py-3 px-2 rounded-lg shadow border border-[#ffd6db] animate-fade-in my-4">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ffe4ea] mr-2">
                      <i className="fas fa-exclamation-circle text-[#ff3366] text-base"></i>
                    </span>
                    <span className="font-semibold whitespace-nowrap tracking-tight text-sm">
                      Please enter your name and a valid email to continue.
                    </span>
                  </div>
                )}
              </div>
              {paymentStatus === 'loading' && (
                <div className="form-note flex items-center gap-2">
                  <span className="inline-block w-6 h-6 border-2 border-[#b9a7d1] border-b-transparent rounded-full animate-spin"></span>
                  Processing payment...
                </div>
              )}
              {paymentStatus === 'success' && ( // This message might be shown briefly before redirect
                <div className="form-note bg-[#d1fae5] text-[#065f46] p-4 rounded-md">
                  Payment successful! Redirecting...
                </div>
              )}
              {paymentStatus === 'error' && (
                <div className="form-note bg-[#fee2e2] text-[#991b1b] p-4 rounded-md">
                  There was an error processing your payment. Please try again.
                </div>
              )}
              {checkoutFormError && (
                <div className="form-note bg-red-100 text-red-700 p-3 rounded-md text-sm my-2">
                  {checkoutFormError}
                </div>
              )}
              <p className="form-disclaimer">
                By completing your purchase, you agree to our<br />
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </form>
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="flex items-center pt-5 gap-2 text-[#10b981] text-base font-semibold">
                <i className="fas fa-lock" /> Secure Payment with PayPal
              </div>
              <div className="flex gap-3 mt-1 text-2xl text-gray-400">
                <i className="fab fa-cc-paypal" title="PayPal" style={{color:'#003087'}}></i>
                <i className="fab fa-cc-visa" title="Visa"></i>
                <i className="fab fa-cc-mastercard" title="Mastercard" style={{color:'#eb001b'}}></i>
                <i className="fab fa-cc-amex" title="Amex" style={{color:'#2e77bb'}}></i>
              </div>
            </div>
          </div>
          <div className="selected-plan-summary w-full max-w-sm">
            <h3>Your Selected Plan <span>{selectedPriceOption.name}</span></h3>
            <p>Subscription Duration <span>{selectedPriceOption.duration}</span></p>
            <p>Regular Price <span className="line-through text-gray-400">${(selectedPriceOption.price * 4).toFixed(2)}</span></p>
            <p>Your Savings <span className="text-[#10b981]">{Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}%</span></p>
            <p>Total <span className="text-[#2c2d5a] font-bold">${selectedPriceOption.price.toFixed(2)}</span></p>
            <div className="trust-guarantee">
              <div className="guarantee-badge"><i className="fas fa-check" /> 100% Satisfaction Guarantee</div>
              <div className="guarantee-badge"><i className="fas fa-check" /> 24/7 Customer Support</div>
              <div className="guarantee-badge"><i className="fas fa-check" /> Email Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
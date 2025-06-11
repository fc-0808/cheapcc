"use client";

import React, { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import type { Session } from '@supabase/supabase-js';
import UrlMessageDisplay from "@/components/UrlMessageDisplay";
import Script from 'next/script';
import { PRICING_OPTIONS } from '@/utils/products';

// Import new section components
import HeroSection from "@/components/home/HeroSection";
import SocialProofSection from "@/components/home/SocialProofSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import PricingSection from "@/components/home/PricingSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CheckoutSection from "@/components/home/CheckoutSection";
import HomeFAQSection from "@/components/home/HomeFAQSection";
import LoginPopup from "@/components/home/LoginPopup";

// PRICING_OPTIONS will be imported by PricingSection and CheckoutSection directly

export default function Home() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('14d');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isUserSignedIn, setIsUserSignedIn] = useState<boolean>(false);
  const [canPay, setCanPay] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [hasPopupBeenShown, setHasPopupBeenShown] = useState(false);
  
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  
  // Refs to hold the latest values for PayPal callbacks
  const nameRef = useRef(name);
  const emailRef = useRef(email);
  const selectedPriceRef = useRef(selectedPrice);

  const [checkoutFormError, setCheckoutFormError] = useState<string | null>(null);

  // Still need this for login popup logic
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  // Check if Apple Pay is available
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);

  // Detect if Apple Pay is available in the browser
  const detectApplePayAvailability = useCallback(() => {
    // Check if we're on a supported browser (Safari)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('Safari browser detected:', isSafari);
    
    // Check if Apple Pay is available in the browser
    const hasApplePaySession = typeof window !== 'undefined' && window.ApplePaySession !== undefined;
    console.log('ApplePaySession available:', hasApplePaySession);
    
    const canMakePayments = hasApplePaySession && window.ApplePaySession?.canMakePayments?.() || false;
    console.log('ApplePaySession.canMakePayments():', canMakePayments);

    const canMakePaymentsWithApplePay = isSafari && hasApplePaySession && canMakePayments;
    console.log('Final Apple Pay availability:', canMakePaymentsWithApplePay);
    
    return canMakePaymentsWithApplePay;
  }, []);

  // Update refs when values change
  useEffect(() => { nameRef.current = name; }, [name]);
  useEffect(() => { emailRef.current = email; }, [email]);
  useEffect(() => { selectedPriceRef.current = selectedPrice; }, [selectedPrice]);

  const isValidEmail = (email: string) => /.+@.+\..+/.test(email);
  
  // Memoize renderPayPalButton with useCallback
  const renderPayPalButton = useCallback(() => {
    if (!paypalButtonContainerRef.current) {
      console.log('PayPal button container not found, cannot render.');
      return;
    }
    paypalButtonContainerRef.current.innerHTML = ''; // Clear existing buttons first

    console.log('Attempting to render PayPal button...');
    if (typeof window !== 'undefined' && window.paypal) {
      try {
        // Try to detect Apple Pay availability
        if (typeof window !== 'undefined') {
          const applePayAvailable = detectApplePayAvailability();
          setIsApplePayAvailable(applePayAvailable || false);
          console.log('Apple Pay available:', applePayAvailable);
        }

        // Render PayPal Buttons
        window.paypal.Buttons({
          onClick: (data: any, actions: any) => {
            const currentName = nameRef.current;
            const currentEmail = emailRef.current;
            const currentSelectedPrice = selectedPriceRef.current;
            
            // Just validate without setting error message (handled by CheckoutSection's useEffect)
            if (!currentName.trim() || !isValidEmail(currentEmail) || !currentSelectedPrice) {
              return actions.reject();
            }
            
            // Clear any previous errors and reset payment status
            setCheckoutFormError(null);
            if (paymentStatus === 'error') setPaymentStatus('idle');
            return actions.resolve();
          },
          createOrder: async () => {
            const currentName = nameRef.current;
            const currentEmail = emailRef.current;
            const currentSelectedPrice = selectedPriceRef.current;
            try {
              setPaymentStatus('loading');
              setCheckoutFormError(null);
              const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId: currentSelectedPrice, name: currentName, email: currentEmail }),
              });
              const orderData = await response.json();
              if (!response.ok || orderData.error) {
                throw new Error(orderData.error || `Failed to create order (status: ${response.status})`);
              }
              return orderData.id;
            } catch (error: any) {
              console.error('Error in createOrder:', error);
              setCheckoutFormError(error.message || 'An unexpected error occurred during order creation.');
              setPaymentStatus('error');
              throw error;
            }
          },
          onApprove: async (data: any, actions: any) => {
            try {
              setPaymentStatus('loading');
              const response = await fetch('/api/orders/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
              });
              const captureData = await response.json();
              if (!response.ok || captureData.error) {
                throw new Error(captureData.error || `Failed to capture order (status: ${response.status})`);
              }
              setPaymentStatus('success');
              router.push(`/success/${data.orderID}`);
            } catch (error: any) {
              console.error('Payment capture error:', error);
              setCheckoutFormError(error.message || 'An error occurred while capturing the payment.');
              setPaymentStatus('error');
            }
          },
          onCancel: () => {
            setPaymentStatus('cancel');
            setCheckoutFormError('Payment was cancelled.');
          },
          onError: (err: Error) => {
            console.error('PayPal button error:', err);
            setCheckoutFormError(`PayPal Error: ${err.message}. Please check your details or try again.`);
            setPaymentStatus('error');
          },
        }).render('#paypal-button-container');
        console.log('PayPal button.render() called.');
        
        // If Apple Pay is available via PayPal SDK, render Apple Pay button
        if (window.paypal.ApplePay && isApplePayAvailable) {
          console.log('PayPal ApplePay SDK component available and device supports Apple Pay, attempting to render...');
          
          // Configure Apple Pay settings
          try {
            window.paypal.ApplePay.config({
              defaultShippingMethod: 'online_delivery',
              shippingLabel: 'Digital Delivery',
            });
            console.log('Apple Pay config set successfully');
            
            // Create the Apple Pay button configuration
            const applePayButtonConfig = {
              onClick: (data: any, actions: any) => {
                const currentName = nameRef.current;
                const currentEmail = emailRef.current;
                const currentSelectedPrice = selectedPriceRef.current;
                
                // Validate without setting error message (handled by CheckoutSection's useEffect)
                if (!currentName.trim() || !isValidEmail(currentEmail) || !currentSelectedPrice) {
                  return actions.reject();
                }
                
                setCheckoutFormError(null);
                if (paymentStatus === 'error') setPaymentStatus('idle');
                return actions.resolve();
              },
              createOrder: async () => {
                const currentName = nameRef.current;
                const currentEmail = emailRef.current;
                const currentSelectedPrice = selectedPriceRef.current;
                try {
                  setPaymentStatus('loading');
                  setCheckoutFormError(null);
                  const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ priceId: currentSelectedPrice, name: currentName, email: currentEmail }),
                  });
                  const orderData = await response.json();
                  if (!response.ok || orderData.error) {
                    throw new Error(orderData.error || `Failed to create order (status: ${response.status})`);
                  }
                  return orderData.id;
                } catch (error: any) {
                  console.error('Error in createOrder:', error);
                  setCheckoutFormError(error.message || 'An unexpected error occurred during order creation.');
                  setPaymentStatus('error');
                  throw error;
                }
              },
              onApprove: async (data: any, actions: any) => {
                try {
                  setPaymentStatus('loading');
                  const response = await fetch('/api/orders/capture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderID: data.orderID }),
                  });
                  const captureData = await response.json();
                  if (!response.ok || captureData.error) {
                    throw new Error(captureData.error || `Failed to capture order (status: ${response.status})`);
                  }
                  setPaymentStatus('success');
                  router.push(`/success/${data.orderID}`);
                } catch (error: any) {
                  console.error('Apple Pay payment capture error:', error);
                  setCheckoutFormError(error.message || 'An error occurred while capturing the Apple Pay payment.');
                  setPaymentStatus('error');
                }
              },
              onCancel: () => {
                setPaymentStatus('cancel');
                setCheckoutFormError('Apple Pay payment was cancelled.');
              },
              onError: (err: Error) => {
                console.error('Apple Pay button error:', err);
                setCheckoutFormError(`Apple Pay Error: ${err.message}. Please check your details or try again.`);
                setPaymentStatus('error');
              },
              style: {
                // Style can be customized if needed
              }
            };
            console.log('Created Apple Pay button config');
            
            // Create and render Apple Pay button
            const applePayButton = window.paypal.Buttons(
              new window.paypal.ApplePay.ButtonsConfig(applePayButtonConfig)
            );
            console.log('Apple Pay button created, checking eligibility');
            
            if (applePayButton?.isEligible?.()) {
              console.log('Apple Pay button eligible, rendering...');
              applePayButton.render('#paypal-button-container');
              console.log('Apple Pay button rendered successfully');
            } else {
              console.log('Apple Pay is not eligible on this device/browser');
            }
          } catch (error) {
            console.error('Error setting up Apple Pay:', error);
          }
        } else {
          console.log('Apple Pay not available:', { 
            paypalApplePaySDK: !!window.paypal.ApplePay, 
            deviceSupportsApplePay: isApplePayAvailable 
          });
        }
      } catch (err: any) {
        console.error('Error rendering payment buttons:', err);
        setCheckoutFormError('Error rendering payment options. Please refresh the page or try again later.');
      }
    } else {
      console.error('PayPal SDK not available on window object during render attempt.');
      setCheckoutFormError('Payment services are not ready. Please wait a moment or refresh the page.');
    }
  }, [router, setCheckoutFormError, setPaymentStatus, isApplePayAvailable, detectApplePayAvailability]);

  const handlePayPalLoad = () => {
    console.log('PayPal SDK loaded successfully (app/page.tsx)');
    setSdkReady(true);
    
    // Check if Apple Pay is available after SDK loads
    if (typeof window !== 'undefined') {
      const applePayAvailable = detectApplePayAvailability();
      setIsApplePayAvailable(applePayAvailable || false);
      console.log('Apple Pay available after SDK load:', applePayAvailable);
      
      // Debug PayPal SDK Apple Pay availability
      if (window.paypal) {
        console.log('PayPal SDK loaded, checking for Apple Pay component:', {
          hasApplePay: !!window.paypal.ApplePay,
          applePay: window.paypal.ApplePay
        });
      }
    }
  };

  const handlePayPalError = () => {
    console.error('PayPal SDK failed to load (app/page.tsx)');
    setCheckoutFormError("Failed to load PayPal. Please refresh the page or try again later.");
  };
  
  // Component initialization
  useEffect(() => {
    setIsInitialized(true);
    if (typeof window !== 'undefined' && window.paypal && !sdkReady) {
        console.log('PayPal SDK already present on window, calling handlePayPalLoad.');
      handlePayPalLoad();
    }
    return () => {
      if (paypalButtonContainerRef.current) {
        paypalButtonContainerRef.current.innerHTML = '';
      }
    };
  }, [sdkReady]);
  
  // Update canPay
  useEffect(() => {
    // Always allow showing the PayPal button, validation happens in onClick handler
    // and the CheckoutSection handles showing/hiding the warning message
    setCanPay(true);
  }, []);

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        const currentUser = session?.user;
        if (currentUser) {
          setIsUserSignedIn(true);
          const userEmail = currentUser.email || '';
          setEmail(userEmail);
          let userName = currentUser.user_metadata?.name || '';
          if (!userName) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', currentUser.id)
              .maybeSingle();
            userName = profileData?.name || '';
          }
          setName(userName);
        } else {
          setIsUserSignedIn(false);
        }
      }
    );

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsUserSignedIn(true);
        const userEmail = user.email || '';
        setEmail(userEmail);
        let userName = user.user_metadata?.name || '';
        if (!userName) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .maybeSingle();
          userName = profileData?.name || '';
        }
        setName(userName);
      } else {
        setIsUserSignedIn(false);
      }
    };
    checkUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Scroll listener for checkout visibility (for login popup)
  useEffect(() => {
    function onScroll() {
      if (checkoutRef.current && !checkoutVisible) {
        const rect = checkoutRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) setCheckoutVisible(true);
      }
    }
    window.addEventListener('scroll', onScroll);
    onScroll(); // Check on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, [checkoutVisible]);

  // Show login popup
  useEffect(() => {
    if (checkoutVisible && !isUserSignedIn && !hasPopupBeenShown) {
      setTimeout(() => setShowLoginPopup(true), 500);
      setHasPopupBeenShown(true);
    }
  }, [checkoutVisible, isUserSignedIn, hasPopupBeenShown]);
  
  const handleRegisterClick = () => {
    setShowLoginPopup(false);
    router.push('/register');
  };
  
  const handleContinueAsGuest = () => {
    setShowLoginPopup(false);
    const emailInput = document.getElementById('email-checkout');
    if (emailInput) {
      emailInput.focus();
    }
  };

  return (
    <main className="bg-white">
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Adobe Creative Cloud Subscription",
          "description": "Get genuine Adobe Creative Cloud subscriptions for up to 86% off. Includes all Adobe apps like Photoshop, Illustrator, and Premiere Pro.",
          "brand": {
            "@type": "Brand",
            "name": "Adobe"
          },
          "image": "https://cheapcc.online/og-image.jpg",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": "4.99",
            "highPrice": "124.99",
            "offerCount": PRICING_OPTIONS.length,
            "offers": PRICING_OPTIONS.map(option => ({
              "@type": "Offer",
              "name": option.description,
              "price": option.price,
              "priceCurrency": "USD"
            }))
          }
        }) }}
      />
      <LoginPopup 
        show={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)}
        onRegisterClick={handleRegisterClick}
        onContinueAsGuest={handleContinueAsGuest}
      />
      
      <React.Suspense fallback={<div>Loading messages...</div>}>
        <UrlMessageDisplay />
      </React.Suspense>

      <HeroSection />
      <SocialProofSection />
      <BenefitsSection />
      
      <PricingSection 
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
        selectedPriceRef={selectedPriceRef}
      />
      
      <HowItWorksSection />

      <div ref={checkoutRef}>
        <CheckoutSection
            selectedPrice={selectedPrice}
            isUserSignedIn={isUserSignedIn}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            canPay={canPay}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            checkoutFormError={checkoutFormError}
            setCheckoutFormError={setCheckoutFormError}
            paypalButtonContainerRef={paypalButtonContainerRef}
            sdkReady={sdkReady}
            onPayPalLoad={handlePayPalLoad}
            onPayPalError={handlePayPalError}
            renderPayPalButton={renderPayPalButton}
        />
      </div>
      
      <HomeFAQSection />
    </main>
  );
}
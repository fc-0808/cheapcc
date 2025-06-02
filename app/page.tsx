"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import type { Session } from '@supabase/supabase-js';
import UrlMessageDisplay from "@/components/UrlMessageDisplay";

// Import new section components
import HeroSection from "@/components/home/HeroSection";
import SocialProofSection from "@/components/home/SocialProofSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import PricingSection from "@/components/home/PricingSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CheckoutSection from "@/components/home/CheckoutSection";
import HomeFAQSection from "@/components/home/HomeFAQSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import LoginPopup from "@/components/home/LoginPopup";

// PRICING_OPTIONS will be imported by PricingSection and CheckoutSection directly

export default function Home() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('1m');
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

  // Update refs when values change
  useEffect(() => { nameRef.current = name; }, [name]);
  useEffect(() => { emailRef.current = email; }, [email]);
  useEffect(() => { selectedPriceRef.current = selectedPrice; }, [selectedPrice]);

  const isValidEmail = (email: string) => /.+@.+\..+/.test(email);
  
  // Function to render the PayPal button
  const renderPayPalButton = () => {
    if (!paypalButtonContainerRef.current) {
      console.log('PayPal button container not found, cannot render.');
      return;
    }
    paypalButtonContainerRef.current.innerHTML = ''; // Clear existing

    console.log('Attempting to render PayPal button...');
    if (typeof window !== 'undefined' && window.paypal) {
      window.paypal.Buttons({
        onClick: (data: any, actions: any) => {
          const currentName = nameRef.current;
          const currentEmail = emailRef.current;
          const currentSelectedPrice = selectedPriceRef.current;
          if (!currentName.trim() || !isValidEmail(currentEmail) || !currentSelectedPrice) {
            setCheckoutFormError('Please fill in your name and a valid email address.');
            setPaymentStatus('error');
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
    } else {
      console.error('PayPal SDK not available on window object during render attempt.');
      setCheckoutFormError('PayPal is not ready. Please wait a moment or refresh the page.');
    }
  };

  const handlePayPalLoad = () => {
    console.log('PayPal SDK loaded successfully (app/page.tsx)');
    setSdkReady(true);
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
    const shouldAllowPayment = isUserSignedIn || (name.trim() !== '' && isValidEmail(email));
    setCanPay(shouldAllowPayment);
  }, [isUserSignedIn, name, email]);

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
      <LoginPopup 
        show={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)}
        onRegisterClick={handleRegisterClick}
        onContinueAsGuest={handleContinueAsGuest}
      />
      
      <Suspense fallback={<div>Loading messages...</div>}>
        <UrlMessageDisplay />
      </Suspense>

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
            nameRef={nameRef}
            emailRef={emailRef}
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
      <TestimonialsSection />
    </main>
  );
}

"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import type { Session } from '@supabase/supabase-js';
import UrlMessageDisplay from "@/components/UrlMessageDisplay";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { v4 as uuidv4 } from 'uuid';
import { PRICING_OPTIONS } from '@/utils/products';
import dynamic from 'next/dynamic';

// Import section components
import HeroSection from "@/components/home/HeroSection";
import SocialProofSection from "@/components/home/SocialProofSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import PricingSection from "@/components/home/PricingSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import LoginPopup from "@/components/home/LoginPopup";

// Dynamically import heavy components
const CheckoutSection = dynamic(() => import("@/components/home/CheckoutSection"), {
  loading: () => (
    <div className="py-20 md:py-32">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="h-8 w-8 border-2 border-fuchsia-500/50 border-t-fuchsia-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

const HomeFAQSection = dynamic(() => import("@/components/home/HomeFAQSection"), {
  ssr: false
});

// Dynamically import the optimized payment providers
const OptimizedPaymentProviders = dynamic(() => import('@/components/home/OptimizedPaymentProviders'), {
  ssr: false
});

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Home() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('1m');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isUserSignedIn, setIsUserSignedIn] = useState<boolean>(false);
  const [canPay, setCanPay] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [hasPopupBeenShown, setHasPopupBeenShown] = useState(false);
  
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  
  // Refs to hold the latest values for PayPal callbacks
  const nameRef = useRef(name);
  const emailRef = useRef(email);
  const selectedPriceRef = useRef(selectedPrice);

  const [checkoutFormError, setCheckoutFormError] = useState<string | null>(null);

  // For login popup logic
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  // Update refs when values change
  useEffect(() => { nameRef.current = name; }, [name]);
  useEffect(() => { emailRef.current = email; }, [email]);
  useEffect(() => { selectedPriceRef.current = selectedPrice; }, [selectedPrice]);

  const isValidEmail = (email: string) => /.+@.+\..+/.test(email);
  const isFormValid = name.trim() !== '' && isValidEmail(email);
  
  // Initialize Stripe payment intent when form is valid
  useEffect(() => {
    if (!isFormValid) {
      setClientSecret(null);
      return;
    }

    const fetchPaymentIntent = async () => {
      setPaymentStatus('loading');
      try {
        const idempotencyKey = uuidv4();
        const response = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: selectedPrice,
            name,
            email,
            idempotencyKey,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment.');
        }
        setClientSecret(data.clientSecret);
        setPaymentStatus('idle');
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        setCheckoutFormError(error.message);
        setPaymentStatus('error');
      }
    };
    
    fetchPaymentIntent();
  }, [selectedPrice, name, email, isFormValid]);
  
  // Memoize renderPayPalButton with useCallback
  const renderPayPalButton = useCallback(() => {
    // This is now handled by our PayPalContext
    console.log('PayPal button rendering is now handled by PayPalContext');
  }, []);

  const handlePayPalLoad = useCallback(() => {
    console.log('PayPal SDK loaded successfully (app/page.tsx)');
    setSdkReady(true);
  }, []);

  const handlePayPalError = useCallback(() => {
    console.error('PayPal SDK failed to load (app/page.tsx)');
    setCheckoutFormError("Failed to load PayPal. Please refresh the page or try again later.");
  }, []);

  // Add a utility function for PayPal order creation with retry
  const createPayPalOrderWithRetry = useCallback(async (
    selectedPrice: string, 
    name: string, 
    email: string, 
    maxRetries = 3
  ) => {
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: selectedPrice, name, email })
        });

        const data = await response.json();
        
        if (!response.ok) {
          // Check if this is a retryable error
          if (response.status === 503 && data.retry === true && retryCount < maxRetries) {
            console.warn(`Network error connecting to PayPal. Retry attempt ${retryCount + 1}/${maxRetries}`);
            retryCount++;
            // Exponential backoff: wait longer between each retry
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            continue;
          }
          
          throw new Error(data.error || 'Failed to create order');
        }
        
        return data.id;
      } catch (error) {
        lastError = error;
        if (retryCount >= maxRetries) {
          console.error('Max retries reached for PayPal order creation:', error);
          break;
        }
        retryCount++;
        console.warn(`Error creating PayPal order, retry ${retryCount}/${maxRetries}`);
        // Exponential backoff: wait longer between each retry
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }
    
    // If we've exhausted all retries, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new Error('Failed to create PayPal order after multiple attempts');
  }, []);
  
  // Component initialization - use safer approach for PayPal
  useEffect(() => {
    // Use a mount reference to track component lifecycle
    const isMounted = { current: true };
    
    // Check for PayPal SDK availability
    if (typeof window !== 'undefined' && window.paypal && !sdkReady) {
      console.log('PayPal SDK already present on window, calling handlePayPalLoad.');
      handlePayPalLoad();
    }
    
    return () => {
      // Mark component as unmounted to prevent any late state updates
      isMounted.current = false;
    };
  }, [sdkReady, handlePayPalLoad]);
  
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
        // Only consider the checkout section visible when it's well into the viewport
        // Instead of just barely visible (window.innerHeight - 100)
        if (rect.top < window.innerHeight * 0.3) setCheckoutVisible(true);
      }
    }
    window.addEventListener('scroll', onScroll);
    // Don't check on mount to prevent popup from showing immediately
    return () => window.removeEventListener('scroll', onScroll);
  }, [checkoutVisible]);

  // Show login popup
  useEffect(() => {
    if (checkoutVisible && !isUserSignedIn && !hasPopupBeenShown) {
      // Increase delay to give user time to interact with checkout section first
      setTimeout(() => setShowLoginPopup(true), 1500);
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

  const selectedPriceOption = PRICING_OPTIONS.find(p => p.id === selectedPrice) || PRICING_OPTIONS[0];
  const amountInCents = Math.round(selectedPriceOption.price * 100);

  const stripeOptions: StripeElementsOptions = clientSecret
    ? {
        // For when payment intent is created
        clientSecret,
        appearance: {
          theme: 'night' as const,
          variables: { colorPrimary: '#ff33ff' },
        },
      }
    : {
        // For initial render before payment intent exists
        mode: 'payment',
        amount: amountInCents,
        currency: 'usd',
        appearance: {
          theme: 'night' as const,
          variables: { colorPrimary: '#e5e7eb' },
        },
      };

  return (
    <main className="min-h-screen overflow-x-hidden">
      <OptimizedPaymentProviders>
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
          userEmail={email}
        />
        
        <HowItWorksSection />

        <div ref={checkoutRef}>
          <Elements
            stripe={stripePromise}
            options={stripeOptions}
          >
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
                clientSecret={clientSecret}
                createPayPalOrderWithRetry={createPayPalOrderWithRetry}
            />
          </Elements>
        </div>
        
        <HomeFAQSection />
      </OptimizedPaymentProviders>
    </main>
  );
}
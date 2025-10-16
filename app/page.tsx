"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/supabase-client';
import type { Session } from '@supabase/supabase-js';
import UrlMessageDisplay from "@/components/UrlMessageDisplay";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { v4 as uuidv4 } from 'uuid';
import { getPricingOptions, type PricingOption } from '@/utils/products-supabase';
import dynamic from 'next/dynamic';
import { useInternationalization } from '@/contexts/InternationalizationContext';

// Import section components
import HeroSection from "@/components/home/HeroSection";
import SocialProofSection from "@/components/home/SocialProofSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import PricingSection from "@/components/home/PricingSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import LoginPopup from "@/components/home/LoginPopup";
import SEOInternalLinks from "@/components/SEOInternalLinks";

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

// Debug component for PayPal (development only) - Commented out since PayPal is working
// const PayPalDebugger = dynamic(() => import('@/components/PayPalDebugger'), {
//   ssr: false
// });

// Load Stripe with error handling and retry mechanism
const createStripePromise = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!).catch((error) => {
    console.error('Failed to load Stripe.js:', error);
    // Return a rejected promise that we can handle in the component
    return Promise.reject(error);
  });
};

const stripePromise = createStripePromise();

export default function Home() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('1m');
  const [selectedActivationType, setSelectedActivationType] = useState<'pre-activated' | 'self-activation'>('pre-activated');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeRetryCount, setStripeRetryCount] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>(''); // Payment/billing email
  const [adobeEmail, setAdobeEmail] = useState<string>(''); // Adobe account email for self-activation
  const [isUserSignedIn, setIsUserSignedIn] = useState<boolean>(false);
  
  // ✅ GET INTERNATIONALIZATION DATA
  const { countryConfig, formatLocalPrice, selectedCountry } = useInternationalization();
  
  // Pricing options - loaded immediately
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  
  // Handle activation type change and clear Adobe email if switching to pre-activated
  const handleActivationTypeChange = useCallback((type: 'pre-activated' | 'self-activation') => {
    setSelectedActivationType(type);
    
    // Clear Adobe email when switching to pre-activated (not needed for pre-activated accounts)
    if (type === 'pre-activated' && !isUserSignedIn) {
      setAdobeEmail('');
    }
    
    // Auto-select 1-month option when switching to self-activation
    if (type === 'self-activation') {
      // Find the 1-month self-activation option
      const oneMonthSelfOption = pricingOptions.find(option => 
        option.activationType === 'self-activation' && 
        option.durationMonths === 1 && 
        !option.id.includes('code') // Exclude redemption codes
      );
      
      if (oneMonthSelfOption) {
        console.log('Auto-selecting 1-month self-activation option:', oneMonthSelfOption.id);
        setSelectedPrice(oneMonthSelfOption.id);
      }
    } else if (type === 'pre-activated') {
      // Auto-select 1-month pre-activated option when switching back
      const oneMonthPreOption = pricingOptions.find(option => 
        option.activationType === 'pre-activated' && 
        option.durationMonths === 1
      );
      
      if (oneMonthPreOption) {
        console.log('Auto-selecting 1-month pre-activated option:', oneMonthPreOption.id);
        setSelectedPrice(oneMonthPreOption.id);
      }
    }
  }, [isUserSignedIn, pricingOptions]);
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

  // Cache for payment intent requests to prevent duplicates
  const paymentIntentCacheRef = useRef<Map<string, string>>(new Map());

  // Function to refresh payment intent by clearing cache and triggering new creation
  const refreshPaymentIntent = useCallback(() => {
    // Clear all cached payment intents
    paymentIntentCacheRef.current.clear();
    // Clear current client secret to trigger new payment intent creation
    setClientSecret(null);
    setPaymentStatus('idle');
    setCheckoutFormError(null);
  }, []);

  // Fetch pricing options from database
  // Fetch pricing options from Supabase immediately
  useEffect(() => {
    const fetchPricingOptions = async () => {
      try {
        console.log('Fetching pricing options from Supabase...');
        const options = await getPricingOptions();
        console.log('Pricing options fetched:', options.length, 'options');
        setPricingOptions(options);
        
        // Set default selected price if current selection doesn't exist in options
        if (options.length > 0) {
          const currentSelectionExists = options.some(opt => opt.id === selectedPrice);
          if (!currentSelectionExists) {
            const defaultOption = options.find(opt => opt.id === '1m') || options[0];
            setSelectedPrice(defaultOption.id);
            console.log(`Updated selectedPrice to ${defaultOption.id}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pricing options:', error);
        setPricingOptions([]);
      }
    };

    fetchPricingOptions();
  }, []);

  // Update refs when values change
  useEffect(() => { nameRef.current = name; }, [name]);
  useEffect(() => { emailRef.current = email; }, [email]);
  useEffect(() => { selectedPriceRef.current = selectedPrice; }, [selectedPrice]);

  const isValidEmail = (email: string) => /.+@.+\..+/.test(email);
  const isFormValid = name.trim() !== '' && isValidEmail(email) && 
    (selectedActivationType === 'pre-activated' || (selectedActivationType === 'self-activation' && isValidEmail(adobeEmail)));
  
  // Monitor Stripe loading and handle errors
  useEffect(() => {
    const checkStripeLoading = async () => {
      try {
        await stripePromise;
        setStripeError(null);
        setSdkReady(true);
      } catch (error) {
        console.error('Stripe failed to load:', error);
        setStripeError('Failed to load payment system');
        setSdkReady(false);
      }
    };

    checkStripeLoading();
  }, [stripeRetryCount]);

  // Initialize Stripe payment intent when form is valid with debouncing
  useEffect(() => {
    // Determine form validity based on the current state.
    const formIsValid = name.trim() !== '' && isValidEmail(email) &&
      (selectedActivationType === 'pre-activated' || (selectedActivationType === 'self-activation' && isValidEmail(adobeEmail)));

    // If the form is not valid, clear any existing client secret and stop.
    if (!formIsValid) {
      if (clientSecret) {
        setClientSecret(null);
        setPaymentStatus('idle');
      }
      return;
    }

    // Don't create an intent if pricing options aren't loaded yet.
    if (pricingOptions.length === 0) {
      return;
    }

    // Don't create payment intent if selected price doesn't exist in pricing options
    const selectedPriceExists = pricingOptions.some(option => option.id === selectedPrice);
    if (!selectedPriceExists) {
      console.warn(`Selected price ${selectedPrice} not found in pricing options`);
      return;
    }

    // Debounce the API call to avoid spamming the server while the user types.
    const timeoutId = setTimeout(() => {
      const fetchPaymentIntent = async () => {
        // Your caching logic is good and prevents redundant calls for the same data.
        const cacheKey = `${selectedPrice}-${name}-${email}-${selectedActivationType}-${adobeEmail || ''}`;
        const cachedClientSecret = paymentIntentCacheRef.current.get(cacheKey);

        if (cachedClientSecret) {
          console.log('Using cached client secret');
          setClientSecret(cachedClientSecret);
          setPaymentStatus('idle');
          return;
        }

        setPaymentStatus('loading');
        setCheckoutFormError(null); // Clear previous errors

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
              activationType: selectedActivationType,
              adobeEmail: adobeEmail && adobeEmail.trim() !== '' ? adobeEmail : null,
            }),
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to initialize payment.');
          }

          if (!data.clientSecret) {
            throw new Error('No client secret received from payment service.');
          }

          // Cache the new client secret and update state.
          paymentIntentCacheRef.current.set(cacheKey, data.clientSecret);
          setClientSecret(data.clientSecret);
          setPaymentStatus('idle');

        } catch (error: any) {
          console.error('Error creating payment intent:', error);
          setCheckoutFormError(error.message);
          setPaymentStatus('error');
        }
      };

      fetchPaymentIntent();
    }, 500); // 500ms debounce is fine for this.

    // Cleanup function to clear the timeout if dependencies change before it fires.
    return () => clearTimeout(timeoutId);

    // The dependencies MUST be the inputs that define the payment intent.
    // Do NOT include `clientSecret` or `paymentStatus` here.
  }, [name, email, adobeEmail, selectedPrice, selectedActivationType, pricingOptions]);

  // Retry payment intent creation
  const retryPaymentIntent = useCallback(() => {
    console.log('Retrying payment intent creation');
    setCheckoutFormError(null);
    setPaymentStatus('idle');
    setClientSecret(null);
  }, []);
  
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
    paymentEmail: string, 
    maxRetries = 3
  ) => {
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= maxRetries) {
      try {
        // Always use payment email for the order, Adobe email is passed separately
        const emailForOrder = paymentEmail;
        
        // Get the selected product to extract pricing info
        const selectedProduct = pricingOptions.find(p => p.id === selectedPrice);
        if (!selectedProduct) {
          throw new Error('Product not found');
        }

        // ✅ Calculate display price using country config
        const basePrice = selectedProduct.price;
        // Calculate localized price with VAT
        const localPriceMultiplier = countryConfig.priceMultiplier;
        const vatRate = countryConfig.vatRate || 0;
        const rawDisplayPrice = basePrice * localPriceMultiplier * (1 + vatRate);
        
        // Handle zero-decimal currencies (JPY, KRW, etc.)
        const zeroDecimalCurrencies = ['JPY', 'KRW', 'HUF', 'CLP', 'ISK', 'TWD'];
        const useDecimals = !zeroDecimalCurrencies.includes(countryConfig.currency);
        const displayPrice = useDecimals 
          ? parseFloat(rawDisplayPrice.toFixed(2))
          : Math.round(rawDisplayPrice);
        
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            priceId: selectedPrice, 
            name, 
            email: emailForOrder, 
            activationType: selectedActivationType,
            adobeEmail: adobeEmail && adobeEmail.trim() !== '' ? adobeEmail : null,
            // ✅ ADD: Country and currency information for multi-currency support
            countryCode: selectedCountry,
            currency: countryConfig.currency,
            basePrice,
            displayPrice,
          })
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
  }, [selectedActivationType, adobeEmail, countryConfig, formatLocalPrice, pricingOptions, selectedCountry]);
  
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
        setEmail(userEmail); // Set payment email
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

  const selectedPriceOption = pricingOptions.find(option => option.id === selectedPrice) || null;
  // Use default amount of $12.99 (1299 cents) if no pricing option is selected yet
  let amountInCents = selectedPriceOption ? Math.round(selectedPriceOption.price * 100) : 1299;
  
  // Ensure amount is never 0 or negative (Stripe requirement)
  if (amountInCents <= 0) {
    console.warn('Invalid amount detected, using default $12.99');
    amountInCents = 1299;
  }

  // Create the options object dynamically based on the clientSecret's availability
  const stripeOptions: StripeElementsOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: { colorPrimary: '#ff33ff' },
    },
  } : {
    mode: 'payment',
    currency: 'usd',
    amount: amountInCents,
    appearance: {
      theme: 'night' as const,
      variables: { colorPrimary: '#ff33ff' },
    },
  };
  
  // Debug logging
  console.log('Debug - Pricing calculation:', {
    pricingOptionsLength: pricingOptions.length,
    selectedPrice,
    selectedPriceOption,
    amountInCents
  });

  // Debug logging for Stripe state
  console.log('Debug - Stripe state:', {
    hasClientSecret: !!clientSecret,
    amountInCents,
    paymentStatus
  });

  // No loading state - pricing options load in background

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
          selectedActivationType={selectedActivationType}
          onActivationTypeChange={handleActivationTypeChange}
          email={adobeEmail}
          setEmail={setAdobeEmail}
          isUserSignedIn={isUserSignedIn}
        />
        
        <HowItWorksSection />

        <div ref={checkoutRef}>
          {amountInCents > 0 && (
            <>
              {stripeError ? (
                <div className="p-6 border border-red-500/20 rounded-lg bg-red-500/10 text-red-400 text-center">
                  <div className="mb-4">
                    <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <h3 className="text-lg font-semibold mb-2">Payment System Unavailable</h3>
                    <p className="text-sm mb-4">
                      We're experiencing issues loading our secure payment system. 
                      {stripeRetryCount < 3 ? ' Retrying...' : ' Please try again later or use PayPal.'}
                    </p>
                    {stripeRetryCount < 3 && (
                      <button
                        onClick={() => {
                          setStripeError(null);
                          setStripeRetryCount(prev => prev + 1);
                          // Try to reload Stripe without full page reload
                          const newStripePromise = createStripePromise();
                          newStripePromise.then(() => {
                            setSdkReady(true);
                            setStripeError(null);
                          }).catch((error) => {
                            console.error('Retry failed:', error);
                            setStripeError('Payment system still unavailable');
                          });
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Retry Payment System
                      </button>
                    )}
                  </div>
                </div>
              ) : (
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
                    selectedActivationType={selectedActivationType}
                    adobeEmail={adobeEmail}
                    createPayPalOrderWithRetry={createPayPalOrderWithRetry}
                    onRefreshPaymentIntent={refreshPaymentIntent}
                  />
                </Elements>
              )}
            </>
          )}
        </div>
        
        <HomeFAQSection />
        
        {/* CheapCC Reviews Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Customers Say</span>
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                Don't just take our word for it. See why hundreds of creatives trust CheapCC for their Adobe Creative Cloud needs.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="bg-green-500/20 border border-green-500/50 rounded-full px-6 py-2 text-green-400 font-medium">
                  <i className="fas fa-star mr-2"></i>4.8/5 Customer Rating
                </div>
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-full px-6 py-2 text-blue-400 font-medium">
                  <i className="fas fa-users mr-2"></i>500+ Happy Customers
                </div>
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-full px-6 py-2 text-purple-400 font-medium">
                  <i className="fas fa-shield-check mr-2"></i>Verified Reviews
                </div>
              </div>
              
              <Link
                href="/cheapcc-review"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-green-500/30 border border-white/20 hover:scale-105 transition-transform"
              >
                Read Full CheapCC Review
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>
        
        {/* PayPal Debug Component (development only) - Commented out since PayPal is working */}
        {/* <PayPalDebugger /> */}
      </OptimizedPaymentProviders>
    </main>
  );
}
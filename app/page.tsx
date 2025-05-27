"use client";

import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { PRODUCT, PRICING_OPTIONS } from "@/utils/products";
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import type { Session } from '@supabase/supabase-js';

// --- Testimonials Data ---
const TESTIMONIALS = [
  {
    name: "Alex J.",
    title: "Designer, Freelancer",
    text: "CheapCC saved me hundreds! The process was smooth and I got my Adobe account instantly. Highly recommended!",
    rating: 5,
  },
  {
    name: "Maria S.",
    title: "Marketing Lead",
    text: "I was skeptical at first, but the subscription is 100% genuine. Support was super responsive too.",
    rating: 5,
  },
  {
    name: "David P.",
    title: "Student",
    text: "As a student, this is a game changer. All apps, no issues, and a fraction of the price.",
    rating: 5,
  },
  {
    name: "Priya K.",
    title: "Photographer",
    text: "The best deal for Adobe CC online. Fast delivery and great customer service!",
    rating: 5,
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('1m');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [orderID, setOrderID] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isUserSignedIn, setIsUserSignedIn] = useState<boolean>(false);
  const [canPay, setCanPay] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [hasPopupBeenShown, setHasPopupBeenShown] = useState(false);
  
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  const isAuthChecked = useRef<boolean>(false);
  const shouldRenderPayPal = useRef<boolean>(false);

  // --- FAQ Accordion State ---
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // --- Testimonials Carousel State ---
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonialTimeout = useRef<NodeJS.Timeout | null>(null);

  // Social proof counter animation
  const counterRef = useRef<HTMLDivElement>(null);
  const [counterVisible, setCounterVisible] = useState(false);
  const [counters, setCounters] = useState([
    { value: 0, target: 150, label: 'Happy Customers', icon: 'fas fa-users' },
    { value: 0, target: 250, label: 'Successful Activations', icon: 'fas fa-check-circle' },
    { value: 0, target: 99, label: 'Customer Satisfaction', icon: 'fas fa-star' },
    { value: 0, target: 24, label: 'Support Availability', icon: 'fas fa-headset', suffix: '/7' },
  ]);
  const [animated, setAnimated] = useState(false);

  // Add ref for how-it-works steps animation
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const [stepsVisible, setStepsVisible] = useState(false);

  // Animation refs and state for scroll-triggered sections
  const benefitsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [benefitsVisible, setBenefitsVisible] = useState(false);
  const [pricingVisible, setPricingVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);

  const searchParams = useSearchParams();

  // Validate email format
  const isValidEmail = (email: string) => /.+@.+\..+/.test(email);

  // --- Refs to hold the latest values for PayPal callbacks ---
  const nameRef = useRef(name);
  const emailRef = useRef(email);
  const selectedPriceRef = useRef(selectedPrice);

  const [checkoutFormError, setCheckoutFormError] = useState<string | null>(null);

  // Function to render the PayPal button when conditions are right
  const renderPayPalButton = () => {
    if (!paypalButtonContainerRef.current) {
      console.log('PayPal button container not found in DOM, cannot render.');
      return;
    }
    // Clear any existing buttons before rendering new ones to prevent duplicates or stale instances
    paypalButtonContainerRef.current.innerHTML = '';

    console.log('Rendering PayPal button now...');
    if (typeof window !== 'undefined' && window.paypal) {
      window.paypal.Buttons({
        // See: https://developer.paypal.com/docs/checkout/standard/customize/validate-user/
        onClick: (data: any, actions: any) => {
          const currentName = nameRef.current;
          const currentEmail = emailRef.current;
          const currentSelectedPrice = selectedPriceRef.current;
          console.log('[PayPal onClick] Validating fields. Name from ref:', `"${currentName}"`, 'Email from ref:', `"${currentEmail}"`, 'Selected Price from ref:', currentSelectedPrice);
          if (!currentName.trim() || !isValidEmail(currentEmail) || !currentSelectedPrice) {
            console.error('[PayPal onClick] Validation failed. Rejecting payment flow.');
            setPaymentStatus('error');
            return actions.reject();
          }
          console.log('[PayPal onClick] Validation passed. Resolving to proceed.');
          if(paymentStatus === 'error') setPaymentStatus('idle');
          return actions.resolve();
        },
        createOrder: async () => {
          const currentName = nameRef.current;
          const currentEmail = emailRef.current;
          const currentSelectedPrice = selectedPriceRef.current;
          console.log(`[createOrder EXECUTION] Using Name from ref: "${currentName}", Email from ref: "${currentEmail}", PriceID from ref: "${currentSelectedPrice}"`);
          const requestBody = {
            priceId: currentSelectedPrice,
            name: currentName,
            email: currentEmail
          };
          const requestBodyString = JSON.stringify(requestBody);
          console.log('[createOrder EXECUTION] Request Body String:', requestBodyString);
          try {
            setPaymentStatus('loading');
            setCheckoutFormError(null);
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: requestBodyString,
            });
            const orderData = await response.json();
            if (orderData.error) {
              throw new Error(orderData.error);
            }
            setOrderID(orderData.id);
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
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            const captureData = await response.json();
            if (captureData.error) {
              throw new Error(captureData.error);
            }
            // Set success status
            setPaymentStatus('success');
            // Redirect to success page for all users (no token logic)
              router.push(`/success/${data.orderID}`);
          } catch (error) {
            console.error('Payment capture error:', error);
            setPaymentStatus('error');
          }
        },
        onCancel: () => {
          setPaymentStatus('cancel');
        },
        onError: (err: Error) => {
          console.error('PayPal button error:', err);
          setCheckoutFormError(`PayPal Error: ${err.message}. Please try again.`);
          setPaymentStatus('error');
        },
      }).render('#paypal-button-container');
      console.log('PayPal button render method called');
    } else {
      console.error('PayPal SDK not available on window object');
    }
  };

  // Function to handle when the PayPal SDK is loaded
  const handlePayPalLoad = () => {
    console.log('PayPal SDK loaded successfully');
    setSdkReady(true);
    setSdkError(false);
    
    // If auth is already checked and we should render, do it now
    if (isAuthChecked.current && shouldRenderPayPal.current) {
      console.log('Auth was already checked, rendering PayPal button immediately after SDK load');
      setTimeout(renderPayPalButton, 0);
    }
  };

  const handlePayPalError = () => {
    console.error('PayPal SDK failed to load');
    setSdkError(true);
  };
  
  // Component initialization & cleanup effect
  useEffect(() => {
    console.log('Component mounted or re-activated');
    setIsInitialized(true);

    // Check if PayPal SDK is already loaded on the window object.
    if (typeof window !== 'undefined' && window.paypal) {
      console.log('PayPal SDK already present on window, calling handlePayPalLoad directly.');
      handlePayPalLoad();
    }

    return () => {
      console.log('Component unmounting or de-activating, cleaning up PayPal button container.');
      if (paypalButtonContainerRef.current) {
        paypalButtonContainerRef.current.innerHTML = '';
      }
      // Optionally reset sdkReady if needed:
      // setSdkReady(false);
    };
  }, []);
  
  // Update canPay whenever relevant dependencies change
  useEffect(() => {
    const shouldAllowPayment = isUserSignedIn || (name.trim() !== '' && isValidEmail(email));
    console.log('Updating canPay state:', { shouldAllowPayment, isUserSignedIn, name, email });

    // If changing from canPay=true to shouldAllowPayment=false, clear the PayPal button container
    if (canPay && !shouldAllowPayment && paypalButtonContainerRef.current) {
      console.log('canPay became false, clearing PayPal button container');
      paypalButtonContainerRef.current.innerHTML = '';
    }
    setCanPay(shouldAllowPayment);
  }, [isUserSignedIn, name, email, canPay]); // Added canPay to dependencies for the previous state check

  // Main effect to handle PayPal button rendering when conditions change
  useEffect(() => {
    if (isInitialized && sdkReady) {
      if (canPay) {
        console.log('Conditions met, rendering PayPal button (dependencies: isInitialized, sdkReady, canPay, selectedPrice)');
        renderPayPalButton();
      } else {
        if (paypalButtonContainerRef.current) {
          console.log('Conditions to pay not met, clearing PayPal button container.');
          paypalButtonContainerRef.current.innerHTML = '';
        }
      }
    }
  }, [isInitialized, sdkReady, canPay, selectedPrice]); // REMOVE name and email from here

  // Dedicated effect for user authentication
  useEffect(() => {
    const supabase = createClient();
    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        const currentUser = session?.user;
        if (currentUser) {
          setIsUserSignedIn(true);
          // Set email from user data
          const userEmail = currentUser.email || '';
          setEmail(userEmail);
          emailRef.current = userEmail;
          // Try to get name from user metadata first or profiles table
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
          nameRef.current = userName;
        } else {
          // User logged out
          setIsUserSignedIn(false);
          setName('');
          setEmail('');
          nameRef.current = '';
          emailRef.current = '';
        }
      }
    );

    // Initial check
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsUserSignedIn(true);
        const userEmail = user.email || '';
        setEmail(userEmail);
        emailRef.current = userEmail;
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
        nameRef.current = userName;
      } else {
        setIsUserSignedIn(false);
        setName('');
        setEmail('');
        nameRef.current = '';
        emailRef.current = '';
      }
    };
    checkUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const selectedPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice)!;

  // Testimonials auto-rotate
  useEffect(() => {
    if (testimonialTimeout.current) clearTimeout(testimonialTimeout.current);
    testimonialTimeout.current = setTimeout(() => {
      setTestimonialIdx((idx) => (idx + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => { if (testimonialTimeout.current) clearTimeout(testimonialTimeout.current); };
  }, [testimonialIdx]);

  useEffect(() => {
    // Only trigger animation when social proof section enters viewport
    function onScrollOrObserve() {
      if (!counterRef.current) return;
      const rect = counterRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        setCounterVisible(true);
      }
    }
    window.addEventListener('scroll', onScrollOrObserve);
    // Also check on mount in case already in view
    onScrollOrObserve();
    return () => window.removeEventListener('scroll', onScrollOrObserve);
  }, []);

  useEffect(() => {
    if (counterVisible && !animated) {
      setAnimated(true);
      const durations = [1200, 1200, 1200, 1200];
      counters.forEach((counter, idx) => {
        let start = 0;
        const end = counter.target;
        const duration = durations[idx];
        const startTime = performance.now();
        function animate(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(progress * (end - start) + start);
          setCounters(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], value: current };
            return updated;
          });
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCounters(prev => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], value: end };
              return updated;
            });
          }
        }
        requestAnimationFrame(animate);
      });
    }
  }, [counterVisible, animated]);

  // How it works steps animation
  useEffect(() => {
    function onScrollOrObserve() {
      if (!howItWorksRef.current) return;
      const rect = howItWorksRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        setStepsVisible(true);
      }
    }
    window.addEventListener('scroll', onScrollOrObserve);
    onScrollOrObserve();
    return () => window.removeEventListener('scroll', onScrollOrObserve);
  }, []);

  useEffect(() => {
    function onScroll() {
      if (benefitsRef.current && !benefitsVisible) {
        const rect = benefitsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) setBenefitsVisible(true);
      }
      if (pricingRef.current && !pricingVisible) {
        const rect = pricingRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) setPricingVisible(true);
      }
      if (checkoutRef.current && !checkoutVisible) {
        const rect = checkoutRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) setCheckoutVisible(true);
      }
      if (faqRef.current && !faqVisible) {
        const rect = faqRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) setFaqVisible(true);
      }
      if (testimonialsRef.current && !testimonialsVisible) {
        const rect = testimonialsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) setTestimonialsVisible(true);
      }
    }
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [benefitsVisible, pricingVisible, checkoutVisible, faqVisible, testimonialsVisible]);

  useEffect(() => {
    if (searchParams.get('success') === 'confirmed') {
      setSuccessMessage('Successfully confirmed!');
      window.history.replaceState({}, document.title, '/');
      
      // Auto-hide the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Add this effect to show the popup when user scrolls to checkout
  useEffect(() => {
    if (checkoutVisible && !isUserSignedIn && !hasPopupBeenShown) {
      console.log('User scrolled to checkout section, showing login popup');
      // Delay popup slightly for better UX (let the section render first)
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
    // Focus on the email input field
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  };

  return (
    <main className="bg-white">
      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-scaleIn">
            <div className="text-center mb-4">
              <i className="fas fa-user-circle text-5xl text-[#ff3366]"></i>
            </div>
            <h3 className="text-xl font-bold text-[#2c2d5a] mb-3 text-center">Create an Account?</h3>
            <p className="text-gray-600 mb-5 text-center">
              Creating an account lets you track your orders and save your information for faster checkout.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-center">
              <button
                onClick={handleRegisterClick}
                className="py-2.5 px-5 bg-[#ff3366] text-white rounded-lg hover:bg-[#e62e5c] transition font-medium flex items-center justify-center whitespace-nowrap cursor-pointer"
              >
                <i className="fas fa-user-plus mr-2"></i> Register
              </button>
              <button
                onClick={handleContinueAsGuest}
                className="py-2.5 px-5 border border-gray-300 text-[#2c2d5a] rounded-lg hover:bg-gray-100 transition font-medium flex items-center justify-center whitespace-nowrap cursor-pointer"
              >
                <i className="fas fa-arrow-right mr-2"></i> Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Display success message if present */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 text-green-700 px-6 py-3 rounded-md shadow-lg">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2" />
            {successMessage}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="savings-badge">
            <i className="fas fa-tags" /> Save up to 86% vs Official Pricing
          </div>
          <h1>
            Unleash Your Creativity with<br />
            <span className="highlight">
              Adobe Creative Cloud
              <span className="highlight-underline" />
            </span>
            </h1>
          <p>
            Get the complete suite with all premium applications at a fraction of the official cost. Same powerful tools, same features, massive savings.
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <i className="fas fa-check-circle" /> All Creative Cloud Apps
            </div>
            <div className="hero-feature">
              <i className="fas fa-check-circle" /> 100GB Cloud Storage
            </div>
            <div className="hero-feature">
              <i className="fas fa-check-circle" /> Adobe Firefly Included
            </div>
          </div>
          <a
            href="#pricing"
            className="primary-btn"
            onClick={e => {
              e.preventDefault();
              const el = document.getElementById('pricing');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <i className="fas fa-bolt" /> View Plans & Pricing
          </a>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof bg-gradient-to-br from-[#2c2d5a] to-[#1e0029] py-12">
        <div className="container">
          <div
            className="counter-container flex flex-wrap justify-center gap-6"
            ref={counterRef}
          >
            {counters.map((counter, idx) => (
              <div key={counter.label} className="counter-item">
                <i className={`${counter.icon} text-2xl`} />
                <div className={`counter-value${animated ? ' animated' : ''}`}>
                  {counter.value}
                  {counter.suffix || (counter.label === 'Customer Satisfaction' ? '%' : '+')}
                </div>
                <div className="counter-label">{counter.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits py-20 bg-white">
        <div className="container" ref={benefitsRef}>
          <div className={`section-heading text-center mb-12 stagger-item${benefitsVisible ? ' visible' : ''}`}> 
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-[#2c2d5a] to-[#484a9e] bg-clip-text text-transparent inline-block mb-2">
              Why Choose CheapCC?
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Authorized Adobe Creative Cloud subscriptions at significantly reduced prices compared to official channels
            </p>
          </div>
          <div className={`benefits-container grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-12 stagger-item delay-100${benefitsVisible ? ' visible' : ''}`}> 
            <div className="benefit-card">
              <i className="fas fa-piggy-bank" />
              <h3>Massive Savings</h3>
              <p>Pay up to 86% less than official Adobe pricing while getting the exact same product and benefits.</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-bolt" />
              <h3>Email Delivery</h3>
              <p>Receive your Adobe account details via email after purchase with all apps ready to download.</p>
              </div>
            <div className="benefit-card">
              <i className="fas fa-check-circle" />
              <h3>100% Genuine</h3>
              <p>Full access to all Creative Cloud apps and services with regular updates and cloud storage.</p>
              </div>
            <div className="benefit-card">
              <i className="fas fa-exchange-alt" />
              <h3>Alternative to cheapcc.net</h3>
              <p>cheapcc.online is your alternative destination to cheapcc.net for affordable Adobe Creative Cloud subscriptions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing py-20 bg-gradient-to-b from-[#f3f4f6] to-white border-t border-b border-gray-100" id="pricing">
        <div className="container" ref={pricingRef}>
          <div className={`section-heading text-center mb-12 stagger-item${pricingVisible ? ' visible' : ''}`}> 
            <h2 className="mb-2">Choose Your Plan</h2>
            <p className="text-lg text-gray-500">Select the best Adobe Creative Cloud subscription for your needs</p>
          </div>
          <div className={`plans-container flex flex-wrap gap-6 justify-center stagger-item delay-100${pricingVisible ? ' visible' : ''}`}> 
              {PRICING_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`plan-card${selectedPrice === option.id ? ' selected' : ''}`}
                  onClick={() => {
                    if (selectedPrice !== option.id) {
                      setSelectedPrice(option.id);
                      selectedPriceRef.current = option.id;
                    }
                    setTimeout(() => {
                      const el = document.getElementById('checkout');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 10);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrice === option.id}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedPrice(option.id)}
                  style={{ position: 'relative', overflow: 'visible' }}
                >
                  {/* Ribbon for 14-Day Trial */}
                  {option.id === '14d' && (
                    <div
                      className="absolute right-0 top-0 z-10 px-3 py-1 text-xs font-bold text-white rounded-bl-lg"
                      style={{
                        background: 'linear-gradient(90deg, #ff3366 0%, #a855f7 100%)',
                        transform: 'translateY(-40%) translateX(35%) rotate(18deg)',
                        boxShadow: '0 6px 24px rgba(255,51,102,0.25), 0 1.5px 6px rgba(168,85,247,0.18)',
                        letterSpacing: '0.03em',
                        fontSize: '13px',
                      }}
                    >
                      One-time purchase
                  </div>
                  )}
                  <div className="plan-duration">{option.duration}</div>
                  <div className="plan-price">${option.price}</div>
                  <div className="plan-features text-left mt-4 mb-6">
                    <ul className="space-y-2">
                      <li>All Creative Cloud Apps</li>
                      <li>All AI features</li>
                      <li>100GB Cloud Storage</li>
                    </ul>
                  </div>
                  <button
                    className="select-btn w-full"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSelectedPrice(option.id);
                      selectedPriceRef.current = option.id;
                      setTimeout(() => {
                        const el = document.getElementById('checkout');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 10);
                    }}
                  >
                    {selectedPrice === option.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works py-20 bg-white">
        <div className="container">
          <div className={`section-heading text-center mb-12 stagger-item${stepsVisible ? ' visible' : ''}`}> 
            <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">How It Works</h2>
            <p className="text-lg text-gray-500">Getting your Adobe Creative Cloud subscription is simple and fast</p>
          </div>
          <div className="steps-container" ref={howItWorksRef}>
            <div className={`step stagger-item${stepsVisible ? ' visible' : ''}`}> 
              <div className="step-number">1</div>
              <h3>Choose a Plan</h3>
              <p>Select the subscription duration that best fits your needs.</p>
            </div>
            <div className={`step stagger-item delay-100${stepsVisible ? ' visible' : ''}`}> 
              <div className="step-number">2</div>
              <h3>Complete Purchase</h3>
              <p>Enter your email and pay securely with PayPal.</p>
            </div>
            <div className={`step stagger-item delay-200${stepsVisible ? ' visible' : ''}`}> 
              <div className="step-number">3</div>
              <h3>Receive Details</h3>
              <p>Get your Adobe account information delivered via email.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section className="checkout py-20 bg-[#f3f4f6]" id="checkout">
        <div className="container" ref={checkoutRef}>
          <div className={`section-heading text-center mb-12 stagger-item${checkoutVisible ? ' visible' : ''}`}> 
            <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">Complete Your Order</h2>
            <p className="text-lg text-gray-500">You're just moments away from accessing Adobe Creative Cloud</p>
              </div>
          <div className={`checkout-container flex flex-wrap gap-8 justify-center items-start stagger-item${checkoutVisible ? ' visible' : ''}`}>
            <div className="checkout-form w-full max-w-md">
              {/* Trust/Payment Widgets */}
              <form id="checkout-form" onSubmit={e => e.preventDefault()} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="email">Email Address {isUserSignedIn && <span className="text-[#10b981] text-xs">(Autofilled)</span>}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Where we'll send your account details"
                    value={email}
                    onChange={e => {
                      if (!isUserSignedIn) {
                        const val = e.target.value;
                        console.log(`[Input onChange] Setting email to: "${val}"`);
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
                  <label htmlFor="name">Name {isUserSignedIn && <span className="text-[#10b981] text-xs">(Autofilled)</span>}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={e => {
                      if (!isUserSignedIn) {
                        const val = e.target.value;
                        console.log(`[Input onChange] Setting name to: "${val}"`);
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
                    onLoad={handlePayPalLoad}
                    onError={handlePayPalError}
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
                {paymentStatus === 'success' && (
                  <div className="form-note bg-[#d1fae5] text-[#065f46] p-4 rounded-md">
                    Payment successful! Check your email for access details.
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
              {/* Trust Badge Below Form */}
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
              <p>Regular Price <span className="line-through text-gray-400">${selectedPriceOption.price * 4}</span></p>
              <p>Your Savings <span className="text-[#10b981]">{Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}%</span></p>
              <p>Total <span className="text-[#2c2d5a] font-bold">${selectedPriceOption.price}</span></p>
              <div className="trust-guarantee">
                <div className="guarantee-badge"><i className="fas fa-check" /> 100% Satisfaction Guarantee</div>
                <div className="guarantee-badge"><i className="fas fa-check" /> 24/7 Customer Support</div>
                <div className="guarantee-badge"><i className="fas fa-check" /> Email Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq py-20 bg-white" id="faq">
        <div className="container" ref={faqRef}>
          <div className={`section-heading text-center mb-12 stagger-item${faqVisible ? ' visible' : ''}`}> 
            <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-500">Quick answers to common questions about our Adobe Creative Cloud subscriptions</p>
          </div>
          <div className={`faq-accordion stagger-item${faqVisible ? ' visible' : ''}`}>
            {[
              {
                q: "How does cheapcc.online offer such low prices?",
                a: "As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 86% off compared to Adobe's official pricing while providing the same authentic product.",
              },
              {
                q: "Are these genuine Adobe Creative Cloud subscriptions?",
                a: "Yes, absolutely. You will receive genuine Adobe Creative Cloud accounts with full access to all Creative Cloud applications and services. The subscriptions include regular updates, cloud storage, and all the features you would get from purchasing directly from Adobe, but at a much lower price.",
              },
              {
                q: "How quickly will I receive my Adobe account details?",
                a: "In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We currently accept payments through PayPal, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card. This ensures your payment information is secure and protected.",
              },
              {
                q: "What is your refund policy?",
                a: "We offer a 7-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly.",
              },
            ].map((item, idx) => (
              <div
                key={item.q}
                className={`faq-item${openFaq === idx ? ' active' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                tabIndex={0}
                role="button"
                aria-expanded={openFaq === idx}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="faq-question">
                  <h3>{item.q}</h3>
                  <span className={`faq-icon${openFaq === idx ? ' open' : ''}`}><i className="fas fa-chevron-down" /></span>
                </div>
                <div
                  className={`faq-answer${openFaq === idx ? ' open' : ''}`}
                  style={{ maxHeight: openFaq === idx ? 300 : 0, opacity: openFaq === idx ? 1 : 0 }}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all-faqs text-center mt-10">
            <a href="/faq" className="btn btn-outline inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#b9a7d1] text-[#2c2d5a] font-semibold hover:bg-[#f3f4f6] transition">
              <span>View All FAQs</span> <i className="fas fa-arrow-right" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="testimonials" id="testimonials">
        <div className="container" ref={testimonialsRef}>
          <div className={`section-heading text-center mb-12 stagger-item${testimonialsVisible ? ' visible' : ''}`}> 
            <h2 className="mb-2">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-500" style={{ 
              color: '#4b5563', 
              fontWeight: 'normal',
              position: 'relative',
              zIndex: '2'
            }}>
              Real feedback from real users
            </p>
          </div>
          <div className={`testimonials-container stagger-item${testimonialsVisible ? ' visible' : ''}`}>
            <div className="testimonial-card" key={testimonialIdx}>
              <div className="testimonial-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className={`fas fa-star${i < TESTIMONIALS[testimonialIdx].rating ? '' : ' inactive'}`}></i>
                ))}
              </div>
              <div className="testimonial-text">{TESTIMONIALS[testimonialIdx].text}</div>
              <div className="testimonial-author">
                <div className="author-details">
                  <div className="author-name">{TESTIMONIALS[testimonialIdx].name}</div>
                  <div className="author-title">{TESTIMONIALS[testimonialIdx].title}</div>
                  <span className="verified-badge"><i className="fas fa-check-circle" /> Verified Buyer</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6 justify-center">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                className={`btn btn-outline${testimonialIdx === idx ? ' active' : ''}`}
                style={{ width: 12, height: 12, borderRadius: '50%', padding: 0, minWidth: 0, minHeight: 0, borderWidth: 2, borderColor: testimonialIdx === idx ? '#ff3366' : '#b9a7d1', background: testimonialIdx === idx ? '#ff3366' : 'transparent' }}
                aria-label={`Show testimonial ${idx + 1}`}
                onClick={() => setTestimonialIdx(idx)}
              />
            ))}
      </div>
    </div>
      </section>
    </main>
  );
}

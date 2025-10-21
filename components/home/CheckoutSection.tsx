// components/home/CheckoutSection.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getPricingOptions, getPriceForActivationType, isRedemptionCode, getActivationFee, isEmailActivationSubscription, type PricingOption } from '@/utils/products-supabase';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import { motion, useInView, Variants, AnimatePresence, PanInfo } from 'framer-motion';
import StripePaymentForm from './StripePaymentForm';
import PayPalPaymentForm from './PayPalPaymentForm';
import PayPalErrorBoundary from '../PayPalErrorBoundary';
import { useRouter } from 'next/navigation';
import { useInternationalization } from '@/contexts/InternationalizationContext';
import Script from 'next/script';
import { validateAdobeEmail, getEmailErrorMessage, getEmailSuggestions, type EmailValidationResult } from '@/utils/email-validation';
import { trackGoogleAdsConversion } from '@/utils/analytics';

// Success message component to show after successful payment
const PaymentSuccessMessage = ({ email }: { email: string }) => {
  console.log('🎉 PaymentSuccessMessage rendering with email:', email);
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-md p-8 border border-white/10 shadow-2xl"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-check-circle text-green-400 text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-gray-300 mb-6">Thank you for your purchase.</p>
        
        <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-300 mb-2">
            <i className="fas fa-envelope mr-2 text-fuchsia-400"></i>
            We've sent an order confirmation to:
          </p>
          <p className="text-white font-medium truncate">{email}</p>
        </div>
        
        <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg text-left mb-6">
          <h3 className="font-medium text-blue-300 flex items-center gap-2 mb-1">
            <i className="fas fa-info-circle"></i>What happens next?
          </h3>
          <p className="text-blue-200/80 text-sm">
            You'll receive an email with your login details and instructions within 24 hours. Please check your inbox (including spam/junk folders).
          </p>
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-semibold rounded-lg transition hover:shadow-lg"
        >
          Return to Homepage
        </button>
      </div>
    </motion.div>
  </div>
  );
};

// Simple requestIdleCallback polyfill - IMPORTANT: Must be outside the component
const scheduleIdleTask = (callback: Function): any => {
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(() => callback());
    }
    return setTimeout(() => callback(), 1);
  }
  return setTimeout(() => callback(), 1);
};

const cancelIdleTask = (id: any): void => {
  if (typeof window !== 'undefined') {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  } else {
    clearTimeout(id);
  }
};

// --- Reusable Interfaces ---
interface TimeInfo {
  currentTime: Date;
  expiryTime: Date | null;
  timezone: string | null;
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
  paypalButtonContainerRef: React.RefObject<HTMLDivElement>;
  sdkReady?: boolean;
  onPayPalLoad?: () => void;
  onPayPalError?: () => void;
  renderPayPalButton?: () => void;
  clientSecret: string | null;
  selectedActivationType?: 'pre-activated' | 'email-activation';
  adobeEmail?: string;
  createPayPalOrderWithRetry?: (
    selectedPrice: string, 
    name: string, 
    email: string, 
    maxRetries?: number
  ) => Promise<string>;
  onRefreshPaymentIntent?: () => void;
  onPaymentSuccess?: (details: any) => void;
  onPaymentError?: (error: string) => void;
}

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function CheckoutSection({
  selectedPrice, isUserSignedIn, name, setName, email, setEmail, canPay,
  paymentStatus, setPaymentStatus, checkoutFormError, setCheckoutFormError,
  paypalButtonContainerRef, sdkReady, onPayPalLoad, onPayPalError,
  renderPayPalButton, clientSecret, selectedActivationType, adobeEmail,
  createPayPalOrderWithRetry, onRefreshPaymentIntent, onPaymentSuccess, onPaymentError,
}: CheckoutSectionProps) {
  
  // Get internationalization context
  const { formatLocalPrice, countryConfig } = useInternationalization();
  // --- Refs and Hooks ---
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px 0px" });

  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal'>('stripe');
  const [timeInfo, setTimeInfo] = useState<TimeInfo>({ currentTime: new Date(), expiryTime: null, timezone: 'UTC', isLoading: true });
  
  // Pricing options - loaded immediately
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  
  // State for activation fee
  const [activationFee, setActivationFee] = useState<number>(0);
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Adobe email validation state
  const [adobeEmailValidation, setAdobeEmailValidation] = useState<EmailValidationResult | null>(null);
  
  // Track screen size to determine which view to render
  const [isMobile, setIsMobile] = useState(false);
  
  // Force re-render when country changes for real-time price updates
  const [, forceUpdate] = useState({});
  
  const stripe = useStripe();
  const elements = useElements();
  
  // Memoize form validation to avoid recalculating on every render
  const isFormValid = useMemo(() => {
    const basicValidation = name.trim() !== '' && isValidEmail(email) && !nameError && !emailError;
    
    // For email-activation, also validate Adobe email
    if (selectedActivationType === 'email-activation') {
      return basicValidation && adobeEmailValidation?.isValid === true;
    }
    
    return basicValidation;
  }, [name, email, nameError, emailError, selectedActivationType, adobeEmailValidation]);

  const router = useRouter();

  // Detect mobile view with stable callback
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  // Detect mobile view
  useEffect(() => {
    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Listen for country changes to update prices in real-time
  useEffect(() => {
    const handleCountryChange = () => {
      forceUpdate({}); // Force re-render to update prices with new currency
    };

    window.addEventListener('countryChanged', handleCountryChange);
    return () => window.removeEventListener('countryChanged', handleCountryChange);
  }, []);

  // Fetch pricing options from Supabase immediately
  useEffect(() => {
    const fetchPricingOptions = async () => {
      try {
        const options = await getPricingOptions();
        setPricingOptions(options);
      } catch (error) {
        console.error('Failed to fetch pricing options:', error);
        setPricingOptions([]);
      }
    };

    fetchPricingOptions();
  }, []);

  // --- Real-time Validation Effect ---
  useEffect(() => {
    // Defer validation to idle time
    const validationId = scheduleIdleTask(() => {
      if (name.length > 0 && name.trim().length === 0) setNameError("Name cannot be only spaces.");
      else if (name.length > 50) setNameError("Name must be 50 characters or less.");
      else setNameError(null);
    });
    
    return () => cancelIdleTask(validationId);
  }, [name]);

  useEffect(() => {
    // Defer validation to idle time
    const validationId = scheduleIdleTask(() => {
      if (email.length > 0 && !isValidEmail(email)) setEmailError("Please enter a valid email address.");
      else setEmailError(null);
    });
    
    return () => cancelIdleTask(validationId);
  }, [email]);

  // --- Effects for PayPal and Timezone ---
  // NOTE: PayPal button rendering is now handled by PayPalPaymentForm component
  // This effect was interfering with the new PayPal context system
  // useEffect(() => {
  //   const container = paypalButtonContainerRef.current;
  //   if (container && activeTab === 'paypal' && sdkReady && canPay && isInView) {
  //     renderPayPalButton?.();
  //     container.style.display = 'block';
  //   } else if (container) {
  //     container.style.display = 'none';
  //   }
  // }, [sdkReady, canPay, isInView, renderPayPalButton, paypalButtonContainerRef, activeTab]);

  // Optimize expiry date calculation using memoization
  const calculateExpiryDate = useCallback((priceId: string): Date => {
    const now = new Date();
    const currentPriceOption = pricingOptions.find(option => option.id === priceId) || pricingOptions[0];
    if (!currentPriceOption) return now; // Fallback if no pricing option found
    
    console.log('Calculating expiry date for:', { priceId, duration: currentPriceOption.duration });
    
    let expiryDate = new Date();
    const durationValue = parseInt(currentPriceOption.duration);
    
    console.log('Parsed duration value:', durationValue);

    if (currentPriceOption.duration.includes('month')) {
      // Use a more accurate method to add months
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();
      
      // Calculate the target month and year
      const targetMonth = currentMonth + durationValue;
      const targetYear = currentYear + Math.floor(targetMonth / 12);
      const finalMonth = targetMonth % 12;
      
      // Create the new date, handling month-end edge cases
      expiryDate = new Date(targetYear, finalMonth, currentDay);
      
      // If the day doesn't exist in the target month (e.g., Jan 31 -> Feb 31), 
      // set to the last day of the target month
      if (expiryDate.getDate() !== currentDay) {
        expiryDate = new Date(targetYear, finalMonth + 1, 0);
      }
      
      console.log('Added months:', durationValue, 'New date:', expiryDate);
    } else if (currentPriceOption.duration.includes('year')) {
      expiryDate = new Date(now.getFullYear() + durationValue, now.getMonth(), now.getDate());
    } else if (currentPriceOption.duration.includes('day')) {
      expiryDate = new Date(now.getTime() + (durationValue * 24 * 60 * 60 * 1000));
    }
    
    return expiryDate;
  }, [pricingOptions]);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const now = new Date();
    const expiryDate = calculateExpiryDate(selectedPrice);
    
    setTimeInfo({ currentTime: now, expiryTime: expiryDate, timezone, isLoading: false });

    // Less frequent interval to reduce CPU usage
    const timer = setInterval(() => setTimeInfo(prev => ({ ...prev, currentTime: new Date() })), 60000);
    return () => clearInterval(timer);
  }, [selectedPrice, calculateExpiryDate]);

  // --- Form Submission Logic with useCallback ---
  const handleStripeSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !isFormValid || !clientSecret) return;

    setCheckoutFormError(null);
    setPaymentStatus('loading');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setCheckoutFormError(submitError.message || "An error occurred.");
        setPaymentStatus('error');
        return;
      }
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements, 
        clientSecret,
        confirmParams: {
          // We still need return_url for redirect fallback, but we'll process success in-page
          return_url: window.location.href, // Redirect back to the same page if needed
          receipt_email: email,
          payment_method_data: { billing_details: { name, email } }
        },
        redirect: 'if_required', // Only redirect if the payment requires additional steps
      });

      if (error) {
        // Handle specific Stripe errors
        if (error.code === 'payment_intent_unexpected_state' || 
            error.message?.includes('No such payment_intent') ||
            error.message?.includes('payment_intent')) {
          setCheckoutFormError('Payment session expired. Please refresh the page and try again.');
        } else {
          setCheckoutFormError(error.message || "An unexpected error occurred.");
        }
        setPaymentStatus('error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful, show success message by setting status
        try {
          trackGoogleAdsConversion(finalPrice, countryConfig.currency, paymentIntent.id);
        } catch {}
        setPaymentStatus('success');
      }
    } catch (error: any) {
      console.error("Payment submission error:", error);
      setCheckoutFormError(error?.message || "An unexpected error occurred.");
      setPaymentStatus('error');
    }
  }, [
    stripe, 
    elements, 
    clientSecret, 
    email, 
    name, 
    setCheckoutFormError, 
    setPaymentStatus,
    isFormValid
  ]);
  
  // --- Constants and Framer Motion Variants ---
  const selectedPriceOption = useMemo(() => 
    pricingOptions.find(option => option.id === selectedPrice) || pricingOptions[0] || null,
    [selectedPrice, pricingOptions]
  );

  const finalPrice = useMemo(() => {
    // The base price already includes the activation fee, so don't add it again
    return getPriceForActivationType(selectedPriceOption);
  }, [selectedPriceOption]);

  // Calculate activation fee when selected price option changes
  useEffect(() => {
    const calculateActivationFee = async () => {
      if (selectedPriceOption && isEmailActivationSubscription(selectedPriceOption)) {
        try {
          const fee = await getActivationFee(selectedPriceOption.id);
          setActivationFee(fee);
        } catch (error) {
          console.error('Failed to calculate activation fee:', error);
          setActivationFee(0);
        }
      } else {
        setActivationFee(0);
      }
    };

    calculateActivationFee();
  }, [selectedPriceOption]);

  // Adobe email validation
  useEffect(() => {
    if (!adobeEmail || adobeEmail.trim() === '') {
      setAdobeEmailValidation(null);
      return;
    }

    const validation = validateAdobeEmail(adobeEmail);
    setAdobeEmailValidation(validation);
  }, [adobeEmail]);

  // Professional guidance for missing Adobe email
  const isAdobeEmailRequired = selectedActivationType === 'email-activation';
  const isAdobeEmailMissing = isAdobeEmailRequired && (!adobeEmail || !adobeEmailValidation?.isValid);
  const showAdobeEmailGuidance = isAdobeEmailMissing;
  
  const containerVariants: Variants = useMemo(() => ({ 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } } 
  }), []);
  
  const itemVariants: Variants = useMemo(() => ({ 
    hidden: { opacity: 0, y: 30 }, 
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } 
  }), []);
  
  const TABS = useMemo(() => [
    { id: 'stripe', label: 'Card', icon: 'fas fa-credit-card' }, 
    { id: 'paypal', label: 'PayPal', icon: 'fab fa-paypal' }
  ], []);

  // Mobile card variants
  // Mobile specific variants
  const mobileCardVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }), []);
  
  // Render mobile/tablet card switcher with swipe functionality
  const renderMobileCardSwitcher = useCallback(() => {
    return (
      <div className="relative w-full max-w-lg mx-auto md:hidden">
        <motion.div 
          variants={itemVariants}
          className="w-full bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black/40 border border-white/20"
        >
          {/* Unified Checkout Form - Mobile/Tablet */}
          
          {/* Section 1: Billing Information */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-user text-fuchsia-400 text-sm"></i>
            </div>
            <h3 className="text-lg font-semibold text-white">Billing Information</h3>
          </div>
          <div className="space-y-8 mb-10">
            <div>
              <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-xl blur transition duration-300 ${nameError ? 'bg-red-500 opacity-75' : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-focus-within:opacity-75'}`}></div>
                <i className="far fa-user text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"></i>
                <input type="text" id="name-checkout-mobile" required value={name} disabled={isUserSignedIn}
                  onChange={e => !isUserSignedIn && setName(e.target.value)}
                  className={`relative w-full px-5 py-4 pl-12 border-2 rounded-xl bg-gray-800/50 focus:outline-none transition-all duration-300 text-white text-base ${nameError ? 'border-red-500 bg-red-500/10' : 'border-white/20 focus:border-fuchsia-400/50 focus:bg-gray-700/50'} ${isUserSignedIn ? 'cursor-not-allowed bg-gray-700/30' : ''}`}
                />
                <label htmlFor="name-checkout-mobile" className={`absolute left-12 transition-all duration-300 pointer-events-none ${name || isUserSignedIn ? '-top-3 left-0' : 'top-4'} text-${name || isUserSignedIn ? 'sm' : 'base'} ${nameError ? 'text-red-400' : 'text-gray-400 group-focus-within:-top-3 group-focus-within:text-sm group-focus-within:left-0 group-focus-within:text-fuchsia-400'}`}>Full Name</label>
                {isUserSignedIn && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="bg-gradient-to-r from-green-500 to-cyan-500 text-xs text-black font-medium py-0.5 px-2 rounded-full flex items-center gap-1">
                      <i className="fas fa-check text-[10px]"></i> Auto-filled
                    </span>
                  </div>
                )}
              </div>
              <AnimatePresence>
                {nameError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i>{nameError}</motion.p>}
              </AnimatePresence>
            </div>
            <div>
              <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-xl blur transition duration-300 ${emailError ? 'bg-red-500 opacity-75' : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-focus-within:opacity-75'}`}></div>
                <i className="far fa-envelope text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"></i>
                <input type="email" id="email-checkout-mobile" required value={email} disabled={isUserSignedIn}
                  onChange={e => !isUserSignedIn && setEmail(e.target.value)}
                  className={`relative w-full px-5 py-4 pl-12 border-2 rounded-xl bg-gray-800/50 focus:outline-none transition-all duration-300 text-white text-base ${emailError ? 'border-red-500 bg-red-500/10' : 'border-white/20 focus:border-fuchsia-400/50 focus:bg-gray-700/50'} ${isUserSignedIn ? 'cursor-not-allowed bg-gray-700/30' : ''}`}
                />
                <label htmlFor="email-checkout-mobile" className={`absolute left-12 transition-all duration-300 pointer-events-none ${email || isUserSignedIn ? '-top-3 left-0' : 'top-4'} text-${email || isUserSignedIn ? 'sm' : 'base'} ${emailError ? 'text-red-400' : 'text-gray-400 group-focus-within:-top-3 group-focus-within:text-sm group-focus-within:left-0 group-focus-within:text-fuchsia-400'}`}>Email Address</label>
                {isUserSignedIn && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="bg-gradient-to-r from-green-400 to-cyan-400 text-xs text-black font-medium py-0.5 px-2 rounded-full flex items-center gap-1">
                      <i className="fas fa-check text-[10px]"></i> Auto-filled
                    </span>
                  </div>
                )}
              </div>
              <AnimatePresence>
                {emailError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i>{emailError}</motion.p>}
              </AnimatePresence>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-6"></div>

          {/* Section 2: Payment - Conditionally show locked state or payment form */}
          <AnimatePresence>
            {!isFormValid ? (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-black/30 border border-white/10 rounded-lg p-4 mb-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                    <motion.i 
                      className="fas fa-lock text-fuchsia-400 text-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.i>
                  </div>
                  <div>
                    <p className="text-white font-medium">Payment Options</p>
                    <p className="text-gray-400 text-sm">
                      {!name.trim() && !isValidEmail(email) ? 'Enter your name and email to unlock payment' : 
                       !name.trim() ? 'Enter your name to unlock payment' : 
                       !isValidEmail(email) ? 'Enter a valid email to unlock payment' : 
                       'Validating your information...'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-credit-card text-green-400 text-sm"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Payment Method</h3>
                </div>
                <div className="flex border-b border-white/10 mb-6">
                  {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as 'stripe' | 'paypal')} className="flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative text-gray-400 hover:text-white">
                      {activeTab === tab.id && <motion.div layoutId="active-payment-tab-mobile" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500" />}
                      <i className={`${tab.icon} ${activeTab === tab.id ? 'text-fuchsia-400' : ''}`}></i>
                      <span className={`${activeTab === tab.id ? 'text-white' : ''}`}>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Enterprise-grade guidance for missing Adobe email */}
                {showAdobeEmailGuidance && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      duration: 0.6
                    }}
                    className="relative z-[60] mb-8 overflow-hidden"
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-red-400/30 rounded-2xl blur-xl transform scale-105"></div>
                    
                    {/* Main alert container */}
                    <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border border-amber-400/40 rounded-2xl p-6 shadow-2xl">
                      {/* Subtle top border accent */}
                      <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                      
                      <div className="flex items-start gap-5">
                        {/* Enhanced icon with animation */}
                        <div className="relative flex-shrink-0">
                          <motion.div 
                            className="w-12 h-12 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded-xl flex items-center justify-center ring-1 ring-amber-400/30 shadow-lg"
                            animate={{ 
                              scale: [1, 1.05, 1],
                              rotate: [0, 2, -2, 0]
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                            }}
                          >
                            <i className="fab fa-adobe text-amber-300 text-xl"></i>
                          </motion.div>
                          
                          {/* Pulse indicator */}
                          <motion.div
                            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [1, 0.7, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          {/* Professional header */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-semibold text-lg">
                                Adobe Account Required
                              </h3>
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full border border-amber-400/30">
                                Action Needed
                              </span>
                            </div>
                            <p className="text-amber-200/80 text-xs font-medium tracking-wide uppercase">
                              Use Your Email Setup
                            </p>
                          </div>
                          
                          {/* Enhanced description */}
                          <div className="md:space-y-3 space-y-2">
                            <p className="text-gray-200 text-sm md:leading-relaxed">
                              <span className="hidden md:inline">
                                {adobeEmail && adobeEmailValidation && !adobeEmailValidation.isValid 
                                  ? `Please fix the email validation issue: ${getEmailErrorMessage(adobeEmailValidation)}`
                                  : `To proceed with Use Your Email, please provide your Adobe Creative Cloud account email address in the pricing section above.`
                                }
                              </span>
                              <span className="md:hidden">
                                {adobeEmail && adobeEmailValidation && !adobeEmailValidation.isValid 
                                  ? `Please fix the email validation issue: ${getEmailErrorMessage(adobeEmailValidation)}`
                                  : 'Please enter your Adobe account email in the pricing section above.'
                                }
                              </span>
                            </p>
                            
                            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg">
                              <i className="fas fa-info-circle text-amber-400 text-sm mt-0.5 flex-shrink-0 hidden md:inline"></i>
                              <p className="text-amber-100/90 md:text-xs text-xs md:leading-relaxed">
                                <span className="font-medium hidden md:inline">Why is this needed?</span> 
                                <span className="hidden md:inline">We'll add the subscription directly to your existing Adobe account, 
                                preserving all your settings, files, and preferences.</span>
                                <span className="md:hidden">We'll add the subscription directly to your existing Adobe account.</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Professional CTA buttons */}
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => {
                                const pricingSection = document.querySelector('#pricing');
                                if (pricingSection) {
                                  pricingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 group transform hover:scale-105"
                            >
                              <i className="fas fa-arrow-up group-hover:transform group-hover:-translate-y-0.5 transition-transform duration-200"></i>
                              <span>Complete Setup</span>
                            </button>
                            
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <i className="fas fa-clock"></i>
                              <span>Takes 30 seconds</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>                 
                    {activeTab === 'stripe' ? (
                      <StripePaymentForm 
                        containerId="mobile-stripe-container"
                        handleSubmit={handleStripeSubmit}
                        paymentStatus={paymentStatus}
                        stripe={stripe}
                        elements={elements}
                        isFormValid={isFormValid}
                        clientSecret={clientSecret}
                      />
                    ) : (
                      <PayPalPaymentForm 
                        selectedProduct={{ id: selectedPrice, activationType: selectedActivationType }}
                        email={email}
                        onPaymentSuccess={(details) => {
                          console.log('🎯 CheckoutSection MOBILE: PayPal onPaymentSuccess called with details:', details);
                          console.log('🎯 CheckoutSection MOBILE: Setting payment status to "success"');
                          console.log('🎯 CheckoutSection MOBILE: Current paymentStatus before set:', paymentStatus);
                          
                          // Fire Ads conversion and then set success
                          try {
                            const transactionId = details?.id || details?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
                            trackGoogleAdsConversion(finalPrice, countryConfig.currency, transactionId);
                          } catch {}
                          setPaymentStatus('success');
                          
                          // Also call the parent callback
                          onPaymentSuccess?.(details);
                          
                          console.log('🎯 CheckoutSection MOBILE: Payment success callback completed');
                        }}
                        onPaymentError={(error) => {
                          console.log('❌ CheckoutSection MOBILE: PayPal onPaymentError called:', error);
                          setPaymentStatus('error');
                          setCheckoutFormError(error);
                          onPaymentError?.(error);
                        }}
                        isProcessing={paymentStatus === 'loading'}
                        setIsProcessing={(processing) => setPaymentStatus(processing ? 'loading' : 'idle')}
                        containerId="mobile-paypal-container"
                        createPayPalOrderWithRetry={createPayPalOrderWithRetry}
                        adobeEmail={adobeEmail}
                        name={name}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                {checkoutFormError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-sm text-red-300 gap-2">
                    <i className="fas fa-exclamation-circle text-red-400"></i>
                    <span className="flex-1">{checkoutFormError}</span>
                    {(checkoutFormError.includes('Payment session expired') || 
                      checkoutFormError.includes('Payment service') || 
                      checkoutFormError.includes('timeout') ||
                      checkoutFormError.includes('Failed to initialize')) && onRefreshPaymentIntent && (
                      <button
                        onClick={() => {
                          setCheckoutFormError(null);
                          onRefreshPaymentIntent();
                        }}
                        className="ml-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-xs font-medium transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="border-t border-white/10 my-6"></div>

          {/* Section 3: Order Summary */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-receipt text-blue-400 text-sm"></i>
            </div>
            <h3 className="text-lg font-semibold text-white">Order Summary</h3>
          </div>
          <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 mb-4">
            <i className="fas fa-clock text-fuchsia-400 text-xs"></i>
            <span className="text-xs font-medium text-fuchsia-400">Limited Time Offer</span>
          </div>
          <div className="space-y-3 pb-4 border-b border-dashed border-white/10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Product</span>
              <span className="text-xs text-gray-200 text-right max-w-[200px]">
                {selectedPriceOption?.originalName || 'Loading...'}
              </span>
            </div>
          </div>
          {!isRedemptionCode(selectedPriceOption) && (
            <div className="space-y-3 py-4 border-b border-dashed border-white/10">
              <h4 className="text-sm font-semibold text-gray-200">Billing Details</h4>
              {timeInfo.isLoading ? (
                <div className="flex items-center justify-center"><div className="h-4 w-4 border-2 border-gray-600 border-t-fuchsia-500 rounded-full animate-spin"></div></div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Billed on</span><span className="font-medium text-gray-300">{format(timeInfo.currentTime, 'MMMM d, yyyy')}</span></div>
                  <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Expires on</span><span className="font-medium text-gray-300">{timeInfo.expiryTime ? format(timeInfo.expiryTime, 'MMMM d, yyyy') : 'N/A'}</span></div>
                </>
              )}
            </div>
          )}
            <div className="space-y-3 text-sm py-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Regular Price</span>
                <span className="line-through text-gray-500">
                  {selectedPriceOption ? formatLocalPrice(selectedPriceOption.originalPrice ? selectedPriceOption.originalPrice : (selectedPriceOption.price * 4)) : 'Loading...'}
                </span>
              </div>
              {isEmailActivationSubscription(selectedPriceOption) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Activation Fee</span>
                  <span className="text-gray-300">
                    {formatLocalPrice(activationFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Discount <span className="text-fuchsia-400 text-xs font-medium">(Limited Time)</span></span>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                  {selectedPriceOption ? (selectedPriceOption.originalPrice ? 
                    Math.round((1 - selectedPriceOption.price / selectedPriceOption.originalPrice) * 100) : 
                    Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)) : 0}% OFF
                </div>
              </div>
            </div>
          <div className="pt-5 flex justify-between items-baseline">
            <span className="text-base font-semibold text-gray-200">Amount Due Today</span>
            <div className="flex items-baseline">
              <motion.span 
                key={`${selectedPrice}-${selectedActivationType}-${countryConfig.currency}`}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {formatLocalPrice(finalPrice)}
              </motion.span>
              <span className="ml-1 text-xs text-gray-400">{countryConfig.currency}</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }, [
    itemVariants, 
    isUserSignedIn, 
    isFormValid, 
    activeTab,
    setActiveTab,
    handleStripeSubmit,
    paymentStatus,
    setPaymentStatus,
    stripe,
    elements,
    clientSecret,
    checkoutFormError,
    setCheckoutFormError,
    TABS,
    timeInfo,
    selectedPriceOption,
    paypalButtonContainerRef,
    onPayPalLoad,
    onPayPalError,
    selectedPrice,
    createPayPalOrderWithRetry,
    finalPrice,
    selectedActivationType,
    formatLocalPrice,
    countryConfig.currency
  ]);

  // Desktop view components
  const renderDesktopBillingCard = useCallback(() => (
    <motion.div 
      variants={itemVariants}
      className="w-full max-w-md bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/20 border border-white/10"
    >
      <h3 className="text-xl font-semibold text-white mb-10">Billing Information</h3>
      <div className="space-y-6 mb-8">
        <div>
          <div className="relative group">
            <div className={`absolute -inset-0.5 rounded-lg blur transition duration-300 ${nameError ? 'bg-red-500 opacity-75' : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-focus-within:opacity-75'}`}></div>
            <i className="far fa-user text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"></i>
            <input type="text" id="name-checkout" required value={name} disabled={isUserSignedIn}
              onChange={e => !isUserSignedIn && setName(e.target.value)}
              className={`relative w-full px-4 py-3 pl-10 border-b-2 bg-black/20 focus:outline-none transition text-white ${nameError ? 'border-red-500' : 'border-white/20 focus:border-fuchsia-400/50'} ${isUserSignedIn ? 'cursor-not-allowed bg-black/30' : ''}`}
            />
            <label htmlFor="name-checkout" className={`absolute left-10 transition-all duration-300 pointer-events-none ${name || isUserSignedIn ? '-top-5 left-0' : 'top-3'} text-${name || isUserSignedIn ? 'xs' : 'base'} ${nameError ? 'text-red-400' : 'text-gray-400 group-focus-within:-top-5 group-focus-within:text-xs group-focus-within:left-0 group-focus-within:text-fuchsia-400'}`}>Full Name</label>
            {isUserSignedIn && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <span className="bg-gradient-to-r from-green-500 to-cyan-500 text-xs text-black font-medium py-0.5 px-2 rounded-full flex items-center gap-1">
                  <i className="fas fa-check text-[10px]"></i> Auto-filled
                </span>
              </div>
            )}
          </div>
          <AnimatePresence>
            {nameError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i>{nameError}</motion.p>}
          </AnimatePresence>
        </div>
        <div>
          <div className="relative group">
            <div className={`absolute -inset-0.5 rounded-lg blur transition duration-300 ${emailError ? 'bg-red-500 opacity-75' : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-focus-within:opacity-75'}`}></div>
            <i className="far fa-envelope text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"></i>
            <input type="email" id="email-checkout" required value={email} disabled={isUserSignedIn}
              onChange={e => !isUserSignedIn && setEmail(e.target.value)}
              className={`relative w-full px-4 py-3 pl-10 border-b-2 bg-black/20 focus:outline-none transition text-white ${emailError ? 'border-red-500' : 'border-white/20 focus:border-fuchsia-400/50'} ${isUserSignedIn ? 'cursor-not-allowed bg-black/30' : ''}`}
            />
            <label htmlFor="email-checkout" className={`absolute left-10 transition-all duration-300 pointer-events-none ${email || isUserSignedIn ? '-top-5 left-0' : 'top-3'} text-${email || isUserSignedIn ? 'xs' : 'base'} ${emailError ? 'text-red-400' : 'text-gray-400 group-focus-within:-top-5 group-focus-within:text-xs group-focus-within:left-0 group-focus-within:text-fuchsia-400'}`}>Email Address</label>
            {isUserSignedIn && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <span className="bg-gradient-to-r from-green-400 to-cyan-400 text-xs text-black font-medium py-0.5 px-2 rounded-full flex items-center gap-1">
                  <i className="fas fa-check text-[10px]"></i> Auto-filled
                </span>
              </div>
            )}
          </div>
          <AnimatePresence>
            {emailError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i>{emailError}</motion.p>}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="relative">
        <AnimatePresence>
          {!isFormValid && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <i className="fas fa-lock text-2xl text-gray-400"></i>
              </motion.div>
              <p className="text-sm font-semibold text-gray-200">Enter your details to proceed</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <h3 className="text-xl font-semibold text-white mb-4">Payment Method</h3>
        <div className="flex border-b border-white/10 mb-6">
          {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as 'stripe' | 'paypal')} className="flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative text-gray-400 hover:text-white">
                  {activeTab === tab.id && <motion.div layoutId="active-payment-tab-desktop" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500" />}
                  <i className={`${tab.icon} ${activeTab === tab.id ? 'text-fuchsia-400' : ''}`}></i>
                  <span className={`${activeTab === tab.id ? 'text-white' : ''}`}>{tab.label}</span>
              </button>
          ))}
        </div>

        {/* Enterprise-grade guidance for missing Adobe email */}
        {showAdobeEmailGuidance && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.6
            }}
            className="relative z-[60] mb-8 overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-red-400/30 rounded-2xl blur-xl transform scale-105"></div>
            
            {/* Main alert container */}
            <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border border-amber-400/40 rounded-2xl p-6 shadow-2xl">
              {/* Subtle top border accent */}
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              
              <div className="flex items-start gap-5">
                {/* Enhanced icon with animation */}
                <div className="relative flex-shrink-0">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded-xl flex items-center justify-center ring-1 ring-amber-400/30 shadow-lg"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <i className="fab fa-adobe text-amber-300 text-xl"></i>
                  </motion.div>
                  
                  {/* Pulse indicator */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                
                <div className="flex-1 space-y-3">
                  {/* Streamlined header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-base">
                        Adobe Account Required
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full border border-amber-400/30">
                        Setup Required
                      </span>
                    </div>
                  </div>
                  
                  {/* Concise description */}
                  <p className="text-gray-300 text-sm">
                    {adobeEmail && adobeEmailValidation && !adobeEmailValidation.isValid 
                      ? `Please fix the email validation issue: ${getEmailErrorMessage(adobeEmailValidation)}`
                      : 'Please enter your Adobe account email in the pricing section above to link your subscription.'
                    }
                  </p>
                  
                  {/* Compact action button */}
                  <button
                    onClick={() => {
                      const pricingSection = document.querySelector('#pricing');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
                  >
                    <i className="fas fa-arrow-up text-xs group-hover:transform group-hover:-translate-y-0.5 transition-transform duration-200"></i>
                    <span>Complete Setup</span>
                    <span className="text-xs opacity-75 ml-1">(30s)</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'stripe' ? (
              <StripePaymentForm 
                containerId="desktop-stripe-container"
                handleSubmit={handleStripeSubmit}
                paymentStatus={paymentStatus}
                stripe={stripe}
                elements={elements}
                isFormValid={isFormValid}
                clientSecret={clientSecret}
              />
            ) : (
              <PayPalErrorBoundary>
                <PayPalPaymentForm 
                  selectedProduct={{ id: selectedPrice, activationType: selectedActivationType }}
                  email={email}
                  onPaymentSuccess={(details) => {
                    console.log('🎯 CheckoutSection: PayPal onPaymentSuccess called with details:', details);
                    console.log('🎯 CheckoutSection: Setting payment status to "success"');
                    console.log('🎯 CheckoutSection: Current paymentStatus before set:', paymentStatus);
                    
                    // Fire Ads conversion and then set success
                    try {
                      const transactionId = details?.id || details?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
                      trackGoogleAdsConversion(finalPrice, countryConfig.currency, transactionId);
                    } catch {}
                    setPaymentStatus('success');
                    
                    // Also call the parent callback
                    onPaymentSuccess?.(details);
                    
                    console.log('🎯 CheckoutSection: Payment success callback completed');
                  }}
                  onPaymentError={(error) => {
                    console.log('❌ CheckoutSection: PayPal onPaymentError called:', error);
                    setPaymentStatus('error');
                    setCheckoutFormError(error);
                    onPaymentError?.(error);
                  }}
                  isProcessing={paymentStatus === 'loading'}
                  setIsProcessing={(processing) => setPaymentStatus(processing ? 'loading' : 'idle')}
                  containerId="desktop-paypal-container"
                  createPayPalOrderWithRetry={createPayPalOrderWithRetry}
                  adobeEmail={adobeEmail}
                  name={name}
                />
              </PayPalErrorBoundary>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {checkoutFormError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-sm text-red-300 gap-2">
          <i className="fas fa-exclamation-circle text-red-400"></i>
          <span className="flex-1">{checkoutFormError}</span>
          {(checkoutFormError.includes('Payment session expired') || 
            checkoutFormError.includes('Payment service') || 
            checkoutFormError.includes('timeout') ||
            checkoutFormError.includes('Failed to initialize')) && onRefreshPaymentIntent && (
            <button
              onClick={() => {
                setCheckoutFormError(null);
                onRefreshPaymentIntent();
              }}
              className="ml-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-xs font-medium transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </motion.div>
  ), [
    itemVariants, 
    isUserSignedIn, 
    isFormValid, 
    activeTab, 
    handleStripeSubmit, 
    paymentStatus, 
    stripe, 
    elements, 
    clientSecret, 
    checkoutFormError, 
    TABS,
    setActiveTab,
    selectedPrice,
    createPayPalOrderWithRetry,
    setPaymentStatus,
    setCheckoutFormError,
    paypalButtonContainerRef,
    onPayPalLoad,
    onPayPalError,
    formatLocalPrice,
    countryConfig.currency
  ]);

  const renderDesktopSummaryCard = useCallback(() => (
    <motion.div 
      variants={itemVariants} 
      className="w-full max-w-sm bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl shadow-black/20 border border-white/10"
    >
      <h3 className="text-xl font-semibold text-white mb-1">Order Summary</h3>
      <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 mt-2 mb-4">
        <i className="fas fa-clock text-fuchsia-400 text-xs"></i>
        <span className="text-xs font-medium text-fuchsia-400">Limited Time Offer</span>
      </div>
      <div className="space-y-3 pb-4 border-b border-dashed border-white/10">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Product</span>
          <span className="text-xs text-gray-200 text-right max-w-[200px]">
            {selectedPriceOption?.originalName || 'Loading...'}
          </span>
        </div>
      </div>
      {!isRedemptionCode(selectedPriceOption) && (
        <div className="space-y-3 py-4 border-b border-dashed border-white/10">
          <h4 className="text-sm font-semibold text-gray-200">Billing Details</h4>
          {timeInfo.isLoading ? (
            <div className="flex items-center justify-center"><div className="h-4 w-4 border-2 border-gray-600 border-t-fuchsia-500 rounded-full animate-spin"></div></div>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Billed on</span><span className="font-medium text-gray-300">{format(timeInfo.currentTime, 'MMMM d, yyyy')}</span></div>
              <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Expires on</span><span className="font-medium text-gray-300">{timeInfo.expiryTime ? format(timeInfo.expiryTime, 'MMMM d, yyyy') : 'N/A'}</span></div>
            </>
          )}
        </div>
      )}
      <div className="space-y-3 text-sm py-4 border-b border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Regular Price</span>
          <span className="line-through text-gray-500">
            {selectedPriceOption ? formatLocalPrice(selectedPriceOption.originalPrice ? selectedPriceOption.originalPrice : (selectedPriceOption.price * 4)) : 'Loading...'}
          </span>
        </div>
        {isEmailActivationSubscription(selectedPriceOption) && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Activation Fee</span>
            <span className="text-gray-300">
              {formatLocalPrice(activationFee)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Discount <span className="text-fuchsia-400 text-xs font-medium">(Limited Time)</span></span>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
            {selectedPriceOption ? (selectedPriceOption.originalPrice ? 
              Math.round((1 - selectedPriceOption.price / selectedPriceOption.originalPrice) * 100) : 
              Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)) : 0}% OFF
          </div>
        </div>
      </div>
      <div className="pt-5 flex justify-between items-baseline">
        <span className="text-base font-semibold text-gray-200">Amount Due Today</span>
        <div className="flex items-baseline">
          <motion.span 
            key={`${selectedPrice}-${selectedActivationType}-${countryConfig.currency}`}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {formatLocalPrice(finalPrice)}
          </motion.span>
          <span className="ml-1 text-xs text-gray-400">{countryConfig.currency}</span>
        </div>
      </div>
    </motion.div>
  ), [
    itemVariants, 
    selectedPriceOption, 
    timeInfo,
    finalPrice,
    selectedActivationType,
    selectedPrice,
    formatLocalPrice,
    countryConfig.currency
  ]);

  // Debug effect to track payment status changes
  useEffect(() => {
    console.log('🔍 Payment status changed to:', paymentStatus);
    if (paymentStatus === 'success') {
      console.log('🎉 SUCCESS STATUS DETECTED - Should show PaymentSuccessMessage');
    }
  }, [paymentStatus]);

  // No loading state - show content immediately

  return (
    <section className="relative py-20 md:py-32 overflow-hidden" id="checkout" ref={sectionRef}>
      {paymentStatus === 'success' && <PaymentSuccessMessage email={email} />}
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="text-center mb-10 sm:mb-14" initial="hidden" animate={isInView ? "visible" : "hidden"} variants={containerVariants}>
        <motion.h2 
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ 
              textShadow: '0 0 20px rgba(255, 51, 102, 0.3)',
              transform: titleInView ? "perspective(1000px) rotateX(0deg)" : "perspective(1000px) rotateX(10deg)",
              willChange: 'transform'
            }}
          >
            <motion.span 
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                backgroundSize: "200% 100%",
                willChange: 'background-position'
              }}
            >
              Complete{" "}
            </motion.span>
            <motion.span 
              className="inline-block"
              animate={{ 
                y: [0, -5, 0],
                x: [0, 2, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              &nbsp;Your Order{" "}
            </motion.span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white/80 mx-auto mb-8 text-base sm:text-lg font-light tracking-wide">
            You're just moments away from accessing Adobe Creative Cloud
          </motion.p>
        </motion.div>
        
        {/* Mobile view */}
        <motion.div 
          className="md:hidden" 
          initial="hidden" 
          animate={isInView ? "visible" : "hidden"} 
          variants={containerVariants}
        >
          {renderMobileCardSwitcher()}
        </motion.div>
        
        {/* Desktop view */}
        <motion.div 
          className="hidden md:flex flex-col md:flex-row flex-wrap gap-8 justify-center items-start" 
          initial="hidden" 
          animate={isInView ? "visible" : "hidden"} 
          variants={containerVariants}
        >
          {renderDesktopBillingCard()}
          {renderDesktopSummaryCard()}
        </motion.div>
      </div>
    </section>
  );
}
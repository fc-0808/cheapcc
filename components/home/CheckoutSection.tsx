// components/home/CheckoutSection.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PRICING_OPTIONS, getPriceForActivationType, getSelfActivationFee } from '@/utils/products';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import { motion, useInView, Variants, AnimatePresence, PanInfo } from 'framer-motion';
import StripePaymentForm from './StripePaymentForm';
import PayPalPaymentForm from './PayPalPaymentForm';
import { useRouter } from 'next/navigation';

// Success message component to show after successful payment
const PaymentSuccessMessage = ({ email }: { email: string }) => (
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
  selectedActivationType?: 'pre-activated' | 'self-activation';
  adobeEmail?: string;
  createPayPalOrderWithRetry?: (
    selectedPrice: string, 
    name: string, 
    email: string, 
    maxRetries?: number
  ) => Promise<string>;
  onRefreshPaymentIntent?: () => void;
}

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function CheckoutSection({
  selectedPrice, isUserSignedIn, name, setName, email, setEmail, canPay,
  paymentStatus, setPaymentStatus, checkoutFormError, setCheckoutFormError,
  paypalButtonContainerRef, sdkReady, onPayPalLoad, onPayPalError,
  renderPayPalButton, clientSecret, selectedActivationType, adobeEmail,
  createPayPalOrderWithRetry, onRefreshPaymentIntent,
}: CheckoutSectionProps) {

  // --- Refs and Hooks ---
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px 0px" });

  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal'>('stripe');
  const [timeInfo, setTimeInfo] = useState<TimeInfo>({ currentTime: new Date(), expiryTime: null, timezone: 'UTC', isLoading: true });
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Track screen size to determine which view to render
  const [isMobile, setIsMobile] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();
  
  // Memoize form validation to avoid recalculating on every render
  const isFormValid = useMemo(() => 
    name.trim() !== '' && isValidEmail(email) && !nameError && !emailError, 
    [name, email, nameError, emailError]
  );

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
  useEffect(() => {
    const container = paypalButtonContainerRef.current;
    if (container && activeTab === 'paypal' && sdkReady && canPay && isInView) {
      renderPayPalButton?.();
      container.style.display = 'block';
    } else if (container) {
      container.style.display = 'none';
    }
  }, [sdkReady, canPay, isInView, renderPayPalButton, paypalButtonContainerRef, activeTab]);

  // Optimize expiry date calculation using memoization
  const calculateExpiryDate = useCallback((priceId: string): Date => {
    const now = new Date();
    const currentPriceOption = PRICING_OPTIONS.find(option => option.id === priceId) || PRICING_OPTIONS[0];
    let expiryDate = new Date();
    const durationValue = parseInt(currentPriceOption.duration);

    if (currentPriceOption.duration.includes('month')) expiryDate.setMonth(now.getMonth() + durationValue);
    else if (currentPriceOption.duration.includes('year')) expiryDate.setFullYear(now.getFullYear() + durationValue);
    else if (currentPriceOption.duration.includes('day')) expiryDate.setDate(now.getDate() + durationValue);
    
    return expiryDate;
  }, []);

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
    PRICING_OPTIONS.find(option => option.id === selectedPrice) || PRICING_OPTIONS[1],
    [selectedPrice]
  );

  const finalPrice = useMemo(() => 
    getPriceForActivationType(selectedPriceOption, selectedActivationType || 'pre-activated'),
    [selectedPriceOption, selectedActivationType]
  );

  // Professional guidance for missing Adobe email
  const isAdobeEmailRequired = selectedActivationType === 'self-activation';
  const isAdobeEmailMissing = isAdobeEmailRequired && (!adobeEmail || !isValidEmail(adobeEmail));
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
      <div className="relative w-full max-w-md mx-auto md:hidden">
        <motion.div 
          variants={itemVariants}
          className="w-full bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/20 border border-white/10"
        >
          {/* Unified Checkout Form - Mobile/Tablet */}
          
          {/* Section 1: Billing Information */}
          <h3 className="text-xl font-semibold text-white mb-6">Billing Information</h3>
          <div className="space-y-6 mb-8">
            <div>
              <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-lg blur transition duration-300 ${nameError ? 'bg-red-500 opacity-75' : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-focus-within:opacity-75'}`}></div>
                <i className="far fa-user text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"></i>
                <input type="text" id="name-checkout-mobile" required value={name} disabled={isUserSignedIn}
                  onChange={e => !isUserSignedIn && setName(e.target.value)}
                  className={`relative w-full px-4 py-3 pl-10 border-b-2 bg-black/20 focus:outline-none transition text-white ${nameError ? 'border-red-500' : 'border-white/20 focus:border-fuchsia-400/50'} ${isUserSignedIn ? 'cursor-not-allowed bg-black/30' : ''}`}
                />
                <label htmlFor="name-checkout-mobile" className={`absolute left-10 transition-all duration-300 pointer-events-none ${name || isUserSignedIn ? '-top-5 left-0' : 'top-3'} text-${name || isUserSignedIn ? 'xs' : 'base'} ${nameError ? 'text-red-400' : 'text-gray-400 group-focus-within:-top-5 group-focus-within:text-xs group-focus-within:left-0 group-focus-within:text-fuchsia-400'}`}>Full Name</label>
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
                <input type="email" id="email-checkout-mobile" required value={email} disabled={isUserSignedIn}
                  onChange={e => !isUserSignedIn && setEmail(e.target.value)}
                  className={`relative w-full px-4 py-3 pl-10 border-b-2 bg-black/20 focus:outline-none transition text-white ${emailError ? 'border-red-500' : 'border-white/20 focus:border-fuchsia-400/50'} ${isUserSignedIn ? 'cursor-not-allowed bg-black/30' : ''}`}
                />
                <label htmlFor="email-checkout-mobile" className={`absolute left-10 transition-all duration-300 pointer-events-none ${email || isUserSignedIn ? '-top-5 left-0' : 'top-3'} text-${email || isUserSignedIn ? 'xs' : 'base'} ${emailError ? 'text-red-400' : 'text-gray-400 group-focus-within:-top-5 group-focus-within:text-xs group-focus-within:left-0 group-focus-within:text-fuchsia-400'}`}>Email Address</label>
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
                <h3 className="text-xl font-semibold text-white mb-4">Payment Method</h3>
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
                              Self-Activation Setup
                            </p>
                          </div>
                          
                          {/* Enhanced description */}
                          <div className="space-y-3">
                            <p className="text-gray-200 text-sm leading-relaxed">
                              To proceed with <span className="font-semibold text-amber-200 bg-amber-500/20 px-1.5 py-0.5 rounded">Self-Activation</span>, 
                              please provide your Adobe Creative Cloud account email address in the pricing section above.
                            </p>
                            
                            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg">
                              <i className="fas fa-info-circle text-amber-400 text-sm mt-0.5 flex-shrink-0"></i>
                              <p className="text-amber-100/90 text-xs leading-relaxed">
                                <span className="font-medium">Why is this needed?</span> We'll add the subscription directly to your existing Adobe account, 
                                preserving all your settings, files, and preferences.
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
                        paypalButtonContainerRef={paypalButtonContainerRef}
                        onPayPalLoad={onPayPalLoad}
                        onPayPalError={onPayPalError}
                        paymentStatus={paymentStatus}
                        containerId="mobile-paypal-container"
                        createOrder={() => {
                          // If we have the retry function, use it
                          if (createPayPalOrderWithRetry) {
                            return createPayPalOrderWithRetry(selectedPrice, name, email);
                          }
                          
                          // Otherwise use the original implementation as fallback
                          return new Promise((resolve, reject) => {
                            try {
                              setPaymentStatus('loading');
                              fetch('/api/orders', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ priceId: selectedPrice, name, email })
                              })
                              .then(res => res.json())
                              .then(data => {
                                if (data.error) {
                                  setPaymentStatus('error');
                                  setCheckoutFormError(data.error);
                                  reject(new Error(data.error));
                                } else {
                                  resolve(data.id);
                                }
                              })
                              .catch((error: unknown) => {
                                console.error('Error creating PayPal order:', error);
                                setPaymentStatus('error');
                                setCheckoutFormError(error instanceof Error ? error.message : 'Failed to create order');
                                reject(error);
                              });
                            } catch (error: unknown) {
                              console.error('Exception in createOrder:', error);
                              setPaymentStatus('error');
                              setCheckoutFormError(error instanceof Error ? error.message : 'Failed to create order');
                              reject(error);
                            }
                          });
                        }}
                        onApprove={(data) => {
                          return new Promise((resolve, reject) => {
                            fetch('/api/orders/capture', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ orderID: data.orderID })
                            })
                            .then(res => res.json())
                            .then(details => {
                              if (details.error) {
                                console.error('Error capturing PayPal order:', details);
                                setPaymentStatus('error');
                                setCheckoutFormError(details.error);
                                reject(new Error(details.error));
                              } else {
                                setPaymentStatus('success');
                                resolve();
                              }
                            })
                            .catch((error: unknown) => {
                              console.error('Error capturing PayPal payment:', error);
                              setPaymentStatus('error');
                              setCheckoutFormError(error instanceof Error ? error.message : 'Failed to capture payment');
                              reject(error);
                            });
                          });
                        }}
                        onCancel={() => {
                          console.log('PayPal payment cancelled');
                          setPaymentStatus('cancel');
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                {checkoutFormError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-sm text-red-300 gap-2">
                    <i className="fas fa-exclamation-circle text-red-400"></i>
                    <span className="flex-1">{checkoutFormError}</span>
                    {checkoutFormError.includes('Payment session expired') && onRefreshPaymentIntent && (
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
          <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
          <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 mb-4">
            <i className="fas fa-clock text-fuchsia-400 text-xs"></i>
            <span className="text-xs font-medium text-fuchsia-400">Limited Time Offer</span>
          </div>
          <div className="space-y-3 pb-4 border-b border-dashed border-white/10">
            <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Subscription</span><span className="font-medium text-gray-200">{selectedPriceOption.duration}</span></div>
          </div>
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
          <div className="space-y-3 text-sm py-4 border-b border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Regular Price</span>
              <span className="line-through text-gray-500">
                ${selectedPriceOption.originalPrice ? selectedPriceOption.originalPrice.toFixed(2) : (selectedPriceOption.price * 4).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Discount <span className="text-fuchsia-400 text-xs font-medium">(Limited Time)</span></span>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                {selectedPriceOption.originalPrice ? 
                  Math.round((1 - selectedPriceOption.price / selectedPriceOption.originalPrice) * 100) : 
                  Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}% OFF
              </div>
            </div>
          </div>
          <div className="pt-5 flex justify-between items-baseline">
            <span className="text-base font-semibold text-gray-200">Amount Due Today</span>
            <div className="flex items-baseline">
              <motion.span 
                key={`${selectedPrice}-${selectedActivationType}`}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                ${finalPrice.toFixed(2)}
              </motion.span>
              <span className="ml-1 text-xs text-gray-400">USD</span>
            </div>
          </div>
          {selectedActivationType === 'self-activation' && selectedPriceOption.selfActivationPrice && (
            <motion.div 
              className="mt-2 text-xs text-pink-300 text-right"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Includes ${getSelfActivationFee(selectedPriceOption.duration).toFixed(2)} activation fee
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }, [
    itemVariants, 
    name, 
    setName,
    email, 
    setEmail,
    nameError, 
    emailError, 
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
    selectedActivationType
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
                      Self-Activation Setup
                    </p>
                  </div>
                  
                  {/* Enhanced description */}
                  <div className="space-y-3">
                    <p className="text-gray-200 text-sm leading-relaxed">
                      To proceed with <span className="font-semibold text-amber-200 bg-amber-500/20 px-1.5 py-0.5 rounded">Self-Activation</span>, 
                      please provide your Adobe Creative Cloud account email address in the pricing section above.
                    </p>
                    
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg">
                      <i className="fas fa-info-circle text-amber-400 text-sm mt-0.5 flex-shrink-0"></i>
                      <p className="text-amber-100/90 text-xs leading-relaxed">
                        <span className="font-medium">Why is this needed?</span> We'll add the subscription directly to your existing Adobe account, 
                        preserving all your settings, files, and preferences.
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
                containerId="desktop-stripe-container"
                handleSubmit={handleStripeSubmit}
                paymentStatus={paymentStatus}
                stripe={stripe}
                elements={elements}
                isFormValid={isFormValid}
                clientSecret={clientSecret}
              />
            ) : (
              <PayPalPaymentForm 
                paypalButtonContainerRef={paypalButtonContainerRef}
                onPayPalLoad={onPayPalLoad}
                onPayPalError={onPayPalError}
                paymentStatus={paymentStatus}
                containerId="desktop-paypal-container"
                createOrder={() => {
                  if (createPayPalOrderWithRetry) {
                    return createPayPalOrderWithRetry(selectedPrice, name, email);
                  }
                  
                  return new Promise((resolve, reject) => {
                    try {
                      setPaymentStatus('loading');
                      fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ priceId: selectedPrice, name, email })
                      })
                      .then(res => res.json())
                      .then(data => {
                        if (data.error) {
                          setPaymentStatus('error');
                          setCheckoutFormError(data.error);
                          reject(new Error(data.error));
                        } else {
                          resolve(data.id);
                        }
                      })
                      .catch((error: unknown) => {
                        console.error('Error creating PayPal order:', error);
                        setPaymentStatus('error');
                        setCheckoutFormError(error instanceof Error ? error.message : 'Failed to create order');
                        reject(error);
                      });
                    } catch (error: unknown) {
                      console.error('Exception in createOrder:', error);
                      setPaymentStatus('error');
                      setCheckoutFormError(error instanceof Error ? error.message : 'Failed to create order');
                      reject(error);
                    }
                  });
                }}
                onApprove={(data) => {
                  return new Promise((resolve, reject) => {
                    fetch('/api/orders/capture', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ orderID: data.orderID })
                    })
                    .then(res => res.json())
                    .then(details => {
                      if (details.error) {
                        console.error('Error capturing PayPal order:', details);
                        setPaymentStatus('error');
                        setCheckoutFormError(details.error);
                        reject(new Error(details.error));
                      } else {
                        setPaymentStatus('success');
                        resolve();
                      }
                    })
                    .catch((error: unknown) => {
                      console.error('Error capturing PayPal payment:', error);
                      setPaymentStatus('error');
                      setCheckoutFormError(error instanceof Error ? error.message : 'Failed to capture payment');
                      reject(error);
                    });
                  });
                }}
                onCancel={() => {
                  console.log('PayPal payment cancelled');
                  setPaymentStatus('cancel');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {checkoutFormError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-sm text-red-300 gap-2">
          <i className="fas fa-exclamation-circle text-red-400"></i>
          <span className="flex-1">{checkoutFormError}</span>
          {checkoutFormError.includes('Payment session expired') && onRefreshPaymentIntent && (
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
    name, 
    email, 
    nameError, 
    emailError, 
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
    onPayPalError
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
        <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Subscription</span><span className="font-medium text-gray-200">{selectedPriceOption.duration}</span></div>
      </div>
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
      <div className="space-y-3 text-sm py-4 border-b border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Regular Price</span>
          <span className="line-through text-gray-500">
            ${selectedPriceOption.originalPrice ? selectedPriceOption.originalPrice.toFixed(2) : (selectedPriceOption.price * 4).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Discount <span className="text-fuchsia-400 text-xs font-medium">(Limited Time)</span></span>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
            {selectedPriceOption.originalPrice ? 
              Math.round((1 - selectedPriceOption.price / selectedPriceOption.originalPrice) * 100) : 
              Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}% OFF
          </div>
        </div>
      </div>
      <div className="pt-5 flex justify-between items-baseline">
        <span className="text-base font-semibold text-gray-200">Amount Due Today</span>
        <div className="flex items-baseline">
          <motion.span 
            key={`${selectedPrice}-${selectedActivationType}`}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            ${finalPrice.toFixed(2)}
          </motion.span>
          <span className="ml-1 text-xs text-gray-400">USD</span>
        </div>
      </div>
      {selectedActivationType === 'self-activation' && selectedPriceOption.selfActivationPrice && (
        <motion.div 
          className="mt-2 text-xs text-pink-300 text-right"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Includes ${getSelfActivationFee(selectedPriceOption.duration).toFixed(2)} activation fee
        </motion.div>
      )}
    </motion.div>
  ), [
    itemVariants, 
    selectedPriceOption, 
    timeInfo,
    finalPrice,
    selectedActivationType,
    selectedPrice
  ]);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden" id="checkout" ref={sectionRef}>
      {paymentStatus === 'success' && <PaymentSuccessMessage email={email} />}
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="text-center mb-10 sm:mb-14" initial="hidden" animate={isInView ? "visible" : "hidden"} variants={containerVariants}>
        <motion.h2 
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
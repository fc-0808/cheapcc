// components/home/CheckoutSection.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PRICING_OPTIONS } from '@/utils/products';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import { motion, useInView, Variants, AnimatePresence, PanInfo } from 'framer-motion';
import StripePaymentForm from './StripePaymentForm';
import PayPalPaymentForm from './PayPalPaymentForm';
import { useRouter } from 'next/navigation';

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
  createPayPalOrderWithRetry?: (
    selectedPrice: string, 
    name: string, 
    email: string, 
    maxRetries?: number
  ) => Promise<string>;
}

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function CheckoutSection({
  selectedPrice, isUserSignedIn, name, setName, email, setEmail, canPay,
  paymentStatus, setPaymentStatus, checkoutFormError, setCheckoutFormError,
  paypalButtonContainerRef, sdkReady, onPayPalLoad, onPayPalError,
  renderPayPalButton, clientSecret, createPayPalOrderWithRetry,
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

  // Card swiper for mobile/tablet view
  const [[activeCardIndex, direction], setActiveCard] = useState([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Track screen size to determine which view to render
  const [isMobile, setIsMobile] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();
  
  const isFormValid = name.trim() !== '' && isValidEmail(email) && !nameError && !emailError;

  const router = useRouter();

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Real-time Validation Effect ---
  useEffect(() => {
    if (name.length > 0 && name.trim().length === 0) setNameError("Name cannot be only spaces.");
    else if (name.length > 50) setNameError("Name must be 50 characters or less.");
    else setNameError(null);
  }, [name]);

  useEffect(() => {
    if (email.length > 0 && !isValidEmail(email)) setEmailError("Please enter a valid email address.");
    else setEmailError(null);
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

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const now = new Date();
    const currentPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice) || PRICING_OPTIONS[0];
    let expiryDate = new Date();
    const durationValue = parseInt(currentPriceOption.duration);

    if (currentPriceOption.duration.includes('month')) expiryDate.setMonth(now.getMonth() + durationValue);
    else if (currentPriceOption.duration.includes('year')) expiryDate.setFullYear(now.getFullYear() + durationValue);
    else if (currentPriceOption.duration.includes('day')) expiryDate.setDate(now.getDate() + durationValue);
    
    setTimeInfo({ currentTime: now, expiryTime: expiryDate, timezone, isLoading: false });

    const timer = setInterval(() => setTimeInfo(prev => ({ ...prev, currentTime: new Date() })), 60000);
    return () => clearInterval(timer);
  }, [selectedPrice]);

  // --- Form Submission Logic ---
  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !isFormValid || !clientSecret) return;

    setCheckoutFormError(null);
    setPaymentStatus('loading');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setCheckoutFormError(submitError.message || "An error occurred.");
      setPaymentStatus('error');
      return;
    }
    
    const { error } = await stripe.confirmPayment({
      elements, clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
        receipt_email: email,
        payment_method_data: { billing_details: { name, email } }
      },
      redirect: 'always',
    });

    if (error) {
      setCheckoutFormError(error.message || "An unexpected error occurred.");
      setPaymentStatus('error');
    }
  };
  
  // Card swipe handlers for mobile/tablet
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (info.offset.x < -threshold && activeCardIndex === 0) {
      setActiveCard([1, 1]); // Move right to summary
    } else if (info.offset.x > threshold && activeCardIndex === 1) {
      setActiveCard([0, -1]); // Move left to billing
    } else {
      setActiveCard([activeCardIndex, 0]); // Reset to current position
    }
  };

  // --- Constants and Framer Motion Variants ---
  const selectedPriceOption = PRICING_OPTIONS.find(option => option.id === selectedPrice) || PRICING_OPTIONS[1];
  const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
  const TABS = [{ id: 'stripe', label: 'Card', icon: 'fas fa-credit-card' }, { id: 'paypal', label: 'PayPal', icon: 'fab fa-paypal' }];

  // Mobile card variants
  const cardVariants: Variants = {
    center: {
      x: 0,
      scale: 1,
      zIndex: 10,
      opacity: 1,
      rotateY: 0,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      transition: { duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }
    },
    left: {
      x: -10,
      scale: 0.9,
      zIndex: 5,
      opacity: 0.7,
      rotateY: 10,
      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }
    },
    right: {
      x: 10,
      scale: 0.9,
      zIndex: 5,
      opacity: 0.7,
      rotateY: -10,
      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }
    }
  };

  const getCardVariant = (index: number) => {
    if (index === activeCardIndex) return 'center';
    if (index < activeCardIndex) return 'left';
    return 'right';
  };
  
  // Render checkout cards - without payment form for mobile version
  const renderBillingCard = (includePaymentForm: boolean = true) => (
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
                  {activeTab === tab.id && <motion.div layoutId="active-payment-tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500" />}
                  <i className={`${tab.icon} ${activeTab === tab.id ? 'text-fuchsia-400' : ''}`}></i>
                  <span className={`${activeTab === tab.id ? 'text-white' : ''}`}>{tab.label}</span>
              </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Conditionally include payment form only when requested */}
            {includePaymentForm && (
              activeTab === 'stripe' ? (
                <StripePaymentForm 
                  containerId="billing-card-stripe"
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
                  containerId={`billing-card-paypal-${activeTab === 'paypal' ? '1' : '0'}`}
                  createOrder={() => {
                    // If we have the retry function, use it
                    if (createPayPalOrderWithRetry) {
                      return createPayPalOrderWithRetry(selectedPrice, name, email);
                    }
                    
                    // Otherwise use the original implementation as fallback
                    // This will be passed to our context's renderPayPalButton
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
              )
            )}
            {!includePaymentForm && (
              <div className="p-5 border border-white/20 rounded-lg bg-black/20 text-gray-400 text-sm flex flex-col items-center justify-center">
                <p className="text-center">Continue to next step to complete payment</p>
                {activeCardIndex === 0 && (
                  <motion.div 
                    className="flex items-center gap-2 mt-4 text-fuchsia-400"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <span>Swipe to continue</span>
                    <i className="fas fa-arrow-right"></i>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {checkoutFormError && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-sm text-red-300 gap-2"><i className="fas fa-exclamation-circle text-red-400"></i>{checkoutFormError}</div>}
    </motion.div>
  );

  const renderSummaryCard = (includePaymentForm: boolean = false) => (
    <motion.div 
      variants={itemVariants} 
      className="w-full max-w-sm bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl shadow-black/20 border border-white/10"
    >
      <h3 className="text-xl font-semibold text-white mb-1">Order Summary</h3>
      <br />
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
        <div className="flex justify-between items-center"><span className="text-gray-400">Regular Price</span><span className="line-through text-gray-500">${(selectedPriceOption.price * 4).toFixed(2)}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-400">Discount</span><span className="font-medium text-green-400">{Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}% OFF</span></div>
      </div>
      <div className="pt-5 flex justify-between items-baseline">
        <span className="text-base font-semibold text-gray-200">Amount Due Today</span>
        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500">${selectedPriceOption.price.toFixed(2)}</span>
      </div>
      
      {/* Only show payment form in mobile view when on summary card */}
      {includePaymentForm && activeCardIndex === 1 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Complete Payment</h3>
          {activeTab === 'stripe' ? (
            <StripePaymentForm 
              containerId="summary-card-stripe"
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
              containerId={`summary-card-paypal-${activeTab === 'paypal' ? '1' : '0'}`}
              createOrder={() => {
                // If we have the retry function, use it
                if (createPayPalOrderWithRetry) {
                  return createPayPalOrderWithRetry(selectedPrice, name, email);
                }
                
                // Otherwise use the original implementation as fallback
                // This will be passed to our context's renderPayPalButton
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
        </div>
      )}
      
      {activeCardIndex === 1 && !includePaymentForm && (
        <motion.div 
          className="flex items-center gap-2 mt-6 justify-center text-fuchsia-400"
          animate={{ x: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <i className="fas fa-arrow-left"></i>
          <span>Swipe for details</span>
        </motion.div>
      )}
    </motion.div>
  );

  // Render mobile/tablet card switcher with swipe functionality
  const renderMobileCardSwitcher = () => {
    return (
      <div className="relative w-full max-w-md mx-auto md:hidden">
        <motion.div 
          variants={itemVariants}
          className="w-full bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/20 border border-white/10"
        >
          {/* Billing Information Section */}
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
          
          {/* Order Summary Section */}
          <div className="mb-8 py-6 border-t border-b border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3 pb-4 border-b border-dashed border-white/10">
              <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Subscription</span><span className="font-medium text-gray-200">{selectedPriceOption.duration}</span></div>
            </div>
            <div className="space-y-3 py-4 border-b border-dashed border-white/10">
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
              <div className="flex justify-between items-center"><span className="text-gray-400">Regular Price</span><span className="line-through text-gray-500">${(selectedPriceOption.price * 4).toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">Discount</span><span className="font-medium text-green-400">{Math.round(100 - (selectedPriceOption.price / (selectedPriceOption.price * 4)) * 100)}% OFF</span></div>
            </div>
            <div className="pt-5 flex justify-between items-baseline">
              <span className="text-base font-semibold text-gray-200">Amount Due Today</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500">${selectedPriceOption.price.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Payment Section */}
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
                  {activeTab === tab.id && <motion.div layoutId="active-payment-tab-mobile" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500" />}
                  <i className={`${tab.icon} ${activeTab === tab.id ? 'text-fuchsia-400' : ''}`}></i>
                  <span className={`${activeTab === tab.id ? 'text-white' : ''}`}>{tab.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === 'stripe' ? (
                  <StripePaymentForm 
                    containerId="mobile-card-stripe"
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
                    containerId={`mobile-card-paypal-${activeTab === 'paypal' ? '1' : '0'}`}
                    createOrder={() => {
                      // If we have the retry function, use it
                      if (createPayPalOrderWithRetry) {
                        return createPayPalOrderWithRetry(selectedPrice, name, email);
                      }
                      
                      // Otherwise use the original implementation as fallback
                      // This will be passed to our context's renderPayPalButton
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
          {checkoutFormError && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-sm text-red-300 gap-2"><i className="fas fa-exclamation-circle text-red-400"></i>{checkoutFormError}</div>}
        </motion.div>
      </div>
    );
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden" id="checkout" ref={sectionRef}>
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
        
        {/* Mobile combined view */}
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
          {renderBillingCard(true)} {/* Include payment form in desktop view */}
          {renderSummaryCard(false)} {/* Don't include payment form in desktop summary */}
        </motion.div>
      </div>
    </section>
  );
}
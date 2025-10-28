"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/supabase-client';
import type { Session } from '@supabase/supabase-js';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { v4 as uuidv4 } from 'uuid';
import { getPricingOptions, type PricingOption } from '@/utils/products-supabase';
import dynamic from 'next/dynamic';
import { useInternationalization } from '@/contexts/InternationalizationContext';
import { motion } from 'framer-motion';
import { validateAdobeEmail, getEmailErrorMessage, type EmailValidationResult } from '@/utils/email-validation';

// Import components
import Breadcrumb from "@/components/Breadcrumb";
import ProductPageWrapper from "@/components/ProductPageWrapper";
import ProfessionalPricingCard from "@/components/pricing/ProfessionalPricingCard";
import ProductPageRedirect from "@/components/ProductPageRedirect";

// Dynamically import heavy components
const CheckoutSection = dynamic(() => import("@/components/home/CheckoutSection"), {
  loading: () => (
    <div className="py-20 md:py-32">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="h-8 w-8 border-2 border-blue-500/50 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

// Load Stripe with error handling
const createStripePromise = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!).catch((error) => {
    console.error('Failed to load Stripe.js:', error);
    return Promise.reject(error);
  });
};

const stripePromise = createStripePromise();

export default function SelfActivatedAdobeCreativeCloud() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('1m-self');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [adobeEmail, setAdobeEmail] = useState<string>('');
  const [isUserSignedIn, setIsUserSignedIn] = useState<boolean>(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [canPay, setCanPay] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutFormError, setCheckoutFormError] = useState<string | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [adobeEmailValidation, setAdobeEmailValidation] = useState<EmailValidationResult | null>(null);
  const [adobeEmailError, setAdobeEmailError] = useState<string | null>(null);
  
  const { countryConfig, formatLocalPrice, selectedCountry } = useInternationalization();
  const checkoutRef = useRef<HTMLDivElement>(null);
  const paymentIntentCacheRef = useRef<Map<string, string>>(new Map());

  // Filter for email-activation products only
  const emailActivationOptions = pricingOptions.filter(option => 
    option.activationType === 'email-activation' && 
    option.productType === 'subscription' &&
    option.adobeProductLine === 'creative_cloud'
  );

  // Fetch pricing options
  useEffect(() => {
    const fetchPricingOptions = async () => {
      try {
        const options = await getPricingOptions();
        setPricingOptions(options);
        
        // Set default selected price for email-activation
        const defaultOption = options.find(opt => 
          opt.activationType === 'email-activation' && 
          opt.durationMonths === 1 &&
          opt.adobeProductLine === 'creative_cloud'
        );
        if (defaultOption) {
          setSelectedPrice(defaultOption.id);
        }
      } catch (error) {
        console.error('Failed to fetch pricing options:', error);
        setPricingOptions([]);
      }
    };

    fetchPricingOptions();
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

  // Adobe email validation
  useEffect(() => {
    if (adobeEmail.trim() === '') {
      setAdobeEmailValidation(null);
      setAdobeEmailError(null);
      return;
    }

    const validation = validateAdobeEmail(adobeEmail);
    setAdobeEmailValidation(validation);
    
    const errorMessage = getEmailErrorMessage(validation);
    setAdobeEmailError(errorMessage);
    
  }, [adobeEmail]);

  // Payment intent creation
  useEffect(() => {
    const formIsValid = name.trim() !== '' && /.+@.+\..+/.test(email) && adobeEmailValidation?.isValid === true;
    
    if (!formIsValid) {
      if (clientSecret) {
        setClientSecret(null);
        setPaymentStatus('idle');
      }
      return;
    }

    if (pricingOptions.length === 0) return;

    const selectedPriceExists = pricingOptions.some(option => option.id === selectedPrice);
    if (!selectedPriceExists) {
      console.warn(`Selected price ${selectedPrice} not found in pricing options`);
      return;
    }

    const timeoutId = setTimeout(() => {
      const fetchPaymentIntent = async () => {
        const cacheKey = `${selectedPrice}-${name}-${email}-email-activation-${adobeEmail}`;
        const cachedClientSecret = paymentIntentCacheRef.current.get(cacheKey);

        if (cachedClientSecret) {
          setClientSecret(cachedClientSecret);
          setPaymentStatus('idle');
          return;
        }

        setPaymentStatus('loading');
        setCheckoutFormError(null);

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
              activationType: 'email-activation',
              adobeEmail: adobeEmail,
              countryCode: selectedCountry,
              currency: countryConfig.currency,
            }),
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to initialize payment.');
          }

          if (!data.clientSecret) {
            throw new Error('No client secret received from payment service.');
          }

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
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [name, email, adobeEmail, selectedPrice, pricingOptions]);

  // Stripe loading check
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
  }, []);

  // Scroll listener for checkout visibility
  useEffect(() => {
    function onScroll() {
      if (checkoutRef.current && !checkoutVisible) {
        const rect = checkoutRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.3) setCheckoutVisible(true);
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [checkoutVisible]);

  const handlePlanSelect = (optionId: string) => {
    if (selectedPrice !== optionId) {
      setSelectedPrice(optionId);
    }
    // Scroll to checkout section after a brief delay to ensure state is updated
    setTimeout(() => {
      const checkoutSection = document.getElementById('checkout-section');
      if (checkoutSection) {
        checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const selectedPriceOption = emailActivationOptions.find(option => option.id === selectedPrice) || null;
  let amountInCents = selectedPriceOption ? Math.round(selectedPriceOption.price * 100) : 1299;
  
  if (amountInCents <= 0) {
    console.warn('Invalid amount detected, using default $12.99');
    amountInCents = 1299;
  }

  const stripeOptions: StripeElementsOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: { colorPrimary: '#3b82f6' },
    },
  } : {
    mode: 'payment',
    currency: countryConfig.currency.toLowerCase(),
    amount: amountInCents,
    appearance: {
      theme: 'night' as const,
      variables: { colorPrimary: '#3b82f6' },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ProductPageWrapper>
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-cyan-900 text-white relative overflow-hidden">
        
        {/* Breadcrumb Navigation - Fixed at top with proper z-index and pushed below header */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 mt-20 hidden md:block">
          <Breadcrumb 
            items={[
              { name: 'Adobe Creative Cloud', href: '/adobe-creative-cloud' },
              { name: 'Email-activated', href: '/email-activated-adobe-creative-cloud' }
            ]}
            currentPage="Email-activated Adobe Creative Cloud"
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Hero Section */}
          <section className="relative py-20 md:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-cyan-900/20 to-teal-900/20"></div>
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center max-w-4xl mx-auto"
                variants={itemVariants}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6"
                  variants={itemVariants}
                >
                  <i className="fas fa-user-cog text-blue-400"></i>
                  <span className="text-blue-300 font-medium">Use Your Own Adobe Email</span>
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    Email-activated Adobe Creative Cloud
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                  Activate Adobe Creative Cloud on your existing Adobe email. 
                  <span className="text-blue-400 font-semibold"> Full control</span> over your account with maximum savings.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-dollar-sign text-green-400"></i>
                    <span className="text-green-300 font-medium">Maximum Savings</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-user-shield text-blue-400"></i>
                    <span className="text-blue-300 font-medium">Your Adobe Email</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-cogs text-purple-400"></i>
                    <span className="text-purple-300 font-medium">Full Control</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-20 bg-gradient-to-b from-gray-900/50 to-gray-900/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Email-activation</span>?
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Take control of your Adobe Creative Cloud experience with your own Adobe email and enjoy maximum savings.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "fas fa-piggy-bank",
                    title: "Maximum Savings",
                    description: "Save more with email-activation compared to pre-activated accounts. Keep your existing Adobe email while enjoying significant cost reductions.",
                    color: "from-green-500 to-emerald-500"
                  },
                  {
                    icon: "fas fa-user-check",
                    title: "Your Adobe Email",
                    description: "Use your existing Adobe email and maintain your creative cloud library, fonts, and preferences. No need to start over.",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: "fas fa-shield-alt",
                    title: "Full Control",
                    description: "Complete control over your account settings, billing, and subscription management. You own your Adobe experience.",
                    color: "from-purple-500 to-pink-500"
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${benefit.color} flex items-center justify-center`}>
                      <i className={`${benefit.icon} text-white text-2xl`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Adobe Email Input Section */}
          <section className="py-16 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="max-w-2xl mx-auto text-center"
                variants={itemVariants}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  Enter Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Adobe Email</span>
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                  We'll activate your Adobe Creative Cloud subscription on your existing Adobe account.
                </p>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="adobe-email" className="block text-sm font-medium text-gray-300 mb-2">
                        Adobe Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="adobe-email"
                          value={adobeEmail}
                          onChange={(e) => setAdobeEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className={`w-full px-4 py-3 pr-10 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                            adobeEmailError 
                              ? 'border-red-500/50 focus:ring-red-500/50' 
                              : adobeEmailValidation?.isValid === true 
                                ? 'border-green-500/50 focus:ring-green-500/50' 
                                : 'border-white/20 focus:ring-blue-500'
                          }`}
                        />
                        {adobeEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {adobeEmailValidation?.isValid === true ? (
                              <i className="fas fa-check-circle text-green-400 text-lg"></i>
                            ) : adobeEmailError ? (
                              <i className="fas fa-exclamation-circle text-red-400 text-lg"></i>
                            ) : (
                              <i className="fas fa-spinner fa-spin text-blue-400 text-lg"></i>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Error Message */}
                      {adobeEmailError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                        >
                          <div className="flex items-start gap-2">
                            <i className="fas fa-exclamation-triangle text-red-400 mt-0.5"></i>
                            <div>
                              <p className="text-red-300 text-sm font-medium">{adobeEmailError}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Warnings */}
                      {adobeEmailValidation?.warnings && adobeEmailValidation.warnings.length > 0 && !adobeEmailError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                        >
                          <div className="flex items-start gap-2">
                            <i className="fas fa-exclamation-triangle text-amber-400 mt-0.5"></i>
                            <div>
                              <p className="text-amber-300 text-sm font-medium">{adobeEmailValidation.warnings[0]}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                    </div>
                    
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Plan</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  All plans include the complete Adobe Creative Cloud suite activated on your Adobe email.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {emailActivationOptions.map((option, index) => (
                  <ProfessionalPricingCard
                    key={option.id}
                    option={option}
                    selectedPrice={selectedPrice}
                    onSelectPrice={handlePlanSelect}
                    features={[
                      'Complete Adobe CC Suite',
                      'Your Adobe Email',
                      'Maximum Savings',
                      'Full Control'
                    ]}
                    productType="email-activation"
                    adobeProductLine="creative_cloud"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 bg-gradient-to-b from-gray-900/30 to-gray-900/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Works</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Activate Adobe Creative Cloud on your existing Adobe email in just a few simple steps.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    step: "01",
                    title: "Provide Your Adobe Email",
                    description: "Enter your existing Adobe email address during checkout. This is where we'll activate your subscription.",
                    icon: "fas fa-envelope"
                  },
                  {
                    step: "02", 
                    title: "Complete Purchase",
                    description: "Choose your plan and complete the secure checkout process. We'll process your order immediately.",
                    icon: "fas fa-credit-card"
                  },
                  {
                    step: "03",
                    title: "Activation Instructions",
                    description: "Receive detailed activation instructions via email. Follow the simple steps to activate on your Adobe email.",
                    icon: "fas fa-list-check"
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    variants={itemVariants}
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <i className={`${step.icon} text-white text-2xl`}></i>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{step.step}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Redirect to Home Page Checkout */}
          <div id="checkout-section">
            <ProductPageRedirect
              productType="email-activation"
              adobeProductLine="creative_cloud"
              productName="Email-activated Adobe Creative Cloud"
              selectedPrice={selectedPrice}
              adobeEmail={adobeEmail}
            />
          </div>

          {/* FAQ Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Questions</span>
                </h2>
              </motion.div>

              <div className="max-w-3xl mx-auto space-y-6">
                {[
                  {
                    question: "What is email-activation and how does it work?",
                    answer: "Email-activation allows you to use your existing Adobe email to receive a Creative Cloud subscription. We provide you with activation instructions to add the subscription to your account, giving you full control while saving money."
                  },
                  {
                    question: "Do I need an existing Adobe email for email-activation?",
                    answer: "Yes, you need an existing Adobe email (free to create at adobe.com) to use the email-activation service. This ensures you maintain control over your account and creative cloud library."
                  },
                  {
                    question: "How much can I save with email-activation?",
                    answer: "Email-activation typically offers the highest savings compared to other options. You can save up to 80% off Adobe's official pricing while using your own Adobe email."
                  },
                  {
                    question: "Is email-activation safe and legitimate?",
                    answer: "Absolutely. We provide legitimate Adobe Creative Cloud subscriptions through official channels. The activation process is completely safe and follows Adobe's official procedures."
                  },
                  {
                    question: "What if I don't have an Adobe email yet?",
                    answer: "You can create a free Adobe email at adobe.com before purchasing. Alternatively, you can choose our pre-activated service if you prefer not to use your own Adobe email."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                    variants={itemVariants}
                  >
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                variants={itemVariants}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Save More?
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Get maximum savings with email-activation while keeping full control of your Adobe Creative Cloud account.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/?type=email-activation&product=creative-cloud&scroll=pricing"
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/25"
                  >
                    Activate Now
                  </Link>
                  <Link
                    href="/compare"
                    className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    Compare Options
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </motion.div>
      </main>
    </ProductPageWrapper>
  );
}

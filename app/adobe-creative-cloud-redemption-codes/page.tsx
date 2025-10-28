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
          <div className="h-8 w-8 border-2 border-emerald-500/50 border-t-emerald-500 rounded-full animate-spin"></div>
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

export default function AdobeCreativeCloudRedemptionCodes() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('cc-code-1m');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cancel'>('idle');
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isUserSignedIn, setIsUserSignedIn] = useState<boolean>(false);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [canPay, setCanPay] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutFormError, setCheckoutFormError] = useState<string | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  
  const { countryConfig, formatLocalPrice, selectedCountry } = useInternationalization();
  const checkoutRef = useRef<HTMLDivElement>(null);
  const paymentIntentCacheRef = useRef<Map<string, string>>(new Map());

  // Filter for Creative Cloud redemption codes only
  const ccRedemptionOptions = pricingOptions.filter(option => 
    option.activationType === 'redemption-required' && 
    option.productType === 'redemption_code' &&
    option.adobeProductLine === 'creative_cloud'
  );

  // Fetch pricing options
  useEffect(() => {
    const fetchPricingOptions = async () => {
      try {
        const options = await getPricingOptions();
        setPricingOptions(options);
        
        // Set default selected price for CC redemption codes
        const defaultOption = options.find(opt => 
          opt.activationType === 'redemption-required' && 
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

  // Payment intent creation
  useEffect(() => {
    const formIsValid = name.trim() !== '' && /.+@.+\..+/.test(email);
    
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
        const cacheKey = `${selectedPrice}-${name}-${email}-redemption-required`;
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
              activationType: 'redemption-required',
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
  }, [name, email, selectedPrice, pricingOptions]);

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

  const selectedPriceOption = ccRedemptionOptions.find(option => option.id === selectedPrice) || null;
  let amountInCents = selectedPriceOption ? Math.round(selectedPriceOption.price * 100) : 1299;
  
  if (amountInCents <= 0) {
    console.warn('Invalid amount detected, using default $12.99');
    amountInCents = 1299;
  }

  const stripeOptions: StripeElementsOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: { colorPrimary: '#10b981' },
    },
  } : {
    mode: 'payment',
    currency: countryConfig.currency.toLowerCase(),
    amount: amountInCents,
    appearance: {
      theme: 'night' as const,
      variables: { colorPrimary: '#10b981' },
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
      <main className="min-h-screen bg-gradient-to-br from-emerald-900 via-black to-teal-900 text-white relative overflow-hidden">
        
        {/* Breadcrumb Navigation - Fixed at top with proper z-index and pushed below header */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 mt-20 hidden md:block">
          <Breadcrumb 
            items={[
              { name: 'Adobe Creative Cloud', href: '/adobe-creative-cloud' },
              { name: 'Redemption Codes', href: '/adobe-creative-cloud-redemption-codes' }
            ]}
            currentPage="Adobe Creative Cloud Redemption Codes"
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20"></div>
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center max-w-4xl mx-auto"
                variants={itemVariants}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-6"
                  variants={itemVariants}
                >
                  <i className="fas fa-gift text-emerald-400"></i>
                  <span className="text-emerald-300 font-medium">Official Redemption Codes</span>
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Adobe Creative Cloud Redemption Codes
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                  Official Adobe Creative Cloud redemption codes to activate on your existing account at{' '}
                  <a 
                    href="https://redeem.adobe.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline transition-colors duration-200"
                  >
                    redeem.adobe.com
                  </a>
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-certificate text-green-400"></i>
                    <span className="text-green-300 font-medium">Official Adobe Codes</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-shield-check text-blue-400"></i>
                    <span className="text-blue-300 font-medium">100% Legitimate</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-user-check text-purple-400"></i>
                    <span className="text-purple-300 font-medium">Your Adobe Account</span>
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
                  Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Redemption Codes</span>?
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Official Adobe redemption codes give you complete control over your Creative Cloud subscription with maximum flexibility.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "fas fa-certificate",
                    title: "Official Adobe Codes",
                    description: "Genuine Adobe redemption codes that work directly with Adobe's official redemption system. No third-party accounts required.",
                    color: "from-emerald-500 to-teal-500"
                  },
                  {
                    icon: "fas fa-user-shield",
                    title: "Your Adobe Account",
                    description: "Redeem codes on your existing Adobe account to maintain your creative cloud library, fonts, and all your preferences.",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: "fas fa-mobile-alt",
                    title: "Quick Redemption",
                    description: "Redeem your code immediately at redeem.adobe.com. No waiting, no delays - activate your subscription right away.",
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

          {/* Redemption Process Section */}
          <section className="py-16 bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="max-w-4xl mx-auto text-center"
                variants={itemVariants}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Redeem Your Code</span>
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                  Follow these simple steps to redeem your Adobe Creative Cloud code on your existing Adobe account.
                </p>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        step: "1",
                        title: "Receive Your Code",
                        description: "Get your redemption code via email immediately after purchase.",
                        icon: "fas fa-envelope"
                      },
                      {
                        step: "2",
                        title: "Visit Adobe Redemption",
                        description: "Go to redeem.adobe.com and sign in with your Adobe ID.",
                        icon: "fas fa-external-link-alt"
                      },
                      {
                        step: "3",
                        title: "Enter & Activate",
                        description: "Enter your redemption code and activate your Creative Cloud subscription.",
                        icon: "fas fa-check-circle"
                      }
                    ].map((step, index) => (
                      <div key={index} className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                          <i className={`${step.icon} text-white text-xl`}></i>
                        </div>
                        <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{step.step}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-gray-300 text-sm">{step.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-300 text-sm">
                      <i className="fas fa-info-circle mr-2"></i>
                      <strong>Important:</strong> You must have an existing Adobe ID to redeem codes. 
                      <a href="https://account.adobe.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                        Create one for free here
                      </a> if you don't have an account yet.
                    </p>
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
                  Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Redemption Code</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  All codes provide access to the complete Adobe Creative Cloud suite on your existing Adobe account.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {ccRedemptionOptions.map((option, index) => (
                  <ProfessionalPricingCard
                    key={option.id}
                    option={option}
                    selectedPrice={selectedPrice}
                    onSelectPrice={handlePlanSelect}
                    features={[
                      'Complete Adobe CC Suite',
                      'Official Redemption Code',
                      'Your Adobe Account',
                      'Quick Redemption'
                    ]}
                    productType="redemption-code"
                    adobeProductLine="creative_cloud"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Redirect to Home Page Checkout */}
          <div id="checkout-section">
            <ProductPageRedirect
              productType="redemption-required"
              adobeProductLine="creative_cloud"
              productName="Adobe Creative Cloud Redemption Codes"
              selectedPrice={selectedPrice}
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
                  Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Questions</span>
                </h2>
              </motion.div>

              <div className="max-w-3xl mx-auto space-y-6">
                {[
                  {
                    question: "What are Adobe Creative Cloud redemption codes?",
                    answer: "Redemption codes are official Adobe codes that you can redeem at redeem.adobe.com to add a Creative Cloud subscription to your existing Adobe ID account. They work exactly like gift cards for Adobe services."
                  },
                  {
                    question: "Do I need an existing Adobe ID to use redemption codes?",
                    answer: "Yes, you need an existing Adobe ID to redeem codes. If you don't have one, you can create a free Adobe ID at account.adobe.com before purchasing a redemption code."
                  },
                  {
                    question: "How quickly will I receive my redemption code?",
                    answer: "Redemption codes are delivered immediately via email after successful payment. You'll receive your code within minutes of completing your purchase."
                  },
                  {
                    question: "Are these codes legitimate and safe to use?",
                    answer: "Yes, absolutely. We provide genuine Adobe redemption codes through official channels. All codes are legitimate and work directly with Adobe's official redemption system."
                  },
                  {
                    question: "What happens if my redemption code doesn't work?",
                    answer: "If you encounter any issues with your redemption code, our support team will help you resolve the problem. We provide full support for all redemption code purchases and can assist with troubleshooting."
                  },
                  {
                    question: "Can I use multiple redemption codes on the same Adobe account?",
                    answer: "Yes, you can stack multiple redemption codes on the same Adobe account to extend your subscription period. Each code will add to your existing subscription time."
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
          <section className="py-20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                variants={itemVariants}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Get Your Official Adobe Code Today
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join thousands of creatives who trust CheapCC for their Adobe Creative Cloud redemption codes. 
                  Get official codes with maximum flexibility.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/?type=redemption-required&product=creative-cloud&scroll=creative-cloud-codes"
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/25"
                  >
                    Get Redemption Code
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

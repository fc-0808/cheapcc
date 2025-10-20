"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/supabase-client';
import type { Session } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { getPricingOptions, type PricingOption } from '@/utils/products-supabase';

// Import components
import Breadcrumb from "@/components/Breadcrumb";
import ProductPageWrapper from "@/components/ProductPageWrapper";
import ProfessionalPricingCard from "@/components/pricing/ProfessionalPricingCard";
import ProductPageRedirect from "@/components/ProductPageRedirect";


export default function PreActivatedAdobeCreativeCloud() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<string>('1m');
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [isUserSignedIn, setIsUserSignedIn] = useState<boolean>(false);

  // Filter for pre-activated products only
  const preActivatedOptions = pricingOptions.filter(option => 
    option.activationType === 'pre-activated' && 
    option.productType === 'subscription' &&
    option.adobeProductLine === 'creative_cloud'
  );

  // Fetch pricing options
  useEffect(() => {
    const fetchPricingOptions = async () => {
      try {
        const options = await getPricingOptions();
        setPricingOptions(options);
        
        // Set default selected price for pre-activated
        const defaultOption = options.find(opt => 
          opt.activationType === 'pre-activated' && 
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
        } else {
          setIsUserSignedIn(false);
        }
      }
    );

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsUserSignedIn(true);
      } else {
        setIsUserSignedIn(false);
      }
    };
    checkUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

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
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white relative overflow-hidden">
        
        {/* Breadcrumb Navigation - Fixed at top with proper z-index and pushed below header */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 mt-20 hidden md:block">
          <Breadcrumb 
            items={[
              { name: 'Adobe Creative Cloud', href: '/adobe-creative-cloud' },
              { name: 'Pre-activated Accounts', href: '/pre-activated-adobe-creative-cloud' }
            ]}
            currentPage="Pre-activated Adobe Creative Cloud"
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-red-900/20"></div>
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center max-w-4xl mx-auto"
                variants={itemVariants}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6"
                  variants={itemVariants}
                >
                  <i className="fas fa-bolt text-purple-400"></i>
                  <span className="text-purple-300 font-medium">Quick Access</span>
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                    Pre-activated Adobe Creative Cloud
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                  Get quick access to the complete Adobe Creative Cloud suite with pre-configured accounts. 
                  <span className="text-purple-400 font-semibold"> No setup required</span> - start creating immediately.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-check-circle text-green-400"></i>
                    <span className="text-green-300 font-medium">Quick Access</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-shield-check text-blue-400"></i>
                    <span className="text-blue-300 font-medium">100% Legitimate</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-full px-4 py-2">
                    <i className="fas fa-infinity text-purple-400"></i>
                    <span className="text-purple-300 font-medium">Full Suite Access</span>
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
                  Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Pre-activated Accounts</span>?
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Skip the setup hassle and dive straight into your creative workflow with accounts that are ready to use from day one.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "fas fa-rocket",
                    title: "Quick Access",
                    description: "No waiting, no setup - your account is ready to use immediately after purchase. Start creating within minutes.",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: "fas fa-user-check",
                    title: "Pre-configured",
                    description: "All Adobe apps are already installed and configured. Just log in and start using the full Creative Cloud suite.",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: "fas fa-clock",
                    title: "Time Saving",
                    description: "Skip hours of setup and configuration. Focus on what matters most - your creative work.",
                    color: "from-green-500 to-emerald-500"
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

          {/* Pricing Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Plan</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  All plans include the complete Adobe Creative Cloud suite with quick access to all applications.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {preActivatedOptions.map((option, index) => (
                  <ProfessionalPricingCard
                    key={option.id}
                    option={option}
                    selectedPrice={selectedPrice}
                    onSelectPrice={handlePlanSelect}
                    features={[
                      'Complete Adobe CC Suite',
                      'Quick Access',
                      'All Creative Apps',
                      'Cloud Storage'
                    ]}
                    productType="pre-activated"
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
                  How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Works</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Getting started with your pre-activated Adobe Creative Cloud account is simple and fast.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    step: "01",
                    title: "Choose & Purchase",
                    description: "Select your preferred plan and complete the secure checkout process. Payment is processed immediately.",
                    icon: "fas fa-shopping-cart"
                  },
                  {
                    step: "02", 
                    title: "Fast Delivery",
                    description: "Receive your pre-activated account credentials immediately via email. No waiting required.",
                    icon: "fas fa-envelope"
                  },
                  {
                    step: "03",
                    title: "Start Creating",
                    description: "Log in to your account and access all Adobe Creative Cloud applications immediately. Begin your creative journey.",
                    icon: "fas fa-palette"
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    variants={itemVariants}
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <i className={`${step.icon} text-white text-2xl`}></i>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">{step.step}</span>
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
              productType="pre-activated"
              adobeProductLine="creative_cloud"
              productName="Pre-activated Adobe Creative Cloud"
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
                  Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Questions</span>
                </h2>
              </motion.div>

              <div className="max-w-3xl mx-auto space-y-6">
                {[
                  {
                    question: "What exactly is a pre-activated Adobe Creative Cloud account?",
                    answer: "A pre-activated account is a fully configured Adobe Creative Cloud subscription that's ready to use immediately. All applications are installed and the account is set up, so you can start creating right away without any setup process."
                  },
                  {
                    question: "How quickly will I receive my account credentials?",
                    answer: "Account credentials are delivered immediately via email after successful payment. You'll receive login information and instructions within minutes of completing your purchase."
                  },
                  {
                    question: "Is this legitimate and safe?",
                    answer: "Yes, absolutely. We provide genuine Adobe Creative Cloud subscriptions through official channels. All accounts are legitimate and come with full Adobe support and updates."
                  },
                  {
                    question: "What happens if I have issues with my account?",
                    answer: "We provide full support for all pre-activated accounts. If you encounter any issues, our support team will help you resolve them quickly. We also provide detailed setup guides and troubleshooting resources."
                  },
                  {
                    question: "Can I use my own Adobe ID with this service?",
                    answer: "Pre-activated accounts come with their own Adobe ID that's already configured. If you prefer to use your own Adobe ID, consider our email-activation service instead."
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
          <section className="py-20 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                variants={itemVariants}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Start Creating?
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join thousands of creatives who trust CheapCC for their Adobe Creative Cloud needs. 
                  Get quick access to the complete suite today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/?type=pre-activated&product=creative-cloud&scroll=pricing"
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
                  >
                    Get Started Now
                  </Link>
                  <Link
                    href="/compare"
                    className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    Compare Plans
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

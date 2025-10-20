"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProductPageRedirectProps {
  productType: 'pre-activated' | 'email-activation' | 'redemption-required';
  adobeProductLine: 'creative_cloud' | 'acrobat_pro';
  productName: string;
  selectedPrice?: string;
  adobeEmail?: string;
  className?: string;
}

export default function ProductPageRedirect({ 
  productType, 
  adobeProductLine, 
  productName,
  selectedPrice,
  adobeEmail,
  className = "" 
}: ProductPageRedirectProps) {
  const getRedirectUrl = () => {
    const baseUrl = '/';
    const params = new URLSearchParams();
    
    // Add product type parameter
    if (productType === 'pre-activated') {
      params.set('type', 'pre-activated');
    } else if (productType === 'email-activation') {
      params.set('type', 'email-activation');
    } else if (productType === 'redemption-required') {
      params.set('type', 'redemption-required');
    }
    
    // Add product line parameter
    if (adobeProductLine === 'creative_cloud') {
      params.set('product', 'creative-cloud');
    } else if (adobeProductLine === 'acrobat_pro') {
      params.set('product', 'acrobat-pro');
    }
    
    // Add selected plan parameter if provided
    if (selectedPrice) {
      params.set('plan', selectedPrice);
    }
    
    // Add Adobe email parameter if provided (for email-activation only)
    if (adobeEmail && productType === 'email-activation') {
      params.set('adobeEmail', adobeEmail);
    }
    
    // Add scroll to specific section parameter
    if (productType === 'pre-activated') {
      params.set('scroll', 'pricing');
    } else if (productType === 'email-activation') {
      params.set('scroll', 'pricing');
    } else if (productType === 'redemption-required') {
      if (adobeProductLine === 'creative_cloud') {
        params.set('scroll', 'creative-cloud-codes');
      } else if (adobeProductLine === 'acrobat_pro') {
        params.set('scroll', 'acrobat-codes');
      }
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  const getButtonText = () => {
    if (productType === 'pre-activated') {
      return 'Get Pre-activated Account';
    } else if (productType === 'email-activation') {
      return 'Activate with Your Email';
    } else if (productType === 'redemption-required') {
      return 'Get Redemption Code';
    }
    return 'Get Started';
  };

  const getButtonIcon = () => {
    if (productType === 'pre-activated') {
      return 'fas fa-bolt';
    } else if (productType === 'email-activation') {
      return 'fas fa-user-cog';
    } else if (productType === 'redemption-required') {
      return 'fas fa-gift';
    }
    return 'fas fa-arrow-right';
  };

  const getGradientColors = () => {
    if (productType === 'pre-activated') {
      return 'from-purple-500 to-pink-500';
    } else if (productType === 'email-activation') {
      return 'from-blue-500 to-cyan-500';
    } else if (productType === 'redemption-required') {
      return 'from-emerald-500 to-teal-500';
    }
    return 'from-fuchsia-500 to-pink-500';
  };

  const getShadowColor = () => {
    if (productType === 'pre-activated') {
      return 'shadow-purple-500/25';
    } else if (productType === 'email-activation') {
      return 'shadow-blue-500/25';
    } else if (productType === 'redemption-required') {
      return 'shadow-emerald-500/25';
    }
    return 'shadow-fuchsia-500/25';
  };

  return (
    <div className={`py-20 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Main CTA Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${getGradientColors()} flex items-center justify-center shadow-lg`}>
                  <i className={`${getButtonIcon()} text-white text-2xl`}></i>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{productName}</span>?
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Complete your purchase securely on our main checkout page with industry-standard payment processing and instant delivery.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={getRedirectUrl()}
                    className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r ${getGradientColors()} text-white font-semibold text-lg shadow-lg ${getShadowColor()} hover:shadow-xl transition-all duration-300 border border-white/20`}
                  >
                    <i className={`${getButtonIcon()} text-lg`}></i>
                    {getButtonText()}
                    <i className="fas fa-arrow-right text-sm"></i>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/compare"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-balance-scale"></i>
                    Compare Options
                  </Link>
                </motion.div>
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 pt-8 border-t border-white/10"
              >
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shield-check text-green-400"></i>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-bolt text-yellow-400"></i>
                    <span>Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-headset text-blue-400"></i>
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-undo text-purple-400"></i>
                    <span>30-Day Refund</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              <i className="fas fa-info-circle mr-2"></i>
              You'll be redirected to our main checkout page where you can complete your purchase with industry-standard security and instant delivery.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

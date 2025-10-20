'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PricingOption } from '@/utils/products';
import { isRedemptionCode, getAdobeProductLine } from '@/utils/pricing-utils';
import SimplePricingCardList from './SimplePricingCardList';

interface GroupedPricingDisplayProps {
  pricingOptions: PricingOption[];
  selectedPrice: string;
  onSelectPrice: (priceId: string) => void;
  selectedActivationType?: 'pre-activated' | 'email-activation';
}

interface ProductGroup {
  id: string;
  title: string;
  subtitle: string;
  description: string | React.ReactNode;
  icon: string;
  products: PricingOption[];
  colorScheme: {
    gradient: string;
    iconBg: string;
    badge: string;
  };
}

export default function GroupedPricingDisplay({ 
  pricingOptions, 
  selectedPrice, 
  onSelectPrice, 
  selectedActivationType = 'pre-activated' 
}: GroupedPricingDisplayProps) {
  
  const productGroups = useMemo(() => {
    const groups: ProductGroup[] = [];
    
    // Group 1: Subscription Products (Pre-activated accounts)
    const subscriptions = pricingOptions.filter(option => !isRedemptionCode(option));
    if (subscriptions.length > 0) {
      groups.push({
        id: 'subscriptions',
        title: '',
        subtitle: '',
        description: '',
        icon: '',
        products: subscriptions,
        colorScheme: {
          gradient: 'from-purple-500 to-pink-500',
          iconBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
          badge: 'bg-gradient-to-r from-purple-500 to-pink-500'
        }
      });
    }
    
    // Group 2: Creative Cloud Redemption Codes
    const ccCodes = pricingOptions.filter(option => 
      isRedemptionCode(option) && getAdobeProductLine(option) === 'creative_cloud'
    );
    if (ccCodes.length > 0) {
      groups.push({
        id: 'creative-cloud-codes',
        title: 'Creative Cloud Codes',
        subtitle: 'Digital Redemption Codes',
        description: (
          <>
            Official Adobe codes to redeem on your existing account at{' '}
            <a 
              href="https://redeem.adobe.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline transition-colors duration-200"
            >
              redeem.adobe.com
            </a>
          </>
        ),
        icon: 'fas fa-palette',
        products: ccCodes,
        colorScheme: {
          gradient: 'from-emerald-500 to-teal-500',
          iconBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500'
        }
      });
    }
    
    // Group 3: Acrobat Pro Redemption Codes
    const acrobatCodes = pricingOptions.filter(option => 
      isRedemptionCode(option) && getAdobeProductLine(option) === 'acrobat_pro'
    );
    if (acrobatCodes.length > 0) {
      groups.push({
        id: 'acrobat-codes',
        title: 'Acrobat Pro Codes',
        subtitle: 'PDF & Document Solutions',
        description: (
          <>
            Professional PDF editing and document management codes to redeem at{' '}
            <a 
              href="https://redeem.adobe.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline transition-colors duration-200"
            >
              redeem.adobe.com
            </a>
          </>
        ),
        icon: 'fas fa-file-pdf',
        products: acrobatCodes,
        colorScheme: {
          gradient: 'from-red-500 to-orange-500',
          iconBg: 'bg-gradient-to-r from-red-500 to-orange-500',
          badge: 'bg-gradient-to-r from-red-500 to-orange-500'
        }
      });
    }
    
    return groups;
  }, [pricingOptions]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const groupVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <motion.div 
      className="space-y-16 md:space-y-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {productGroups.map((group, groupIndex) => (
        <motion.div 
          key={group.id}
          id={group.id}
          className="relative"
          variants={groupVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Section Header - Only show if title exists */}
          {group.title && (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <motion.div 
                className="text-center max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.2 + 0.3 }}
              >
                {/* Icon and Badge */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl ${group.colorScheme.iconBg} flex items-center justify-center shadow-lg`}>
                    <i className={`${group.icon} text-white text-2xl`}></i>
                  </div>
                </div>
                
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {group.title}
                </h2>
                
                {/* Subtitle */}
                <div className="mb-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium ${group.colorScheme.badge}`}>
                    {group.subtitle}
                  </span>
                </div>
                
                {/* Description */}
                <div className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                  {group.description}
                </div>
                
              </motion.div>
            </div>
          )}

          {/* Products Grid */}
          <div className="w-full">
            <SimplePricingCardList 
              pricingOptions={group.products} 
              selectedPrice={selectedPrice} 
              onSelectPrice={onSelectPrice}
              selectedActivationType={selectedActivationType}
            />
          </div>

        </motion.div>
      ))}
    </motion.div>
  );
}

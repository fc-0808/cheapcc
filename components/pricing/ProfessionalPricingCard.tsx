"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useInternationalization } from '@/contexts/InternationalizationContext';
import { PricingOption } from '@/utils/products-supabase';

interface ProfessionalPricingCardProps {
  option: PricingOption;
  selectedPrice: string;
  onSelectPrice: (priceId: string) => void;
  features: string[];
  productType: 'pre-activated' | 'email-activation' | 'redemption-code';
  adobeProductLine?: 'creative_cloud' | 'acrobat_pro';
}

const ProfessionalPricingCard: React.FC<ProfessionalPricingCardProps> = ({
  option,
  selectedPrice,
  onSelectPrice,
  features,
  productType,
  adobeProductLine = 'creative_cloud'
}) => {
  const { formatLocalPrice } = useInternationalization();
  
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15, 
        mass: 1 
      } 
    }
  };

  const isSelected = selectedPrice === option.id;
  const isRedemptionCode = productType === 'redemption-code';
  
  // Color schemes based on product type
  const getColorScheme = () => {
    if (isRedemptionCode) {
      return adobeProductLine === 'acrobat_pro' 
        ? {
            primary: 'from-red-500 to-orange-500',
            secondary: 'from-red-400 to-orange-400',
            accent: 'red-500',
            border: 'border-red-500/30',
            bg: 'from-red-500/10 to-orange-500/10',
            text: 'text-red-400'
          }
        : {
            primary: 'from-emerald-500 to-teal-500',
            secondary: 'from-emerald-400 to-teal-400',
            accent: 'emerald-500',
            border: 'border-emerald-500/30',
            bg: 'from-emerald-500/10 to-teal-500/10',
            text: 'text-emerald-400'
          };
    }
    
    if (productType === 'email-activation') {
      return {
        primary: 'from-blue-500 to-cyan-500',
        secondary: 'from-blue-400 to-cyan-400',
        accent: 'blue-500',
        border: 'border-blue-500/30',
        bg: 'from-blue-500/10 to-cyan-500/10',
        text: 'text-blue-400'
      };
    }
    
    // pre-activated
    return {
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-purple-400 to-pink-400',
      accent: 'purple-500',
      border: 'border-purple-500/30',
      bg: 'from-purple-500/10 to-pink-500/10',
      text: 'text-purple-400'
    };
  };

  const colors = getColorScheme();

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full max-w-sm mx-auto rounded-2xl p-6 cursor-pointer transition-all duration-300
        ${isSelected 
          ? `bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-2xl shadow-${colors.accent}/25` 
          : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/10'
        }
      `}
      onClick={() => onSelectPrice(option.id)}
    >

      {/* Product Type Badge */}
      <div className="absolute -top-3 -right-3 z-10">
        <div className={`
          px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg
          bg-gradient-to-r ${colors.primary}
        `}>
          {isRedemptionCode 
            ? (adobeProductLine === 'acrobat_pro' ? 'ACROBAT CODE' : 'CC CODE')
            : (productType === 'email-activation' ? 'EMAIL-ACTIVATION' : 'PRE-ACTIVATED')
          }
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className={`
            w-6 h-6 rounded-full bg-gradient-to-r ${colors.primary} 
            flex items-center justify-center
          `}>
            <i className="fas fa-check text-white text-sm"></i>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="text-left">
        {/* Duration */}
        <div className="text-gray-300 text-lg font-medium mb-3">
          {option.duration}
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-4xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
              {formatLocalPrice(option.price)}
            </span>
            {option.originalPrice && option.originalPrice > option.price && (
              <span className="text-xl text-gray-400 line-through">
                {formatLocalPrice(option.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Savings Badge */}
          {option.originalPrice && option.originalPrice > option.price && (
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              <i className="fas fa-tag text-xs"></i>
              {Math.round(((option.originalPrice - option.price) / option.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {option.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className={`
                w-5 h-5 rounded-full bg-gradient-to-r ${colors.primary} 
                flex items-center justify-center flex-shrink-0
              `}>
                <i className="fas fa-check text-white text-xs"></i>
              </div>
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 text-center
            ${isSelected 
              ? `bg-gradient-to-r ${colors.primary} text-white shadow-lg shadow-${colors.accent}/25` 
              : `bg-gradient-to-r ${colors.primary} text-white hover:shadow-lg hover:shadow-${colors.accent}/25`
            }
          `}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </motion.button>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-br ${colors.bg} pointer-events-none
      `} />
    </motion.div>
  );
};

export default ProfessionalPricingCard;

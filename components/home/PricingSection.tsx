"use client";
import React, { useEffect, useRef, useMemo, Suspense } from 'react';
import { PRICING_OPTIONS } from '@/utils/products';
import { useInView, motion } from 'framer-motion';
import PricingSchema from './pricing/PricingSchema';
import PricingHeading from './pricing/PricingHeading';
import SimplePricingCardList from './pricing/SimplePricingCardList';

// Simple fallback component
function PricingFallback() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex overflow-x-auto gap-4 justify-center">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="w-[220px] h-[420px] bg-[rgba(30,30,50,0.4)] border border-[rgba(255,255,255,0.08)] rounded-xl flex-shrink-0 animate-pulse"
          >
            <div className="h-full w-full flex flex-col items-center justify-center p-6">
              <div className="w-20 h-6 bg-white/10 rounded-md mb-4"></div>
              <div className="w-28 h-12 bg-white/10 rounded-md mb-8"></div>
              <div className="w-32 h-5 bg-white/10 rounded-md mb-3"></div>
              <div className="w-32 h-5 bg-white/10 rounded-md mb-3"></div>
              <div className="w-32 h-5 bg-white/10 rounded-md mb-8"></div>
              <div className="w-36 h-10 bg-white/10 rounded-md mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PricingSectionProps {
  selectedPrice: string;
  setSelectedPrice: (priceId: string) => void;
  selectedPriceRef: { current: string };
  userEmail?: string | null;
  selectedActivationType?: 'pre-activated' | 'self-activation';
  onActivationTypeChange?: (type: 'pre-activated' | 'self-activation') => void;
  email?: string;
  setEmail?: (email: string) => void;
  isUserSignedIn?: boolean;
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function PricingSection({ selectedPrice, setSelectedPrice, selectedPriceRef, userEmail, selectedActivationType, onActivationTypeChange, email, setEmail, isUserSignedIn }: PricingSectionProps) {
  const pricingRef = useRef<HTMLDivElement>(null);
  const [adminError, setAdminError] = React.useState<string | null>(null);
  
  // Ensure scrollable container starts at correct position
  useEffect(() => {
    if (pricingRef.current && window.innerWidth >= 768 && window.innerWidth <= 1023) {
      // Set initial scroll position for tablet view to show first card properly
      requestAnimationFrame(() => {
        if (pricingRef.current) {
          // Just enough to allow scrolling left
          const container = pricingRef.current.querySelector('.pricing-container');
          if (container) {
            (container as HTMLElement).scrollLeft = 1;
          }
        }
      });
    }
  }, []);

  const isAdmin = useMemo(() => {
    try {
      if (!ADMIN_EMAIL) {
        console.warn('NEXT_PUBLIC_ADMIN_EMAIL environment variable is not set');
        return false;
      }
      if (!userEmail) {
        return false;
      }
      return userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdminError('Error validating admin privileges');
      return false;
    }
  }, [userEmail]);

  const sortedPricingOptions = useMemo(() => {
    try {
      const options = [...PRICING_OPTIONS]
        .filter(option => {
          if (option.id === 'test-payment' || (option.id === 'test-live' && !isAdmin) || (option.adminOnly && !isAdmin)) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          const durationOrder: Record<string, number> = { "1 day": 0, "14 days": 1, "1 month": 2, "3 months": 3, "6 months": 4, "12 months": 5 };
          return (durationOrder[a.duration] || 99) - (durationOrder[b.duration] || 99);
        });
      
      console.log("Sorted pricing options:", options);
      return options;
    } catch (error) {
      console.error('Error processing pricing options:', error);
      return [];
    }
  }, [isAdmin]);

  const handlePlanSelect = (optionId: string) => {
    if (selectedPrice !== optionId) {
      setSelectedPrice(optionId);
      selectedPriceRef.current = optionId;
    }
    setTimeout(() => {
      document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  };

  // Ensure we have pricing options
  useEffect(() => {
    console.log("PRICING_OPTIONS:", PRICING_OPTIONS);
    console.log("Filtered pricing options:", sortedPricingOptions);
  }, [sortedPricingOptions]);

  return (
    <>
      <PricingSchema pricingOptions={PRICING_OPTIONS} />
      <section className="relative py-20 md:py-32 overflow-visible w-full" id="pricing" ref={pricingRef}>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <PricingHeading 
            isAdmin={isAdmin} 
            adminError={adminError}
            selectedActivationType={selectedActivationType}
            onActivationTypeChange={onActivationTypeChange}
            email={email}
            setEmail={setEmail}
            isUserSignedIn={isUserSignedIn}
          />
        </div>

        <div className="w-full overflow-visible">
          <Suspense fallback={<PricingFallback />}>
            {sortedPricingOptions.length > 0 ? (
              <SimplePricingCardList 
                pricingOptions={sortedPricingOptions} 
                selectedPrice={selectedPrice} 
                onSelectPrice={handlePlanSelect}
                selectedActivationType={selectedActivationType}
              />
            ) : (
              <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <p className="text-white">No pricing options are currently available. Please try refreshing the page.</p>
                </div>
              </div>
            )}
          </Suspense>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <motion.div className="text-right sm:text-right mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400 italic md:-mr-14" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            *All prices are listed in USD
          </motion.div>
          {/* Extra spacing div for tablet view */}
          <div className="hidden md:block lg:hidden h-10"></div>
          <motion.div
            className="md:hidden flex justify-center items-center mt-4 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.div
              className="flex items-center gap-2 text-white/80 text-xs bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ touchAction: 'none' }}
            >
              <i className="fas fa-arrow-left text-pink-500"></i>
              <span>Swipe to view all plans</span>
              <i className="fas fa-arrow-right text-pink-500"></i>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
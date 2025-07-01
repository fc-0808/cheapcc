"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Script from 'next/script';
import { PRICING_OPTIONS } from '@/utils/products';
import { motion, useInView, AnimatePresence } from 'framer-motion';

interface PricingSectionProps {
  selectedPrice: string;
  setSelectedPrice: (priceId: string) => void;
  selectedPriceRef: { current: string };
  userEmail?: string | null;
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

interface HoverParticle {
  top: string;
  left: string;
  color: string;
  delay: number;
  duration: number;
}

// Features consistent across all pricing options
const COMMON_FEATURES = [
  { text: "All Adobe Apps", icon: "fa-check" },
  { text: "All AI features", icon: "fa-check" },
  { text: "100GB Cloud", icon: "fa-check" }
];

export default function PricingSection({ selectedPrice, setSelectedPrice, selectedPriceRef, userEmail }: PricingSectionProps) {
  const pricingRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(pricingRef, { once: true, margin: "-100px" });
  const [adminError, setAdminError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoverParticles, setHoverParticles] = useState<{[key: string]: HoverParticle[]}>({});

  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px 0px" });

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

  useEffect(() => {
    const newHoverParticles: {[key: string]: HoverParticle[]} = {};
    PRICING_OPTIONS.forEach(option => {
      let color;
      if (option.id === '14d') color = '#ff3366';
      else if (option.id === '1m') color = '#7e22ce';
      else if (option.id === '6m') color = '#3b82f6';
      else color = '#10b981';

      newHoverParticles[option.id] = Array(5).fill(0).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        color,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 3
      }));
    });
    setHoverParticles(newHoverParticles);
  }, []);

  const handlePlanSelect = (optionId: string) => {
    if (selectedPrice !== optionId) {
      setSelectedPrice(optionId);
      selectedPriceRef.current = optionId;
    }
    setTimeout(() => {
      document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  };

  const sortedPricingOptions = useMemo(() => {
    try {
      return [...PRICING_OPTIONS]
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
    } catch (error) {
      console.error('Error processing pricing options:', error);
      return [];
    }
  }, [isAdmin]);

  const productSchema = useMemo(() => {
    try {
      const filteredOptions = PRICING_OPTIONS.filter(p => !p.adminOnly && p.id !== 'test-live' && p.id !== 'test-payment');
      if (filteredOptions.length === 0) {
        return null;
      }
      const prices = filteredOptions.map(p => p.price);
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Adobe Creative Cloud All Apps Subscription",
        "description": "Get genuine Adobe Creative Cloud subscriptions for up to 75% off.",
        "brand": { "@type": "Brand", "name": "Adobe" },
        "image": "https://cheapcc.online/og-image.jpg",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "lowPrice": Math.min(...prices),
          "highPrice": Math.max(...prices),
          "offerCount": filteredOptions.length,
          "offers": filteredOptions.map(option => ({
            "@type": "Offer",
            "name": `Adobe Creative Cloud - ${option.duration}`,
            "price": option.price.toFixed(2),
            "priceCurrency": "USD",
            "description": option.description,
            "url": "https://cheapcc.online/#pricing",
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": "CheapCC" }
          }))
        }
      };
    } catch (error) {
      console.error('Error generating product schema:', error);
      return null;
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <>
      {productSchema && <Script id="product-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />}
      <section className="relative py-20 md:py-32" id="pricing" ref={pricingRef}>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as any }}>
            <motion.h2
              ref={titleRef}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
              style={{
                textShadow: '0 0 20px rgba(255, 51, 102, 0.3)',
                transform: titleInView ? "perspective(1000px) rotateX(0deg)" : "perspective(1000px) rotateX(10deg)",
                willChange: 'transform'
              }}
            >
              <motion.span
                className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{ backgroundSize: "200% 100%", willChange: 'background-position' }}
              >
                Unbeatable
              </motion.span>
              <motion.span
                className="inline-block"
                animate={{ y: [0, -5, 0], x: [0, 2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                &nbsp;Adobe CC Value{" "}
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-white/80 mx-auto mb-8 text-base sm:text-lg font-light tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Choose the plan that works for you. All plans include the complete Adobe CC suite.
            </motion.p>
            {adminError && <motion.div className="mt-2 text-sm text-red-300 bg-red-900 bg-opacity-50 p-2 rounded-md mx-auto max-w-md"><i className="fas fa-exclamation-triangle mr-1"></i> {adminError}</motion.div>}
            {isAdmin && <motion.div className="mt-2 text-sm text-green-300 bg-green-900 bg-opacity-50 p-2 rounded-md mx-auto max-w-md"><i className="fas fa-check-circle mr-1"></i> Admin features enabled</motion.div>}
          </motion.div>
        </div>

        {/* --- FIX APPLIED HERE --- */}
        {/*
          This container now breaks out of the parent's padding to achieve a "full-bleed" effect.
          - `w-screen`: Makes it as wide as the viewport.
          - `-ml-[50vw] left-1/2`: Centers the viewport-width element on the screen.
          - `px-4 sm:px-6 md:px-8`: This padding is now applied correctly to provide gutters at the screen edges.
        */}
        <motion.div
          className="relative left-1/2 -ml-[50vw] w-screen flex overflow-x-auto pb-8 snap-x snap-mandatory sm:snap-none justify-start md:justify-center gap-6 lg:gap-8 mt-10 md:mt-14 hide-scrollbar px-4 sm:px-6 md:px-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedPricingOptions.length > 0 ? (
            sortedPricingOptions.map((option) => (
              <motion.div
                key={option.id}
                className={`relative group rounded-xl backdrop-blur-sm p-4 sm:p-6 transition-all duration-300 transform cursor-pointer flex-shrink-0 snap-center ${
                  selectedPrice === option.id
                    ? 'bg-gradient-to-br from-[rgba(217,70,239,0.2)] to-[rgba(225,29,72,0.2)] border border-[rgba(226,51,102,0.4)] shadow-[0_0_15px_rgba(226,51,102,0.25)]'
                    : 'bg-[rgba(30,30,50,0.4)] border border-[rgba(255,255,255,0.08)]'
                }`}
                style={{
                  width: '220px',
                  minHeight: '420px',
                  perspective: '1000px',
                  transformStyle: 'preserve-3d', // Good for child animations
                }}
                onClick={() => handlePlanSelect(option.id)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPrice === option.id}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
                variants={cardVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)" }}
              >
                <div className="flex flex-col h-full w-full">
                  {option.id === '14d' && (
                    <div className="absolute top-0 left-0 -translate-x-1 -translate-y-1 z-10">
                      <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white text-[0.65rem] sm:text-xs font-bold rounded-tl-lg rounded-br-lg shadow-lg">
                        ONE-TIME
                      </div>
                    </div>
                  )}
                  {option.id === '6m' && (
                    <div className="absolute top-0 left-0 -translate-x-1 -translate-y-1 z-10">
                      <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-[0.65rem] sm:text-xs font-bold rounded-tl-lg rounded-br-lg shadow-lg flex items-center gap-0.5 sm:gap-1">
                        <i className="fas fa-star text-[0.6rem] sm:text-xs opacity-90"></i>
                        BEST VALUE
                      </div>
                    </div>
                  )}

                  <motion.div className="text-gray-200 text-base font-medium mb-3 sm:mb-5 text-center mt-2">{option.duration}</motion.div>

                  <motion.div
                    className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center"
                    style={{ textShadow: selectedPrice === option.id ? "0 0 20px rgba(255, 51, 102, 0.6)" : "0 0 10px rgba(255, 51, 102, 0.3)"}}
                  >
                    <span className="relative inline-block">${option.price}</span>
                  </motion.div>

                  <div className="flex-grow">
                    <div className="text-gray-300 text-xs sm:text-sm space-y-2 sm:space-y-3 mb-5 sm:mb-8">
                      {COMMON_FEATURES.map((feature) => (
                        <div key={feature.text} className="flex items-center">
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2 sm:mr-3">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, #d946ef 20%, #e11d48 80%)", boxShadow: "0 2px 6px rgba(255, 51, 102, 0.4)"}}
                            >
                              <i className={`fas ${feature.icon} text-white text-xs`} />
                            </div>
                          </div>
                          <span className="text-gray-200">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    className={`w-full py-2.5 rounded-md transition-all duration-300 ${selectedPrice === option.id ? 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white shadow-lg' : 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]'}`}
                    onClick={(e) => { e.stopPropagation(); handlePlanSelect(option.id); }}
                  >
                    {selectedPrice === option.id ? 'Selected' : 'Select'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {hoverParticles[option.id]?.map((particle, particleIndex) => (
                    <motion.div
                      key={`particle-${option.id}-${particleIndex}`}
                      className="absolute w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100"
                      style={{ top: particle.top, left: particle.left, backgroundColor: particle.color, filter: "blur(0.5px)", boxShadow: `0 0 8px ${particle.color}` }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ y: [0, -30 - Math.random() * 40], x: [0, (Math.random() - 0.5) * 50], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}
                      transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: [0.23, 0.94, 0.41, 1.2] }}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.div className="p-6 text-center bg-[rgba(255,255,255,0.05)] rounded-lg col-span-full border border-[rgba(255,255,255,0.1)]">
              <i className="fas fa-exclamation-circle text-yellow-500 text-2xl mb-2"></i>
              <p className="text-gray-300">No pricing options available. Please try refreshing the page.</p>
            </motion.div>
          )}
        </motion.div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div className="text-center sm:text-right mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400 italic" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.8 }}>
              *All prices are listed in USD
            </motion.div>
            <motion.div
              className="md:hidden flex justify-center items-center mt-4 mb-2"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-2 text-white/80 text-xs bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
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
        delay: Math.random() * 3, // Increased random delay range
        duration: 3 + Math.random() * 3 // Increased random duration range
      }));
    });
    setHoverParticles(newHoverParticles);
  }, []);

  useEffect(() => {
    if (userEmail) {
      const adminDomains = ['@cheapcc.online', '@cheapcc.cc', '@admin.cc'];
      if (!adminDomains.some(domain => userEmail.includes(domain))) {
        setAdminError('You do not have admin privileges');
      }
    }
  }, [userEmail]);

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

  const handleCardHover = (optionId: string) => {
    setHoveredCard(optionId);
  };

  return (
    <>
      {productSchema && <Script id="product-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />}
      <section className="relative py-20 md:py-32 overflow-hidden" id="pricing" ref={pricingRef}>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as any }}>
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
              Unbeatable
            </motion.span>
            <motion.span 
              className="inline-block"
              animate={{ 
                y: [0, -5, 0],
                x: [0, 2, 0]
              }}
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
            {adminError && <motion.div className="mt-2 text-sm text-red-300 bg-red-900 bg-opacity-50 p-2 rounded-md mx-auto max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}><i className="fas fa-exclamation-triangle mr-1"></i> {adminError}</motion.div>}
            {isAdmin && <motion.div className="mt-2 text-sm text-green-300 bg-green-900 bg-opacity-50 p-2 rounded-md mx-auto max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}><i className="fas fa-check-circle mr-1"></i> Admin features enabled</motion.div>}
          </motion.div>
          
          <motion.div className="flex flex-nowrap justify-center gap-4 sm:gap-6 lg:gap-8 w-full mt-14" initial="hidden" animate={isInView ? "visible" : "hidden"} variants={containerVariants}>
            {sortedPricingOptions.length > 0 ? (
              sortedPricingOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  className={`relative group rounded-xl backdrop-blur-sm p-4 sm:p-6 transition-all duration-300 transform cursor-pointer transform-style-preserve-3d ${ // Added group and transform-style
                    selectedPrice === option.id 
                      ? 'bg-gradient-to-br from-[rgba(217,70,239,0.15)] to-[rgba(225,29,72,0.15)] border border-[rgba(226,51,102,0.3)]' 
                      : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]'
                  } ${option.adminOnly ? 'admin-only' : ''}`}
                  style={{ width: '220px', minHeight: '420px', perspective: '1000px' }} // Added perspective
                  onClick={() => handlePlanSelect(option.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrice === option.id}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
                  variants={cardVariants}
                  onHoverStart={() => handleCardHover(option.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)" }}
                >
                  <div className="flex flex-col h-full">
                    {/* *** UPDATED RIBBONS START HERE *** */}
                    {option.id === '14d' && (
                        <div className="absolute top-0 left-0 -translate-x-1 -translate-y-1">
                            <div className="px-3 py-1 bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white text-xs font-bold rounded-tl-lg rounded-br-lg shadow-lg">
                                ONE-TIME
                            </div>
                        </div>
                    )}
                    {option.id === '6m' && (
                        <div className="absolute top-0 left-0 -translate-x-1 -translate-y-1">
                            <div className="px-3 py-1 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold rounded-tl-lg rounded-br-lg shadow-lg flex items-center gap-1">
                                <i className="fas fa-star text-xs opacity-80"></i>
                                BEST VALUE
                            </div>
                        </div>
                    )}
                    {/* *** UPDATED RIBBONS END HERE *** */}

                    <motion.div className="text-gray-200 text-base font-medium mb-5 text-center mt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
                      {option.duration}
                    </motion.div>
                    
                    <motion.div className="text-white text-3xl sm:text-4xl font-bold mb-6 text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 100 }} style={{ textShadow: selectedPrice === option.id || hoveredCard === option.id ? "0 0 20px rgba(255, 51, 102, 0.6)" : "0 0 10px rgba(255, 51, 102, 0.3)" }}>
                      ${option.price}
                    </motion.div>

                    <div className="flex-grow">
                      <motion.div className="text-gray-300 text-sm space-y-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + index * 0.1 }}>
                        <div className="flex items-center"><motion.i className="fas fa-check mr-3 p-1 rounded-full" style={{ color: "#fff", background: "linear-gradient(135deg, #d946ef 20%, #e11d48 80%)", boxShadow: "0 2px 6px rgba(255, 51, 102, 0.4)" }} whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}></motion.i><span >All Adobe Apps</span></div>
                        <div className="flex items-center"><motion.i className="fas fa-check mr-3 p-1 rounded-full" style={{ color: "#fff", background: "linear-gradient(135deg, #d946ef 20%, #e11d48 80%)", boxShadow: "0 2px 6px rgba(255, 51, 102, 0.4)" }} whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}></motion.i><span>All AI features</span></div>
                        <div className="flex items-center"><motion.i className="fas fa-check mr-3 p-1 rounded-full" style={{ color: "#fff", background: "linear-gradient(135deg, #d946ef 20%, #e11d48 80%)", boxShadow: "0 2px 6px rgba(255, 51, 102, 0.4)" }} whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}></motion.i><span>100GB Cloud</span></div>
                      </motion.div>
                    </div>
                    
                    <motion.button className={`w-full py-2.5 rounded-md transition-all duration-300 ${selectedPrice === option.id ? 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white hover:bg-gradient-to-r hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-700 shadow-lg' : 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]'}`} whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)" }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} onClick={(e) => { e.stopPropagation(); handlePlanSelect(option.id); }}>
                      {selectedPrice === option.id ? 'Selected' : 'Select'}
                    </motion.button>
                  </div>

                  {/* *** NEW STARS ANIMATION APPLIED HERE *** */}
                  <AnimatePresence>
                    {hoverParticles[option.id]?.map((particle, particleIndex) => (
                      <motion.div
                        key={`particle-${option.id}-${particleIndex}`}
                        className="absolute w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100"
                        style={{
                          top: particle.top,
                          left: particle.left,
                          backgroundColor: particle.color,
                          filter: "blur(0.5px)",
                          boxShadow: `0 0 8px ${particle.color}`,
                          willChange: "transform, opacity",
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          y: [0, -30 - Math.random() * 40],
                          x: [0, (Math.random() - 0.5) * 50],
                          opacity: [0, 0.8, 0],
                          scale: [0.5, 1, 0.5],
                          z: [0, 30, 0]
                        }}
                        transition={{
                          duration: particle.duration,
                          repeat: Infinity,
                          delay: particle.delay,
                          ease: [0.23, 0.94, 0.41, 1.2]
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div className="p-6 text-center bg-[rgba(255,255,255,0.05)] rounded-lg shadow-sm col-span-full border border-[rgba(255,255,255,0.1)]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <i className="fas fa-exclamation-circle text-yellow-500 text-2xl mb-2"></i>
                <p className="text-gray-300">No pricing options available. Please try refreshing the page.</p>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div className="text-right mt-6 text-sm text-gray-400 italic" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.8 }}>
            *All prices are listed in USD
          </motion.div>
        </div>
      </section>
    </>
  );
}
"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Script from 'next/script'; // Import the Script component
import { PRICING_OPTIONS } from '@/utils/products';
import { motion, useInView, AnimatePresence } from 'framer-motion';

interface PricingSectionProps {
  selectedPrice: string;
  setSelectedPrice: (priceId: string) => void;
  selectedPriceRef: { current: string };
  userEmail?: string | null;
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

// Utility types for storing particle data
interface BackgroundParticle {
  top: string;
  left: string;
  delay: number;
  duration: number;
}

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
  const [isClient, setIsClient] = useState(false);
  const [backgroundParticles, setBackgroundParticles] = useState<BackgroundParticle[]>([]);
  const [hoverParticles, setHoverParticles] = useState<{[key: string]: HoverParticle[]}>({});
  
  // Check if admin email is properly configured
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

  // Client-side only effects
  useEffect(() => {
    setIsClient(true);
    
    // Generate background particles
    if (isClient) {
      setBackgroundParticles(
        Array(10).fill(0).map(() => ({
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          delay: Math.random() * 5,
          duration: Math.random() * 10 + 10
        }))
      );

      // Pre-generate hover particles for each pricing option
      const newHoverParticles: {[key: string]: HoverParticle[]} = {};
      
      PRICING_OPTIONS.forEach(option => {
        // Select color based on option
        let color;
        if (option.id === '14d') color = '#ff3366';
        else if (option.id === '1m') color = '#7e22ce';
        else if (option.id === '6m') color = '#3b82f6';
        else color = '#10b981';
        
        newHoverParticles[option.id] = Array(5).fill(0).map(() => ({
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          color,
          delay: Math.random() * 2,
          duration: 2 + Math.random() * 3
        }));
      });
      
      setHoverParticles(newHoverParticles);
    }
  }, [isClient]);

  useEffect(() => {
    // Email validation with common admin domains
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
      const el = document.getElementById('checkout');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  };

  // Filter and sort pricing options based on user status
  const sortedPricingOptions = useMemo(() => {
    try {
      return [...PRICING_OPTIONS]
        .filter(option => {
          try {
            // Filter out test options and admin-only options for non-admins
            if (option.id === 'test-payment') return false;
            if (option.id === 'test-live' && !isAdmin) return false;
            if (option.adminOnly && !isAdmin) return false;
            return true;
          } catch (error) {
            console.error('Error filtering pricing option:', error, option);
            return false;
          }
        })
        .sort((a, b) => {
          try {
            const durationOrder: Record<string, number> = { 
              "1 day": 0,
              "14 days": 1, 
              "1 month": 2, 
              "3 months": 3, 
              "6 months": 4, 
              "12 months": 5 
            };
            return (durationOrder[a.duration] || 99) - (durationOrder[b.duration] || 99);
          } catch (error) {
            console.error('Error sorting pricing options:', error);
            return 0;
          }
        });
    } catch (error) {
      console.error('Error processing pricing options:', error);
      return [];
    }
  }, [PRICING_OPTIONS, isAdmin]);

  // Define the JSON-LD schema for the product and its offers
  const productSchema = useMemo(() => {
    try {
      const filteredOptions = PRICING_OPTIONS.filter(p => !p.adminOnly && p.id !== 'test-live' && p.id !== 'test-payment');
      
      if (filteredOptions.length === 0) {
        console.error('No valid pricing options available for schema');
        return null;
      }
      
      const prices = filteredOptions.map(p => p.price);
      const lowPrice = Math.min(...prices);
      const highPrice = Math.max(...prices);
      
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Adobe Creative Cloud All Apps Subscription",
        "description": "Get genuine Adobe Creative Cloud subscriptions for up to 75% off. Includes all Adobe apps like Photoshop, Illustrator, and Premiere Pro with full functionality and updates.",
        "brand": {
          "@type": "Brand",
          "name": "Adobe"
        },
        "image": "https://cheapcc.online/og-image.jpg",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "lowPrice": lowPrice,
          "highPrice": highPrice,
          "offerCount": filteredOptions.length,
          "offers": filteredOptions.map(option => ({
            "@type": "Offer",
            "name": `Adobe Creative Cloud - ${option.duration}`,
            "price": option.price.toFixed(2),
            "priceCurrency": "USD",
            "description": option.description,
            "url": "https://cheapcc.online/#pricing",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "CheapCC"
            }
          }))
        }
      };
    } catch (error) {
      console.error('Error generating product schema:', error);
      return null;
    }
  }, [PRICING_OPTIONS]);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring" as const, 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  const handleCardHover = (optionId: string) => {
    setHoveredCard(optionId);
  };

  // Static placeholder for initial server render to prevent layout shift
  if (!isClient) {
    return (
      <section 
        id="pricing" 
        ref={pricingRef}
        className="relative py-20 md:py-32 bg-gradient-to-b from-[#171746] via-[#131347] to-[#151533]"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Unbeatable Adobe CC Value
            </h2>
            <p className="text-[#d1d5db] text-lg max-w-3xl mx-auto">
              Choose the plan that works for you. All plans include the complete Adobe CC suite.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {/* Static placeholder cards */}
            {sortedPricingOptions.map((option) => (
              <div key={option.id} className="opacity-0" style={{ width: '230px', height: '380px' }}>
                <div className="h-full w-full rounded-xl" style={{backgroundColor: 'rgba(30, 30, 60, 0.6)'}}>
                  {/* Empty card for layout spacing */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Client-side render with all animations and dynamic content
  return (
    <>
      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <section className="relative bg-gradient-to-b from-[#171746] via-[#131347] to-[#151533] py-20 md:py-32 overflow-hidden" id="pricing" ref={pricingRef}>
        {/* Background effects */}
        {backgroundParticles.map((particle, i) => (
          <motion.div
            key={`bg-particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white opacity-20"
            style={{ top: particle.top, left: particle.left, filter: "blur(1px)", willChange: "transform, opacity" }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay }}
          />
        ))}

        {/* Animated Nebula and Stars - matching Hero section */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(120,_80,_255,_0.15),_transparent_70%)]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,_51,_102,_0.1),_transparent_70%)]"
          animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] }}
            >
              Unbeatable Adobe CC Value
            </motion.h2>
            <motion.p 
              className="text-[#d1d5db] text-lg max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] }}
            >
              Choose the plan that works for you. All plans include the complete Adobe CC suite.
            </motion.p>
            
            {adminError && (
              <motion.div 
                className="mt-2 text-sm text-red-300 bg-red-900 bg-opacity-50 p-2 rounded-md mx-auto max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <i className="fas fa-exclamation-triangle mr-1"></i> {adminError}
              </motion.div>
            )}
            
            {isAdmin && (
              <motion.div 
                className="mt-2 text-sm text-green-300 bg-green-900 bg-opacity-50 p-2 rounded-md mx-auto max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <i className="fas fa-check-circle mr-1"></i> Admin features enabled
              </motion.div>
            )}
          </motion.div>
          
          {/* Unified Pricing Grid for all screen sizes */}
          <motion.div 
            className="flex flex-nowrap justify-center gap-4 sm:gap-6 lg:gap-8 w-full"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {sortedPricingOptions.length > 0 ? (
              sortedPricingOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  // Removed overflow hidden and added fixed width instead of responsive
                  className={`relative rounded-xl backdrop-blur-sm p-4 sm:p-6 transition-all duration-300 transform cursor-pointer ${
                    selectedPrice === option.id 
                      ? 'bg-gradient-to-br from-[rgba(255,51,102,0.15)] to-[rgba(255,51,102,0.05)] border border-[rgba(255,51,102,0.3)]' 
                      : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]'
                  } ${option.adminOnly ? 'admin-only' : ''}`}
                  style={{ width: '220px' }} // Fixed width for consistent single row
                  onClick={() => handlePlanSelect(option.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrice === option.id}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
                  variants={cardVariants}
                  onHoverStart={() => handleCardHover(option.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {/* Shared Card Content */}
                  <div className="flex flex-col h-full">
                    {option.id === '14d' && (
                      <motion.div 
                        className="absolute -right-[3.5rem] -top-3 rotate-45 w-[170px] text-center text-xs py-1.5 z-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        style={{
                          background: 'linear-gradient(135deg, #ff3366 30%, #ff66a3 100%)',
                          boxShadow: '0 4px 15px rgba(255, 51, 102, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                          backdropFilter: 'blur(4px)',
                          fontWeight: '600',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <span style={{ position: 'relative' }}>
                          <span style={{ opacity: 0.8 }}>•</span> One-Time <span style={{ opacity: 0.8 }}>•</span>
                        </span>
                      </motion.div>
                    )}
                    
                    {option.id === '6m' && (
                      <motion.div 
                        className="absolute -right-[3.5rem] -top-3 rotate-45 w-[170px] text-center text-xs py-1.5 z-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        style={{
                          background: 'linear-gradient(135deg, #5c93ff 30%, #8ab4ff 100%)',
                          boxShadow: '0 4px 15px rgba(92, 147, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                          backdropFilter: 'blur(4px)',
                          fontWeight: '600',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <span style={{ position: 'relative' }}>
                          <span style={{ opacity: 0.8 }}>★</span> Best Value <span style={{ opacity: 0.8 }}>★</span>
                        </span>
                      </motion.div>
                    )}
                    
                    {option.adminOnly && (
                      <motion.div 
                        className="absolute -right-[3.5rem] -top-3 rotate-45 w-[170px] text-center text-xs py-1.5 z-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        style={{
                          background: 'linear-gradient(135deg, #2c2d5a 30%, #3e3f7a 100%)',
                          boxShadow: '0 4px 15px rgba(44, 45, 90, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                          backdropFilter: 'blur(4px)',
                          fontWeight: '600',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <span style={{ position: 'relative' }}>
                          <span style={{ opacity: 0.8 }}>•</span> Admin Only <span style={{ opacity: 0.8 }}>•</span>
                        </span>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className="text-gray-200 text-base font-medium mb-3 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {option.duration}
                    </motion.div>
                    
                    <motion.div 
                      className="text-white text-3xl sm:text-4xl font-bold mb-4 text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 100 }}
                      style={{ textShadow: selectedPrice === option.id || hoveredCard === option.id ? "0 0 15px rgba(255, 51, 102, 0.5)" : "none" }}
                    >
                      ${option.price}
                    </motion.div>

                    <div className="flex-grow">
                      <motion.div 
                        className="text-gray-300 text-sm space-y-2 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center"><i className="fas fa-check text-[#ff3366] mr-2"></i><span>All Adobe Apps</span></div>
                        <div className="flex items-center"><i className="fas fa-check text-[#ff3366] mr-2"></i><span>All AI features</span></div>
                        <div className="flex items-center"><i className="fas fa-check text-[#ff3366] mr-2"></i><span>100GB Cloud</span></div>
                      </motion.div>
                    </div>
                    
                    <motion.button
                      className={`w-full py-2 rounded-md transition-all duration-300 ${
                        selectedPrice === option.id 
                          ? 'bg-[#ff3366] text-white hover:bg-[#ff4778]' 
                          : 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(option.id);
                      }}
                    >
                      {selectedPrice === option.id ? 'Selected' : 'Select'}
                    </motion.button>
                  </div>
                  
                  {/* Floating particles on hover/select */}
                  {(selectedPrice === option.id || hoveredCard === option.id) && (
                    <AnimatePresence>
                      {hoverParticles[option.id]?.map((particle, particleIndex) => (
                        <motion.div
                          key={`particle-${option.id}-${particleIndex}`}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{ 
                            top: particle.top,
                            left: particle.left,
                            backgroundColor: particle.color,
                            filter: "blur(0.5px)",
                            boxShadow: `0 0 8px ${particle.color}`,
                            willChange: "transform, opacity"
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: [0, 0.8, 0],
                            scale: [0, 1, 0],
                            y: [0, -20, -40],
                            x: [0, Math.random() > 0.5 ? 10 : -10, 0]
                          }}
                          transition={{
                            duration: particle.duration,
                            delay: particle.delay,
                            ease: "easeOut"
                          }}
                          exit={{ opacity: 0, scale: 0 }}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="p-6 text-center bg-[rgba(255,255,255,0.05)] rounded-lg shadow-sm col-span-full border border-[rgba(255,255,255,0.1)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <i className="fas fa-exclamation-circle text-yellow-500 text-2xl mb-2"></i>
                <p className="text-gray-300">No pricing options available. Please try refreshing the page.</p>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            className="text-right mt-6 text-sm text-gray-400 italic"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.8 }}
          >
            *All prices are listed in USD
          </motion.div>
        </div>
      </section>
    </>
  );
}
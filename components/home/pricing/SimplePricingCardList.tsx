'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, Variants } from 'framer-motion';
import { PricingOption } from '@/utils/products';

interface SimplePricingCardListProps {
  pricingOptions: PricingOption[];
  selectedPrice: string;
  onSelectPrice: (priceId: string) => void;
}

export default function SimplePricingCardList({ pricingOptions, selectedPrice, onSelectPrice }: SimplePricingCardListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { 
    once: true, 
    margin: "-100px 0px -100px 0px", 
    amount: 0.2 
  });

  useEffect(() => {
    console.log("Simple pricing card list rendered with", pricingOptions.length, "options");
    
    // Center the selected card if any
    if (scrollContainerRef.current && selectedPrice) {
      const selectedCard = scrollContainerRef.current.querySelector(`[data-id="${selectedPrice}"]`) as HTMLElement;
      if (selectedCard) {
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const cardWidth = selectedCard.offsetWidth;
        const cardLeft = selectedCard.offsetLeft;
        
        scrollContainerRef.current.scrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      }
    }
    
    // Add the CSS for the shadow glow effect
    const style = document.createElement('style');
    style.textContent = `
      .shadow-glow-sm {
        box-shadow: 0 0 8px rgba(217, 70, 239, 0.4);
      }
      .card-highlight {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(236, 72, 153, 0.3);
        border: 1px solid rgba(236, 72, 153, 0.3);
      }
      .discount-badge {
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [pricingOptions.length, selectedPrice]);

  if (pricingOptions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
          <p className="text-white">No pricing options available</p>
        </div>
      </div>
    );
  }

  // Card entrance animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 70,
        damping: 15,
        mass: 1
      }
    }
  };

  // Badge animation variants
  const badgeVariants: Variants = {
    initial: { 
      scale: 0.8, 
      opacity: 0, 
      y: -10, 
      rotate: -5 
    },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0, 
      rotate: 2,
      transition: {
        delay: 0.3,
        duration: 0.4,
        type: "spring",
        stiffness: 150,
        damping: 10
      }
    }
  };

  // Border highlight animation variants
  const borderHighlightVariants: Variants = {
    initial: { 
      opacity: 0,
      scale: 0.98,
    },
    hover: { 
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="w-full max-w-full py-10 overflow-visible" ref={sectionRef}>
      <motion.div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 md:gap-8 justify-start lg:justify-center pb-8 px-4 sm:px-8 md:px-12 lg:px-16 scroll-smooth hide-scrollbar mx-auto"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity'
        }}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Larger spacer div at beginning for all screen sizes */}
        <div className="w-16 sm:w-24 md:w-36 lg:w-48 xl:w-64 flex-shrink-0"></div>
        
        {pricingOptions.map((option, index) => (
          <motion.div
            key={option.id}
            className="relative mt-4 pt-4 overflow-visible" 
            onMouseEnter={() => setHoveredCardId(option.id)}
            onMouseLeave={() => setHoveredCardId(null)}
            variants={cardVariants}
            custom={index}
            style={{ position: 'relative' }}
          >
            <motion.div
              data-id={option.id}
              className={`w-[220px] min-h-[420px] rounded-xl p-6 flex-shrink-0 flex flex-col cursor-pointer scroll-snap-align-start relative ${
                selectedPrice === option.id
                  ? 'bg-gradient-to-br from-[rgba(217,70,239,0.25)] to-[rgba(225,29,72,0.25)] border border-[rgba(226,51,102,0.5)] card-highlight'
                  : 'bg-[rgba(30,30,50,0.45)] border border-[rgba(255,255,255,0.12)]'
              }`}
              onClick={() => onSelectPrice(option.id)}
              animate={{
                y: hoveredCardId === option.id ? -4 : 0,
                boxShadow: hoveredCardId === option.id ? "0 8px 20px rgba(0, 0, 0, 0.15)" : "none",
                zIndex: hoveredCardId === option.id ? 5 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                duration: 0.3
              }}
              style={{
                willChange: "transform, box-shadow",
                border: hoveredCardId === option.id ? '1px solid rgba(139, 92, 246, 0.5)' : undefined
              }}
            >
              {/* One Time Purchase Badge - only for 14 days option */}
              {option.duration === "14 days" && (
                <motion.div 
                  className="absolute top-0 right-0 z-30 origin-top-right" 
                  style={{ transform: "translate(4px, -4px)" }}
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div 
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-tr-lg rounded-bl-lg shadow-lg" 
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 25px rgba(236,72,153,0.9)"
                    }}
                    animate={{ 
                      boxShadow: ["0 0 15px rgba(236,72,153,0.6)", "0 0 20px rgba(236,72,153,0.8)", "0 0 15px rgba(236,72,153,0.6)"],
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                  >
                    ONE TIME
                  </motion.div>
                </motion.div>
              )}
              
              <div className="text-gray-200 text-base font-medium mb-3 text-center relative z-10">
                {option.duration}
              </div>
              
              <div className="text-center mb-4 relative">
                {option.originalPrice && (
                  <div className="text-gray-400 text-sm line-through opacity-80 mb-1">
                    ${option.originalPrice.toFixed(2)}
                  </div>
                )}
                <div className="text-3xl font-bold text-white">
                  ${option.price.toFixed(2)}
                </div>
                {option.originalPrice && (
                  <div className="absolute -right-2 -top-1 transform rotate-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm discount-badge">
                      {Math.round((1 - option.price / option.originalPrice) * 100)}% OFF
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="text-gray-300 text-sm space-y-3 mb-8">
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                      hoveredCardId === option.id || selectedPrice === option.id 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-glow-sm'
                        : 'bg-pink-500'
                    }`}>
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <span>All Adobe Apps</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                      hoveredCardId === option.id || selectedPrice === option.id 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-glow-sm'
                        : 'bg-pink-500'
                    }`}>
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <span>All AI features</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                      hoveredCardId === option.id || selectedPrice === option.id 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-glow-sm'
                        : 'bg-pink-500'
                    }`}>
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <span>100GB Cloud</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                className={`w-full py-2.5 rounded-md font-semibold transition-all duration-300 ${
                  selectedPrice === option.id
                    ? 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white shadow-md shadow-pink-600/20'
                    : hoveredCardId === option.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm'
                      : 'bg-white/10 text-white'
                }`}
                onClick={(e) => { e.stopPropagation(); onSelectPrice(option.id); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {selectedPrice === option.id ? 'Selected' : 'Select'}
              </motion.button>
            </motion.div>
          </motion.div>
        ))}
        
        {/* Larger spacer div at end for all screen sizes */}
        <div className="w-16 sm:w-24 md:w-36 lg:w-48 xl:w-64 flex-shrink-0"></div>
      </motion.div>
    </div>
  );
} 
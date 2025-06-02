"use client";
import React, { useState, useEffect, useRef } from 'react';
import { PRICING_OPTIONS } from '@/utils/products'; // Assuming PRICING_OPTIONS is exported

interface PricingSectionProps {
  selectedPrice: string;
  setSelectedPrice: (priceId: string) => void;
  selectedPriceRef: React.MutableRefObject<string>;
}

export default function PricingSection({ selectedPrice, setSelectedPrice, selectedPriceRef }: PricingSectionProps) {
  const pricingRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (pricingRef.current) {
      observer.observe(pricingRef.current);
    }
    return () => {
      if (pricingRef.current) {
        observer.unobserve(pricingRef.current);
      }
    };
  }, []);

  const handlePlanSelect = (optionId: string) => {
    if (selectedPrice !== optionId) {
        setSelectedPrice(optionId);
        selectedPriceRef.current = optionId;
      }
      // Smooth scroll to checkout section
      setTimeout(() => {
        const el = document.getElementById('checkout');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 10); // Small delay to ensure state update if needed
  };

  return (
    <section className="pricing py-10 sm:py-16 md:py-20 bg-gradient-to-b from-[#f3f4f6] to-white border-t border-b border-gray-100" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={pricingRef}>
        <div className={`section-heading text-center mb-8 sm:mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2c2d5a] mb-2">Choose Your Plan</h2>
          <p className="text-base sm:text-lg text-gray-500">Select the best Adobe Creative Cloud subscription for your needs</p>
        </div>
        
        {/* Mobile scroll indicator */}
        <div className="md:hidden text-center text-xs text-gray-400 mb-4">
          <i className="fas fa-arrows-alt-h mr-1"></i> Swipe to see more options
        </div>
        
        {/* Wrap in a scrollable div for mobile */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:px-0 sm:overflow-visible">
          <div className={`plans-container flex gap-4 sm:gap-6 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
            {PRICING_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`plan-card flex-shrink-0 w-[240px] sm:w-[280px] md:w-[300px] ${selectedPrice === option.id ? 'selected' : ''}`}
                onClick={() => handlePlanSelect(option.id)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPrice === option.id}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
                style={{ position: 'relative', overflow: 'visible' }}
              >
                {option.id === '14d' && (
                  <div
                    className="absolute right-0 top-0 z-10 px-3 py-1 text-xs font-bold text-white rounded-bl-lg"
                    style={{
                      background: 'linear-gradient(90deg, #ff3366 0%, #a855f7 100%)',
                      transform: 'translateY(-40%) translateX(35%) rotate(18deg)',
                      boxShadow: '0 6px 24px rgba(255,51,102,0.25), 0 1.5px 6px rgba(168,85,247,0.18)',
                      letterSpacing: '0.03em',
                      fontSize: '13px',
                    }}
                  >
                    One-time purchase
                  </div>
                )}
                <div className="plan-duration text-sm sm:text-base">{option.duration}</div>
                <div className="plan-price text-xl sm:text-2xl md:text-3xl">${option.price}</div>
                <div className="plan-features text-left mt-4 mb-6">
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                      <span>All Creative Cloud Apps</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                      <span>All AI features</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                      <span>100GB Cloud Storage</span>
                    </li>
                  </ul>
                </div>
                <button
                  className="select-btn w-full text-sm sm:text-base"
                  type="button"
                  onClick={e => {
                    e.stopPropagation(); // Prevent card's onClick from firing again
                    handlePlanSelect(option.id);
                  }}
                >
                  {selectedPrice === option.id ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 
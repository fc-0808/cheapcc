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

  // Find the 6-month and 12-month plans
  const sixMonthPlan = PRICING_OPTIONS.find(option => option.duration === "6 months");
  const twelveMonthPlan = PRICING_OPTIONS.find(option => option.duration === "12 months");
  
  // Filter to get all other plans (excluding 6 and 12 months)
  const otherPlans = PRICING_OPTIONS.filter(option => 
    option.duration !== "6 months" && option.duration !== "12 months"
  );

  return (
    <section className="pricing" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={pricingRef}>
        <div className={`section-heading text-center mb-10 sm:mb-14 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-2">Choose Your Plan</h2>
          <p className="text-base sm:text-lg text-text-muted">Select the best Adobe Creative Cloud subscription for your needs</p>
        </div>
        
        {/* Mobile scroll indicator */}
        <div className="md:hidden text-center text-xs text-gray-400 mb-4">
          <i className="fas fa-arrows-alt-h mr-1"></i> Swipe to see more options
        </div>
        
        {/* Wrap in a scrollable div for mobile */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:px-0 sm:overflow-visible">
          {/* Main container */}
          <div className="flex flex-col items-center">
            {/* First row - Regular plans */}
            <div className={`plans-container flex flex-wrap gap-4 sm:gap-6 min-w-max sm:min-w-0 sm:justify-center stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
              {otherPlans.map((option) => (
                <div
                  key={option.id}
                  className={`plan-card flex-shrink-0 w-[230px] xs:w-[240px] sm:w-[260px] md:w-[240px] lg:w-[260px] ${selectedPrice === option.id ? 'selected' : ''}`}
                  onClick={() => handlePlanSelect(option.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrice === option.id}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
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
                  <div className="plan-duration">{option.duration}</div>
                  <div className="plan-price">${option.price}</div>
                  <div className="plan-features">
                    <ul className="space-y-2">
                      <li>All Adobe Apps</li>
                      <li>All AI features</li>
                      <li>100GB Cloud</li>
                    </ul>
                  </div>
                  <button
                    className="select-btn"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handlePlanSelect(option.id);
                    }}
                  >
                    {selectedPrice === option.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Second row - 6 month and 12 month plans */}
            <div className="flex justify-center gap-4 sm:gap-6 mt-4 sm:mt-8">
              {/* 6 Month Plan */}
              {sixMonthPlan && (
                <div
                  key={sixMonthPlan.id}
                  className={`plan-card flex-shrink-0 w-[230px] xs:w-[240px] sm:w-[260px] md:w-[240px] lg:w-[260px] ${selectedPrice === sixMonthPlan.id ? 'selected' : ''}`}
                  onClick={() => handlePlanSelect(sixMonthPlan.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrice === sixMonthPlan.id}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(sixMonthPlan.id)}
                >
                  <div className="plan-duration">{sixMonthPlan.duration}</div>
                  <div className="plan-price">${sixMonthPlan.price}</div>
                  <div className="plan-features">
                    <ul className="space-y-2">
                      <li>All Adobe Apps</li>
                      <li>All AI features</li>
                      <li>100GB Cloud</li>
                    </ul>
                  </div>
                  <button
                    className="select-btn"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handlePlanSelect(sixMonthPlan.id);
                    }}
                  >
                    {selectedPrice === sixMonthPlan.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              )}
              
              {/* 12 Month Plan */}
              {twelveMonthPlan && (
                <div
                  key={twelveMonthPlan.id}
                  className={`plan-card flex-shrink-0 w-[230px] xs:w-[240px] sm:w-[260px] md:w-[240px] lg:w-[260px] ${selectedPrice === twelveMonthPlan.id ? 'selected' : ''}`}
                  onClick={() => handlePlanSelect(twelveMonthPlan.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrice === twelveMonthPlan.id}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(twelveMonthPlan.id)}
                >
                  <div className="plan-duration">{twelveMonthPlan.duration}</div>
                  <div className="plan-price">${twelveMonthPlan.price}</div>
                  <div className="plan-features">
                    <ul className="space-y-2">
                      <li>All Adobe Apps</li>
                      <li>All AI features</li>
                      <li>100GB Cloud</li>
                    </ul>
                  </div>
                  <button
                    className="select-btn"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handlePlanSelect(twelveMonthPlan.id);
                    }}
                  >
                    {selectedPrice === twelveMonthPlan.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
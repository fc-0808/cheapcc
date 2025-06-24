"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Script from 'next/script'; // Import the Script component
import { PRICING_OPTIONS } from '@/utils/products';

interface PricingSectionProps {
  selectedPrice: string;
  setSelectedPrice: (priceId: string) => void;
  selectedPriceRef: { current: string };
  userEmail?: string | null;
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function PricingSection({ selectedPrice, setSelectedPrice, selectedPriceRef, userEmail }: PricingSectionProps) {
  const pricingRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  
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

    const currentRef = pricingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

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

  // Filter pricing options based on user status
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
            return false; // Skip this option if there's an error
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
            return 0; // Default sort position if there's an error
          }
        });
    } catch (error) {
      console.error('Error processing pricing options:', error);
      return []; // Return empty array if there's a critical error
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
        "image": "https://cheapcc.online/og-image.jpg", // Make sure this is a valid, accessible URL
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

  return (
    <>
      {/* Add the Script component to inject the JSON-LD schema */}
      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <section className="pricing" id="pricing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={pricingRef}>
          <div className={`section-heading text-center mb-10 stagger-item ${isVisible ? 'visible' : ''}`}>
            <h2>Choose Your Plan</h2>
            <p>Select the best Adobe Creative Cloud subscription for your needs</p>
            {adminError && (
              <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded-md">
                <i className="fas fa-exclamation-triangle mr-1"></i> {adminError}
              </div>
            )}
            {isAdmin && (
              <div className="mt-2 text-sm text-green-600 bg-green-100 p-2 rounded-md">
                <i className="fas fa-check-circle mr-1"></i> Admin features enabled
              </div>
            )}
          </div>
          
          {/* Mobile & Tablet View */}
          <div className="lg:hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {sortedPricingOptions.length > 0 ? (
                sortedPricingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`plan-card mx-0 ${selectedPrice === option.id ? 'selected' : ''} ${option.adminOnly ? 'admin-only' : ''}`}
                    onClick={() => handlePlanSelect(option.id)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedPrice === option.id}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
                  >
                    {option.id === '14d' && (
                      <div className="ribbon-container">
                        <div className="one-time-purchase-ribbon">One-time</div>
                      </div>
                    )}
                    {option.id === '6m' && (
                      <div className="ribbon-container best-value-container">
                        <div className="best-value-ribbon">Best Value</div>
                      </div>
                    )}
                    {option.adminOnly && (
                      <div className="ribbon-container admin-ribbon-container">
                        <div className="admin-ribbon">Admin</div>
                      </div>
                    )}
                    <div className="plan-duration">{option.duration}</div>
                    <div className="plan-price">{option.price}</div>
                    <div className="plan-features hidden sm:block">
                      <ul>
                        <li>All Adobe Apps</li>
                        <li>All AI features</li>
                        <li>100GB Cloud</li>
                      </ul>
                    </div>
                    <div className="plan-features sm:hidden">
                      <ul>
                        <li>All Apps + AI</li>
                        <li>100GB Cloud</li>
                        <li>24/7 support</li>
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
                ))
              ) : (
                <div className="p-6 text-center bg-gray-100 rounded-lg shadow-sm col-span-full">
                  <i className="fas fa-exclamation-circle text-yellow-500 text-2xl mb-2"></i>
                  <p className="text-gray-600">No pricing options available. Please try refreshing the page.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Desktop View - Unchanged */}
          <div className="hidden lg:block">
            <div className="pricing-scroll-container">
              <div className="overflow-x-auto pb-4" style={{ overflowY: 'visible' }}>
                <div className="flex justify-center" style={{ minWidth: 'max-content' }}>
                  {sortedPricingOptions.length > 0 ? (
                    sortedPricingOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`plan-card mx-2 ${selectedPrice === option.id ? 'selected' : ''} ${option.adminOnly ? 'admin-only' : ''}`}
                        onClick={() => handlePlanSelect(option.id)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={selectedPrice === option.id}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
                        style={{ width: '200px' }}
                      >
                        {option.id === '14d' && (
                          <div className="ribbon-container">
                            <div className="one-time-purchase-ribbon">One-time purchase</div>
                          </div>
                        )}
                        {option.id === '6m' && (
                          <div className="ribbon-container best-value-container">
                            <div className="best-value-ribbon">Best Value</div>
                          </div>
                        )}
                        {option.adminOnly && (
                          <div className="ribbon-container admin-ribbon-container">
                            <div className="admin-ribbon">Admin Only</div>
                          </div>
                        )}
                        <div className="plan-duration">{option.duration}</div>
                        <div className="plan-price">{option.price}</div>
                        <div className="plan-features">
                          <ul>
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
                    ))
                  ) : (
                    <div className="p-6 text-center bg-gray-100 rounded-lg shadow-sm">
                      <i className="fas fa-exclamation-circle text-yellow-500 text-2xl mb-2"></i>
                      <p className="text-gray-600">No pricing options available. Please try refreshing the page.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Add currency note */}
          <div className="text-right mt-2 text-sm text-gray-500 italic">*All prices are listed in USD</div>
        </div>
      </section>
    </>
  );
}
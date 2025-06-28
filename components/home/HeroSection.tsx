// fc-0808/cheapcc/cheapcc-master/components/home/HeroSection.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const starContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (starContainerRef.current) {
      const container = starContainerRef.current;
      container.innerHTML = '';
      for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.5 + 0.3;
        
        star.className = 'absolute rounded-full bg-white z-10';
        star.setAttribute('aria-hidden', 'true');
        star.setAttribute('role', 'presentation');
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = opacity.toString();
        star.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, ${opacity})`;
        
        const animDuration = Math.random() * 20 + 40;
        star.style.animation = `float ${animDuration}s infinite ease-in-out`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(star);
      }
    }
  }, []);

  const handleScrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const heroSchemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "CheapCC Adobe Creative Cloud Subscription",
    "description": "Your Adobe Creative Cloud, For Less. Genuine Adobe CC. Up to 75% Off.",
    "brand": {
      "@type": "Brand",
      "name": "CheapCC"
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "4.99",
      "highPrice": "124.99",
      "priceCurrency": "USD",
      "offerCount": "5"
    }
  };

  return (
    <>
      <Script
        id="hero-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(heroSchemaData) }}
      />
      <section 
        className="hero relative overflow-hidden min-h-screen flex items-center -mt-16"
        aria-labelledby="hero-heading"
      >  
        {/* Background elements */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#070714] via-[#0c0c2b] to-[#151533] z-0"
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 opacity-30 z-0" aria-hidden="true">
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(120,_80,_255,_0.15),_transparent_70%)] animate-nebula-drift"></div>
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,_51,_102,_0.15),_transparent_70%)] animate-nebula-pulse"></div>
        </div>
        <div ref={starContainerRef} className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true"></div>
        
        <div className="container mx-auto px-4 p-8 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center text-center">
          <div className={`hero-content ${isVisible ? 'visible' : ''} relative max-w-4xl mx-auto`}>
            
            {/* =========== UPDATED Mobile and Tablet View =========== */}
            <div className="md:hidden">
                

                <div className="hero-title-container mb-5">
                    <h1 id="hero-heading-mobile" className="text-4xl sm:text-5xl font-extrabold text-white leading-tight hero-3d-text">
                        Your&nbsp;
                        <span className="hero-title-accent block">
                          Adobe Creative
                        </span>
                        <span className="hero-title-accent">Cloud</span>, For Less.
                    </h1>
                </div>

                <p className="text-white/80 max-w-md mx-auto mb-8 text-base sm:text-xl font-light tracking-wide">
                  Genuine Adobe CC. Up to 75% Off.
                </p>
                
                <div className="hero-cta w-full mb-8">
                    <a 
                        href="#pricing" 
                        onClick={handleScrollToPricing} 
                        className="primary-btn glow-effect inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#ff3366] to-[#ff6b8b] text-white font-semibold text-base shadow-lg hover:shadow-[#ff336670] hover:translate-y-[-2px] transition-all duration-300"
                        aria-label="View Adobe Creative Cloud pricing and plans"
                    >
                        <i className="fas fa-arrow-down"></i>
                        View Pricing & Plans
                    </a>
                </div>
            </div>
            {/* =========== END OF UPDATED SECTION =========== */}


            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="savings-badge mb-8 md:mb-10">
                    <div className="savings-badge-inner border border-[#ff3366] bg-transparent backdrop-blur-sm text-[#ff3366]">
                        <i className="fas fa-tags mr-2 text-[#ff3366]" aria-hidden="true" /> Save up to 75% vs Official Pricing
                    </div>
                </div>
                <div className="hero-title-container mb-4 md:mb-6">
                    <h1 id="hero-heading-desktop" className="hero-title">
                        <span className="hero-title-main hero-3d-text opacity-85 md:opacity-100 text-white text-[2.2rem] leading-[2.5rem] sm:text-[2.8rem] sm:leading-[3.1rem] md:text-6xl font-bold">Unleash Your Creativity with</span>
                        <span className="hero-title-accent block mt-0 pt-3 sm:mt-1 md:mt-2 text-[2.4rem] leading-[2.7rem] sm:text-[3rem] sm:leading-[3.3rem] md:text-6xl">
                        Adobe Creative Cloud
                        </span>
                    </h1>
                </div>
                <p className="hero-description text-white/60 max-w-2xl mx-auto mb-10 text-lg backdrop-blur-sm py-8 pt-1 font-light tracking-wide">
                    CheapCC provides the full Adobe Creative Cloud suite for less.
                </p>
                <div className="hero-features-wrapper mb-10">
                    <h2 className="sr-only">Adobe Creative Cloud Features</h2>
                    <ul className="hero-features flex flex-wrap justify-center gap-4" aria-label="Creative Cloud Features">
                        <li className="hero-feature bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff10] rounded-full shadow-[0_0_20px_rgba(255,51,102,0.07)]">
                        <div className="hero-feature-icon" aria-hidden="true"><i className="fas fa-th"></i></div>
                        <span>All Creative Cloud Apps</span>
                        </li>
                        <li className="hero-feature bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff10] rounded-full shadow-[0_0_20px_rgba(255,51,102,0.07)]">
                        <div className="hero-feature-icon" aria-hidden="true"><i className="fas fa-cloud"></i></div>
                        <span>100GB Cloud Storage</span>
                        </li>
                        <li className="hero-feature bg-[#ffffff08] backdrop-blur-sm border border-[#ffffff10] rounded-full shadow-[0_0_20px_rgba(255,51,102,0.07)]">
                        <div className="hero-feature-icon" aria-hidden="true"><i className="fas fa-wand-magic-sparkles"></i></div>
                        <span>Adobe Firefly Included</span>
                        </li>
                    </ul>
                </div>
                <div className="hero-cta mb-6 md:mb-12">
                    <a 
                        href="#pricing" 
                        onClick={handleScrollToPricing} 
                        className="primary-btn glow-effect px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#ff3366] to-[#ff6b8b] text-white font-medium text-base sm:text-lg shadow-lg shadow-[#ff336640] hover:shadow-[#ff336670] hover:translate-y-[-2px] transition-all duration-300 border border-[#ff336620] backdrop-blur-sm relative overflow-hidden"
                        aria-label="View Adobe Creative Cloud pricing and plans"
                    >
                        <span className="relative z-10">View Pricing & Plans</span> <i className="fas fa-arrow-right ml-2 relative z-10" aria-hidden="true"></i>
                        <span className="absolute inset-0 bg-gradient-to-r from-[#ff4f7b] to-[#ff3366] opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                    </a>
                </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
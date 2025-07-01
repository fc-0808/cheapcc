"use client";
import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { motion, Variants } from 'framer-motion';

export default function HeroSection() {
  const handleScrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const heroSchemaData = {
    "@context": "https://schema.org", "@type": "Product", "name": "CheapCC Adobe Creative Cloud Subscription",
    "description": "Your Adobe Creative Cloud, For Less. Genuine Adobe CC. Up to 75% Off.",
    "brand": { "@type": "Brand", "name": "CheapCC" },
    "offers": { "@type": "AggregateOffer", "lowPrice": "4.99", "highPrice": "124.99", "priceCurrency": "USD", "offerCount": "5" }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <>
      <Script id="hero-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(heroSchemaData) }} />
      <section className="hero relative overflow-hidden min-h-screen flex items-center justify-center -mt-16 bg-transparent" aria-labelledby="hero-heading">
        <motion.div
          className="container mx-auto px-4 py-8 relative z-10 flex flex-col items-center justify-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Mobile & Tablet View */}
            <div className="md:hidden">
              <motion.h1 id="hero-heading-mobile" variants={itemVariants} className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }} >
                Your&nbsp;
                <span className="block bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Adobe Creative Cloud
                </span>
                , For Less.
              </motion.h1>
              <motion.p variants={itemVariants} className="text-white/80 max-w-md mx-auto mb-8 text-base sm:text-lg font-light tracking-wide">
                Genuine Adobe CC. Up to 75% Off.
              </motion.p>
              <motion.div variants={itemVariants} className="w-full mb-8">
                <motion.a 
                  whileHover={{ scale: 1.05, y: -3, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  href="#pricing" 
                  onClick={handleScrollToPricing} 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white font-semibold text-base shadow-lg shadow-red-500/30 border border-white/20"
                  aria-label="View pricing"
                >
                  View Pricing & Plans<i className="fas fa-arrow-right ml-1 transition-transform group-hover:translate-x-1"></i>
                </motion.a>
              </motion.div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <motion.div variants={itemVariants} className="mb-8 md:mb-10">
                <motion.div 
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(255, 51, 102, 0.8)' }}
                  className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-black/20 backdrop-blur-sm border border-[#ff3366]/50 text-[#ff3366] text-sm font-medium shadow-[0_0_15px_rgba(255,51,102,0.6)] transition-shadow duration-300"
                >
                  <i className="fas fa-tags" aria-hidden="true" /> Save up to 75% vs Official Pricing
                </motion.div>
              </motion.div>

              <motion.h1 id="hero-heading-desktop" variants={itemVariants} className="text-center text-6xl font-extrabold text-white leading-tight mb-6" style={{ textShadow: '0 5px 25px rgba(0,0,0,0.4)' }}>
                Unlock major savings on <br />
                <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Adobe Creative Cloud
                </span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-white/70 max-w-2xl mx-auto mb-10 text-lg font-light">
                CheapCC provides the full Adobe Creative Cloud suite for less.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mb-10">
                {['All Creative Cloud Apps', '100GB Cloud Storage', 'Adobe Firefly Included'].map((feature, i) => (
                  <motion.div key={feature} whileHover={{ y: -5, scale: 1.05 }} className="flex items-center gap-2 py-2 px-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium">
                    <i className={`fas ${['fa-th', 'fa-cloud', 'fa-wand-magic-sparkles'][i]} text-[#ff3366] text-xs`}></i>{feature}
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={itemVariants}>
                <motion.a
                  whileHover={{ scale: 1.05, y: -3, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  href="#pricing"
                  onClick={handleScrollToPricing}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white font-semibold text-lg shadow-lg shadow-red-500/30 border border-white/20"
                  aria-label="View pricing"
                >
                  View Pricing & Plans
                  <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                </motion.a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
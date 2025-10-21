"use client";
import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { motion } from 'framer-motion';
// We're importing only the specific types we need
import type { Variants } from 'framer-motion';

export default function HeroSection() {
  const handleScrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const heroSchemaData = {
    "@context": "https://schema.org", "@type": "Product", "name": "CheapCC Adobe Creative Cloud Subscription",
    "description": "Your Adobe Creative Cloud, For Less. Genuine Adobe CC. Up to 83% Off.",
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
      <section className="hero relative overflow-hidden min-h-screen md:min-h-screen flex items-center justify-center -mt-16 md:-mt-16 bg-transparent" aria-labelledby="hero-heading">
        <motion.div
          className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-8 relative z-10 flex flex-col items-center justify-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative max-w-4xl mx-auto w-full">
            {/* Mobile View */}
            <div className="md:hidden space-y-6 sm:space-y-8">
              {/* Badge */}
              <motion.div variants={itemVariants} className="flex justify-center">
                <motion.div 
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 51, 102, 0.6)' }}
                  className="inline-flex items-center gap-2.5 py-2 px-4 sm:px-5 rounded-full bg-white/5 backdrop-blur-xl border border-[#ff3366]/40 text-[#ff3366] text-xs sm:text-sm font-semibold shadow-lg shadow-red-500/10 hover:bg-white/8 transition-all duration-300"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ff3366]/20">
                    <i className="fas fa-bolt text-sm" aria-hidden="true" />
                  </span>
                  <span>Limited Time: Save up to 83%</span>
                </motion.div>
              </motion.div>

              {/* Main Heading */}
              <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
                <h1 id="hero-heading-mobile" className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  <span className="block">Genuine Adobe CC</span>
                  <span className="block">
                    <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                      Up to 83% Off
                    </span>
                  </span>
                </h1>
              </motion.div>

              {/* Description */}
              <motion.p variants={itemVariants} className="text-base sm:text-lg text-white/75 max-w-md mx-auto leading-relaxed font-light">
                CheapCC provides legitimate Adobe Creative Cloud subscriptions. Same apps, guaranteed activation, lifetime support.
              </motion.p>

              {/* Feature Pills */}
              <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  { icon: 'fa-check', text: 'Fast Delivery' },
                  { icon: 'fa-shield', text: 'Secure' },
                  { icon: 'fa-headset', text: '24/7 Support' }
                ].map((feature, i) => (
                  <div key={feature.text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium backdrop-blur-sm">
                    <i className={`fas ${feature.icon} text-[0.625rem] text-[#ff3366]`}></i>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div variants={itemVariants} className="pt-4 sm:pt-6 w-full px-0 sm:px-6">
                <motion.a 
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  href="#pricing" 
                  onClick={handleScrollToPricing} 
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 via-pink-500 to-rose-600 text-white font-bold text-base sm:text-lg shadow-xl shadow-red-500/20 border border-white/20 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 backdrop-blur-sm"
                  aria-label="View pricing plans"
                >
                  <span>View Pricing & Plans</span>
                  <i className="fas fa-arrow-right text-sm group-hover:translate-x-1 transition-transform duration-300"></i>
                </motion.a>
              </motion.div>

              {/* Trust Indicator */}
              <motion.div variants={itemVariants} className="pt-2 flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">1000+</p>
                  <p className="text-xs sm:text-sm text-white/60">Happy Customers</p>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">4.8/5</p>
                  <p className="text-xs sm:text-sm text-white/60">Rating</p>
                </div>
              </motion.div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block space-y-10">
              <motion.div variants={itemVariants} className="mb-10">
                <motion.div 
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(255, 51, 102, 0.8)' }}
                  className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-black/20 backdrop-blur-sm border border-[#ff3366]/50 text-[#ff3366] text-sm font-medium shadow-[0_0_15px_rgba(255,51,102,0.6)] transition-shadow duration-300"
                >
                  <i className="fas fa-tags" aria-hidden="true" /> Limited Time Offer: Save up to 83% vs Official Pricing
                </motion.div>
              </motion.div>

              <motion.h1 id="hero-heading-desktop" variants={itemVariants} className="text-center text-6xl font-extrabold text-white leading-tight mb-6" style={{ textShadow: '0 5px 25px rgba(0,0,0,0.4)' }}>
                <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Adobe Creative Cloud Discount
                </span> <br />
                83% Off Official Pricing
              </motion.h1>
              <motion.p variants={itemVariants} className="text-white/70 max-w-2xl mx-auto mb-10 text-lg font-light">
                CheapCC: Your trusted Adobe CC alternative. Get genuine Photoshop, Illustrator, Premiere Pro & all Creative Cloud apps for less.
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

export function ProductInclusionsSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const inclusions = [
    {
      icon: 'fa-layer-group',
      title: 'All Adobe Apps',
      description: '20+ creative applications including Photoshop, Illustrator, Premiere Pro & more'
    },
    {
      icon: 'fa-wand-magic-sparkles',
      title: 'All AI Features',
      description: 'Firefly, Generative Fill, and advanced AI tools included with every subscription'
    },
    {
      icon: 'fa-cloud',
      title: '100GB Cloud Drive',
      description: 'Secure cloud storage to sync and access your projects anywhere'
    }
  ];

  return (
    <section className="relative overflow-hidden py-8 sm:py-16 md:py-20 lg:py-24 bg-transparent" aria-labelledby="inclusions-heading">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px 0px" }}
        >
          {/* Mobile Layout */}
          <div className="md:hidden space-y-8">
            <motion.div variants={itemVariants} className="text-center pb-2">
              <h2 id="inclusions-heading" className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                <motion.span
                  className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  style={{ backgroundSize: "200% 100%", willChange: 'background-position' }}
                >
                  Everything
                </motion.span>
                {" "}You Get
              </h2>
              <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed">Complete access to all Adobe Creative Cloud features and tools</p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3 pt-2">
              {inclusions.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white/8 via-white/4 to-white/2 border border-white/15 backdrop-blur-xl hover:border-[#ff3366]/40 hover:from-white/12 hover:via-white/6 transition-all duration-300 overflow-hidden"
                >
                  {/* Animated background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/0 to-rose-500/0 group-hover:from-pink-500/5 group-hover:via-pink-500/3 group-hover:to-rose-500/5 transition-all duration-300 pointer-events-none"></div>
                  
                  <div className="relative flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <motion.div 
                        whileHover={{ rotate: 6, scale: 1.1 }}
                        className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/25 to-rose-500/15 border border-[#ff3366]/40 group-hover:border-[#ff3366]/70 shadow-lg shadow-red-500/5 group-hover:shadow-red-500/15 transition-all duration-300"
                      >
                        <i className={`fas ${item.icon} text-lg text-[#ff3366] group-hover:text-pink-300 transition-colors duration-300`}></i>
                      </motion.div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-pink-200 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/65 leading-relaxed group-hover:text-white/75 transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 id="inclusions-heading-desktop" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-tight" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 0 30px rgba(255, 51, 102, 0.2)' }}>
                <motion.span
                  className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  style={{ backgroundSize: "200% 100%", willChange: 'background-position' }}
                >
                  Everything
                </motion.span>
                {" "}You Get
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto font-light">Complete access to all Adobe Creative Cloud features and premium tools</p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-7">
              {inclusions.map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-9 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] border border-white/20 backdrop-blur-2xl hover:border-[#ff3366]/50 hover:from-white/15 hover:via-white/8 shadow-xl shadow-black/10 group-hover:shadow-2xl group-hover:shadow-red-500/10 transition-all duration-300 overflow-hidden"
                >
                  {/* Animated gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/0 to-rose-500/0 group-hover:from-pink-500/8 group-hover:via-pink-500/4 group-hover:to-rose-500/8 transition-all duration-300 pointer-events-none"></div>
                  
                  <div className="relative text-center">
                    <motion.div 
                      whileHover={{ rotate: 6, scale: 1.15 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/30 to-rose-500/20 border border-[#ff3366]/50 shadow-2xl shadow-red-500/10 group-hover:border-[#ff3366]/80 group-hover:shadow-red-500/25 mb-6 group-hover:shadow-xl transition-all duration-300"
                    >
                      <i className={`fas ${item.icon} text-3xl text-[#ff3366] group-hover:text-pink-200 transition-colors duration-300`}></i>
                    </motion.div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-pink-200 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
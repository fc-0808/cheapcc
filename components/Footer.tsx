"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, Variants } from 'framer-motion';

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });
  
  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.2,
      }
    }
  };

  const linkVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.3 + (custom * 0.1),
      }
    }),
    hover: { 
      x: 5, 
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10,
      }
    }
  };

  const iconVariants: Variants = {
    hover: {
      scale: 1.2,
      rotate: [0, 10, -10, 0],
      boxShadow: "0 0 15px rgba(255, 51, 102, 0.5)",
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  const socialIconVariants: Variants = {
    hover: {
      scale: 1.2,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 10
      }
    }
  };

  return (
    <motion.footer 
      ref={footerRef}
      style={{ pointerEvents: 'auto' }} 
      className="relative py-20 sm:py-28 -mt-20 sm:-mt-28"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          className="footer-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-10"
          variants={containerVariants}
        >
          {/* Logo Section */}
          <motion.div className="footer-section footer-logo-section" variants={itemVariants}>
            <motion.h3
              className="text-xl sm:text-2xl font-bold mb-6"
            style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em' }}
              variants={titleVariants}
          >
            <Link href="/" prefetch={false} className="text-white hover:text-gray-200 transition-colors duration-150">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Cheap <motion.span 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{ backgroundSize: "200% 100%" }}
                  >CC</motion.span>
                </motion.span>
              </Link>
            </motion.h3>
            
            <motion.p 
              className="text-sm text-gray-300 mb-7 font-light leading-relaxed"
              variants={itemVariants}
            >
              Providing affordable Adobe Creative Cloud subscriptions with premium support and instant delivery.
            </motion.p>
            
            <motion.div 
              className="footer-social-icons flex gap-5"
              variants={itemVariants}
            >
              <motion.a 
                href="https://www.instagram.com/cheapcc_online/" 
                aria-label="Instagram" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:border-pink-500/30 transition-colors duration-150 group"
                whileHover="hover"
                variants={socialIconVariants}
              >
                <i className="fab fa-instagram text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-500 group-hover:via-pink-500 group-hover:to-red-500 transition-colors duration-300"></i>
              </motion.a>
              
              <motion.a 
                href="https://x.com/cheapcc137024" 
                aria-label="X (Twitter)" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:border-pink-500/30 transition-colors duration-150 group"
                whileHover="hover"
                variants={socialIconVariants}
              >
                <i className="fab fa-x-twitter text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-500 group-hover:via-pink-500 group-hover:to-red-500 transition-colors duration-300"></i>
              </motion.a>
              
              <motion.a 
                href="https://www.youtube.com/@cheapcc-online" 
                aria-label="YouTube" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:border-pink-500/30 transition-colors duration-150 group"
                whileHover="hover"
                variants={socialIconVariants}
              >
                <i className="fab fa-youtube text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-500 group-hover:via-pink-500 group-hover:to-red-500 transition-colors duration-300"></i>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Quick Links Section */}
          <motion.div className="footer-section" variants={itemVariants}>
            <motion.h3 
              className="text-base sm:text-lg font-semibold mb-6 text-white"
              variants={titleVariants}
            >
              Quick Links
            </motion.h3>
            
            <motion.ul className="footer-links space-y-4" variants={containerVariants}>
              <motion.li custom={0} variants={linkVariants} whileHover="hover">
                <Link href="/" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-home text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light">Home</span>
                </Link>
              </motion.li>
              
              <motion.li custom={1} variants={linkVariants} whileHover="hover">
                <Link href="/#pricing" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-tags text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light">Pricing</span>
              </Link>
              </motion.li>
              
              <motion.li custom={2} variants={linkVariants} whileHover="hover">
                <Link href="/faq" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-question-circle text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light">FAQ</span>
              </Link>
              </motion.li>
              
              <motion.li custom={3} variants={linkVariants} whileHover="hover">
                <a href="mailto:support@cheapcc.online" className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-envelope text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light">Support</span>
              </a>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Legal Section */}
          <motion.div className="footer-section" variants={itemVariants}>
            <motion.h3 
              className="text-base sm:text-lg font-semibold mb-6 text-white"
              variants={titleVariants}
            >
            Legal
            </motion.h3>
            
            <motion.ul className="footer-links space-y-4" variants={containerVariants}>
              <motion.li custom={0} variants={linkVariants} whileHover="hover">
                <Link href="/terms" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-file-contract text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light">Terms of Service</span>
              </Link>
              </motion.li>
              
              <motion.li custom={1} variants={linkVariants} whileHover="hover">
                <Link href="/privacy" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-shield-alt text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light">Privacy Policy</span>
              </Link>
              </motion.li>
              
              <motion.li custom={2} variants={linkVariants} whileHover="hover">
                <Link href="/refund" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-undo-alt text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light">Refund Policy</span>
              </Link>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Contact Us Section */}
          <motion.div className="footer-section" variants={itemVariants}>
            <motion.h3 
              className="text-base sm:text-lg font-semibold mb-6 text-white"
              variants={titleVariants}
            >
            Contact Us
            </motion.h3>
            
            <motion.ul className="footer-links space-y-4" variants={containerVariants}>
              <motion.li custom={0} variants={linkVariants} whileHover="hover">
                <a href="mailto:support@cheapcc.online" className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-at text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light break-all">support@cheapcc.online</span>
              </a>
              </motion.li>
              
              <motion.li custom={1} variants={linkVariants} whileHover="hover">
                <Link href="/#faq" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <motion.div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <i className="fas fa-comments text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </motion.div>
                  <span className="text-sm font-light">Help Center</span>
              </Link>
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Copyright Section - styled as a floating pill */}
      <motion.div 
        className="copyright text-center text-sm mt-16 text-gray-400/80 relative z-10 container mx-auto px-4 sm:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <motion.div 
          className="backdrop-blur-sm py-3 px-6 rounded-full inline-flex items-center gap-2 bg-white/5 border border-white/10 shadow-lg"
          whileHover={{ 
            boxShadow: "0 0 20px rgba(236, 72, 153, 0.2)",
            borderColor: "rgba(236, 72, 153, 0.3)",
            y: -2
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-light">&copy; {new Date().getFullYear()} CheapCC.online</span>
          <span className="mx-1 h-1 w-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 opacity-70"></span>
          <span className="font-light">All rights reserved</span>
        </motion.div>
      </motion.div>
    </motion.footer>
);
};

export default Footer; 
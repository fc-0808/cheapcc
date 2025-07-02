'use client';

import React, { useState, FormEvent, Suspense, useEffect } from 'react';
import { updateMarketingPreferences } from './actions';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Core component logic
function OnboardingComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get name and email from URL parameters for pre-filling
  const nameFromParams = searchParams?.get('name') || '';
  const emailFromParams = searchParams?.get('email') || '';
  
  const [name, setName] = useState(nameFromParams);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [particles, setParticles] = useState<Array<{top: number, left: number, size: number, delay: number}>>([]);

  // Generate background particles
  useEffect(() => {
    setParticles(
      Array.from({ length: 10 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 2,
      }))
    );
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('email', emailFromParams);
      
      const result = await updateMarketingPreferences(formData);
      
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle the skip action
  const handleSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/dashboard?welcome=new');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f111a] py-10 px-4 overflow-hidden relative">
      {/* Background particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white opacity-40 pointer-events-none"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.5)`,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Background glow effect */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      <motion.div 
        className="w-full max-w-md rounded-2xl p-8 relative z-10"
        style={{
          background: "rgba(17, 17, 40, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)"
        }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.8,
              staggerChildren: 0.1
            }
          }
        }}
      >
        {/* Logo and Welcome Message */}
        <motion.div className="text-center mb-8" variants={fadeInUp}>
          <motion.a 
            href="/" 
            className="w-fit mx-auto mb-6 text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2 hover:text-[#ff3366] transition-colors duration-300" 
            style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Cheap <motion.span 
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 100%" }}
            >CC</motion.span>
          </motion.a>
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-100 bg-clip-text text-transparent mb-2"
            variants={fadeInUp}
          >
            Welcome, {name || 'Creator'}
          </motion.h1>
          <motion.p className="text-gray-300 text-sm" variants={fadeInUp}>
            Complete your profile to get the most from your experience
          </motion.p>
        </motion.div>
        
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="mb-6 p-4 rounded-lg text-sm font-medium bg-red-500/20 border border-red-500/30 text-red-300 flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <i className="fas fa-exclamation-circle text-lg"></i>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={fadeInUp}
        >
          {/* Name Input */}
          <motion.div variants={fadeInUp}>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">Your Name</label>
            <div className="relative group">
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-white placeholder-gray-400"
                placeholder="Enter your name"
                required
                disabled={isSubmitting}
              />
              <motion.div 
                className="absolute inset-0 border border-white/0 rounded-lg pointer-events-none"
                animate={{ boxShadow: ["0 0 0px rgba(255, 51, 102, 0)", "0 0 10px rgba(255, 51, 102, 0.3)", "0 0 0px rgba(255, 51, 102, 0)"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>
          </motion.div>
          
          {/* Marketing Consent Section */}
          <motion.div 
            className="rounded-lg border border-white/10 p-5 backdrop-blur-sm bg-white/5 transition-colors duration-300"
            whileHover={{ 
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 51, 102, 0.5)",
              y: -2,
              transition: { duration: 0.2 }
            }}
            variants={fadeInUp}
          >
            <div className="flex items-start space-x-4">
              <div className="relative min-w-5">
                <input
                  id="marketing-consent"
                  name="marketingConsent"
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 text-[#ff3366] focus:ring-2 focus:ring-offset-2 focus:ring-[#ff3366]/50 focus:ring-offset-[#11122a] transition cursor-pointer bg-white/5"
                  disabled={isSubmitting}
                />
                <motion.div 
                  className="absolute -inset-1 rounded-md pointer-events-none"
                  animate={{ 
                    boxShadow: marketingConsent ? 
                      ["0 0 0px rgba(255, 51, 102, 0)", "0 0 8px rgba(255, 51, 102, 0.5)", "0 0 0px rgba(255, 51, 102, 0)"] : 
                      "none" 
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div>
                <label htmlFor="marketing-consent" className="font-medium text-gray-100 cursor-pointer text-sm">
                  Personalized Updates
                </label>
                <p className="text-gray-400 mt-1 text-xs leading-relaxed">
                  Receive tutorials, exclusive discounts, and product updates tailored to enhance your Adobe Creative Cloud experience.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div className="pt-3 space-y-4" variants={fadeInUp}>
            <motion.button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-semibold rounded-lg transition focus:outline-none cursor-pointer disabled:opacity-60 relative overflow-hidden group"
              disabled={isSubmitting}
              whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(255, 51, 102, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated shine effect */}
              <motion.span 
                className="absolute inset-0 opacity-40"
                animate={{
                  background: [
                    "linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.1) 50%, transparent 75%)",
                    "linear-gradient(45deg, transparent 20%, rgba(255, 255, 255, 0.2) 50%, transparent 80%)",
                    "linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.1) 50%, transparent 75%)"
                  ],
                  backgroundSize: ["200% 200%"],
                  backgroundPosition: ["-200% -200%", "200% 200%", "-200% -200%"]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
              <span className="relative z-10 flex items-center justify-center">
                {isSubmitting && (
                  <svg className="animate-spin mr-2 h-5 w-5 text-white opacity-90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Processing...' : 'Complete Setup'}
              </span>
            </motion.button>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <motion.button 
                onClick={handleSkip} 
                className="text-sm text-gray-400 hover:text-white transition-colors duration-300 py-2 px-4 rounded-md"
                disabled={isSubmitting}
                whileHover={{ color: "#ff3366" }}
              >
                Skip for now
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.form>
      </motion.div>
    </main>
  );
}

// Wrap the component in Suspense to handle Next.js static rendering optimizations
export default function WelcomeOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0f111a]">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-fuchsia-500 animate-spin" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}></div>
          <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
        </div>
      </div>
    }>
      <OnboardingComponent />
    </Suspense>
  );
}

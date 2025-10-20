'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface ActivationTypeTooltipProps {
  className?: string;
}

export default function ActivationTypeTooltip({ className = "" }: ActivationTypeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className={`relative ${className}`} ref={tooltipRef}>
      {/* Trigger */}
      <div
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 hover:from-fuchsia-500/30 hover:to-pink-500/30 border border-fuchsia-400/30 hover:border-fuchsia-400/50 transition-all duration-200 cursor-help group shadow-lg"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onTouchStart={() => setIsVisible(!isVisible)}
      >
        <i className="fas fa-question text-xs text-fuchsia-300 group-hover:text-fuchsia-200 transition-colors duration-200"></i>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Desktop Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="hidden sm:block absolute top-0 left-full ml-2 md:w-96 md:p-6 w-80 p-4 bg-[rgba(17,17,40,0.98)] backdrop-blur-lg border border-white/30 md:rounded-2xl rounded-xl shadow-2xl z-50000"
              onMouseEnter={() => setIsVisible(true)}
              onMouseLeave={() => setIsVisible(false)}
            >
              {/* Desktop Arrow */}
              <div className="absolute top-6 -left-2 w-4 h-4 bg-[rgba(17,17,40,0.98)] border-l border-b border-white/30 rotate-45 shadow-lg"></div>
              
              {/* Desktop Content */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <i className="fas fa-info-circle text-fuchsia-400"></i>
                  Activation Type Options
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <i className="fas fa-key text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm mb-2 text-left">Pre-Activated</div>
                      <div className="text-gray-300 leading-relaxed text-sm text-left">
                        We provide you with a ready-to-use Adobe account. You'll receive login credentials immediately after payment. Perfect for quick setup and quick access.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <i className="fas fa-envelope text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm mb-2 text-left">Use Your Email</div>
                      <div className="text-gray-300 leading-relaxed text-sm text-left">
                        CheapCC will authorize your Adobe email account and add it to an educational organization that provides access to Adobe Creative Cloud. This preserves your existing settings, cloud storage, and preferences while giving you access to the full Adobe suite at educational pricing.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="block sm:hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-sm bg-[rgba(17,17,40,0.98)] backdrop-blur-lg border border-white/30 rounded-xl shadow-2xl z-50000 p-4"
              onMouseEnter={() => setIsVisible(true)}
              onMouseLeave={() => setIsVisible(false)}
            >
              {/* Mobile Content */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <i className="fas fa-info-circle text-fuchsia-400"></i>
                  Activation Type Options
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <i className="fas fa-key text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm mb-1">Pre-Activated</div>
                      <div className="text-gray-300 leading-relaxed text-xs">
                        Ready-to-use Adobe account with quick access.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <i className="fas fa-envelope text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm mb-1">Use Your Email</div>
                      <div className="text-gray-300 leading-relaxed text-xs">
                        CheapCC authorizes your Adobe account via educational organization access.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

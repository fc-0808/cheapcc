'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ActivationTypeTooltipProps {
  className?: string;
}

export default function ActivationTypeTooltip({ className = "" }: ActivationTypeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 cursor-help group"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <i className="fas fa-question text-xs text-white/70 group-hover:text-white transition-colors duration-200"></i>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-0 left-full ml-2 md:w-80 md:p-4 w-64 p-3 bg-[rgba(17,17,40,0.95)] backdrop-blur-md border border-white/20 md:rounded-xl rounded-lg shadow-2xl z-50000"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
          >
            {/* Arrow pointing left */}
            <div className="absolute top-4 -left-2 w-4 h-4 bg-[rgba(17,17,40,0.95)] border-l border-b border-white/20 rotate-45"></div>
            
            {/* Content */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-4">
                Activation Type Options
              </h4>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="md:w-6 md:h-6 md:rounded-full md:bg-gradient-to-r md:from-fuchsia-500 md:to-pink-500 w-5 h-5 rounded bg-fuchsia-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-key text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white md:mb-2 mb-1 text-left">Pre-Activated</div>
                    <div className="text-gray-300 md:leading-relaxed text-xs text-left">
                      <span className="hidden md:inline">We provide you with a ready-to-use Adobe account. You'll receive login credentials immediately after payment. Perfect for quick setup and immediate access.</span>
                      <span className="md:hidden">Ready-to-use Adobe account with instant access.</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="md:w-6 md:h-6 md:rounded-full md:bg-gradient-to-r md:from-blue-500 md:to-purple-500 w-5 h-5 rounded bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="md:fas md:fa-user-plus fas fa-envelope text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white md:mb-2 mb-1 text-left">Use Your Email</div>
                    <div className="text-gray-300 md:leading-relaxed text-xs text-left">
                      <span className="hidden md:inline">CheapCC will authorize your Adobe email account and add it to an educational organization that provides access to Adobe Creative Cloud. This preserves your existing settings, cloud storage, and preferences while giving you access to the full Adobe suite at educational pricing.</span>
                      <span className="md:hidden">CheapCC authorizes your Adobe account via educational organization access.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

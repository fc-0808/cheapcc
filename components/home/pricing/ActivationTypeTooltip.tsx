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
            className="absolute top-0 left-full ml-2 w-80 p-4 bg-[rgba(17,17,40,0.95)] backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50000"
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
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-key text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white mb-2 text-left">Pre-Activated</div>
                    <div className="text-gray-300 leading-relaxed text-left">
                      We provide you with a ready-to-use Adobe account. You'll receive login credentials immediately after payment. Perfect for quick setup and immediate access.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-user-plus text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white mb-2 text-left">Use Your Email</div>
                    <div className="text-gray-300 leading-relaxed text-left">
                      Use your existing Adobe account. We'll add the subscription to your current account, preserving your settings, cloud storage, and preferences. You'll need to provide your Adobe account email address.
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

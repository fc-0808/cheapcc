'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ActivationTypeTooltip from './ActivationTypeTooltip';

interface ActivationTypeSelectorProps {
  selectedType: 'pre-activated' | 'email-activation';
  onTypeChange: (type: 'pre-activated' | 'email-activation') => void;
}

export default function ActivationTypeSelector({ selectedType, onTypeChange }: ActivationTypeSelectorProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="flex justify-center mb-8 relative z-20 md:z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div 
        className="relative md:bg-[rgba(17,17,40,0.8)] md:backdrop-blur-sm md:border md:border-white/10 md:rounded-xl md:p-1 md:shadow-lg
                   bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border border-white/20 rounded-2xl p-1.5 shadow-2xl shadow-black/40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip */}
        <div className="absolute -top-2 -right-2 z-30">
          <ActivationTypeTooltip />
        </div>
        {/* Background slider - Desktop only */}
        <motion.div
          className="absolute inset-1 bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 rounded-lg hidden md:block"
          animate={{
            opacity: isHovered ? 1 : 0.7,
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Selection indicator */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 shadow-lg shadow-fuchsia-500/30
                     md:rounded-lg rounded-xl"
          animate={{
            x: selectedType === 'email-activation' ? '100%' : '0%',
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />
        
        <div className="relative flex">
          <button
            onClick={() => onTypeChange('pre-activated')}
            className={`relative z-10 md:px-6 md:py-3 px-6 py-3.5 text-sm font-semibold md:transition-all md:duration-300 transition-all duration-300 rounded-xl ${
              selectedType === 'pre-activated'
                ? 'text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                selectedType === 'pre-activated' 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-gray-600/50'
              }`}>
                <i className="fas fa-key text-xs"></i>
              </div>
              <span className="font-medium">Pre-Activated</span>
            </div>
            <div className={`text-xs mt-2 md:transition-opacity md:duration-300 hidden md:block ${
              selectedType === 'pre-activated' ? 'opacity-100' : 'opacity-0'
            }`}>
              Quick access
            </div>
            {/* Mobile subtitle */}
            <div className={`text-xs mt-1.5 md:hidden transition-opacity duration-300 ${
              selectedType === 'pre-activated' ? 'opacity-100 text-fuchsia-200' : 'opacity-0'
            }`}>
              Instant setup
            </div>
          </button>
          
          <button
            onClick={() => onTypeChange('email-activation')}
            className={`relative z-10 md:px-6 md:py-3 px-6 py-3.5 text-sm font-semibold md:transition-all md:duration-300 transition-all duration-300 rounded-xl ${
              selectedType === 'email-activation'
                ? 'text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                selectedType === 'email-activation' 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-gray-600/50'
              }`}>
                <i className="md:fas md:fa-user-plus fas fa-envelope text-xs"></i>
              </div>
              <span className="font-medium">Use Your Email</span>
            </div>
            <div className={`text-xs mt-2 md:transition-opacity md:duration-300 hidden md:block ${
              selectedType === 'email-activation' ? 'opacity-100' : 'opacity-0'
            }`}>
              Use your Adobe account
            </div>
            {/* Mobile subtitle */}
            <div className={`text-xs mt-1.5 md:hidden transition-opacity duration-300 ${
              selectedType === 'email-activation' ? 'opacity-100 text-fuchsia-200' : 'opacity-0'
            }`}>
              Your Adobe account
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ActivationTypeTooltip from './ActivationTypeTooltip';

interface ActivationTypeSelectorProps {
  selectedType: 'pre-activated' | 'self-activation';
  onTypeChange: (type: 'pre-activated' | 'self-activation') => void;
}

export default function ActivationTypeSelector({ selectedType, onTypeChange }: ActivationTypeSelectorProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="flex justify-center mb-6 relative z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div 
        className="relative bg-[rgba(17,17,40,0.8)] backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip */}
        <div className="absolute -top-2 -right-2 z-10">
          <ActivationTypeTooltip />
        </div>
        {/* Background slider */}
        <motion.div
          className="absolute inset-1 bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 rounded-lg"
          animate={{
            opacity: isHovered ? 1 : 0.7,
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Selection indicator */}
        <motion.div
          className="absolute top-1 bottom-1 w-[calc(50%-2px)] bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-lg shadow-lg"
          animate={{
            x: selectedType === 'self-activation' ? '100%' : '0%',
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
            className={`relative z-10 px-6 py-3 text-sm font-medium transition-all duration-300 ${
              selectedType === 'pre-activated'
                ? 'text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <i className="fas fa-key text-xs"></i>
              <span>Pre-Activated</span>
            </div>
            <div className={`text-xs mt-1 transition-opacity duration-300 ${
              selectedType === 'pre-activated' ? 'opacity-100' : 'opacity-0'
            }`}>
              Instant access
            </div>
          </button>
          
          <button
            onClick={() => onTypeChange('self-activation')}
            className={`relative z-10 px-6 py-3 text-sm font-medium transition-all duration-300 ${
              selectedType === 'self-activation'
                ? 'text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <i className="fas fa-user-plus text-xs"></i>
              <span>Use Your Email</span>
            </div>
            <div className={`text-xs mt-1 transition-opacity duration-300 ${
              selectedType === 'self-activation' ? 'opacity-100' : 'opacity-0'
            }`}>
              Use your Adobe account
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

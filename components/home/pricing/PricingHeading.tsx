'use client';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import ActivationTypeSelector from './ActivationTypeSelector';
import EmailInputField from './EmailInputField';

interface PricingHeadingProps {
  isAdmin?: boolean;
  adminError?: string | null;
  selectedActivationType?: 'pre-activated' | 'self-activation';
  onActivationTypeChange?: (type: 'pre-activated' | 'self-activation') => void;
  email?: string;
  setEmail?: (email: string) => void;
  isUserSignedIn?: boolean;
}

export default function PricingHeading({ isAdmin, adminError, selectedActivationType, onActivationTypeChange, email, setEmail, isUserSignedIn }: PricingHeadingProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px 0px" });
  
  return (
    <motion.div 
      className="text-center -mb-8" 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
    >
      <motion.h2
        ref={titleRef}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
        style={{
          textShadow: '0 0 20px rgba(255, 51, 102, 0.3)',
          transform: titleInView ? "perspective(1000px) rotateX(0deg)" : "perspective(1000px) rotateX(10deg)",
          willChange: 'transform'
        }}
      >
        <motion.span
          className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundSize: "200% 100%", willChange: 'background-position' }}
        >
          Unbeatable
        </motion.span>
        <motion.span
          className="inline-block"
          animate={{ y: [0, -5, 0], x: [0, 2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          &nbsp;Adobe CC Value{" "}
        </motion.span>
      </motion.h2>
      <motion.p
        className="text-white/80 mx-auto mb-8 text-base sm:text-lg font-light tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Choose the plan that works for you. All plans include the complete Adobe CC suite.
      </motion.p>
      
      {/* Activation Type Selector */}
      {selectedActivationType && onActivationTypeChange && (
        <ActivationTypeSelector
          selectedType={selectedActivationType}
          onTypeChange={onActivationTypeChange}
        />
      )}

      {/* Email Input Field - Only for Self-Activation */}
      {email !== undefined && setEmail && selectedActivationType === 'self-activation' && (
        <motion.div 
          className="max-w-lg mx-auto mb-8 relative z-10"
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <EmailInputField
            email={email}
            setEmail={setEmail}
            isUserSignedIn={isUserSignedIn || false}
            isSelfActivation={true}
          />
        </motion.div>
      )}
      
      {adminError && (
        <motion.div 
          className="mt-2 text-sm text-red-300 bg-red-900 bg-opacity-50 p-2 rounded-md mx-auto max-w-md"
        >
          <i className="fas fa-exclamation-triangle mr-1"></i> {adminError}
        </motion.div>
      )}
      {isAdmin && (
        <motion.div 
          className="mt-2 text-sm text-green-300 bg-green-900 bg-opacity-50 p-2 rounded-md mx-auto max-w-md"
        >
          <i className="fas fa-check-circle mr-1"></i> Admin features enabled
        </motion.div>
      )}
    </motion.div>
  );
} 
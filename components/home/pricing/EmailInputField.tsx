'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface EmailInputFieldProps {
  email: string;
  setEmail: (email: string) => void;
  isUserSignedIn: boolean;
  isSelfActivation?: boolean;
  highlightRequired?: boolean;
  className?: string;
}

export default function EmailInputField({ 
  email, 
  setEmail, 
  isUserSignedIn, 
  isSelfActivation = false,
  highlightRequired = false,
  className = "" 
}: EmailInputFieldProps) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Professional email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  // Real-time validation with debouncing
  useEffect(() => {
    if (!email) {
      setEmailError(null);
      return;
    }

    setIsValidating(true);
    const timeoutId = setTimeout(() => {
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError(null);
      }
      setIsValidating(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsValidating(false);
    };
  }, [email]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserSignedIn || isSelfActivation) {
      setEmail(e.target.value);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: highlightRequired ? [1, 1.02, 1] : 1
      }}
      transition={{ 
        opacity: { duration: 0.6, delay: 0.3 },
        y: { duration: 0.6, delay: 0.3 },
        scale: highlightRequired ? { duration: 1, repeat: 2, ease: "easeInOut" } : {}
      }}
    >
      {/* Label */}
      <motion.label 
        htmlFor="pricing-email"
        className="flex text-sm font-medium text-white mb-3 items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <i className="fas fa-envelope text-fuchsia-400 text-sm hidden md:inline"></i>
        <span className="hidden md:inline">
          {isSelfActivation ? 'Adobe Account Email Address' : 'Email Address for Activation'}
        </span>
        <span className="md:hidden">
          {isSelfActivation ? 'Adobe Account Email' : 'Email Address'}
        </span>
        <span className="text-fuchsia-400">*</span>
      </motion.label>

      {/* Input Container */}
      <div className="relative group">
        {/* Glow Effect - Desktop, Subtle focus ring - Mobile */}
        <motion.div 
          className={`absolute -inset-0.5 rounded-xl blur transition-all duration-300 hidden md:block ${
            emailError 
              ? 'bg-red-500 opacity-75' 
              : isFocused 
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 opacity-75' 
                : 'bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 opacity-0 group-hover:opacity-50'
          }`}
          animate={{
            opacity: emailError ? 0.75 : isFocused ? 0.75 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        <div 
          className={`absolute -inset-0.5 rounded-lg transition-all duration-200 md:hidden ${
            emailError 
              ? 'bg-red-500/20' 
              : isFocused 
                ? 'bg-fuchsia-500/20' 
                : 'bg-transparent'
          }`}
        />

        {/* Input Field */}
        <div className="relative">
          <input
            type="email"
            id="pricing-email"
            value={email}
            onChange={handleEmailChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isUserSignedIn && !isSelfActivation}
            placeholder={isSelfActivation ? 
              (isDesktop ? "Enter your Adobe account email" : "your.email@adobe.com") : 
              (isDesktop ? "Enter your email address" : "your.email@example.com")
            }
            className={`
              relative w-full transition-all
              md:px-4 md:py-4 md:pl-12 md:pr-12 md:bg-[rgba(17,17,40,0.8)] md:border-2 md:rounded-xl md:duration-300
              px-4 py-3 pl-10 pr-10 bg-[rgba(17,17,40,0.9)] border rounded-lg duration-200
              backdrop-blur-sm
              text-white md:placeholder-gray-400 placeholder-gray-500
              focus:outline-none
              ${emailError 
                ? 'md:border-red-500 border-red-400' 
                : isFocused 
                  ? 'md:border-fuchsia-400/50 border-fuchsia-400' 
                  : 'border-white/20 hover:border-white/30'
              }
              ${isUserSignedIn && !isSelfActivation
                ? 'cursor-not-allowed md:bg-[rgba(17,17,40,0.6)] opacity-60' 
                : 'cursor-text'
              }
            `}
          />

          {/* Email Icon */}
          <div className="absolute md:left-4 left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <motion.i 
              className={`fas fa-envelope text-sm transition-colors md:duration-300 duration-200 ${
                emailError 
                  ? 'text-red-400' 
                  : isFocused 
                    ? 'text-fuchsia-400' 
                    : 'text-gray-400'
              }`}
              animate={{
                color: emailError ? '#f87171' : isFocused ? '#e879f9' : '#9ca3af'
              }}
            />
          </div>

          {/* Right Side Icons */}
          <div className="absolute md:right-4 right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Validation Loading */}
            <AnimatePresence>
              {isValidating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-4 h-4 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin"
                />
              )}
            </AnimatePresence>

            {/* Success Icon */}
            <AnimatePresence>
              {!isValidating && !emailError && email && validateEmail(email) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="md:w-5 md:h-5 md:bg-green-500/20 md:rounded-full md:flex md:items-center md:justify-center"
                >
                  <i className="fas fa-check text-green-400 md:text-xs text-sm"></i>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Icon */}
            <AnimatePresence>
              {emailError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="md:w-5 md:h-5 md:bg-red-500/20 md:rounded-full md:flex md:items-center md:justify-center"
                >
                  <i className="md:fas md:fa-exclamation md:text-red-400 md:text-xs fas fa-exclamation-triangle text-red-400 text-sm"></i>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto-filled Badge */}
            {isUserSignedIn && !isSelfActivation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="md:bg-gradient-to-r md:from-green-500 md:to-cyan-500 md:text-xs md:text-black md:font-medium md:py-1 md:px-2 md:rounded-full md:flex md:items-center md:gap-1
                           bg-green-500/20 text-green-400 text-xs font-medium py-1 px-2 rounded flex items-center gap-1"
              >
                <i className="fas fa-check text-[10px]"></i>
                Auto-filled
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {emailError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 flex items-center gap-2 text-sm text-red-400"
          >
            <i className="fas fa-exclamation-circle text-xs hidden md:inline"></i>
            {emailError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <motion.div 
        className="mt-3 text-xs text-gray-400 flex items-start gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <i className="fas fa-info-circle text-fuchsia-400 mt-0.5 hidden md:inline"></i>
        <div>
          {isSelfActivation ? (
            <>
              <p className="mb-2 font-medium text-white text-left hidden md:block">
                Adobe Account Email Required
              </p>
              <p className="hidden md:block text-left">
                Enter your Adobe account email address. CheapCC will authorize your account for Adobe Creative Cloud access.
              </p>
              <p className="text-left hidden md:block">
                This preserves your existing settings, files, and preferences.
              </p>
              <p className="md:hidden text-left">
                CheapCC will authorize your Adobe account for Creative Cloud access.
              </p>
            </>
          ) : (
            <>
              <p className="mb-1 hidden md:block text-left">
                This email will be used for your Adobe account activation and order confirmations.
              </p>
              <p className="text-gray-500 hidden md:block text-left">
                For use your email: Use the email associated with your existing Adobe account.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

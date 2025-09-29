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
    if (!isUserSignedIn) {
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
        <i className="fas fa-envelope text-fuchsia-400 text-sm"></i>
        {isSelfActivation ? 'Adobe Account Email Address' : 'Email Address for Activation'}
        <span className="text-fuchsia-400">*</span>
      </motion.label>

      {/* Input Container */}
      <div className="relative group">
        {/* Glow Effect */}
        <motion.div 
          className={`absolute -inset-0.5 rounded-xl blur transition-all duration-300 ${
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

        {/* Input Field */}
        <div className="relative">
          <input
            type="email"
            id="pricing-email"
            value={email}
            onChange={handleEmailChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isUserSignedIn}
            placeholder={isSelfActivation ? "Enter your Adobe account email" : "Enter your email address"}
            className={`
              relative w-full px-4 py-4 pl-12 pr-12
              bg-[rgba(17,17,40,0.8)] backdrop-blur-sm
              border-2 rounded-xl
              text-white placeholder-gray-400
              focus:outline-none transition-all duration-300
              ${emailError 
                ? 'border-red-500' 
                : isFocused 
                  ? 'border-fuchsia-400/50' 
                  : 'border-white/20 hover:border-white/30'
              }
              ${isUserSignedIn 
                ? 'cursor-not-allowed bg-[rgba(17,17,40,0.6)]' 
                : 'cursor-text'
              }
            `}
          />

          {/* Email Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <motion.i 
              className={`fas fa-envelope text-sm transition-colors duration-300 ${
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
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
                  className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center"
                >
                  <i className="fas fa-check text-green-400 text-xs"></i>
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
                  className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center"
                >
                  <i className="fas fa-exclamation text-red-400 text-xs"></i>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto-filled Badge */}
            {isUserSignedIn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-500 to-cyan-500 text-xs text-black font-medium py-1 px-2 rounded-full flex items-center gap-1"
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
            <i className="fas fa-exclamation-circle text-xs"></i>
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
        <i className="fas fa-info-circle text-fuchsia-400 mt-0.5"></i>
        <div>
          {isSelfActivation ? (
            <>
              <p className="mb-2 font-medium text-white text-left">
                Adobe Account Email Required
              </p>
              <p className="">
                Enter the email address associated with your existing Adobe Creative Cloud account. 
              </p>
              <p className="text-left">
                We will add the subscription to this account.
              </p>
            </>
          ) : (
            <>
              <p className="mb-1">
                This email will be used for your Adobe account activation and order confirmations.
              </p>
              <p className="text-gray-500">
                For self-activation: Use the email associated with your existing Adobe account.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

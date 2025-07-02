'use client';

import Link from 'next/link';
import { signup } from './actions';
import { useEffect, useState, useRef, Suspense } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import RegisterPageURLMessages from '@/components/RegisterPageURLMessages';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [particles, setParticles] = useState<Array<{top: number, left: number, size: number, delay: number}>>([]);
  // New state to toggle email registration form visibility
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Password strength validation
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Generate particles for background effect
  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  // Calculate overall password validity
  const isPasswordValid = Object.values(passwordRequirements).every(req => req);

  // Check if passwords match whenever either password changes
  useEffect(() => {
    if (confirmPasswordTouched) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword, confirmPasswordTouched]);

  // UPDATED useEffect for password strength calculation
  useEffect(() => {
    // Always calculate requirements based on the current password.
    // The display of these requirements in JSX is controlled by passwordTouched.
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
    });
  }, [password]); // Only depends on password

  // Custom password input handler with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!passwordTouched) { // Ensure passwordTouched is set on first interaction
        setPasswordTouched(true);
    }
  };

  // Custom confirm password input handler with validation
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordTouched(true);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recaptchaToken) {
      setErrorMessage("Please complete the reCAPTCHA.");
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true); // --- Set loading state to true ---

    const formData = new FormData(event.currentTarget);
    formData.append('g-recaptcha-response', recaptchaToken);

    try {
      await signup(formData);
    } catch (error: any) {
      console.error("Client-side error during signup (should be rare if action redirects):", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  // Toggle email registration form
  const toggleEmailForm = () => {
    setShowEmailForm(!showEmailForm);
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut"
      }
    }
  };

  const formVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        height: { 
          duration: 0.4,
          ease: "easeOut"
        },
        opacity: { 
          duration: 0.4,
          delay: 0.1,
          ease: "easeOut"
        }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { 
          duration: 0.3,
          ease: "easeIn"
        },
        opacity: { 
          duration: 0.2,
          ease: "easeIn"
        }
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-8 overflow-y-auto bg-[#0f111a] relative">
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
            scale: [0.8, 1.2, 0.8],
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
        className="w-full max-w-md rounded-xl p-6 sm:p-7 mt-0 mb-2 relative z-10"
        style={{
          background: "rgba(17, 17, 40, 0.7)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.a 
          href="/" 
          className="w-fit mx-auto mb-4 text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition duration-300" 
          style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}
          variants={itemVariants}
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

        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white mb-1 text-center">
          Create your account
        </motion.h1>
        <motion.p variants={itemVariants} className="text-gray-300 text-center mb-5 text-sm">
          Join CheapCC and start saving on Adobe Creative Cloud
        </motion.p>

        {/* Component to display messages from URL parameters */}
        <Suspense fallback={
          <motion.div 
            variants={itemVariants} 
            className="mb-3 p-3 rounded-lg text-sm font-medium bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200"
          >
            Loading messages...
          </motion.div>
        }>
          <RegisterPageURLMessages />
        </Suspense>

        {/* Display client-side validation error messages */}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg text-sm font-medium bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-300"
          >
            <i className="fas fa-exclamation-circle mr-2"></i>
            {errorMessage}
          </motion.div>
        )}

        {/* Google Sign-In Button (prioritized) */}
        <motion.div 
          variants={itemVariants}
          className="mb-5"
          initial="hidden"
          animate="visible"
        >
          <GoogleSignInButton />
        </motion.div>

        <motion.div variants={containerVariants} className="relative mb-5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-400" style={{
              background: "rgba(17, 17, 40, 0.7)",
            }}>Or</span>
          </div>
        </motion.div>

        {/* Toggle button for email registration */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleEmailForm}
          className="w-full py-2.5 px-4 mb-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
        >
          <i className={`fas ${showEmailForm ? 'fa-chevron-up' : 'fa-envelope'} text-sm`}></i>
          <span>{showEmailForm ? 'Hide email registration' : 'Register with email'}</span>
        </motion.button>

        {/* Expandable Email Registration Form */}
        <AnimatePresence>
          {showEmailForm && (
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <motion.form 
                className="space-y-3" 
                onSubmit={handleSubmit}
              >
                <motion.div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-white placeholder-gray-400"
                    required
                    placeholder="Your Full Name"
                    disabled={isSubmitting}
                  />
                </motion.div>

                <motion.div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-white placeholder-gray-400"
                    required
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                  />
                </motion.div>

                <motion.div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 bg-white/5 backdrop-blur-sm border rounded-lg focus:ring-2 focus:ring-[#ff3366] transition text-white placeholder-gray-400 pr-10 ${
                        passwordTouched && !isPasswordValid ? 'border-yellow-500/50 bg-yellow-500/5 focus:border-yellow-500/50' : 'border-white/10 focus:border-[#ff3366]'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                      onClick={togglePasswordVisibility}
                      disabled={isSubmitting}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  
                  {passwordTouched && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 text-xs overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <p className={passwordRequirements.minLength ? 'text-green-400' : 'text-gray-400'}>
                          <i className={`fas ${passwordRequirements.minLength ? 'fa-check-circle' : 'fa-circle'} mr-1.5`}></i>
                          At least 8 characters
                        </p>
                        <p className={passwordRequirements.hasUppercase ? 'text-green-400' : 'text-gray-400'}>
                          <i className={`fas ${passwordRequirements.hasUppercase ? 'fa-check-circle' : 'fa-circle'} mr-1.5`}></i>
                          One uppercase letter
                        </p>
                        <p className={passwordRequirements.hasLowercase ? 'text-green-400' : 'text-gray-400'}>
                          <i className={`fas ${passwordRequirements.hasLowercase ? 'fa-check-circle' : 'fa-circle'} mr-1.5`}></i>
                          One lowercase letter
                        </p>
                        <p className={passwordRequirements.hasNumber ? 'text-green-400' : 'text-gray-400'}>
                          <i className={`fas ${passwordRequirements.hasNumber ? 'fa-check-circle' : 'fa-circle'} mr-1.5`}></i>
                          One number
                        </p>
                        <p className={passwordRequirements.hasSpecialChar ? 'text-green-400' : 'text-gray-400'}>
                          <i className={`fas ${passwordRequirements.hasSpecialChar ? 'fa-check-circle' : 'fa-circle'} mr-1.5`}></i>
                          One special character
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className={`w-full px-3 py-2 bg-white/5 backdrop-blur-sm border rounded-lg focus:ring-2 focus:ring-[#ff3366] transition text-white placeholder-gray-400 pr-10 ${
                        !passwordsMatch && confirmPasswordTouched ? 'border-red-500/50 bg-red-500/5 focus:border-red-500/50' : 'border-white/10 focus:border-[#ff3366]'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                      onClick={toggleConfirmPasswordVisibility}
                      disabled={isSubmitting}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {!passwordsMatch && confirmPasswordTouched && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-400"
                    >
                      <i className="fas fa-exclamation-circle mr-1.5"></i>
                      Passwords don't match
                    </motion.p>
                  )}
                </motion.div>

                <motion.div className="flex items-center my-2">
                  <input
                    id="marketing-opt-in"
                    name="marketingOptIn"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-[#ff3366] focus:ring-[#ff3366] transition"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="marketing-opt-in" className="ml-2 block text-sm text-gray-300">
                    Receive news and offers from CheapCC
                  </label>
                </motion.div>

                <motion.div className="flex justify-center w-full">
                  <div className="w-full max-w-md overflow-hidden">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                      onChange={handleRecaptchaChange}
                      theme="dark"
                      size="normal"
                      className="transform scale-[1.03] origin-left"
                    />
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-semibold rounded-lg transition focus:ring-2 focus:ring-white/25 focus:outline-none cursor-pointer disabled:opacity-60 shadow-lg relative overflow-hidden"
                  disabled={isSubmitting || (confirmPasswordTouched && !passwordsMatch) || !isPasswordValid || !recaptchaToken}
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
                  <span className="relative z-10">{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                </motion.button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Link */}
        <motion.div variants={itemVariants} className="text-center mt-4 text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            prefetch={false}
            className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 hover:underline font-medium transition-all duration-300"
          >
            Login
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
 
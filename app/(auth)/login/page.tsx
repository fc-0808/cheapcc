'use client';
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Link from 'next/link';
import { login } from './actions';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPageURLMessages from '@/components/LoginPageURLMessages';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import LightweightParticles from '@/components/home/LightweightParticles';

export default function LoginPage() {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState<'success' | 'error' | 'info' | ''>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check URL for message parameters
  useEffect(() => {
    setIsClient(true);
    
    const params = new URLSearchParams(window.location.search);
    const messageParam = params.get('message');
    const typeParam = params.get('type');
    
    if (messageParam) {
      setFormMessage(messageParam);
      setFormMessageType((typeParam as 'success' | 'error' | 'info') || 'info');
      
      // Update the URL without the query parameters
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url);
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle email login form
  const toggleEmailForm = () => {
    setShowEmailForm(!showEmailForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setFormMessage('');
    setFormMessageType('');

    const formData = new FormData(event.currentTarget);
    
    try {
      await login(formData);
      // If this code runs, the login action didn't redirect, which is unexpected
      setFormMessage('Redirecting...');
      setFormMessageType('info');
    } catch (error: any) {
      console.error("Client-side error during login (should be rare if action redirects):", error);
      setFormMessage("An unexpected error occurred. Please try again.");
      setFormMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize rendering for mobile devices
  const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 15;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-8 overflow-y-auto relative">
      {/* Background particles - only render on client side */}
      {isClient && (
      <LightweightParticles 
          count={particleCount}
        color="rgba(255, 255, 255, 0.4)"
        minSize={1}
        maxSize={3}
        minSpeed={10}
        maxSpeed={30}
      />
      )}

      {/* Background glow effect */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      
        <motion.div 
          className="w-full max-w-md rounded-xl p-6 sm:p-7 mt-0 mb-2 relative z-10"
          style={{
            background: "rgba(17, 17, 40, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.a 
            href="/" 
            className="w-fit mx-auto mb-4 text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition duration-300" 
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

          <motion.h1 className="text-2xl font-bold text-white mb-1 text-center">
            Welcome back
          </motion.h1>
          <motion.p className="text-gray-300 text-center mb-5 text-sm">
            Sign in to access your account
          </motion.p>

          <Suspense fallback={
            <div className="mb-3 p-3 rounded-lg text-sm font-medium bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200">
              Loading messages...
            </div>
          }>
            <LoginPageURLMessages />
          </Suspense>

          {/* Display client-side validation error messages */}
          {formMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium backdrop-blur-sm ${
               formMessageType === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 
               formMessageType === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 
               'bg-blue-500/20 border border-blue-500/30 text-blue-300'
             }`}>
               <i className={`fas ${
                 formMessageType === 'error' ? 'fa-exclamation-circle' : 
                 formMessageType === 'success' ? 'fa-check-circle' : 
                 'fa-info-circle'
               } mr-2`}></i>
               {formMessage}
             </div>
          )}

          {/* Google Sign-In Button (prioritized) */}
          <div className="mb-5">
            <GoogleSignInButton />
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400" style={{
                background: "rgba(17, 17, 40, 0.7)",
              }}>Or</span>
            </div>
          </div>

          {/* Toggle button for email login */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleEmailForm}
            className="w-full py-2.5 px-4 mb-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <i className={`fas ${showEmailForm ? 'fa-chevron-up' : 'fa-envelope'} text-sm`}></i>
            <span>{showEmailForm ? 'Hide email login' : 'Login with email'}</span>
          </motion.button>

        {/* Expandable Email Login Form with smoother animation */}
        <AnimatePresence>
          {showEmailForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
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
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-white placeholder-gray-400 mobile-enhanced-input"
                    style={{ fontSize: '16px' }} /* Prevents iOS zoom on focus */
                    required
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-200 mb-1"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      prefetch={false}
                      className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 hover:underline font-medium transition"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-white placeholder-gray-400 pr-12 mobile-enhanced-input"
                      style={{ fontSize: '16px' }} /* Prevents iOS zoom on focus */
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="flex items-center my-2">
                  <input
                    id="remember-me"
                    name="remember"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-[#ff3366] focus:ring-[#ff3366] transition"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-semibold rounded-lg transition focus:ring-2 focus:ring-white/25 focus:outline-none cursor-pointer disabled:opacity-60 shadow-lg relative overflow-hidden"
                  disabled={isLoading}
                >
                  <span className="relative z-10">{isLoading ? 'Signing in...' : 'Sign in'}</span>
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Registration Link */}
          <div className="text-center mt-4 text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/register"
              prefetch={false}
              className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 hover:underline font-medium transition-all duration-300"
            >
              Create account
            </Link>
          </div>
        </motion.div>
    </main>
  );
} 
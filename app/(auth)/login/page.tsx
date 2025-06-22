'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { login } from './actions';
import { useRouter } from 'next/navigation';
import LoginPageURLMessages from '@/components/LoginPageURLMessages';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState<'success' | 'error' | 'info' | ''>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     setIsLoading(true);
     setFormMessage('');
     setFormMessageType('');

     const formData = new FormData(event.currentTarget);
     const result = await login(formData);

     setIsLoading(false);

     if (result?.error) {
         setFormMessage(result.error);
         setFormMessageType('error');
     } else {
         // If login was successful, refresh to ensure components re-render with new auth state
         router.refresh();
     }
  };

  return (
    <main className="min-h-screen flex items-start sm:items-center justify-center bg-[#f8f9fa] pt-2 pb-4 px-4 sm:pt-4 sm:pb-6 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5 sm:p-6 mt-22 sm:mt-0 mb-2">
        <a href="/" className="w-fit mx-auto mb-2 sm:mb-3 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
          Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-xl sm:text-2xl font-bold text-[#2c2d5a] mb-1 text-center">Sign in to your account</h1>
        <p className="text-gray-500 text-center mb-3 text-sm">Welcome back! Please enter your details.</p>
        
        <Suspense fallback={<div className="mb-3 p-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700">Loading messages...</div>}>
          <LoginPageURLMessages />
        </Suspense>
        
        {formMessage && (
          <div className={`mb-3 p-2 rounded-md text-sm font-medium ${
            formMessageType === 'success' ? 'bg-green-100 text-green-700' :
            formMessageType === 'error' ? 'bg-red-100 text-red-700' :
            formMessageType === 'info' ? 'bg-blue-100 text-blue-700' : ''
          }`}>
            {formMessage}
          </div>
        )}
        
        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2c2d5a] mb-1">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-[#2c2d5a]">Password</label>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10"
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link href="/forgot-password" prefetch={false} legacyBehavior={false} className="text-sm text-[#ff3366] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-[#ff3366] to-[#ff5c86] text-white font-semibold rounded-md hover:from-[#ff2050] hover:to-[#ff4575] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none cursor-pointer disabled:opacity-60 shadow-md hover:shadow-lg hover:translate-y-[-1px]"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="relative my-3 sm:my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>
        <GoogleSignInButton />
        
        <div className="text-center mt-3 sm:mt-4 text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" prefetch={false} legacyBehavior={false} className="text-[#ff3366] hover:underline font-medium">Register</Link>
        </div>
      </div>
    </main>
  );
} 
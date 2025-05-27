'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { login } from './actions';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'register') {
      setMessage('Registration successful! Please check your email to confirm your account.');
      setMessageType('success');
      window.history.replaceState({}, document.title, '/login');
    }
    if (searchParams.get('success') === 'password_reset') {
      setMessage('Your password has been reset successfully. Please log in.');
      setMessageType('success');
      window.history.replaceState({}, document.title, '/login');
    }
    if (searchParams.get('info') === 'reset_link_sent') {
      setMessage('If an account exists for this email, a password reset link has been sent.');
      setMessageType('success');
      window.history.replaceState({}, document.title, '/login');
    }

    if (searchParams.get('error')) {
      setMessage(decodeURIComponent(searchParams.get('error') || ''));
      setMessageType('error');
      window.history.replaceState({}, document.title, '/login');
    }
  }, [searchParams]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <a href="/" className="w-fit mx-auto mb-6 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
          Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Sign in to your account</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Welcome back! Please enter your details.</p>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm font-medium ${
            messageType === 'success' ? 'bg-green-100 text-green-700' : 
            messageType === 'error' ? 'bg-red-100 text-red-700' : ''
          }`}>
            {message}
          </div>
        )}
        
        <form className="space-y-5">
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
              <Link href="/forgot-password" legacyBehavior={false} className="text-sm text-[#ff3366] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              formAction={login}
              className="w-full py-2 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none cursor-pointer"
              type="submit"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="text-center mt-6 text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" legacyBehavior={false} className="text-[#ff3366] hover:underline font-medium">Register</Link>
        </div>
      </div>
    </main>
  );
} 
'use client';

import React, { useState, FormEvent, Suspense } from 'react';
import { updateMarketingPreferences } from './actions';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Core component logic
function OnboardingComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get name and email from URL parameters for pre-filling
  const nameFromParams = searchParams?.get('name') || '';
  const emailFromParams = searchParams?.get('email') || '';
  
  const [name, setName] = useState(nameFromParams);
  const [marketingConsent, setMarketingConsent] = useState(true); // Default to checked
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData(e.currentTarget);
      // Append email from params as it's not in a form field
      formData.append('email', emailFromParams);
      
      const result = await updateMarketingPreferences(formData);
      
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
      // Success case is handled by the server action's redirect.
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle the skip action
  const handleSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/dashboard?welcome=new');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300">

        {/* Logo and Welcome Message */}
        <div className="text-center mb-6">
           <a href="/" className="w-fit mx-auto mb-4 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center justify-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
              Cheap <span className="text-[#ff3366]">CC</span>
            </a>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {name || 'Creator'}!</h1>
          <p className="text-gray-500 mt-1">Let's finalize your account setup.</p>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm font-medium bg-red-100 text-red-700 border border-red-200 flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <div className="relative">
              <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* Marketing Consent Section */}
          <div className="rounded-lg border border-gray-200 p-4 hover:border-[#ff3366] transition-colors duration-300 bg-gray-50/50">
            <div className="flex items-start">
              <input
                id="marketing-consent"
                name="marketingConsent"
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="h-5 w-5 mt-0.5 rounded border-gray-300 text-[#ff3366] focus:ring-2 focus:ring-offset-2 focus:ring-[#ff3366] transition cursor-pointer"
                disabled={isSubmitting}
              />
              <div className="ml-3 text-sm">
                <label htmlFor="marketing-consent" className="font-semibold text-gray-800 cursor-pointer">
                   Stay in the loop!
                </label>
                <p className="text-gray-600 mt-1">
                  Receive product updates, tutorials, and exclusive discounts from CheapCC.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-[#ff3366] to-[#ff5c86] text-white font-semibold rounded-lg hover:from-[#ff2050] hover:to-[#ff4575] transition focus:ring-4 focus:ring-[#ff3366]/30 focus:outline-none cursor-pointer disabled:opacity-70 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? 'Saving...' : 'Complete Registration'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-5">
          <button onClick={handleSkip} className="text-sm font-medium text-gray-500 hover:text-[#ff3366] transition" disabled={isSubmitting}>
            Skip for now
          </button>
        </div>
      </div>
    </main>
  );
}

// Wrap the component in Suspense to handle Next.js static rendering optimizations
export default function WelcomeOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <OnboardingComponent />
    </Suspense>
  );
}

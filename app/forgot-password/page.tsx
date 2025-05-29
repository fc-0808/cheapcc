'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from './actions'; // We'll create this action next
import ReCAPTCHA from "react-google-recaptcha";
import ForgotPasswordMessages from '@/components/ForgotPasswordMessages';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Local state for form submission feedback, distinct from URL param messages
  const [formSubmissionMessage, setFormSubmissionMessage] = useState('');
  const [formSubmissionMessageType, setFormSubmissionMessageType] = useState<'success' | 'error' | '' | null>(null);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recaptchaToken) {
      setFormSubmissionMessage("Please complete the reCAPTCHA.");
      setFormSubmissionMessageType('error');
      return;
    }
    setIsLoading(true);
    setFormSubmissionMessage('');
    setFormSubmissionMessageType(null);

    const formData = new FormData(event.currentTarget);
    formData.append('g-recaptcha-response', recaptchaToken);
    const result = await requestPasswordReset(formData);

    if (result?.error) {
      setFormSubmissionMessage(result.error);
      setFormSubmissionMessageType('error');
    }
    setIsLoading(false);
    recaptchaRef.current?.reset();
    setRecaptchaToken(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <a href="/" className="w-fit mx-auto mb-6 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
          Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Reset Your Password</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {/* Component for messages from URL parameters */}
        <Suspense fallback={<div className="mb-4 p-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700">Loading...</div>}>
          <ForgotPasswordMessages />
        </Suspense>

        {/* For direct form submission feedback */}
        {formSubmissionMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm font-medium ${
            formSubmissionMessageType === 'success' ? 'bg-green-100 text-green-700' :
            formSubmissionMessageType === 'error' ? 'bg-red-100 text-red-700' : ''
          }`}>
            {formSubmissionMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex justify-center">
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={handleRecaptchaChange}
              />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || !recaptchaToken}
              className="w-full py-2 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        <div className="text-center mt-6 text-sm text-gray-500">
          Remember your password?{' '}
          <Link href="/login" legacyBehavior={false} className="text-[#ff3366] hover:underline font-medium">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
} 
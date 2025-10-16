'use client';

import { useEffect, useState } from 'react';
import ReCaptchaWrapper from '@/components/ReCaptchaWrapper';

export default function DebugRecaptchaPage() {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'Not set',
      siteKeyLength: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.length || 0,
      userAgent: navigator.userAgent,
      windowGrecaptcha: typeof window !== 'undefined' ? !!window.grecaptcha : false,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    console.log('reCAPTCHA token changed:', token ? 'Token received' : 'Token cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">reCAPTCHA Debug Page</h1>
        
        {/* Debug Information */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="text-gray-300 w-40">{key}:</span>
                <span className="text-white font-mono break-all">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* reCAPTCHA Test */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">reCAPTCHA Test</h2>
          
          {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <ReCaptchaWrapper
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  theme="dark"
                  size="normal"
                />
              </div>
              
              {recaptchaToken && (
                <div className="bg-green-500/20 border border-green-500/30 rounded p-4">
                  <h3 className="text-green-300 font-semibold mb-2">✅ reCAPTCHA Token Received</h3>
                  <p className="text-green-200 text-sm font-mono break-all">
                    {recaptchaToken.substring(0, 50)}...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-500/20 border border-red-500/30 rounded p-4">
              <h3 className="text-red-300 font-semibold mb-2">❌ reCAPTCHA Site Key Not Found</h3>
              <p className="text-red-200 text-sm">
                The NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable is not set.
              </p>
            </div>
          )}
        </div>

        {/* Script Loading Status */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Script Loading Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="text-gray-300 w-40">reCAPTCHA Script:</span>
              <span className={`font-semibold ${
                typeof window !== 'undefined' && window.grecaptcha 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {typeof window !== 'undefined' && window.grecaptcha ? '✅ Loaded' : '❌ Not Loaded'}
              </span>
            </div>
            <div className="flex">
              <span className="text-gray-300 w-40">Script Element:</span>
              <span className={`font-semibold ${
                document.getElementById('recaptcha-script') 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {document.getElementById('recaptcha-script') ? '✅ Found' : '❌ Not Found'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/register" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Go to Register Page
          </a>
        </div>
      </div>
    </div>
  );
}

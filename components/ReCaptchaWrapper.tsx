'use client';

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { getRecaptchaConfig, waitForRecaptcha, debugRecaptcha } from '@/utils/recaptcha-client';

interface ReCaptchaWrapperProps {
  sitekey: string;
  onChange: (token: string | null) => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

export interface ReCaptchaWrapperRef {
  reset: () => void;
  execute: () => void;
}

const ReCaptchaWrapper = forwardRef<ReCaptchaWrapperRef, ReCaptchaWrapperProps>(
  ({ sitekey, onChange, theme = 'dark', size = 'normal', className }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      },
      execute: () => {
        if (recaptchaRef.current) {
          recaptchaRef.current.execute();
        }
      }
    }));

    useEffect(() => {
      const initializeRecaptcha = async () => {
        try {
          // Debug reCAPTCHA configuration
          if (process.env.NODE_ENV === 'development') {
            debugRecaptcha();
          }

          // Wait for reCAPTCHA to load
          const loaded = await waitForRecaptcha(15000);
          
          if (loaded) {
            setIsLoaded(true);
            setError(null);
          } else {
            setError('reCAPTCHA failed to load. Please refresh the page and try again.');
          }
        } catch (err) {
          console.error('Error initializing reCAPTCHA:', err);
          setError('Failed to initialize reCAPTCHA. Please check your internet connection.');
        }
      };

      initializeRecaptcha();
    }, []);

    const handleChange = (token: string | null) => {
      console.log('reCAPTCHA token received:', token ? 'Token received' : 'Token cleared');
      onChange(token);
    };

    const handleExpired = () => {
      console.log('reCAPTCHA expired');
      onChange(null);
    };

    const handleError = () => {
      console.error('reCAPTCHA error occurred');
      setError('reCAPTCHA verification failed. Please try again.');
      onChange(null);
    };

    // Debug information
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('reCAPTCHA Debug Info:', {
          sitekey: sitekey ? `${sitekey.substring(0, 10)}...` : 'Not provided',
          isLoaded,
          error,
          grecaptchaAvailable: typeof window !== 'undefined' && !!(window as any).grecaptcha
        });
      }
    }, [sitekey, isLoaded, error]);

    if (!sitekey) {
      return (
        <div className="text-red-400 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          reCAPTCHA site key not configured
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-400 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
          <button 
            onClick={() => {
              setError(null);
              setIsLoaded(false);
              // Try to reload
              window.location.reload();
            }}
            className="ml-2 text-red-300 hover:text-red-100 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center p-4 bg-white/5 rounded border border-white/10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/50 mr-3"></div>
          <span className="text-gray-300 text-sm">Loading reCAPTCHA...</span>
        </div>
      );
    }

    return (
      <div className={className}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={sitekey}
          onChange={handleChange}
          onExpired={handleExpired}
          onError={handleError}
          theme={theme}
          size={size}
        />
      </div>
    );
  }
);

ReCaptchaWrapper.displayName = 'ReCaptchaWrapper';

export default ReCaptchaWrapper;

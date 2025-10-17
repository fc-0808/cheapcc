'use client'

import React, { useEffect, useState, useRef } from 'react';
import { getPayPalClientId } from '@/utils/paypal-config';
import { useInternationalization } from '@/contexts/InternationalizationContext';

// Declare PayPal types for TypeScript
declare global {
  interface Window {
    paypal?: {
      Buttons: any;
      version: string;
    };
    __paypalLoadingPromise?: Promise<void>;
  }
}

// Global tracking to prevent multiple simultaneous loads
let globalPayPalLoadingPromise: Promise<void> | null = null;

const PayPalContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
  const [payPalError, setPayPalError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);
  const isMountedRef = useRef(true);
  const currentCurrencyRef = useRef<string>('');
  
  // Get user's currency from internationalization context
  const { countryConfig } = useInternationalization();

  useEffect(() => {
    isMountedRef.current = true;
    
    const loadPayPalSDK = async () => {
      if (!isMountedRef.current) {
        return;
      }
      
      try {
        const clientId = getPayPalClientId();
        const currency = countryConfig.currency;
        
        console.log('🔧 PayPalContextWrapper: Loading PayPal SDK with client ID:', clientId?.substring(0, 10) + '...');

        // Check if PayPal is already loaded with the same currency
        if (window.paypal && currentCurrencyRef.current === currency) {
          console.log('✅ PayPal SDK already loaded with correct currency:', currency);
          if (isMountedRef.current) {
            setIsPayPalLoaded(true);
          }
          return;
        }
        
        // If currency changed, we need to reload the script
        if (window.paypal && currentCurrencyRef.current !== currency) {
          console.log(`🔄 Currency changed from ${currentCurrencyRef.current} to ${currency}, reloading PayPal SDK`);
          // Remove existing PayPal scripts
          const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk/js"]');
          existingScripts.forEach(script => script.remove());
          window.paypal = undefined;
          scriptLoadedRef.current = false;
          setIsPayPalLoaded(false);
          globalPayPalLoadingPromise = null;
        }

        // Validate client ID
        if (!clientId || clientId.length < 50) {
          throw new Error('Invalid PayPal Client ID');
        }

        // Check if script is already being loaded globally
        if (globalPayPalLoadingPromise) {
          console.log('⏳ Waiting for PayPal SDK that is currently loading...');
          await globalPayPalLoadingPromise;
          if (isMountedRef.current && window.paypal) {
            setIsPayPalLoaded(true);
            setPayPalError(null);
          }
          return;
        }

        // Check if this instance already loaded the script
        if (scriptLoadedRef.current) {
          return;
        }

        // Create the loading promise
        globalPayPalLoadingPromise = new Promise<void>((resolve, reject) => {
          // Check if PayPal script already exists in DOM to avoid duplicates
          const existingPayPalScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
          if (existingPayPalScript) {
            console.log('✅ PayPal SDK script already exists in DOM');
            scriptLoadedRef.current = true;
            currentCurrencyRef.current = currency;
            
            // Wait for PayPal to be available
            const checkPayPal = setInterval(() => {
              if (window.paypal) {
                clearInterval(checkPayPal);
                if (isMountedRef.current) {
                  setIsPayPalLoaded(true);
                  setPayPalError(null);
                }
                globalPayPalLoadingPromise = null;
                resolve();
              }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkPayPal);
              globalPayPalLoadingPromise = null;
              if (isMountedRef.current) {
                setPayPalError('PayPal SDK timeout');
              }
              reject(new Error('PayPal SDK timeout'));
            }, 5000);
            return;
          }

          // Load PayPal SDK script with dynamic currency
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons&disable-funding=card`;
          script.async = true;
          script.defer = true;
          
          console.log(`🌍 Loading PayPal SDK with currency: ${currency} for country: ${countryConfig.code}`);
          
          script.onload = () => {
            console.log('✅ PayPal SDK script loaded');
            scriptLoadedRef.current = true;
            currentCurrencyRef.current = currency; // Store the current currency
            
            // Wait a bit for PayPal to initialize
            setTimeout(() => {
              if (!isMountedRef.current) {
                globalPayPalLoadingPromise = null;
                resolve();
                return;
              }
              
              if (window.paypal) {
                console.log(`✅ PayPal SDK initialized successfully with currency: ${currency}`);
                setIsPayPalLoaded(true);
                setPayPalError(null);
              } else {
                console.error('❌ PayPal SDK not available after script load');
                setPayPalError('PayPal SDK failed to initialize');
              }
              globalPayPalLoadingPromise = null;
              resolve();
            }, 100);
          };
          
          script.onerror = (error) => {
            console.error('❌ Failed to load PayPal SDK script:', error);
            if (isMountedRef.current) {
              setPayPalError('Failed to load PayPal SDK');
            }
            globalPayPalLoadingPromise = null;
            reject(error);
          };

          document.head.appendChild(script);
        });

        // Wait for the promise to complete
        await globalPayPalLoadingPromise;

      } catch (error) {
        console.error('❌ Error loading PayPal SDK:', error);
        if (isMountedRef.current) {
          setPayPalError(error instanceof Error ? error.message : 'Unknown error');
        }
        globalPayPalLoadingPromise = null;
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadPayPalSDK, 100);
    
    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
    };
  }, [countryConfig.currency]); // Reload when currency changes

  // Show error if PayPal failed to load
  if (payPalError) {
    console.error('❌ PayPal Context Error:', payPalError);
    return (
      <div data-paypal-loaded={false} data-paypal-error={payPalError}>
        {children}
      </div>
    );
  }

  // Pass PayPal loading state to children via context
  return (
    <div data-paypal-loaded={isPayPalLoaded} data-paypal-error={payPalError}>
      {children}
    </div>
  );
};

export default PayPalContextWrapper;
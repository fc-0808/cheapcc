'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { PAYPAL_CONFIG } from '@/utils/paypal-config';
import { useInternationalization } from '@/contexts/InternationalizationContext';

// No hardcoded fallback - rely on environment variables

type PayPalContextType = {
  isPayPalScriptLoaded: boolean;
  renderPayPalButton: (
    containerId: string,
    paypalButtonRef: React.RefObject<HTMLDivElement>,
    createOrder: () => Promise<string>,
    onApprove: (data: any) => Promise<void>,
    onCancel?: () => void,
    onError?: (err: Error) => void
  ) => void;
  cleanupPayPalButton: (containerId: string) => void;
};

const PayPalContext = createContext<PayPalContextType>({
  isPayPalScriptLoaded: false,
  renderPayPalButton: () => {},
  cleanupPayPalButton: () => {}
});

export const PayPalProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🚀 PayPalProvider initialized');
  const [isPayPalScriptLoaded, setIsPayPalScriptLoaded] = useState(false);
  
  // Get user's currency from internationalization context
  const { countryConfig } = useInternationalization();
  const activeContainers = useRef<Set<string>>(new Set());
  const pendingRenders = useRef<Map<string, any>>(new Map());
  const buttonInstances = useRef<Map<string, any>>(new Map());
  const renderTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map()); // Add render debouncing

  // Check if PayPal is already loaded on window
  useEffect(() => {
    console.log('🔄 PayPal Provider initialized');
    
    if (typeof window !== 'undefined' && window.paypal) {
      console.log('✅ PayPal SDK already present on window object');
      setIsPayPalScriptLoaded(true);
    }
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 PayPal Provider cleanup');
      
      // Clean up all active buttons first
      activeContainers.current.forEach(containerId => {
        try {
          cleanupPayPalButton(containerId);
        } catch (error) {
          console.debug(`Cleanup error for ${containerId}:`, error);
        }
      });
      
      // Clear all tracking
      activeContainers.current.clear();
      buttonInstances.current.clear();
      pendingRenders.current.clear();
      
      // Clear any pending render timeouts
      renderTimeouts.current.forEach(timeout => clearTimeout(timeout));
      renderTimeouts.current.clear();
    };
  }, []);

  const handlePayPalLoad = () => {
    console.log('✅ PayPal SDK loaded successfully');
    console.log('PayPal object available:', !!window.paypal);
    console.log('PayPal Buttons available:', !!window.paypal?.Buttons);
    setIsPayPalScriptLoaded(true);
    
    // Process any pending button renders
    if (typeof window !== 'undefined' && window.paypal && pendingRenders.current.size > 0) {
      console.log(`🔄 Processing ${pendingRenders.current.size} pending renders`);
      pendingRenders.current.forEach((config, containerId) => {
        const { ref, createOrder, onApprove, onCancel, onError } = config;
        if (ref.current && document.body.contains(ref.current)) {
          renderButtonSafely(containerId, ref, createOrder, onApprove, onCancel, onError);
        }
      });
      pendingRenders.current.clear();
    }
  };

  // Check if environment is valid for PayPal
  if (!PAYPAL_CONFIG.isEnvironmentValid()) {
    console.error('❌ PayPal environment is not valid, cannot initialize');
    return null;
  }

  // Get PayPal Client ID using the configuration utility with final fallback
  let clientId = PAYPAL_CONFIG.getClientId();
  
  // Final safety check - if somehow we still don't have a valid client ID, use hardcoded
  if (!clientId || clientId.length < 50) {
    console.error('❌ All PayPal Client ID methods failed, PayPal will not load');
    clientId = 'sb'; // Use invalid client ID to trigger error boundary
  }
  
  // Debug logging for production
  console.log('PayPal Client ID Debug:', {
    envClientId: process.env.PAYPAL_CLIENT_ID,
    envClientIdLength: process.env.PAYPAL_CLIENT_ID?.length || 0,
    finalClientId: clientId,
    finalClientIdLength: clientId?.length || 0,
    environment: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('PAYPAL'))
  });
  
  // Validate PayPal Client ID before creating URL
  if (!clientId || clientId.length < 50) {
    console.error('❌ PayPal Client ID is invalid or missing even with fallback!');
    console.error('❌ Expected length: ~80 chars, Got:', clientId?.length || 0);
    console.error('❌ Environment variables available:', Object.keys(process.env).filter(key => key.includes('PAYPAL')));
    return null;
  }

  const paypalScriptUrl = PAYPAL_CONFIG.getScriptUrl(countryConfig.currency);
  
  console.log(`🌍 PayPal Context: Loading SDK with currency ${countryConfig.currency} for country ${countryConfig.code}`);
  
  // Additional validation for the URL
  if (!paypalScriptUrl.includes(clientId) || paypalScriptUrl.includes('undefined') || paypalScriptUrl.includes('null')) {
    console.error('❌ PayPal script URL is invalid:', paypalScriptUrl);
    return null;
  }

  const handlePayPalError = (error: Error) => {
    console.error('❌ PayPal SDK failed to load:', error);
    console.error('❌ Check: Client ID, Network, CSP settings');
    console.error('❌ Script URL:', paypalScriptUrl);
    console.error('❌ Client ID used:', clientId);
    console.error('❌ Environment:', process.env.NODE_ENV);
    console.error('❌ User Agent:', typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A');
    
    // Try to provide helpful debugging information
    if (typeof window !== 'undefined') {
      console.error('❌ Available scripts:', Array.from(document.scripts).map(s => s.src));
      console.error('❌ CSP violations:', 'Check browser console for Content Security Policy errors');
      
      // Check if PayPal script is blocked by CSP
      const cspViolations = performance.getEntriesByType('navigation').filter(entry => 
        entry.name.includes('paypal') || entry.name.includes('csp')
      );
      if (cspViolations.length > 0) {
        console.error('❌ CSP violations detected:', cspViolations);
      }
      
      // Try to load PayPal script manually as fallback
      console.log('🔄 Attempting manual PayPal script load as fallback...');
      const script = document.createElement('script');
      script.src = paypalScriptUrl;
      script.async = true;
      script.onload = () => {
        console.log('✅ Manual PayPal script load successful');
        setIsPayPalScriptLoaded(true);
      };
      script.onerror = (e) => {
        console.error('❌ Manual PayPal script load also failed:', e);
      };
      document.head.appendChild(script);
    }
  };

  // Completely redesigned cleanup function - no DOM manipulation
  const cleanupPayPalButton = (containerId: string) => {
    console.log(`🧹 Cleaning up PayPal button: ${containerId}`);
    
    // Clear any pending render timeout
    const timeout = renderTimeouts.current.get(containerId);
    if (timeout) {
      clearTimeout(timeout);
      renderTimeouts.current.delete(containerId);
    }
    
    // Remove from tracking
    activeContainers.current.delete(containerId);
    pendingRenders.current.delete(containerId);
    
    // Clean up button instance first - be very defensive
    const buttonInstance = buttonInstances.current.get(containerId);
    if (buttonInstance) {
      try {
        // Only call cleanup methods if they exist and are functions
        if (buttonInstance && typeof buttonInstance === 'object') {
          // Try to properly close the button instance
          if (typeof buttonInstance.close === 'function') {
            try {
              buttonInstance.close();
            } catch (closeError) {
              console.debug(`Button close error for ${containerId}:`, closeError);
            }
          }
          // Some PayPal instances might have different cleanup methods
          if (typeof buttonInstance.destroy === 'function') {
            try {
              buttonInstance.destroy();
            } catch (destroyError) {
              console.debug(`Button destroy error for ${containerId}:`, destroyError);
            }
          }
        }
      } catch (error) {
        console.debug(`Button cleanup handled for ${containerId}:`, error);
      } finally {
        // Always remove from tracking, even if cleanup failed
        buttonInstances.current.delete(containerId);
      }
    }
    
    // DO NOT remove DOM elements - let PayPal manage its own DOM
    // The PayPal SDK will clean up its own elements when properly closed
    console.log(`✅ PayPal button cleanup completed for: ${containerId}`);
  };

  // Improved button rendering function with better error handling
  const renderButtonSafely = (
    containerId: string,
    paypalButtonRef: React.RefObject<HTMLDivElement>,
    createOrder: () => Promise<string>,
    onApprove: (data: any) => Promise<void>,
    onCancel?: () => void,
    onError?: (err: Error) => void
  ) => {
    console.log(`🔄 Rendering PayPal button in: ${containerId}`);
    
    // Basic safety checks first
    if (!paypalButtonRef.current || !document.body.contains(paypalButtonRef.current)) {
      console.log(`❌ Container ${containerId} not ready`);
      return;
    }

    // Check if the component is still mounted
    if (!activeContainers.current.has(containerId) && !pendingRenders.current.has(containerId)) {
      console.log(`❌ Container ${containerId} is no longer active, skipping render`);
      return;
    }

    // Check if container already has an active button
    if (activeContainers.current.has(containerId)) {
      console.log(`⚠️ Container ${containerId} already has active button, cleaning up first`);
      cleanupPayPalButton(containerId);
    }

    // Wait for DOM to be stable and cleanup to complete (with debouncing)
    const timeout = setTimeout(() => {
      const container = document.getElementById(containerId);
      if (!container || !document.body.contains(container)) {
        console.log(`❌ Container ${containerId} not found or removed from DOM`);
        renderTimeouts.current.delete(containerId);
        return;
      }

      // Check if container already has PayPal buttons - if so, skip rendering
      const existingButtons = container.querySelectorAll('[data-paypal-button], .paypal-buttons');
      if (existingButtons.length > 0) {
        console.log(`⚠️ Container ${containerId} already has ${existingButtons.length} PayPal elements, skipping render`);
        renderTimeouts.current.delete(containerId);
        return;
      }

      try {
        // Create PayPal button
        const buttonInstance = window.paypal.Buttons({
          createOrder: async () => {
            try {
              return await createOrder();
            } catch (error) {
              console.error(`CreateOrder error:`, error);
              if (onError) onError(error as Error);
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              await onApprove(data);
            } catch (error) {
              console.error(`OnApprove error:`, error);
              if (onError) onError(error as Error);
              throw error;
            }
          },
          onCancel: () => {
            console.log(`PayPal payment cancelled: ${containerId}`);
            if (onCancel) onCancel();
          },
          onError: (err: Error) => {
            console.error(`PayPal error:`, err);
            if (onError) onError(err);
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          }
        });

        // Render the button
        try {
          const renderResult: any = buttonInstance.render(`#${containerId}`);
          
          // Handle both promise and synchronous returns
          if (renderResult && typeof renderResult.then === 'function') {
            renderResult.then(() => {
              console.log(`✅ PayPal button rendered: ${containerId}`);
              buttonInstances.current.set(containerId, buttonInstance);
              activeContainers.current.add(containerId);
            }).catch((error: any) => {
              console.error(`❌ PayPal render failed:`, error);
              // Clean up failed render attempt
              activeContainers.current.delete(containerId);
              buttonInstances.current.delete(containerId);
              if (onError) onError(error);
            });
          } else {
            // Synchronous render or no return value
            console.log(`✅ PayPal button rendered: ${containerId}`);
            buttonInstances.current.set(containerId, buttonInstance);
            activeContainers.current.add(containerId);
          }
        } catch (renderError) {
          console.error(`❌ PayPal render error:`, renderError);
          // Clean up failed render attempt
          activeContainers.current.delete(containerId);
          buttonInstances.current.delete(containerId);
          if (onError) onError(renderError as Error);
        }

      } catch (error) {
        console.error(`❌ PayPal button creation failed:`, error);
        renderTimeouts.current.delete(containerId);
      }
    }, 200); // Increased delay for better DOM stability
    
    // Store timeout for cleanup
    renderTimeouts.current.set(containerId, timeout);
  };

  const renderPayPalButton = (
    containerId: string,
    paypalButtonRef: React.RefObject<HTMLDivElement>,
    createOrder: () => Promise<string>,
    onApprove: (data: any) => Promise<void>,
    onCancel?: () => void,
    onError?: (err: Error) => void
  ) => {
    console.log(`🎯 renderPayPalButton called: ${containerId}`);
    console.log(`- SDK loaded: ${isPayPalScriptLoaded}`);
    console.log(`- Window PayPal: ${typeof window !== 'undefined' && !!window.paypal}`);
    
    // Validate inputs
    if (!containerId || !paypalButtonRef) {
      console.error("❌ Invalid arguments to renderPayPalButton");
      return;
    }
    
    // Clean up existing button if any
    if (activeContainers.current.has(containerId)) {
      cleanupPayPalButton(containerId);
    }
    
    // If PayPal SDK is not ready, queue for later
    if (!isPayPalScriptLoaded || typeof window === 'undefined' || !window.paypal) {
      console.log(`⏳ PayPal SDK not ready, queuing: ${containerId}`);
      pendingRenders.current.set(containerId, { 
        ref: paypalButtonRef, 
        createOrder, 
        onApprove, 
        onCancel, 
        onError 
      });
      return;
    }

    // Check container exists
    if (!paypalButtonRef.current || !document.body.contains(paypalButtonRef.current)) {
      console.error(`❌ Container ${containerId} not in DOM`);
      return;
    }

    // Clear container content safely before rendering (only if necessary)
    const container = document.getElementById(containerId);
    if (container && container.innerHTML.trim() !== '') {
      console.log(`🧹 Clearing container content for fresh render: ${containerId}`);
      container.innerHTML = ''; // Safe way to clear content without removing the container itself
    }

    // Render the button
    renderButtonSafely(containerId, paypalButtonRef, createOrder, onApprove, onCancel, onError);
  };

  return (
    <PayPalContext.Provider value={{ isPayPalScriptLoaded, renderPayPalButton, cleanupPayPalButton }}>
      <Script 
        src={paypalScriptUrl}
        strategy="beforeInteractive"
        onLoad={handlePayPalLoad}
        onError={handlePayPalError}
        onReady={() => {
          console.log('🚀 PayPal script onReady fired');
        }}
        // Add additional attributes for better compatibility
        crossOrigin="anonymous"
        // Add a timeout to detect if script fails to load
        onLoadStart={() => {
          console.log('🔄 PayPal script loading started');
        }}
      />
      {children}
    </PayPalContext.Provider>
  );
};

export const usePayPal = () => {
  return useContext(PayPalContext);
}; 
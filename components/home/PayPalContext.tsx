'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Script from 'next/script';

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
  const [isPayPalScriptLoaded, setIsPayPalScriptLoaded] = useState(false);
  // Keep track of container IDs that have active buttons
  const activeContainers = useRef<Set<string>>(new Set());
  // Track any pending renders
  const pendingRenders = useRef<Map<string, any>>(new Map());
  // Track button instances for each container
  const buttonInstances = useRef<Map<string, any>>(new Map());

  // Check if PayPal is already loaded on window
  useEffect(() => {
    if (typeof window !== 'undefined' && window.paypal) {
      console.log('PayPal SDK already present on window object');
      setIsPayPalScriptLoaded(true);
    }
    
    // Cleanup on unmount
    return () => {
      try {
        // Clean up all active containers
        Array.from(activeContainers.current).forEach(containerId => {
          try {
            cleanupPayPalButton(containerId);
          } catch (err) {
            console.error(`Error cleaning up container ${containerId}:`, err);
          }
        });
        
        activeContainers.current.clear();
        buttonInstances.current.clear();
        pendingRenders.current.clear();
      } catch (err) {
        console.error('Error during PayPal provider cleanup:', err);
      }
    };
  }, []);

  const handlePayPalLoad = () => {
    console.log('PayPal SDK loaded successfully');
    setIsPayPalScriptLoaded(true);
    
    // Process any pending button renders
    if (typeof window !== 'undefined' && window.paypal) {
      pendingRenders.current.forEach((config, containerId) => {
        const { ref, createOrder, onApprove, onCancel, onError } = config;
        if (ref.current && document.body.contains(ref.current)) {
          try {
            // Make sure to clean up any existing buttons for this container first
            cleanupPayPalButton(containerId);
            renderButtonSafely(containerId, ref, createOrder, onApprove, onCancel, onError);
          } catch (error) {
            console.error('Failed to render pending PayPal button:', error);
          }
        }
      });
      pendingRenders.current.clear();
    }
  };

  const handlePayPalError = (error: Error) => {
    console.error('PayPal SDK failed to load:', error);
  };

  // Enhanced cleanup function that removes the button DOM elements
  const cleanupPayPalButton = (containerId: string) => {
    try {
      if (activeContainers.current.has(containerId)) {
        console.log(`Cleaning up PayPal button for container ${containerId}`);
        
        // Get the container element
        const container = document.getElementById(containerId);
        
        // Only attempt to clear the container if it exists
        if (container && document.body.contains(container)) {
          try {
            // Clear the container contents to remove the PayPal button
            while (container.firstChild) {
              container.removeChild(container.firstChild);
            }
          } catch (innerErr) {
            console.error(`Error clearing container ${containerId}:`, innerErr);
          }
        }
        
        // Always remove from our tracking collections, even if DOM manipulation failed
        activeContainers.current.delete(containerId);
        buttonInstances.current.delete(containerId);
      }
    } catch (err) {
      console.error(`Error during PayPal button cleanup for ${containerId}:`, err);
    }
  };

  // This function safely checks and renders a button
  const renderButtonSafely = (
    containerId: string,
    paypalButtonRef: React.RefObject<HTMLDivElement>,
    createOrder: () => Promise<string>,
    onApprove: (data: any) => Promise<void>,
    onCancel?: () => void,
    onError?: (err: Error) => void
  ) => {
    // Always clean up existing button first
    cleanupPayPalButton(containerId);
    
    // Safety checks before attempting to render
    if (!paypalButtonRef.current) {
      console.log(`PayPal button container #${containerId} not found, cannot render.`);
      return;
    }

    if (!document.body.contains(paypalButtonRef.current)) {
      console.log(`PayPal button container #${containerId} not in DOM, cannot render.`);
      return;
    }
    
    // Create a wrapper for error handling
    const safeCreateOrder = async () => {
      try {
        return await createOrder();
      } catch (error) {
        console.error(`Error in createOrder for ${containerId}:`, error);
        if (onError) onError(error as Error);
        throw error; // Re-throw to let PayPal handle it
      }
    };

    const safeOnApprove = async (data: any) => {
      try {
        return await onApprove(data);
      } catch (error) {
        console.error(`Error in onApprove for ${containerId}:`, error);
        if (onError) onError(error as Error);
        throw error; // Re-throw to let PayPal handle it
      }
    };

    // Wrapper for onCancel
    const safeOnCancel = () => {
      try {
        if (onCancel) onCancel();
      } catch (error) {
        console.error(`Error in onCancel for ${containerId}:`, error);
        if (onError) onError(error as Error);
      }
    };
    
    // Wrapper for onError to ensure we catch all errors
    const safeOnError = (err: Error) => {
      console.error(`PayPal button error for ${containerId}:`, err);
      if (onError) onError(err);
    };

    console.log(`Rendering PayPal button in container ${containerId}`);
    try {
      // Get the container element by ID to ensure it exists
      const container = document.getElementById(containerId);
      if (!container || !document.body.contains(container)) {
        console.error(`Container #${containerId} not found in DOM, cannot render PayPal button`);
        return;
      }
      
      // First make sure container is empty
      try {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      } catch (clearError) {
        console.error(`Error clearing container #${containerId}:`, clearError);
        // Continue anyway, PayPal might handle this
      }
      
      // Create button
      const buttonInstance = window.paypal.Buttons({
        createOrder: safeCreateOrder,
        onApprove: safeOnApprove,
        onCancel: safeOnCancel,
        onError: safeOnError,
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        }
      });
      
      // Check eligibility without causing errors
      const isEligible = !buttonInstance.isEligible || buttonInstance.isEligible();
      
      if (isEligible) {
        try {
          // Use the container ID directly for rendering
          buttonInstance.render(`#${containerId}`);
          
          // Store button instance reference
          buttonInstances.current.set(containerId, buttonInstance);
          activeContainers.current.add(containerId);
        } catch (renderError) {
          console.error(`Failed to render PayPal button for ${containerId}:`, renderError);
          if (onError) onError(renderError as Error);
        }
      } else {
        console.warn(`PayPal button for ${containerId} not eligible for rendering`);
        if (onError) onError(new Error('PayPal button not eligible for rendering'));
      }
    } catch (error) {
      console.error(`Error creating PayPal button for ${containerId}:`, error);
      if (onError) onError(error as Error);
    }
  };

  const renderPayPalButton = (
    containerId: string,
    paypalButtonRef: React.RefObject<HTMLDivElement>,
    createOrder: () => Promise<string>,
    onApprove: (data: any) => Promise<void>,
    onCancel?: () => void,
    onError?: (err: Error) => void
  ) => {
    // Validate inputs first
    if (!containerId || !paypalButtonRef) {
      console.error("Invalid arguments to renderPayPalButton");
      return;
    }
    
    // First check if there's already a button in this container and clean it up
    try {
      if (activeContainers.current.has(containerId)) {
        cleanupPayPalButton(containerId);
      }
    } catch (err) {
      console.error(`Error cleaning up existing PayPal button for ${containerId}:`, err);
      // Continue anyway, we'll try to render a new button
    }
    
    // If PayPal SDK is not loaded yet, store config for later
    if (!isPayPalScriptLoaded || typeof window === 'undefined' || !window.paypal) {
      console.log(`PayPal SDK not ready, queuing button render for container ${containerId}`);
      pendingRenders.current.set(containerId, { 
        ref: paypalButtonRef, 
        createOrder, 
        onApprove, 
        onCancel, 
        onError 
      });
      return;
    }

    // Check if container exists in DOM before attempting to render
    if (!paypalButtonRef.current || !document.body.contains(paypalButtonRef.current)) {
      console.error(`PayPal button container ${containerId} not in DOM, cannot render`);
      return;
    }

    // Render new button with safety checks
    renderButtonSafely(containerId, paypalButtonRef, createOrder, onApprove, onCancel, onError);
  };

  return (
    <PayPalContext.Provider value={{ isPayPalScriptLoaded, renderPayPalButton, cleanupPayPalButton }}>
      <Script 
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture&components=buttons&disable-funding=card`}
        strategy="afterInteractive"
        onLoad={handlePayPalLoad}
        onError={handlePayPalError}
      />
      {children}
    </PayPalContext.Provider>
  );
};

export const usePayPal = () => {
  return useContext(PayPalContext);
}; 
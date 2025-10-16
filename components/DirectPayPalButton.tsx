'use client';

/**
 * DirectPayPalButton - Professional PayPal Integration Component
 * 
 * CRITICAL DESIGN PRINCIPLES:
 * =========================
 * 1. NEVER manipulate container's innerHTML directly (PAYPAL OWNS THE DOM)
 * 2. ALWAYS use PayPal's close() method for proper cleanup
 * 3. PREVENT React from reconciling PayPal-managed DOM nodes
 * 4. NEVER include PayPal managed div in React's state/effects
 * 
 * COMMON ERRORS THIS PREVENTS:
 * ============================
 * - "Detected container element removed from DOM" - caused by innerHTML = ''
 * - "Failed to execute 'removeChild' on 'Node'" - caused by React/PayPal DOM conflicts
 * - Maximum update depth exceeded - caused by incorrect dependency arrays
 * 
 * See: https://github.com/paypal/PayPal-TypeScript-Server-SDK
 */

import React, { useEffect, useRef, useState, useCallback, useId } from 'react';

interface DirectPayPalButtonProps {
  containerId: string;
  createOrder: () => Promise<string>;
  onApprove: (data: any) => Promise<void>;
  onCancel?: () => void;
  onError?: (err: any) => void;
  style?: any; // PayPal button style options
}

export default function DirectPayPalButton({
  containerId,
  createOrder,
  onApprove,
  onCancel,
  onError,
  style = { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }
}: DirectPayPalButtonProps) {
  // Store reference to the container - PayPal will manage its contents
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Store PayPal button instance for proper cleanup
  const paypalButtonInstanceRef = useRef<any>(null);
  
  // Track if render attempt was made (prevents duplicate renders)
  const renderAttemptedRef = useRef(false);
  
  // Track component lifecycle (prevent state updates after unmount)
  const isMountedRef = useRef(true);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Generate unique ID for safety
  const internalId = useId();

  /**
   * Error handler - called by PayPal if button/transaction errors occur
   * Uses isMountedRef to prevent setting state on unmounted component
   */
  const handleError = useCallback((err: any) => {
    console.error('❌ PayPal button error:', err);
    if (isMountedRef.current) {
      setError(err?.message || 'PayPal payment error occurred');
      if (onError) onError(err);
    }
  }, [onError]);

  /**
   * Init handler - called when PayPal button initializes
   * Update UI state to show button is ready
   */
  const handleInit = useCallback((_data: any, _actions: any) => {
    console.log('✅ PayPal button initialized');
    if (isMountedRef.current) {
      setIsLoading(false);
      setError(null);
    }
  }, []);

  /**
   * Render handler - called when PayPal button completes rendering
   * Purely informational - PayPal manages the actual DOM
   */
  const handleRender = useCallback(() => {
    console.log('🎨 PayPal button rendered successfully');
  }, []);

  /**
   * CRITICAL: Destroy PayPal button instance
   * 
   * Key Points:
   * - Call close() on button instance - NOT innerHTML manipulation
   * - close() properly tears down PayPal's event listeners and DOM
   * - Prevents memory leaks and "container element removed" errors
   * - Never clear the container manually - let PayPal's close() handle it
   */
  const destroyPayPalButton = useCallback(() => {
    if (paypalButtonInstanceRef.current && typeof paypalButtonInstanceRef.current.close === 'function') {
      try {
        console.log('🗑️  Destroying previous PayPal button instance');
        paypalButtonInstanceRef.current.close();
      } catch (err) {
        console.warn('⚠️  Warning during PayPal button close:', err);
      }
    }
    paypalButtonInstanceRef.current = null;
  }, []);

  /**
   * Main rendering effect - setup and render PayPal button
   * 
   * Flow:
   * 1. Wait for PayPal SDK to load (window.paypal.Buttons)
   * 2. Check component is still mounted
   * 3. Verify container ref exists
   * 4. Prevent duplicate renders
   * 5. Destroy any existing button first
   * 6. Create and render new button
   * 
   * Critical: Do NOT include state in dependency array that's set in this effect
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    const renderButton = () => {
      // Check PayPal SDK is available
      if (!window.paypal?.Buttons) {
        console.log('⏳ PayPal SDK not ready yet, retrying...');
        setTimeout(renderButton, 300);
        return;
      }

      // Verify container reference exists
      if (!containerRef.current) {
        console.error('❌ Container ref is not available');
        return;
      }

      // Ensure component is still mounted
      if (!isMountedRef.current) {
        console.log('⚠️  Component unmounted, skipping render');
        return;
      }

      // Prevent duplicate renders (render() call is expensive)
      if (renderAttemptedRef.current) {
        console.log('✓ Button already rendered, skipping duplicate render');
        return;
      }

      try {
        console.log('🎯 Starting PayPal button render');
        
        // Destroy any existing button instance first
        destroyPayPalButton();

        // Create new PayPal button instance
        const buttonInstance = window.paypal.Buttons({
          style,
          createOrder,
          onApprove,
          onCancel,
          onError: handleError,
          onInit: handleInit,
          onRender: handleRender
        });

        // Store reference for later cleanup
        paypalButtonInstanceRef.current = buttonInstance;
        
        // Mark that we've attempted render (prevent duplicate calls)
        renderAttemptedRef.current = true;

        // Render PayPal button into container
        // IMPORTANT: PayPal SDK now manages all DOM within containerRef.current
        // Do NOT manipulate this container outside of PayPal's close() method
        buttonInstance.render(containerRef.current);
        
        console.log('✅ PayPal button render call completed successfully');

      } catch (err) {
        console.error('❌ Error during PayPal button render:', err);
        if (isMountedRef.current) {
          setError('Failed to render PayPal button');
          setIsLoading(false);
        }
        // Allow retry on error - reset render attempted flag
        renderAttemptedRef.current = false;
      }
    };

    // Small delay to ensure DOM is ready for PayPal
    const timerId = setTimeout(renderButton, 100);

    return () => {
      clearTimeout(timerId);
      isMountedRef.current = false;
      // Note: Don't close button here - let unmount effect handle it
    };
  }, [containerId, createOrder, onApprove, onCancel, handleError, handleInit, handleRender, destroyPayPalButton, style]);

  /**
   * Cleanup effect - runs when component unmounts
   * Ensures PayPal button is properly destroyed
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      destroyPayPalButton();
    };
  }, [destroyPayPalButton]);

  // Error state UI
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm font-medium">Payment Method Unavailable</p>
        <p className="text-red-500 text-xs mt-1">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setIsLoading(true);
            renderAttemptedRef.current = false;
            destroyPayPalButton();
          }}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main render - container div for PayPal to manage
  return (
    <div className="w-full">
      {isLoading && (
        <div className="p-6 text-center">
          <div className="h-8 w-8 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Loading secure payment...</p>
        </div>
      )}
      {/* 
        CRITICAL: This container is managed by PayPal SDK
        - PayPal will inject its button HTML here
        - Never manipulate innerHTML directly
        - Use close() method for cleanup
        - React will not reconcile PayPal's injected DOM
      */}
      <div 
        id={`paypal-container-${internalId}`}
        ref={containerRef} 
        className="w-full paypal-button-container"
        data-testid="paypal-button-container"
      />
    </div>
  );
}
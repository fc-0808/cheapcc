import { useEffect, useCallback } from 'react';

/**
 * Custom hook for interacting with Tawk.to chat widget
 * Provides methods to control the chat widget programmatically
 */
export const useTawkTo = () => {
  /**
   * Check if Tawk.to is loaded and available
   */
  const isTawkToLoaded = useCallback((): boolean => {
    return typeof window !== 'undefined' && 
           typeof window.Tawk_API !== 'undefined' &&
           window.Tawk_LoadedSuccessfully !== false;
  }, []);

  /**
   * Hide the chat widget
   */
  const hideWidget = useCallback(() => {
    try {
      if (isTawkToLoaded() && window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    } catch (error) {
      console.warn('Error hiding Tawk.to widget:', error);
    }
  }, [isTawkToLoaded]);

  /**
   * Show the chat widget
   */
  const showWidget = useCallback(() => {
    try {
      if (isTawkToLoaded() && window.Tawk_API?.showWidget) {
        window.Tawk_API.showWidget();
      }
    } catch (error) {
      console.warn('Error showing Tawk.to widget:', error);
    }
  }, [isTawkToLoaded]);

  /**
   * Toggle the chat widget visibility
   */
  const toggleWidget = useCallback(() => {
    try {
      if (isTawkToLoaded() && window.Tawk_API?.toggle) {
        window.Tawk_API.toggle();
      }
    } catch (error) {
      console.warn('Error toggling Tawk.to widget:', error);
    }
  }, [isTawkToLoaded]);

  /**
   * Maximize the chat widget
   */
  const maximizeWidget = useCallback(() => {
    try {
      if (isTawkToLoaded() && window.Tawk_API?.maximize) {
        window.Tawk_API.maximize();
      }
    } catch (error) {
      console.warn('Error maximizing Tawk.to widget:', error);
    }
  }, [isTawkToLoaded]);

  /**
   * Minimize the chat widget
   */
  const minimizeWidget = useCallback(() => {
    try {
      if (isTawkToLoaded() && window.Tawk_API?.minimize) {
        window.Tawk_API.minimize();
      }
    } catch (error) {
      console.warn('Error minimizing Tawk.to widget:', error);
    }
  }, [isTawkToLoaded]);

  /**
   * Set user attributes for the chat
   */
  const setAttributes = useCallback((attributes: Record<string, any>, callback?: () => void) => {
    try {
      if (isTawkToLoaded() && window.Tawk_API?.setAttributes) {
        window.Tawk_API.setAttributes(attributes, callback);
      }
    } catch (error) {
      console.warn('Error setting Tawk.to attributes:', error);
    }
  }, [isTawkToLoaded]);

  /**
   * Set up event listeners for Tawk.to events
   */
  const setupEventListeners = useCallback((
    onLoad?: () => void,
    onStatusChange?: (status: string) => void
  ) => {
    try {
      if (typeof window !== 'undefined') {
        window.Tawk_API = window.Tawk_API || {};
        
        if (onLoad) {
          window.Tawk_API.onLoad = () => {
            try {
              onLoad();
            } catch (error) {
              console.warn('Error in Tawk.to onLoad callback:', error);
            }
          };
        }
        
        if (onStatusChange) {
          window.Tawk_API.onStatusChange = (status: string) => {
            try {
              onStatusChange(status);
            } catch (error) {
              console.warn('Error in Tawk.to onStatusChange callback:', error);
            }
          };
        }
      }
    } catch (error) {
      console.warn('Error setting up Tawk.to event listeners:', error);
    }
  }, []);

  return {
    isTawkToLoaded,
    hideWidget,
    showWidget,
    toggleWidget,
    maximizeWidget,
    minimizeWidget,
    setAttributes,
    setupEventListeners,
  };
};

export default useTawkTo;

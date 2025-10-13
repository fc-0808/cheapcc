'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  detectUserCountry, 
  setUserCountry as setUserCountryUtil, 
  getLocalizedContent,
  formatPrice,
  SUPPORTED_COUNTRIES,
  CountryConfig 
} from '@/utils/internationalization';
import { trackInternationalUser } from '@/utils/analytics';

interface InternationalizationContextType {
  selectedCountry: string;
  countryConfig: CountryConfig;
  localizedContent: ReturnType<typeof getLocalizedContent>;
  setCountry: (countryCode: string) => void;
  formatLocalPrice: (basePrice: number) => string;
  isLoading: boolean;
}

const InternationalizationContext = createContext<InternationalizationContextType | undefined>(undefined);

interface InternationalizationProviderProps {
  children: ReactNode;
}

export function InternationalizationProvider({ children }: InternationalizationProviderProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize country detection
  useEffect(() => {
    const initializeCountry = () => {
      try {
        const detectedCountry = detectUserCountry();
        setSelectedCountry(detectedCountry);
        
        // Track international user if not US
        if (detectedCountry !== 'US') {
          const config = SUPPORTED_COUNTRIES[detectedCountry];
          if (config) {
            trackInternationalUser(detectedCountry, config.currency, config.language);
          }
        }
      } catch (error) {
        console.error('Error initializing country:', error);
        setSelectedCountry('US'); // Fallback to US
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(initializeCountry, 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen for localStorage changes (when user changes country in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_country' && e.newValue) {
        const newCountry = e.newValue;
        if (SUPPORTED_COUNTRIES[newCountry] && newCountry !== selectedCountry) {
          setSelectedCountry(newCountry);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedCountry]);

  const setCountry = (countryCode: string) => {
    if (SUPPORTED_COUNTRIES[countryCode]) {
      setSelectedCountry(countryCode);
      setUserCountryUtil(countryCode);
      
      // Track country selection
      const config = SUPPORTED_COUNTRIES[countryCode];
      trackInternationalUser(countryCode, config.currency, config.language);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('countryChanged', { 
        detail: { countryCode, config } 
      }));
    }
  };

  const formatLocalPrice = (basePrice: number): string => {
    return formatPrice(basePrice, selectedCountry);
  };

  const countryConfig = SUPPORTED_COUNTRIES[selectedCountry] || SUPPORTED_COUNTRIES.US;
  const localizedContent = getLocalizedContent(selectedCountry);

  const contextValue: InternationalizationContextType = {
    selectedCountry,
    countryConfig,
    localizedContent,
    setCountry,
    formatLocalPrice,
    isLoading
  };

  return (
    <InternationalizationContext.Provider value={contextValue}>
      {children}
    </InternationalizationContext.Provider>
  );
}

export function useInternationalization() {
  const context = useContext(InternationalizationContext);
  if (context === undefined) {
    throw new Error('useInternationalization must be used within an InternationalizationProvider');
  }
  return context;
}

// Hook for components that need to react to country changes
export function useCountryChange(callback: (countryCode: string, config: CountryConfig) => void) {
  useEffect(() => {
    const handleCountryChange = (event: CustomEvent) => {
      callback(event.detail.countryCode, event.detail.config);
    };

    window.addEventListener('countryChanged', handleCountryChange as EventListener);
    return () => window.removeEventListener('countryChanged', handleCountryChange as EventListener);
  }, [callback]);
}

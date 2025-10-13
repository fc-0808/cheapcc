// International SEO and Localization Utilities
// Professional implementation for global CheapCC expansion

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  language: string;
  hreflang: string;
  priceMultiplier: number;
  vatRate?: number;
}

// Supported countries with localized pricing
export const SUPPORTED_COUNTRIES: Record<string, CountryConfig> = {
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    language: 'en-US',
    hreflang: 'en-us',
    priceMultiplier: 1.0,
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$',
    language: 'en-CA',
    hreflang: 'en-ca',
    priceMultiplier: 1.35, // Approximate CAD conversion
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    language: 'en-GB',
    hreflang: 'en-gb',
    priceMultiplier: 0.82, // Approximate GBP conversion
    vatRate: 0.20, // 20% VAT
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    language: 'en-AU',
    hreflang: 'en-au',
    priceMultiplier: 1.55, // Approximate AUD conversion
    vatRate: 0.10, // 10% GST
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'de-DE',
    hreflang: 'de-de',
    priceMultiplier: 0.92, // Approximate EUR conversion
    vatRate: 0.19, // 19% VAT
  },
  FR: {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'fr-FR',
    hreflang: 'fr-fr',
    priceMultiplier: 0.92, // Approximate EUR conversion
    vatRate: 0.20, // 20% VAT
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'es-ES',
    hreflang: 'es-es',
    priceMultiplier: 0.92, // Approximate EUR conversion
    vatRate: 0.21, // 21% VAT
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'it-IT',
    hreflang: 'it-it',
    priceMultiplier: 0.92, // Approximate EUR conversion
    vatRate: 0.22, // 22% VAT
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'nl-NL',
    hreflang: 'nl-nl',
    priceMultiplier: 0.92, // Approximate EUR conversion
    vatRate: 0.21, // 21% VAT
  },
  SE: {
    code: 'SE',
    name: 'Sweden',
    currency: 'SEK',
    currencySymbol: 'kr',
    language: 'sv-SE',
    hreflang: 'sv-se',
    priceMultiplier: 10.8, // Approximate SEK conversion
    vatRate: 0.25, // 25% VAT
  }
};

// Detect user's country from various sources
export const detectUserCountry = (): string => {
  if (typeof window === 'undefined') return 'US';
  
  // Try to get country from various sources
  const sources = [
    // From URL parameters
    () => new URLSearchParams(window.location.search).get('country'),
    // From localStorage
    () => localStorage.getItem('user_country'),
    // From navigator language
    () => {
      const lang = navigator.language || navigator.languages?.[0];
      if (lang) {
        const countryCode = lang.split('-')[1];
        return countryCode && SUPPORTED_COUNTRIES[countryCode] ? countryCode : null;
      }
      return null;
    },
    // From timezone (basic detection)
    () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezoneCountryMap: Record<string, string> = {
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Toronto': 'CA',
        'Europe/London': 'GB',
        'Europe/Berlin': 'DE',
        'Europe/Paris': 'FR',
        'Europe/Madrid': 'ES',
        'Europe/Rome': 'IT',
        'Europe/Amsterdam': 'NL',
        'Europe/Stockholm': 'SE',
        'Australia/Sydney': 'AU',
      };
      return timezoneCountryMap[timezone] || null;
    }
  ];
  
  for (const source of sources) {
    const country = source();
    if (country && SUPPORTED_COUNTRIES[country]) {
      return country;
    }
  }
  
  return 'US'; // Default fallback
};

// Format price for specific country
export const formatPrice = (basePrice: number, countryCode: string): string => {
  const country = SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.US;
  const localPrice = basePrice * country.priceMultiplier;
  
  // Add VAT if applicable
  const finalPrice = country.vatRate 
    ? localPrice * (1 + country.vatRate)
    : localPrice;
  
  // Use Intl.NumberFormat to get the formatted number
  const formattedNumber = new Intl.NumberFormat(country.language, {
    style: 'currency',
    currency: country.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(finalPrice);
  
  // For countries where Intl.NumberFormat doesn't use our preferred symbol,
  // replace with our custom currency symbol
  const currencyReplacements: Record<string, { search: RegExp; replace: string }> = {
    'CA': { search: /^\$/, replace: 'C$' },           // Canada: $ → C$
    'AU': { search: /^\$/, replace: 'A$' },           // Australia: $ → A$
    // Add more replacements if needed for other currencies
  };
  
  const replacement = currencyReplacements[countryCode];
  if (replacement) {
    return formattedNumber.replace(replacement.search, replacement.replace);
  }
  
  return formattedNumber;
};

// Generate hreflang links for SEO
export const generateHreflangLinks = (currentPath: string): string => {
  const baseUrl = 'https://cheapcc.online';
  
  const hreflangLinks = Object.values(SUPPORTED_COUNTRIES)
    .map(country => {
      const url = country.code === 'US' 
        ? `${baseUrl}${currentPath}`
        : `${baseUrl}/${country.code.toLowerCase()}${currentPath}`;
      
      return `<link rel="alternate" hreflang="${country.hreflang}" href="${url}" />`;
    })
    .join('\n');
  
  // Add x-default for international users
  const xDefault = `<link rel="alternate" hreflang="x-default" href="${baseUrl}${currentPath}" />`;
  
  return `${hreflangLinks}\n${xDefault}`;
};

// Get localized content based on country
export const getLocalizedContent = (countryCode: string) => {
  const country = SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.US;
  
  return {
    currency: country.currency,
    currencySymbol: country.currencySymbol,
    language: country.language,
    vatNotice: country.vatRate 
      ? `Prices include ${(country.vatRate * 100).toFixed(0)}% ${country.code === 'AU' ? 'GST' : 'VAT'}`
      : null,
    comparisonPrice: {
      adobe: formatPrice(79.99, countryCode),
      cheapcc: formatPrice(14.99, countryCode),
      savings: formatPrice(65.00, countryCode)
    }
  };
};

// Store user's country preference
export const setUserCountry = (countryCode: string): void => {
  if (typeof window !== 'undefined' && SUPPORTED_COUNTRIES[countryCode]) {
    localStorage.setItem('user_country', countryCode);
    
    // Track international user for analytics
    if (window.gtag) {
      window.gtag('event', 'country_selection', {
        event_category: 'Internationalization',
        event_action: 'country_set',
        event_label: countryCode,
        country: countryCode
      });
    }
  }
};

// Initialize internationalization
export const initializeInternationalization = (): CountryConfig => {
  const userCountry = detectUserCountry();
  const config = SUPPORTED_COUNTRIES[userCountry];
  
  // Set country in localStorage if not already set
  if (typeof window !== 'undefined' && !localStorage.getItem('user_country')) {
    setUserCountry(userCountry);
  }
  
  return config;
};

// SEO-optimized country selector data
export const getCountrySelectorData = () => {
  return Object.values(SUPPORTED_COUNTRIES).map(country => ({
    code: country.code,
    name: country.name,
    flag: `https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`,
    currency: country.currency,
    currencySymbol: country.currencySymbol,
    samplePrice: formatPrice(14.99, country.code)
  }));
};


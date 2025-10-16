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
  },
  // Additional European Countries
  CH: {
    code: 'CH',
    name: 'Switzerland',
    currency: 'CHF',
    currencySymbol: 'CHF',
    language: 'de-CH',
    hreflang: 'de-ch',
    priceMultiplier: 0.95, // Approximate CHF conversion
    vatRate: 0.077, // 7.7% VAT
  },
  NO: {
    code: 'NO',
    name: 'Norway',
    currency: 'NOK',
    currencySymbol: 'kr',
    language: 'nb-NO',
    hreflang: 'nb-no',
    priceMultiplier: 11.2, // Approximate NOK conversion
    vatRate: 0.25, // 25% VAT
  },
  DK: {
    code: 'DK',
    name: 'Denmark',
    currency: 'DKK',
    currencySymbol: 'kr',
    language: 'da-DK',
    hreflang: 'da-dk',
    priceMultiplier: 6.8, // Approximate DKK conversion
    vatRate: 0.25, // 25% VAT
  },
  PL: {
    code: 'PL',
    name: 'Poland',
    currency: 'PLN',
    currencySymbol: 'zł',
    language: 'pl-PL',
    hreflang: 'pl-pl',
    priceMultiplier: 4.2, // Approximate PLN conversion
    vatRate: 0.23, // 23% VAT
  },
  CZ: {
    code: 'CZ',
    name: 'Czech Republic',
    currency: 'CZK',
    currencySymbol: 'Kč',
    language: 'cs-CZ',
    hreflang: 'cs-cz',
    priceMultiplier: 24.5, // Approximate CZK conversion
    vatRate: 0.21, // 21% VAT
  },
  HU: {
    code: 'HU',
    name: 'Hungary',
    currency: 'HUF',
    currencySymbol: 'Ft',
    language: 'hu-HU',
    hreflang: 'hu-hu',
    priceMultiplier: 380, // Approximate HUF conversion
    vatRate: 0.27, // 27% VAT
  },
  // Asian Countries
  JP: {
    code: 'JP',
    name: 'Japan',
    currency: 'JPY',
    currencySymbol: '¥',
    language: 'ja-JP',
    hreflang: 'ja-jp',
    priceMultiplier: 150, // Approximate JPY conversion (no decimals)
    vatRate: 0.10, // 10% consumption tax
  },
  HK: {
    code: 'HK',
    name: 'Hong Kong',
    currency: 'HKD',
    currencySymbol: 'HK$',
    language: 'zh-HK',
    hreflang: 'zh-hk',
    priceMultiplier: 7.8, // Approximate HKD conversion
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    language: 'en-SG',
    hreflang: 'en-sg',
    priceMultiplier: 1.35, // Approximate SGD conversion
    vatRate: 0.09, // 9% GST
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    currency: 'KRW',
    currencySymbol: '₩',
    language: 'ko-KR',
    hreflang: 'ko-kr',
    priceMultiplier: 1350, // Approximate KRW conversion (no decimals)
    vatRate: 0.10, // 10% VAT
  },
  // Americas
  BR: {
    code: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    currencySymbol: 'R$',
    language: 'pt-BR',
    hreflang: 'pt-br',
    priceMultiplier: 5.2, // Approximate BRL conversion
    vatRate: 0.17, // Approximate tax rate
  },
  MX: {
    code: 'MX',
    name: 'Mexico',
    currency: 'MXN',
    currencySymbol: '$',
    language: 'es-MX',
    hreflang: 'es-mx',
    priceMultiplier: 18.5, // Approximate MXN conversion
    vatRate: 0.16, // 16% IVA
  },
  NZ: {
    code: 'NZ',
    name: 'New Zealand',
    currency: 'NZD',
    currencySymbol: 'NZ$',
    language: 'en-NZ',
    hreflang: 'en-nz',
    priceMultiplier: 1.65, // Approximate NZD conversion
    vatRate: 0.15, // 15% GST
  },
  // Additional European Countries
  BE: {
    code: 'BE',
    name: 'Belgium',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'nl-BE',
    hreflang: 'nl-be',
    priceMultiplier: 0.92, // EUR conversion
    vatRate: 0.21, // 21% VAT
  },
  AT: {
    code: 'AT',
    name: 'Austria',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'de-AT',
    hreflang: 'de-at',
    priceMultiplier: 0.92, // EUR conversion
    vatRate: 0.20, // 20% VAT
  },
  PT: {
    code: 'PT',
    name: 'Portugal',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'pt-PT',
    hreflang: 'pt-pt',
    priceMultiplier: 0.92, // EUR conversion
    vatRate: 0.23, // 23% VAT
  },
  FI: {
    code: 'FI',
    name: 'Finland',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'fi-FI',
    hreflang: 'fi-fi',
    priceMultiplier: 0.92, // EUR conversion
    vatRate: 0.24, // 24% VAT
  },
  IE: {
    code: 'IE',
    name: 'Ireland',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'en-IE',
    hreflang: 'en-ie',
    priceMultiplier: 0.92, // EUR conversion
    vatRate: 0.23, // 23% VAT
  }
};

// Detect user's country from various sources with geolocation API fallback
export const detectUserCountryAsync = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'US';
  
  try {
    // First check localStorage for cached preference
    const cached = localStorage.getItem('user_country');
    if (cached && SUPPORTED_COUNTRIES[cached]) {
      return cached;
    }

    // Check URL parameters
    const urlCountry = new URLSearchParams(window.location.search).get('country');
    if (urlCountry && SUPPORTED_COUNTRIES[urlCountry]) {
      return urlCountry;
    }

    // Try geolocation API endpoint (server-side IP detection)
    try {
      const geoResponse = await fetch('/api/geolocation', {
        method: 'GET',
        cache: 'force-cache' // Cache in browser
      });

      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const detectedCountry = geoData.country;

        console.log('[Internationalization] Detected country from IP:', detectedCountry);

        // Validate the detected country
        if (detectedCountry && SUPPORTED_COUNTRIES[detectedCountry]) {
          return detectedCountry;
        }
      }
    } catch (geoError) {
      console.warn('[Internationalization] Geolocation API error:', geoError);
      // Continue with fallback detection methods
    }

    // Fall back to navigator language
    const lang = navigator.language || navigator.languages?.[0];
    if (lang) {
      const countryCode = lang.split('-')[1]?.toUpperCase();
      if (countryCode && SUPPORTED_COUNTRIES[countryCode]) {
        return countryCode;
      }
    }

    // Fall back to timezone detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneCountryMap: Record<string, string> = {
      // North America
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'America/Mexico_City': 'MX',
      'America/Sao_Paulo': 'BR',
      // Europe
      'Europe/London': 'GB',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Europe/Madrid': 'ES',
      'Europe/Rome': 'IT',
      'Europe/Amsterdam': 'NL',
      'Europe/Stockholm': 'SE',
      'Europe/Zurich': 'CH',
      'Europe/Oslo': 'NO',
      'Europe/Copenhagen': 'DK',
      'Europe/Warsaw': 'PL',
      'Europe/Prague': 'CZ',
      'Europe/Budapest': 'HU',
      'Europe/Brussels': 'BE',
      'Europe/Vienna': 'AT',
      'Europe/Lisbon': 'PT',
      'Europe/Helsinki': 'FI',
      'Europe/Dublin': 'IE',
      // Asia Pacific
      'Asia/Tokyo': 'JP',
      'Asia/Hong_Kong': 'HK',
      'Asia/Singapore': 'SG',
      'Asia/Seoul': 'KR',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Pacific/Auckland': 'NZ',
    };
    
    if (timezone && timezoneCountryMap[timezone]) {
      return timezoneCountryMap[timezone];
    }

    // Default to US
    return 'US';
  } catch (error) {
    console.error('[Internationalization] Async detection error:', error);
    return 'US';
  }
};

// Synchronous country detection (backwards compatible - uses localStorage/navigator/timezone only)
export const detectUserCountry = (): string => {
  if (typeof window === 'undefined') return 'US';
  
  try {
    // From localStorage
    const cached = localStorage.getItem('user_country');
    if (cached && SUPPORTED_COUNTRIES[cached]) {
      return cached;
    }
    
    // From URL parameters
    const urlCountry = new URLSearchParams(window.location.search).get('country');
    if (urlCountry && SUPPORTED_COUNTRIES[urlCountry]) {
      return urlCountry;
    }
    
    // From navigator language
    const lang = navigator.language || navigator.languages?.[0];
    if (lang) {
      const countryCode = lang.split('-')[1]?.toUpperCase();
      if (countryCode && SUPPORTED_COUNTRIES[countryCode]) {
        return countryCode;
      }
    }

    // From timezone (basic detection)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneCountryMap: Record<string, string> = {
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Europe/Madrid': 'ES',
      'Europe/Rome': 'IT',
      'Europe/Amsterdam': 'NL',
      'Europe/Stockholm': 'SE',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
    };
    if (timezone && timezoneCountryMap[timezone]) {
      return timezoneCountryMap[timezone];
    }
    
    return 'US'; // Default fallback
  } catch (error) {
    console.error('[Internationalization] Sync detection error:', error);
    return 'US';
  }
};

// Format price for specific country
export const formatPrice = (basePrice: number, countryCode: string): string => {
  const country = SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.US;
  const localPrice = basePrice * country.priceMultiplier;
  
  // Add VAT if applicable
  const finalPrice = country.vatRate 
    ? localPrice * (1 + country.vatRate)
    : localPrice;
  
  // Currencies that don't use decimal places
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'HUF', 'CLP', 'ISK', 'TWD'];
  const useDecimals = !zeroDecimalCurrencies.includes(country.currency);
  
  // Use Intl.NumberFormat to get the formatted number
  const formattedNumber = new Intl.NumberFormat(country.language, {
    style: 'currency',
    currency: country.currency,
    minimumFractionDigits: useDecimals ? 2 : 0,
    maximumFractionDigits: useDecimals ? 2 : 0,
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


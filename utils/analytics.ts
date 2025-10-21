// Enhanced Analytics Tracking for CheapCC
// Professional conversion tracking and user behavior analysis

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track brand page visits with enhanced metadata
export const trackBrandPageView = (pageName: string, pageUrl: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: `CheapCC - ${pageName}`,
      page_location: pageUrl,
      content_group1: 'Brand Pages',
      content_group2: 'CheapCC Content',
      custom_parameter_1: 'brand_content',
      send_to: (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-XXXXXXX') : 'AW-XXXXXXX')
    });
  }
};

// Track navigation dropdown interactions
export const trackDropdownInteraction = (action: 'open' | 'close' | 'click', itemName?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'engagement', {
      event_category: 'Navigation',
      event_action: action,
      event_label: itemName ? `CheapCC Dropdown - ${itemName}` : 'CheapCC Dropdown',
      value: action === 'click' ? 1 : 0
    });
  }
};

// Track search intent and keyword performance
export const trackSearchIntent = (keyword: string, source: 'organic' | 'direct' | 'referral') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: keyword,
      event_category: 'SEO',
      event_action: 'keyword_discovery',
      traffic_source: source,
      custom_parameter_2: 'brand_search'
    });
  }
};

// Track user engagement with brand content
export const trackBrandEngagement = (
  contentType: 'review' | 'testimonial' | 'comparison' | 'faq',
  action: 'view' | 'click' | 'scroll' | 'time_spent',
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'engagement', {
      event_category: 'Brand Content',
      event_action: action,
      event_label: contentType,
      value: value || 1,
      content_type: 'brand_content'
    });
  }
};

// Track conversion funnel for brand traffic
export const trackBrandConversion = (
  stage: 'awareness' | 'consideration' | 'decision' | 'purchase',
  source_page: string
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      event_category: 'Brand Funnel',
      event_action: stage,
      event_label: source_page,
      conversion_source: 'brand_content',
      funnel_stage: stage
    });
  }
};

// Track competitor comparison interactions
export const trackCompetitorComparison = (
  competitor: 'adobe_official' | 'other_discount' | 'alternatives',
  action: 'view' | 'compare' | 'choose_cheapcc'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'comparison', {
      event_category: 'Competitive Analysis',
      event_action: action,
      event_label: competitor,
      competitive_advantage: 'pricing'
    });
  }
};

// Track voice search optimization performance
export const trackVoiceSearchQuery = (query: string, matched_content: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'voice_search', {
      event_category: 'Voice Search',
      event_action: 'query_match',
      event_label: query,
      matched_content: matched_content,
      search_type: 'voice'
    });
  }
};

// Track international user behavior
export const trackInternationalUser = (country: string, currency: string, language: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'international_user', {
      event_category: 'Internationalization',
      event_action: 'user_detected',
      country: country,
      currency: currency,
      language: language,
      localization_needed: currency !== 'USD'
    });
  }
};

// Enhanced ecommerce tracking for brand attribution
export const trackBrandAttributedPurchase = (
  transactionId: string,
  value: number,
  brandTouchpoints: string[]
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'USD',
      brand_attribution: brandTouchpoints.join(','),
      attribution_model: 'brand_assisted',
      conversion_path: brandTouchpoints.length
    });
  }
};

// Track Core Web Vitals impact on brand pages
export const trackCoreWebVitals = (metric: string, value: number, pageName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Performance',
      event_action: metric,
      event_label: pageName,
      value: Math.round(value),
      page_type: 'brand_page'
    });
  }
};

// Utility function to detect search intent from referrer
export const detectSearchIntent = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const referrer = document.referrer;
  const url = new URL(window.location.href);
  
  // Check for organic search
  if (referrer.includes('google.com') || referrer.includes('bing.com') || referrer.includes('yahoo.com')) {
    return 'organic';
  }
  
  // Check for direct navigation
  if (!referrer || referrer === '') {
    return 'direct';
  }
  
  // Check for brand-specific UTM parameters
  const utmSource = url.searchParams.get('utm_source');
  const utmCampaign = url.searchParams.get('utm_campaign');
  
  if (utmSource?.includes('brand') || utmCampaign?.includes('cheapcc')) {
    return 'brand_campaign';
  }
  
  return 'referral';
};

// Initialize enhanced tracking on page load
export const initializeEnhancedTracking = () => {
  if (typeof window === 'undefined') return;
  
  // Track search intent
  const intent = detectSearchIntent();
  if (intent) {
    trackSearchIntent(window.location.pathname, intent as any);
  }
  
  // Track international users
  if (navigator.language && navigator.language !== 'en-US') {
    const language = navigator.language;
    const country = language.split('-')[1] || 'Unknown';
    trackInternationalUser(country, 'USD', language); // Will be enhanced with currency detection
  }
  
  // Set up Core Web Vitals tracking
  if ('web-vitals' in window) {
    // This would integrate with web-vitals library if installed
    console.log('Core Web Vitals tracking initialized for brand pages');
  }
};

// Fire Google Ads conversion with optional value and currency
export const trackGoogleAdsConversion = (
  value?: number,
  currency: string = 'USD',
  transactionId?: string
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const sendTo = (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-XXXXXXX') + '/' + (process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || 'conversion_label');

  const params: Record<string, any> = { send_to: sendTo };
  if (typeof value === 'number') params.value = value;
  if (currency) params.currency = currency;
  if (transactionId) params.transaction_id = transactionId;

  window.gtag('event', 'conversion', params);
};


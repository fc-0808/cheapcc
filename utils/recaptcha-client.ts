/**
 * Client-side reCAPTCHA utilities
 */

export interface RecaptchaConfig {
  siteKey: string;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal' | 'invisible';
}

export const getRecaptchaConfig = (): RecaptchaConfig | null => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  if (!siteKey) {
    console.warn('reCAPTCHA site key not found in environment variables');
    return null;
  }

  // Validate site key format (should start with 6L and be 40 characters long)
  if (!siteKey.startsWith('6L') || siteKey.length !== 40) {
    console.error('Invalid reCAPTCHA site key format');
    return null;
  }

  return {
    siteKey,
    theme: 'dark',
    size: 'normal'
  };
};

export const isRecaptchaLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).grecaptcha && !!(window as any).grecaptcha.render;
};

export const waitForRecaptcha = (timeout = 10000): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkRecaptcha = () => {
      if (isRecaptchaLoaded()) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        console.error('reCAPTCHA failed to load within timeout');
        resolve(false);
        return;
      }
      
      setTimeout(checkRecaptcha, 100);
    };
    
    checkRecaptcha();
  });
};

export const debugRecaptcha = () => {
  const config = getRecaptchaConfig();
  const isLoaded = isRecaptchaLoaded();
  
  const debugInfo = {
    config,
    isLoaded,
    grecaptchaExists: typeof window !== 'undefined' && !!(window as any).grecaptcha,
    scriptElement: !!document.getElementById('recaptcha-script'),
    userAgent: navigator.userAgent,
    currentDomain: window.location.hostname,
    timestamp: new Date().toISOString()
  };
  
  console.log('reCAPTCHA Debug Info:', debugInfo);
  return debugInfo;
};

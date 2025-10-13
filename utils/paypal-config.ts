// PayPal configuration with guaranteed fallback
export const PAYPAL_CONFIG = {
  // Always use this fallback Client ID if environment variable fails
  CLIENT_ID: 'AdnhpzgXSmFsoZv7VDuwS9wJo8czKZy6hBPFMqFuRpgglopk5bT-_tQLsM4hwiHtt_MZOB7Fup4MNTWe',
  
  // Get the actual client ID with fallback
  getClientId(): string {
    const envClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    
    // In production, be more aggressive about using fallback
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Validate environment variable
    if (envClientId && 
        envClientId.length > 50 && 
        envClientId !== 'undefined' && 
        envClientId !== 'null' &&
        envClientId !== '' &&
        !envClientId.includes('undefined') &&
        !envClientId.includes('null')) {
      console.log('✅ Using environment PayPal Client ID');
      return envClientId;
    }
    
    console.warn('⚠️ Environment PayPal Client ID is invalid, using fallback');
    console.warn('⚠️ Original value:', JSON.stringify(envClientId));
    console.warn('⚠️ Is production:', isProduction);
    
    // Try window object as backup
    if (typeof window !== 'undefined' && (window as any).PAYPAL_CLIENT_ID) {
      const windowClientId = (window as any).PAYPAL_CLIENT_ID;
      if (windowClientId && windowClientId.length > 50) {
        console.log('✅ Using window PayPal Client ID');
        return windowClientId;
      }
    }
    
    // Always return fallback in production if environment variable fails
    if (isProduction) {
      console.log('🔧 Production mode: Using hardcoded fallback Client ID');
    }
    
    return this.CLIENT_ID;
  },
  
  // Get script URL
  getScriptUrl(): string {
    const clientId = this.getClientId();
    return `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons&disable-funding=card`;
  }
};

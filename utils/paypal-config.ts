// PayPal configuration - no hardcoded values
export const PAYPAL_CONFIG = {
  // Get the actual client ID from environment variables
  getClientId(): string {
    // Try environment variable first (works on both server and client due to next.config.js env mapping)
    const envClientId = process.env.PAYPAL_CLIENT_ID;
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Validate environment variable
    if (envClientId && 
        typeof envClientId === 'string' &&
        envClientId.length > 50 && 
        envClientId !== 'undefined' && 
        envClientId !== 'null' &&
        envClientId !== '' &&
        !envClientId.includes('undefined') &&
        !envClientId.includes('null') &&
        !envClientId.includes('your_paypal_client_id')) {
      console.log('✅ Using environment PayPal Client ID');
      return envClientId;
    }
    
    console.error('❌ PayPal Client ID not configured properly');
    console.error('❌ Environment variable value:', JSON.stringify(envClientId));
    console.error('❌ Is production:', isProduction);
    
    // Return 'sb' to trigger error boundary when environment variable is missing
    console.error('❌ Returning invalid client ID to trigger error boundary');
    return 'sb';
  },
  
  // Get script URL with error handling
  getScriptUrl(): string {
    const clientId = this.getClientId();
    
    // If client ID is invalid, return a URL that will fail gracefully
    if (!clientId || clientId === 'sb' || clientId.length < 50) {
      console.error('❌ Invalid PayPal Client ID, PayPal buttons will not load');
      return `https://www.paypal.com/sdk/js?client-id=sb&currency=USD&intent=capture&components=buttons&disable-funding=card`;
    }
    
    return `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons&disable-funding=card`;
  },
  
  // Check if we're in a valid environment for PayPal
  isEnvironmentValid(): boolean {
    const clientId = this.getClientId();
    return !!(clientId && clientId !== 'sb' && clientId.length > 50);
  }
};

// Export a function that can be used by components
export const getPayPalClientId = (): string => {
  return PAYPAL_CONFIG.getClientId();
};

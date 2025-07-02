import { NextRequest, NextResponse } from 'next/server';

// This API endpoint tests DNS connectivity to important services
export async function GET(request: NextRequest) {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Check PayPal API endpoints
  const paypalHosts = [
    { name: 'PayPal API (Live)', url: 'https://api-m.paypal.com/v1/oauth2/token' },
    { name: 'PayPal API (Sandbox)', url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token' },
    { name: 'PayPal Alternate API', url: 'https://api.paypal.com/v1/oauth2/token' }
  ];

  // Run tests in parallel
  const tests = paypalHosts.map(async (host) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const startTime = Date.now();
      const response = await fetch(host.url, {
        method: 'HEAD', // Just check connectivity, don't need the body
        signal: controller.signal,
      });
      const duration = Date.now() - startTime;
      
      clearTimeout(timeoutId);
      
      results.services[host.name] = {
        status: response.status,
        connected: response.ok,
        responseTime: `${duration}ms`
      };
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      let errorType = 'unknown';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorType = error.name;
      }
      
      results.services[host.name] = {
        status: 'error',
        connected: false,
        error: errorMessage,
        errorType
      };
    }
  });
  
  // Wait for all tests to complete
  await Promise.all(tests);
  
  // Get local DNS servers if possible
  try {
    const dnsServers = await checkLocalDNS();
    results.dnsServers = dnsServers;
  } catch (error) {
    results.dnsServers = { error: 'Could not determine DNS servers' };
  }
  
  return NextResponse.json(results);
}

// Helper function to check local DNS settings
async function checkLocalDNS(): Promise<Record<string, any>> {
  // Try to get client IP info
  try {
    const response = await fetch('https://dns-check.svc.simpledns.plus/api/check', { 
      method: 'GET',
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error checking DNS info:', error);
  }
  
  // Fallback
  return {
    message: 'Could not retrieve DNS information'
  };
} 
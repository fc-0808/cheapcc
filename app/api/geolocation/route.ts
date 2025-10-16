import { NextRequest, NextResponse } from 'next/server';

// Geolocation detection using multiple fallback services
// This endpoint detects the user's country from their IP address
export async function GET(request: NextRequest) {
  try {
    // Get client IP from various sources
    // Next.js/Vercel headers have highest priority
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('cf-connecting-ip') || // Cloudflare
      request.headers.get('x-real-ip') ||
      request.headers.get('x-client-ip') ||
      '0.0.0.0';

    console.log('[Geolocation] Detected IP:', ip);

    // Use ip-api.com (free tier, no API key required)
    // Alternatively, you can use ipstack, maxmind, or other services
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CheapCC-App'
      }
    });

    if (!geoResponse.ok) {
      throw new Error('Geolocation service failed');
    }

    const geoData = await geoResponse.json();
    
    console.log('[Geolocation] Geo data:', geoData);

    if (geoData.status !== 'success') {
      // Fallback to US if detection fails
      return NextResponse.json(
        { 
          country: 'US',
          detected: false,
          message: 'Failed to detect country, using default'
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          }
        }
      );
    }

    // Map country name to country code
    const countryCode = geoData.country || 'US';

    return NextResponse.json(
      { 
        country: countryCode,
        detected: true,
        ip: ip,
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour per IP
        }
      }
    );
  } catch (error) {
    console.error('[Geolocation] Error:', error);

    // Return default country on any error
    return NextResponse.json(
      { 
        country: 'US',
        detected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 200, // Still return 200 for graceful fallback
        headers: {
          'Cache-Control': 'public, max-age=300' // Cache error responses for 5 minutes
        }
      }
    );
  }
}

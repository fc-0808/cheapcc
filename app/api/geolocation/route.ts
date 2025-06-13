import { NextRequest, NextResponse } from 'next/server';
import { SPECIFIC_IPS, IP_REGIONS, CLOUD_PROVIDERS, COUNTRY_CODES } from './geo-data';

export async function POST(request: NextRequest) {
  try {
    const { ip } = await request.json();
    
    console.log(`Geolocation API request for IP: ${ip}`);
    
    if (!ip) {
      console.warn('Geolocation API called without IP address');
      return NextResponse.json({ error: 'IP address is required' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Check for exact IP matches first
    if (SPECIFIC_IPS[ip]) {
      console.log(`IP ${ip} matched exactly in SPECIFIC_IPS → ${SPECIFIC_IPS[ip].country}`);
      return NextResponse.json({
        ip,
        country: SPECIFIC_IPS[ip].country,
        city: SPECIFIC_IPS[ip].city || 'Unknown',
        source: 'specific-ip'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Check if the IP is in our known IP ranges
    for (const prefix in IP_REGIONS) {
      if (ip.startsWith(prefix) || ip === prefix) {
        console.log(`IP ${ip} matched internal range: ${prefix} → ${IP_REGIONS[prefix].country}`);
        return NextResponse.json({
          ip,
          country: IP_REGIONS[prefix].country,
          city: IP_REGIONS[prefix].city || 'Unknown',
          source: 'internal'
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }
    }

    // Check if the IP is from a cloud provider
    for (const prefix in CLOUD_PROVIDERS) {
      if (ip.startsWith(prefix)) {
        const { provider, region } = CLOUD_PROVIDERS[prefix];
        console.log(`IP ${ip} matched cloud provider: ${prefix} → ${provider}`);
        return NextResponse.json({
          ip,
          country: provider,
          city: region || 'Unknown',
          source: 'cloud'
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }
    }

    // Check if we have a country code match
    for (const prefix in COUNTRY_CODES) {
      if (ip.startsWith(prefix)) {
        const { country, region } = COUNTRY_CODES[prefix];
        console.log(`IP ${ip} matched country code: ${prefix} → ${country}`);
        return NextResponse.json({
          ip,
          country: country,
          city: region || 'Unknown',
          source: 'country-code'
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }
    }

    // Get geolocation from request headers (Vercel Edge)
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = request.headers.get('x-vercel-ip-city') || 'Unknown';
    const region = request.headers.get('x-vercel-ip-country-region') || 'Unknown';
    
    // If we have country data from headers, use it
    if (country !== 'Unknown') {
      console.log(`IP ${ip} matched Vercel Edge headers: ${country}, ${city}`);
      return NextResponse.json({
        ip,
        country,
        city: city !== 'Unknown' ? city : region,
        source: 'vercel-edge'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    console.log(`IP ${ip} had no matches, returning Unknown`);
    // If we couldn't determine the location, return a default
    return NextResponse.json({
      ip,
      country: 'Unknown',
      city: 'Unknown',
      source: 'default'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error: any) {
    console.error('Error in geolocation API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 
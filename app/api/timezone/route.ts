import { NextRequest, NextResponse } from 'next/server';

// Using an environment variable with a fallback API key
const TIMEZONE_API_KEY = process.env.TIMEZONE_API_KEY || 'ZJXYPIJ67PN4';

export async function GET(request: NextRequest) {
  // Get latitude and longitude from query parameters
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  // Initial logging
  console.log(`Processing timezone request: lat=${lat}, lng=${lng}`);
  
  // Validate parameters
  if (!lat || !lng) {
    console.warn('Missing latitude or longitude parameters in timezone request');
    return NextResponse.json({ 
      status: 'ERROR', 
      error: 'Missing latitude or longitude parameters'
    }, { status: 400 });
  }
  
  try {
    console.log(`Fetching timezone data from TimeZoneDB for lat=${lat}, lng=${lng}`);
    
    // Proxy the request to TimeZoneDB
    const apiUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONE_API_KEY}&format=json&by=position&lat=${lat}&lng=${lng}`;
    
    const response = await fetch(apiUrl, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`TimeZoneDB API response error: ${response.status} ${response.statusText}`);
    }
    
    // Get the timezone data
    const data = await response.json();
    
    // Check for API-level errors
    if (data.status !== 'OK') {
      console.error('TimeZoneDB API error:', data.message || 'No error message provided');
      return NextResponse.json({ 
        status: 'ERROR', 
        error: data.message || 'TimeZoneDB API error' 
      }, { status: 502 }); // 502 Bad Gateway - upstream server error
    }
    
    console.log(`Timezone data fetched successfully: ${data.zoneName}, ${data.countryName}`);
    
    // Return the data with CORS headers
    return NextResponse.json(data);
    
  } catch (error: any) {
    // Enhanced error logging
    console.error('Timezone API error:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      status: 'ERROR',
      error: 'Failed to fetch timezone data', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
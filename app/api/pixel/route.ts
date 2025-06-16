import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/supabase-server';
import { v4 as uuidv4 } from 'uuid';

// A list of common bot user agent substrings
const BOT_UA_PATTERNS = [
  'bot', 'spider', 'crawler', 'monitor', 'curl', 'python-requests', 'ahrefs', 'semrush'
];

// 1x1 transparent GIF in base64
const TRANSPARENT_GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Track visited paths to prevent duplicate logging within a short time window
const recentVisits = new Map<string, number>();
// Reduce debounce time to ensure we don't miss legitimate page views
const VISIT_DEBOUNCE_MS = 3000; // 3 seconds debounce (down from 10 seconds)

export async function GET(request: NextRequest) {
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/';
    const referer = searchParams.get('ref') || '';
    const timestamp = searchParams.get('t') || Date.now().toString();
    
    // Get user agent and IP
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
              request.headers.get('x-real-ip') || 
              '127.0.0.1';
    
    // Create service client to check for user authentication and log the visit
    const supabase = await createServiceClient();
    
    // Try to get user from auth
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    
    // Generate a unique request ID
    const requestId = uuidv4();
    
    // Create a unique key for this visit - include timestamp to further differentiate
    // This helps with client-side navigation tracking
    const visitKey = `${ip}:${path}:${Math.floor(Number(timestamp) / VISIT_DEBOUNCE_MS)}`;
    const now = Date.now();
    
    // Debug logging in development
    const isDevMode = process.env.NODE_ENV === 'development';
    if (isDevMode) {
      console.log(`[PixelTracker] Processing request for path: ${path}`);
      console.log(`[PixelTracker] User ID: ${userId || 'anonymous'}`);
      console.log(`[PixelTracker] Visit key: ${visitKey}`);
    }
    
    // Check if we've seen this IP+path combination recently (debounce)
    const lastVisitTime = recentVisits.get(visitKey);
    if (lastVisitTime && now - lastVisitTime < VISIT_DEBOUNCE_MS) {
      if (isDevMode) console.log(`[PixelTracker] Skipping duplicate visit: ${path} (debounced)`);
      
      // Return the pixel without logging a duplicate visit
      return new NextResponse(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    // Update the visit timestamp for future debouncing
    recentVisits.set(visitKey, now);
    
    // Clean up old entries from the recentVisits map
    for (const [key, timestamp] of recentVisits.entries()) {
      if (now - timestamp > VISIT_DEBOUNCE_MS) {
        recentVisits.delete(key);
      }
    }

    // Skip logging static assets but allow admin paths
    if (
      (path.startsWith('/api/') && !path.startsWith('/api/pixel')) ||
      path.startsWith('/_next/') ||
      path.includes('favicon') ||
      path.endsWith('.svg') ||
      path.endsWith('.png') ||
      path.endsWith('.jpg') ||
      path.endsWith('.jpeg') ||
      path.endsWith('.ico') ||
      path.endsWith('.json') ||
      path.endsWith('.js') ||
      path.endsWith('.css')
    ) {
      if (isDevMode) console.log(`[PixelTracker] Skipping asset path: ${path}`);
      
      // Return the pixel without logging
      return new NextResponse(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Heuristic: Check if the user agent contains any known bot patterns
    const isBot = BOT_UA_PATTERNS.some(pattern => userAgent.toLowerCase().includes(pattern));

    // Log the visit in a non-blocking way
    Promise.resolve().then(async () => {
      try {
        if (isDevMode) console.log(`[PixelTracker] Logging visit to: ${path}`);
        
        await supabase.from('visitor_logs').insert({
          path: path,
          user_agent: userAgent,
          ip_address: ip,
          user_id: userId,
          is_bot_heuristic: isBot,
          method: 'GET',
          referer: referer
        });
        
        if (isDevMode) console.log(`[PixelTracker] Successfully logged visit to: ${path}`);
      } catch (error) {
        console.error('[PixelTracker] Error logging visitor:', error);
      }
    });

    // Return a 1x1 transparent GIF
    return new NextResponse(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (e: any) {
    console.error('[PixelTracker] Error in /api/pixel:', e.message);
    
    // Even on error, return a transparent pixel to avoid breaking the page
    return new NextResponse(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
} 
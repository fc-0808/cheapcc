import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/supabase-server';

// A list of common bot user agent substrings
const BOT_UA_PATTERNS = [
  'bot', 'spider', 'crawler', 'monitor', 'curl', 'python-requests', 'ahrefs', 'semrush'
];

// Store request IDs temporarily to prevent duplicate logging
// This is more reliable than IP+path since it's tied to the specific request
const processedRequestIds = new Set<string>();
const MAX_STORED_REQUEST_IDS = 1000; // Prevent memory leaks by limiting size

// Track visited paths to prevent duplicate logging within a short time window
const recentVisits = new Map<string, number>();
// Reduce debounce time to match pixel endpoint
const VISIT_DEBOUNCE_MS = 3000; // 3 seconds debounce

export async function POST(request: NextRequest) {
  try {
    const { 
      path, 
      userAgent, 
      ip: clientProvidedIp, // Renamed to clarify it's client-provided
      userId: clientProvidedUserId, // Renamed for clarity
      referer,
      requestId,
      secFetchSite,
      secFetchMode,
      secFetchDest
    } = await request.json();

    // For client-side requests, get the IP from headers
    const ip = clientProvidedIp || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
              request.headers.get('x-real-ip') || 
              '127.0.0.1';
              
    // Debug logging in development
    const isDevMode = process.env.NODE_ENV === 'development';
    if (isDevMode) {
      console.log(`[LogVisitor] Processing request for path: ${path}`);
      console.log(`[LogVisitor] User ID: ${clientProvidedUserId || 'anonymous'}`);
    }

    if (!userAgent) {
      return NextResponse.json({ error: 'User-Agent is required.' }, { status: 400 });
    }
    
    // Create service client early to check for user authentication
    const supabase = await createServiceClient();
    
    // If userId wasn't provided by client, try to get it from current session
    let userId = clientProvidedUserId;
    if (!userId) {
      // Try to get user from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }
    
    // Use the requestId for deduplication if available
    if (requestId && processedRequestIds.has(requestId)) {
      if (isDevMode) console.log(`[LogVisitor] Skipping duplicate request ID: ${requestId}`);
      return NextResponse.json({ success: true, skipped: "duplicate request ID" }, { status: 202 });
    }
    
    // Store the requestId to prevent duplicates
    if (requestId) {
      processedRequestIds.add(requestId);
      
      // Prevent memory leaks by limiting Set size
      if (processedRequestIds.size > MAX_STORED_REQUEST_IDS) {
        // Remove the oldest entries (beginning of the Set)
        const entriesToDelete = processedRequestIds.size - MAX_STORED_REQUEST_IDS;
        const iterator = processedRequestIds.values();
        for (let i = 0; i < entriesToDelete; i++) {
          const oldestId = iterator.next().value;
          if (oldestId) {
            processedRequestIds.delete(oldestId);
          }
        }
      }
    }
    
    // Create a unique key for this visit - include timestamp to better handle client-side navigation
    const visitKey = `${ip}:${path}:${Math.floor(Date.now() / VISIT_DEBOUNCE_MS)}`;
    const now = Date.now();
    
    // Check if we've seen this IP+path combination recently (debounce)
    const lastVisitTime = recentVisits.get(visitKey);
    if (lastVisitTime && now - lastVisitTime < VISIT_DEBOUNCE_MS) {
      if (isDevMode) console.log(`[LogVisitor] Skipping duplicate visit: ${path} (debounced)`);
      return NextResponse.json({ success: true, skipped: "duplicate visit debounced" }, { status: 202 });
    }
    
    // Update the visit timestamp for future debouncing
    recentVisits.set(visitKey, now);
    
    // Clean up old entries from the recentVisits map
    for (const [key, timestamp] of recentVisits.entries()) {
      if (now - timestamp > VISIT_DEBOUNCE_MS) {
        recentVisits.delete(key);
      }
    }
    
    // Skip Next.js data requests
    const isNextJsDataRequest = request.headers.get('x-nextjs-data') === '1';
    if (isNextJsDataRequest) {
      if (isDevMode) console.log(`[LogVisitor] Skipping Next.js data request: ${path}`);
      return NextResponse.json({ success: true, skipped: "next.js data request" }, { status: 202 });
    }

    // Skip logging internal API endpoints and static assets
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
      if (isDevMode) console.log(`[LogVisitor] Skipping asset path: ${path}`);
      return NextResponse.json({ success: true, skipped: true }, { status: 202 });
    }
    
    // Skip data fetching operations by examining sec-fetch headers
    // For client-side: empty+cors combination is data fetching
    // For server-side: navigate+document is a real page visit
    const isDataFetch = (secFetchDest === 'empty' && secFetchMode === 'cors');
    const isDocumentNavigation = (secFetchDest === 'document' && secFetchMode === 'navigate');
    
    // If the sec-fetch headers indicate a data fetch and NOT a document navigation, skip it
    if (isDataFetch && !isDocumentNavigation) {
      if (isDevMode) console.log(`[LogVisitor] Skipping data fetch: ${path}`);
      return NextResponse.json({ success: true, skipped: "data fetch operation" }, { status: 202 });
    }
    
    // Skip data fetching for blog post metadata from the blog index page
    // This prevents logging blog post paths when only visiting the /blog page
    const requestsFromBlogIndex = 
      path.startsWith('/blog/') && 
      path !== '/blog/' && 
      referer && 
      (referer.includes('/blog') && !referer.includes(path));
      
    if (requestsFromBlogIndex) {
      if (isDevMode) console.log(`[LogVisitor] Skipping blog metadata fetch: ${path}`);
      return NextResponse.json({ success: true, skipped: "blog metadata fetching" }, { status: 202 });
    }

    // Heuristic: Check if the user agent contains any known bot patterns
    const isBot = BOT_UA_PATTERNS.some(pattern => userAgent.toLowerCase().includes(pattern));

    if (isDevMode) console.log(`[LogVisitor] Logging visit to: ${path}`);
    const { error } = await supabase.from('visitor_logs').insert({
      path: path,
      user_agent: userAgent,
      ip_address: ip,
      user_id: userId, // Will be null if the user is not logged in
      is_bot_heuristic: isBot,
      method: request.method,
      referer: referer || null
    });

    if (error) {
      // Log the error but don't block the user's navigation
      console.error('[LogVisitor] Error logging visitor:', error.message);
      return NextResponse.json({ error: 'Failed to log visitor data' }, { status: 500 });
    }

    if (isDevMode) console.log(`[LogVisitor] Successfully logged visit to: ${path}`);
    return NextResponse.json({ success: true }, { status: 202 });

  } catch (e: any) {
    console.error('[LogVisitor] Error in /api/log-visitor:', e.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
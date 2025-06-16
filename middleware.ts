import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // First, run the existing session management
  const response = await updateSession(request);
  
  // Create a Supabase client to access user information
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        },
      },
    }
  )

  // Get the current user if authenticated
  const { data: { user } } = await supabase.auth.getUser();

  // Log visitor data without blocking the request
  try {
    const url = new URL(request.url);
    const pathname = request.nextUrl.pathname;
    const userAgent = request.headers.get('user-agent') || '';
    
    // Skip logging for specific scenarios:
    // 1. Skip internal Next.js requests
    // 2. Skip API routes except those we want to track
    // 3. Skip prefetch requests
    // 4. Skip favicon and static asset requests
    // 5. Skip data revalidation requests
    // 6. Skip requests with specific headers that indicate server-side data operations
    const isInternalNextRequest = 
      request.headers.get('x-nextjs-data') === '1' || 
      request.headers.get('purpose') === 'prefetch' ||
      request.headers.get('x-middleware-prefetch') === '1' ||
      request.headers.get('sec-fetch-dest') === 'empty' ||
      pathname.startsWith('/_next/') ||
      pathname.includes('favicon');
      
    // Check for server-side rendering or internal API requests
    const isServerSideRequest = !request.headers.get('sec-fetch-site') && !request.headers.get('referer');
    
    const isApiRoute = pathname.startsWith('/api/');
    const isInternalApiRoute = isApiRoute && (
      pathname.startsWith('/api/geolocation') || 
      pathname.startsWith('/api/log-visitor')
    );
    
    // Only log actual page visits, not data fetching or internal operations
    if (!isInternalNextRequest && !isServerSideRequest && (!isApiRoute || !isInternalApiRoute)) {
      // Skip logging requests that don't look like browser requests
      const isBrowserRequest = 
        userAgent.includes('Mozilla/') || 
        userAgent.includes('Chrome/') || 
        userAgent.includes('Safari/') || 
        userAgent.includes('Edge/') || 
        userAgent.includes('Opera/');
      
      if (isBrowserRequest) {
        // Generate a unique request ID based on timestamp and random string for deduplication
        const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const loggingApiUrl = `${url.origin}/api/log-visitor`;
        
        // Fire-and-forget the logging request
        fetch(loggingApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': request.headers.get('referer') || '',
          },
          body: JSON.stringify({
            path: pathname,
            userAgent: userAgent,
            ip: request.headers.get('x-forwarded-for') ?? '127.0.0.1',
            userId: user?.id ?? null,
            referer: request.headers.get('referer') || '',
            secFetchSite: request.headers.get('sec-fetch-site') || null,
            secFetchMode: request.headers.get('sec-fetch-mode') || null,
            secFetchDest: request.headers.get('sec-fetch-dest') || null,
            requestId: requestId
          }),
        }).catch(e => {
          // Silently catch errors to prevent blocking the response
          console.error('Middleware logging error:', e);
        });
      }
    }
  } catch (e) {
    console.error('Middleware logging error:', e);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/log-visitor (to prevent infinite loops)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/log-visitor|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
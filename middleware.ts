import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { v4 as uuidv4 } from 'uuid';

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
    const isNextInternalRequest = 
      pathname.startsWith('/_next/') ||
      pathname.includes('favicon');
      
    const isDataRequest = 
      request.headers.get('x-nextjs-data') === '1' || 
      request.headers.get('purpose') === 'prefetch' ||
      request.headers.get('x-middleware-prefetch') === '1';
    
    const secFetchDest = request.headers.get('sec-fetch-dest');
    const secFetchMode = request.headers.get('sec-fetch-mode');
    
    // Document requests are actual page visits
    const isDocumentRequest = secFetchDest === 'document' || !secFetchDest;
    
    const isApiRoute = pathname.startsWith('/api/');
    const isLoggingApiRoute = isApiRoute && (
      pathname.startsWith('/api/log-visitor') || 
      pathname.startsWith('/api/pixel')
    );
    
    // Only log actual page visits, not data fetching or internal operations
    // Note: We're now letting client-side tracking handle most page views
    // This middleware will only log the initial page load
    if (!isNextInternalRequest && !isDataRequest && !isLoggingApiRoute && isDocumentRequest) {
      // Skip logging requests that don't look like browser requests
      const isBrowserRequest = 
        userAgent.includes('Mozilla/') || 
        userAgent.includes('Chrome/') || 
        userAgent.includes('Safari/') || 
        userAgent.includes('Edge/') || 
        userAgent.includes('Opera/');
      
      if (isBrowserRequest) {
        // Generate a unique request ID using UUID for better uniqueness
        const requestId = uuidv4();
        
        // Use pixel tracking instead of the log-visitor API for consistency
        const pixelUrl = new URL('/api/pixel', url.origin);
        pixelUrl.searchParams.set('path', pathname);
        pixelUrl.searchParams.set('ref', request.headers.get('referer') || '');
        pixelUrl.searchParams.set('t', Date.now().toString());
        pixelUrl.searchParams.set('mid', requestId); // middleware request id
        
        // Create a safe fetch function that won't fail the middleware
        const safeFetch = async () => {
          try {
            // Use AbortController to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
            
            await fetch(pixelUrl.toString(), {
              headers: {
                'User-Agent': userAgent,
                'X-Forwarded-For': request.headers.get('x-forwarded-for') || 
                                  request.headers.get('x-real-ip') || 
                                  '127.0.0.1',
                'Referer': request.headers.get('referer') || '',
              },
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
          } catch (e) {
            // Silently catch errors to prevent blocking the response
            console.error('Middleware logging fetch error:', e);
          }
        };
        
        // Fire-and-forget the logging request
        safeFetch().catch(e => {
          // Extra safety - catch any promise rejection that might have escaped
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
     * - /api/health (health check endpoint)
     * - /api/pixel (pixel tracking endpoint)
     * - Static assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/log-visitor|api/health|api/pixel|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
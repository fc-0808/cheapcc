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
    const loggingApiUrl = `${url.origin}/api/log-visitor`;

    // Fire-and-forget the logging request
    fetch(loggingApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') ?? '127.0.0.1',
        userId: user?.id ?? null,
      }),
    }).catch(e => {
      // Silently catch errors to prevent blocking the response
      console.error('Middleware logging error:', e);
    });
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
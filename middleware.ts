import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and API health endpoint for better performance
  const path = request.nextUrl.pathname;
  if (path.startsWith('/api/health')) {
    return NextResponse.next();
  }
  
  // Run the session management
  const response = await updateSession(request);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (images, etc.)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
}
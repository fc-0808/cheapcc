import { createBrowserClient } from '@supabase/ssr'

// Store a single instance of the Supabase client to avoid creating new instances too frequently
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  try {
    // Return existing client if available
    if (supabaseClient) return supabaseClient;
    
    // Create a new client
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Enable automatic cookie management to ensure proper session handling
          get: (name) => {
            if (typeof document === 'undefined') return ''
            const cookie = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`))
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : ''
          },
          set: (name, value, options) => {
            if (typeof document === 'undefined') return
            let cookieString = `${name}=${encodeURIComponent(value)}`
            if (options.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`
            }
            if (options.path) {
              cookieString += `; Path=${options.path}`
            }
            if (options.sameSite) {
              cookieString += `; SameSite=${options.sameSite}`
            }
            document.cookie = cookieString
          },
          remove: (name, options) => {
            if (typeof document === 'undefined') return
            document.cookie = `${name}=; Max-Age=0; Path=${options?.path || '/'}`
          },
        },
        // Add a small delay for auth operations to ensure cookies are properly processed
        auth: {
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      }
    )
    
    return supabaseClient
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    // Create a fallback client if the main one fails
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
}
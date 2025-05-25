import { createBrowserClient } from '@supabase/ssr'

// Store a single instance of the Supabase client to avoid creating new instances too frequently
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Supabase environment variables are missing!');
    throw new Error('Supabase environment variables are missing!');
  }
  try {
    supabaseClient = createBrowserClient(url, key, {
      cookies: {
        get: (name) => {
          if (typeof document === 'undefined') return '';
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`));
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
        },
        set: (name, value, options) => {
          if (typeof document === 'undefined') return;
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          if (options.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`;
          }
          if (options.path) {
            cookieString += `; Path=${options.path}`;
          }
          if (options.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`;
          }
          document.cookie = cookieString;
        },
        remove: (name, options) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; Max-Age=0; Path=${options?.path || '/'}`;
        },
      },
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
    return supabaseClient;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Fallback: try to create a new client without options
    supabaseClient = createBrowserClient(url, key);
    return supabaseClient;
  }
}
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
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
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

// Function to clear the client cache (useful for logout)
export function clearClientCache() {
  supabaseClient = null;
}
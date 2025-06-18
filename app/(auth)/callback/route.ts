import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // After a successful code exchange, the session cookie is set.
      // Now, we can safely redirect the user to the dashboard.
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // If there's an error or no code, redirect to an error page or login.
  console.error("Authentication callback error or no code found.");
  const errorRedirectUrl = new URL('/login', origin);
  errorRedirectUrl.searchParams.set('error', 'authentication_failed');
  errorRedirectUrl.searchParams.set('error_description', 'Could not authenticate user. Please try again.');
  return NextResponse.redirect(errorRedirectUrl);
}
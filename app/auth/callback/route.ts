import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const type = searchParams.get('type');

  // Centralized logging for all callback entries
  console.log(`Auth callback received: type=${type}, URL=${request.url.substring(0, 150)}...`);

  // **CRITICAL FIX for password recovery "auto login"**
  // If the callback type is 'recovery', it means Supabase has verified the initial reset token
  // and is redirecting the user. The actual access token for setting a new password
  // will be in the URL fragment (#access_token=...). This must be handled client-side.
  // This server route should NOT attempt to exchange any code/token for 'recovery' type.
  if (type === 'recovery') {
    const updatePasswordUrl = new URL('/auth/update-password', origin);
    // Note: Query parameters from the current request are usually NOT needed for the 
    // fragment-based recovery page, as the essential tokens are in the fragment
    // which the browser carries over to the new URL if this was the target of Supabase's redirect.
    console.log(`Auth callback: type 'recovery' detected. Redirecting to ${updatePasswordUrl.toString()} for client-side processing.`);
    return NextResponse.redirect(updatePasswordUrl);
  }

  // For other types (signup, magiclink, etc.), proceed with code/token exchange
  const code = searchParams.get('code');
  const token = searchParams.get('token'); // Some Supabase flows might use 'token' query param
  const next = searchParams.get('next') ?? '/dashboard'; // Default redirect after success
  const exchangeToken = code || token;

  if (!exchangeToken) {
    console.warn('Auth callback: No code or token found for non-recovery flow.', { type, url: request.url });
    const errorRedirectUrl = new URL('/', origin);
    errorRedirectUrl.searchParams.set('error', 'auth_token_missing');
    errorRedirectUrl.searchParams.set('error_description', 'Authentication token or code is missing.');
    return NextResponse.redirect(errorRedirectUrl);
  }

  // Initialize Supabase client only if it's not a 'recovery' type handled above
  const supabase = await createClient();

  // Handle email confirmation (signup), invites, magic links
  if (type === 'signup' || type === 'invite' || type === 'magiclink' || (type === null && code)) { // type can be null for default email confirmation using 'code'
    const { error } = await supabase.auth.exchangeCodeForSession(exchangeToken);

    if (error) {
      console.error(`Auth callback: Error exchanging code for session (type: ${type || 'unknown/code'}):`, error.message);
      const errorRedirectUrl = new URL( (type === 'signup' || type === 'invite') ? '/login' : '/', origin);
      errorRedirectUrl.searchParams.set('error', 'session_exchange_failed');
      errorRedirectUrl.searchParams.set('error_description', error.message);
      return NextResponse.redirect(errorRedirectUrl);
    }

    console.log(`Auth callback: Session exchanged for type '${type || 'unknown/code'}'. Redirecting to '${next}'.`);
    const successRedirectUrl = new URL(next, origin);
     if (type === 'signup' || type === 'invite'){
      successRedirectUrl.searchParams.set('message', 'Account confirmed successfully! You are now logged in.');
    }
    return NextResponse.redirect(successRedirectUrl);
  }

  // Handle email change confirmation
  // Note: Supabase's email change flow might use verifyOtp with different parameters.
  // This is a common pattern if it involves a token.
  if (type === 'email_change') {
    // Adjust this based on how Supabase structures the email_change confirmation link/token
    const { error } = await supabase.auth.verifyOtp({ token_hash: exchangeToken, type: 'email_change' });
    if (error) {
      console.error('Auth callback: Error verifying email change token:', error.message);
      const errorRedirectUrl = new URL('/profile', origin);
      errorRedirectUrl.searchParams.set('error', 'email_change_verification_failed');
      errorRedirectUrl.searchParams.set('error_description', error.message);
      return NextResponse.redirect(errorRedirectUrl);
    }
    console.log("Auth callback: Email change verified. Redirecting to profile.");
    const successRedirectUrl = new URL('/profile', origin);
    successRedirectUrl.searchParams.set('success', 'email_updated_successfully');
    return NextResponse.redirect(successRedirectUrl);
  }

  console.warn('Auth callback: Unhandled auth type or parameters.', { type, url: request.url });
  const unhandledRedirectUrl = new URL('/', origin); // Fallback to home page
  unhandledRedirectUrl.searchParams.set('error', 'unknown_auth_callback_type');
  unhandledRedirectUrl.searchParams.set('error_description', `The authentication type '${type}' is not handled.`);
  return NextResponse.redirect(unhandledRedirectUrl);
} 
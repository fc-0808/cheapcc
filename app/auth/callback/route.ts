import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server'; // For other flows

export async function GET(request: NextRequest) {
  const { searchParams, origin, hash: incomingHash } = new URL(request.url);
  const type = searchParams.get('type');
  const codeFromQuery = searchParams.get('code'); // From your observation
  const tokenFromQuery = searchParams.get('token'); // Standard Supabase recovery query param from their /v1/recovery redirect

  // Centralized logging for all callback entries
  console.log(`Auth callback received: URL=${request.url.substring(0, 250)}..., Type=${type}, CodeParam=${codeFromQuery}, TokenParam=${tokenFromQuery}, IncomingHash=${incomingHash}`);

  if (type === 'recovery') {
    const updatePasswordUrl = new URL('/auth/update-password', origin);
    
    // Prioritize 'token' if present (standard from Supabase /auth/v1/recovery redirect),
    // then fallback to 'code' based on your observation.
    const recoveryTokenForFragment = tokenFromQuery || codeFromQuery;

    if (recoveryTokenForFragment) {
      // If Supabase sent the essential recovery token as a query parameter to this callback,
      // we must construct the URL fragment that the Supabase JS client (on /auth/update-password) expects.
      // The standard fragment includes access_token, token_type, and type.
      // Other parameters like expires_in and refresh_token are also common but access_token is primary for recovery.
      updatePasswordUrl.hash = `access_token=${recoveryTokenForFragment}&token_type=bearer&type=recovery`;
      
      // Optionally, carry over other relevant parameters if Supabase includes them in the query string for recovery
      const refreshToken = searchParams.get('refresh_token');
      const expiresIn = searchParams.get('expires_in');
      if (refreshToken) updatePasswordUrl.hash += `&refresh_token=${refreshToken}`;
      if (expiresIn) updatePasswordUrl.hash += `&expires_in=${expiresIn}`;

      console.log(`Auth callback: type 'recovery'. Token found in query ('${recoveryTokenForFragment === tokenFromQuery ? 'token_param' : 'code_param'}'). Constructing fragment and redirecting to: ${updatePasswordUrl.toString()}`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    } else if (incomingHash && incomingHash.includes('access_token') && incomingHash.includes('type=recovery')) {
      // This case handles if the fragment was ALREADY on the URL hitting /auth/callback.
      // This is less common for the recovery flow which usually goes:
      // Email link -> Supabase server (/auth/v1/recovery) -> Redirect to /auth/callback (NOW with fragment).
      // But if it happens, just redirect and let browser preserve the fragment.
      console.log(`Auth callback: type 'recovery'. Fragment already present on incoming request to /auth/callback. Redirecting to ${updatePasswordUrl.toString()}. Fragment: ${incomingHash}`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    } else {
      // Fallback: If type=recovery but no token/code in query and no fragment on this request.
      // This implies the client side (/auth/update-password) must have received the fragment directly
      // from Supabase's initial /auth/v1/recovery redirect. This is the most standard expectation.
      console.warn(`Auth callback: type 'recovery', but no specific token/code in query params and no fragment on this incoming request. Redirecting to /auth/update-password. Expecting fragment to be handled by client or already present from previous redirect.`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    }
  }

  // --- For other authentication types (signup, magiclink, etc.) ---
  const supabase = await createClient(); // Initialize Supabase client for other flows
  const exchangeToken = codeFromQuery || tokenFromQuery; // Use 'code' if present from observation, else 'token'

  // Ensure exchangeToken is present for flows that require it
  if (!exchangeToken && type !== 'recovery') { 
    console.warn('Auth callback: No code or token found for non-recovery session exchange flow.', { type, url: request.url });
    const errorRedirectUrl = new URL('/', origin);
    errorRedirectUrl.searchParams.set('error', 'auth_token_missing');
    errorRedirectUrl.searchParams.set('error_description', 'Authentication token or code is missing.');
    return NextResponse.redirect(errorRedirectUrl);
  }

  if (type === 'signup' || type === 'invite' || type === 'magiclink' || (type === null && exchangeToken)) {
    // This condition implies type can be null if an exchangeToken (like a code) is present.
    if (!exchangeToken) {
        // This should ideally not be hit if the outer check for exchangeToken is effective
        console.error('Auth callback: CRITICAL - exchangeToken is missing for a session exchange flow.', { type });
        const errorRedirectUrl = new URL((type === 'signup' || type === 'invite') ? '/login' : '/', origin);
        errorRedirectUrl.searchParams.set('error', 'internal_error_token_absent');
        return NextResponse.redirect(errorRedirectUrl);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(exchangeToken);
    if (error) {
      console.error(`Auth callback: Error exchanging code/token for session (type: ${type || 'unknown_code_flow'}):`, error.message, error.status);
      const errorRedirectUrl = new URL( (type === 'signup' || type === 'invite') ? '/login' : '/', origin);
      errorRedirectUrl.searchParams.set('error', 'session_exchange_failed');
      errorRedirectUrl.searchParams.set('error_description', error.message);
      return NextResponse.redirect(errorRedirectUrl);
    }

    const next = searchParams.get('next') ?? '/dashboard';
    console.log(`Auth callback: Session exchanged successfully for type '${type || 'unknown_code_flow'}'. Redirecting to '${next}'.`);
    const successRedirectUrl = new URL(next, origin);
    if (type === 'signup' || type === 'invite'){
      successRedirectUrl.searchParams.set('message', 'Account confirmed successfully! You are now logged in.');
    }
    return NextResponse.redirect(successRedirectUrl);
  }

  if (type === 'email_change') {
    if (!exchangeToken) {
        console.error('Auth callback: CRITICAL - exchangeToken missing for email_change flow.', { type });
        const errorRedirectUrl = new URL('/profile', origin);
        errorRedirectUrl.searchParams.set('error', 'email_change_token_missing');
        return NextResponse.redirect(errorRedirectUrl);
    }
    // For email_change, Supabase expects verifyOtp with type 'email_change' and the token_hash.
    // Assuming exchangeToken is the token_hash.
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

  console.warn('Auth callback: Unhandled auth type or parameters.', { type, codeFromQuery, tokenFromQuery, url: request.url });
  const unhandledRedirectUrl = new URL('/', origin); 
  unhandledRedirectUrl.searchParams.set('error', 'unknown_auth_callback_type');
  unhandledRedirectUrl.searchParams.set('error_description', `The authentication type '${type}' is not handled or parameters are missing.`);
  return NextResponse.redirect(unhandledRedirectUrl);
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server'; // For other flows

export async function GET(request: NextRequest) {
  const { searchParams, origin, hash: incomingHash } = new URL(request.url);
  const type = searchParams.get('type');
  const codeFromQuery = searchParams.get('code'); // From your observation
  const tokenFromQuery = searchParams.get('token'); // Standard Supabase recovery query param

  // Enhanced logging to capture all relevant parts of the incoming URL to the callback
  console.log(`AuthCallback_ROUTE_START: Full URL = ${request.url}`);
  console.log(`AuthCallback_ROUTE_PARAMS: Type=${type}, CodeParam=${codeFromQuery}, TokenParam=${tokenFromQuery}, IncomingHash=${incomingHash}`);

  if (type === 'recovery') {
    const updatePasswordUrl = new URL('/auth/update-password', origin);
    
    // Prioritize 'token' if present (standard from Supabase /auth/v1/recovery redirect),
    // then fallback to 'code' based on your observation.
    const recoveryTokenForFragment = tokenFromQuery || codeFromQuery;

    if (recoveryTokenForFragment) {
      // If Supabase sent the essential recovery token as a query parameter to this callback,
      // we must construct the URL fragment that the Supabase JS client (on /auth/update-password) expects.
      updatePasswordUrl.hash = `access_token=${recoveryTokenForFragment}&token_type=bearer&type=recovery`;
      
      const refreshToken = searchParams.get('refresh_token');
      const expiresIn = searchParams.get('expires_in');
      if (refreshToken) updatePasswordUrl.hash += `&refresh_token=${refreshToken}`;
      if (expiresIn) updatePasswordUrl.hash += `&expires_in=${expiresIn}`;

      console.log(`AuthCallback_RECOVERY_CONSTRUCTING_FRAGMENT: Redirecting to: ${updatePasswordUrl.toString()}`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    } else if (incomingHash && incomingHash.includes('access_token') && incomingHash.includes('type=recovery')) {
      // This case handles if the fragment was ALREADY on the URL that hit /auth/callback.
      console.log(`AuthCallback_RECOVERY_FRAGMENT_ALREADY_PRESENT: Redirecting to ${updatePasswordUrl.toString()}. Browser to preserve fragment: ${incomingHash}`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    } else {
      // Fallback: If type=recovery but no specific token/code in query and no fragment on this request.
      // This means the client side (/auth/update-password) must have received the fragment directly
      // from Supabase's initial /auth/v1/recovery redirect.
      console.warn(`AuthCallback_RECOVERY_FALLBACK: No token/code in query for recovery, no incoming fragment. Redirecting to /auth/update-password. Client must handle fragment.`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    }
  }

  // --- For other authentication types (signup, magiclink, etc.) ---
  const supabase = await createClient();
  const exchangeToken = codeFromQuery || tokenFromQuery; 

  if (!exchangeToken && type !== 'recovery') { 
    console.warn('AuthCallback_NON_RECOVERY_NO_TOKEN_ERROR: No code or token found for non-recovery session exchange flow.', { type, url: request.url });
    const errorRedirectUrl = new URL('/', origin);
    errorRedirectUrl.searchParams.set('error', 'auth_token_missing');
    errorRedirectUrl.searchParams.set('error_description', 'Authentication token or code is missing.');
    return NextResponse.redirect(errorRedirectUrl);
  }

  if (type === 'signup' || type === 'invite' || type === 'magiclink' || (type === null && exchangeToken)) {
    if (!exchangeToken) {
        console.error('AuthCallback_SESSION_EXCHANGE_CRITICAL_NO_TOKEN_ERROR:', { type });
        const errorRedirectUrl = new URL((type === 'signup' || type === 'invite') ? '/login' : '/', origin);
        errorRedirectUrl.searchParams.set('error', 'internal_error_token_absent_for_session_exchange');
        return NextResponse.redirect(errorRedirectUrl);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(exchangeToken);
    if (error) {
      console.error(`AuthCallback_SESSION_EXCHANGE_ERROR: type ${type || 'unknown_code_flow'} - ${error.message} (Status: ${error.status})`);
      const errorRedirectUrl = new URL( (type === 'signup' || type === 'invite') ? '/login' : '/', origin);
      errorRedirectUrl.searchParams.set('error', 'session_exchange_failed');
      errorRedirectUrl.searchParams.set('error_description', error.message);
      return NextResponse.redirect(errorRedirectUrl);
    }

    const next = searchParams.get('next') ?? '/dashboard';
    console.log(`AuthCallback_SESSION_EXCHANGE_SUCCESS: type '${type || 'unknown_code_flow'}'. Redirecting to '${next}'.`);
    const successRedirectUrl = new URL(next, origin);
    if (type === 'signup' || type === 'invite'){
      successRedirectUrl.searchParams.set('message', 'Account confirmed successfully! You are now logged in.');
    }
    return NextResponse.redirect(successRedirectUrl);
  }

  if (type === 'email_change') {
    if (!exchangeToken) {
        console.error('AuthCallback_EMAIL_CHANGE_CRITICAL_NO_TOKEN_ERROR:', { type });
        const errorRedirectUrl = new URL('/profile', origin);
        errorRedirectUrl.searchParams.set('error', 'email_change_token_missing');
        return NextResponse.redirect(errorRedirectUrl);
    }
    const { error } = await supabase.auth.verifyOtp({ token_hash: exchangeToken, type: 'email_change' });
    if (error) {
      console.error('AuthCallback_EMAIL_CHANGE_ERROR:', error.message);
      const errorRedirectUrl = new URL('/profile', origin);
      errorRedirectUrl.searchParams.set('error', 'email_change_verification_failed');
      errorRedirectUrl.searchParams.set('error_description', error.message);
      return NextResponse.redirect(errorRedirectUrl);
    }
    console.log("AuthCallback_EMAIL_CHANGE_SUCCESS: Email change verified. Redirecting to profile.");
    const successRedirectUrl = new URL('/profile', origin);
    successRedirectUrl.searchParams.set('success', 'email_updated_successfully');
    return NextResponse.redirect(successRedirectUrl);
  }

  console.warn('AuthCallback_UNHANDLED_TYPE_WARN:', { type, codeFromQuery, tokenFromQuery, url: request.url });
  const unhandledRedirectUrl = new URL('/', origin); 
  unhandledRedirectUrl.searchParams.set('error', 'unknown_auth_callback_type');
  unhandledRedirectUrl.searchParams.set('error_description', `The authentication type '${type}' is not handled or parameters are missing.`);
  return NextResponse.redirect(unhandledRedirectUrl);
}
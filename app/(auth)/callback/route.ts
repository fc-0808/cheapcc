import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams, origin, hash: incomingHash } = url;
  
  const type = searchParams.get('type');
  const codeFromQuery = searchParams.get('code');
  const tokenFromQuery = searchParams.get('token');
  const errorParam = searchParams.get('error');
  const errorDescriptionParam = searchParams.get('error_description');

  // Log all incoming parameters to the callback for detailed debugging
  console.log(`AuthCallback_ROUTE_START: Full URL = ${request.url}`);
  console.log(`AuthCallback_ROUTE_PARAMS: Type=${type}, CodeParam=${codeFromQuery}, TokenParam=${tokenFromQuery}, IncomingHash=${incomingHash}, Error=${errorParam}, ErrorDesc=${errorDescriptionParam}`);

  if (type === 'recovery') {
    // UPDATED LINE: Changed '/auth/update-password' to '/update-password'
    const updatePasswordUrl = new URL('/update-password', origin);
    
    // Determine the token to use for the fragment:
    // Supabase usually sends 'token' in query for its own /v1/recovery, then redirects with fragment.
    // If your observation 'code=...' is from the query string after Supabase's own redirect, we use that.
    const recoveryTokenForFragment = tokenFromQuery || codeFromQuery;

    if (recoveryTokenForFragment) {
      // Construct the fragment that the Supabase JS client expects on /update-password
      updatePasswordUrl.hash = `access_token=${recoveryTokenForFragment}&token_type=bearer&type=recovery`;
      
      // Append other potential Supabase recovery fragment parameters if they were sent as query params
      const refreshToken = searchParams.get('refresh_token');
      const expiresIn = searchParams.get('expires_in');
      if (refreshToken) updatePasswordUrl.hash += `&refresh_token=${refreshToken}`;
      if (expiresIn) updatePasswordUrl.hash += `&expires_in=${expiresIn}`;

      console.log(`AuthCallback_RECOVERY_CONSTRUCTING_FRAGMENT: Redirecting to: ${updatePasswordUrl.toString()}`);
      return NextResponse.redirect(updatePasswordUrl.toString());

    } else if (incomingHash && incomingHash.includes('access_token=') && incomingHash.includes('type=recovery')) {
      // If the fragment is ALREADY correctly on the URL hitting /auth/callback.
      // This means Supabase's /auth/v1/recovery endpoint redirected here with the fragment.
      console.log(`AuthCallback_RECOVERY_FRAGMENT_ALREADY_PRESENT: Fragment is '${incomingHash}'. Redirecting to /update-password (browser should preserve fragment).`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    } else {
      // Fallback: Type is 'recovery' but no token/code in query and no valid fragment on this request.
      // This is an unexpected state for recovery if Supabase is working as documented.
      console.error(`AuthCallback_RECOVERY_ERROR_MISSING_TOKEN: Type 'recovery' but no usable token/code in query params and no valid incoming fragment. URL: ${request.url}`);
      const errorRedirectUrl = new URL('/login', origin); // Redirect to login with an error
      errorRedirectUrl.searchParams.set('error', 'password_reset_error');
      errorRedirectUrl.searchParams.set('error_description', 'Invalid or incomplete password reset link.');
      return NextResponse.redirect(errorRedirectUrl.toString());
    }
  }

  // --- For other authentication types (signup, magiclink, email_change etc.) ---
  const supabase = await createClient();
  const exchangeToken = codeFromQuery || tokenFromQuery;

  if (!exchangeToken && type !== 'recovery') { 
    console.warn('AuthCallback_NON_RECOVERY_NO_TOKEN_ERROR: No code or token for non-recovery flow.', { type });
    const errorRedirectUrl = new URL('/', origin);
    errorRedirectUrl.searchParams.set('error', 'auth_token_missing');
    errorRedirectUrl.searchParams.set('error_description', 'Authentication token is missing.');
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
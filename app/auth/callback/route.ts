
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server'; // For other flows

export async function GET(request: NextRequest) {
  const { searchParams, origin, hash: incomingHash } = new URL(request.url);
  const type = searchParams.get('type');
  const codeFromQuery = searchParams.get('code'); // From your observation
  const tokenFromQuery = searchParams.get('token'); // Standard Supabase recovery query param from their /v1/recovery redirect

  console.log(`Auth callback received: URL=${request.url.substring(0, 250)}..., Type=${type}, CodeParam=${codeFromQuery}, TokenParam=${tokenFromQuery}, IncomingHash=${incomingHash}`);

  if (type === 'recovery') {
    const updatePasswordUrl = new URL('/auth/update-password', origin);
    
    const recoveryTokenForFragment = tokenFromQuery || codeFromQuery;

    if (recoveryTokenForFragment) {
      // Construct the fragment that the Supabase JS client expects.
      updatePasswordUrl.hash = `access_token=${recoveryTokenForFragment}&token_type=bearer&type=recovery`;
      
      // Optionally, carry over other relevant parameters if Supabase includes them
      const refreshToken = searchParams.get('refresh_token');
      const expiresIn = searchParams.get('expires_in');
      if (refreshToken) updatePasswordUrl.hash += `&refresh_token=${refreshToken}`;
      if (expiresIn) updatePasswordUrl.hash += `&expires_in=${expiresIn}`;

      console.log(`Auth callback: type 'recovery'. Token found in query. Constructing fragment and redirecting to: ${updatePasswordUrl.toString()}`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    } else if (incomingHash && incomingHash.includes('access_token') && incomingHash.includes('type=recovery')) {
      console.log(`Auth callback: type 'recovery'. Fragment already present on incoming request. Redirecting to ${updatePasswordUrl.toString()}. Fragment: ${incomingHash}`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    } else {
      console.warn(`Auth callback: type 'recovery', but no token in query params and no fragment on this incoming request. Proceeding with simple redirect to /auth/update-password. Client-side MUST have received the fragment from Supabase's initial redirect.`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    }
  }

  // --- For other authentication types (signup, magiclink, etc.) ---
  const supabase = await createClient();
  const exchangeToken = codeFromQuery || tokenFromQuery; 

  if (!exchangeToken && type !== 'recovery') { 
    console.warn('Auth callback: No code or token found for non-recovery session exchange flow.', { type, url: request.url });
    const errorRedirectUrl = new URL('/', origin);
    errorRedirectUrl.searchParams.set('error', 'auth_token_missing');
    errorRedirectUrl.searchParams.set('error_description', 'Authentication token or code is missing.');
    return NextResponse.redirect(errorRedirectUrl);
  }

  if (type === 'signup' || type === 'invite' || type === 'magiclink' || (type === null && exchangeToken)) {
    if (!exchangeToken) {
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
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server';
import { sendWelcomeEmail, addUserToMarketingAudience } from '@/utils/send-email';

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
    const updatePasswordUrl = new URL('/auth/update-password', origin);
    
    const recoveryTokenForFragment = tokenFromQuery || codeFromQuery;

    if (recoveryTokenForFragment) {
      updatePasswordUrl.hash = `access_token=${recoveryTokenForFragment}&token_type=bearer&type=recovery`;
      
      const refreshToken = searchParams.get('refresh_token');
      const expiresIn = searchParams.get('expires_in');
      if (refreshToken) updatePasswordUrl.hash += `&refresh_token=${refreshToken}`;
      if (expiresIn) updatePasswordUrl.hash += `&expires_in=${expiresIn}`;

      console.log(`AuthCallback_RECOVERY_CONSTRUCTING_FRAGMENT: Redirecting to: ${updatePasswordUrl.toString()}`);
      return NextResponse.redirect(updatePasswordUrl.toString());

    } else if (incomingHash && incomingHash.includes('access_token=') && incomingHash.includes('type=recovery')) {
      console.log(`AuthCallback_RECOVERY_FRAGMENT_ALREADY_PRESENT: Fragment is '${incomingHash}'. Redirecting to /auth/update-password (browser should preserve fragment).`);
      return NextResponse.redirect(updatePasswordUrl.toString());
    } else {
      console.error(`AuthCallback_RECOVERY_ERROR_MISSING_TOKEN: Type 'recovery' but no usable token/code in query params and no valid incoming fragment. URL: ${request.url}`);
      const errorRedirectUrl = new URL('/login', origin);
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
  
  // This part handles OAuth, magic links, and email confirmations
  if (type === 'signup' || type === 'invite' || type === 'magiclink' || (type === null && exchangeToken)) {
    if (!exchangeToken) {
        console.error('AuthCallback_SESSION_EXCHANGE_CRITICAL_NO_TOKEN_ERROR:', { type });
        const errorRedirectUrl = new URL((type === 'signup' || type === 'invite') ? '/login' : '/', origin);
        errorRedirectUrl.searchParams.set('error', 'internal_error_token_absent_for_session_exchange');
        return NextResponse.redirect(errorRedirectUrl);
    }
    
    // Exchange the code for a session and get user data
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(exchangeToken);

    if (error) {
      console.error(`AuthCallback_SESSION_EXCHANGE_ERROR: type ${type || 'unknown_code_flow'} - ${error.message} (Status: ${error.status})`);
      const errorRedirectUrl = new URL( (type === 'signup' || type === 'invite') ? '/login' : '/', origin);
      errorRedirectUrl.searchParams.set('error', 'session_exchange_failed');
      errorRedirectUrl.searchParams.set('error_description', error.message);
      return NextResponse.redirect(errorRedirectUrl);
    }
    
    const next = searchParams.get('next') ?? '/dashboard';
    const successRedirectUrl = new URL(next, origin);
    
    if (user) {
      // New user check based on timestamps.
      // A new user's last_sign_in_at is either null or very close to created_at.
      const createdAt = new Date(user.created_at);
      const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at) : createdAt;
      const timeDifference = Math.abs(lastSignInAt.getTime() - createdAt.getTime());
      
      // If the difference is less than 5 seconds, we assume it's the user's first sign-in.
      const isNewUser = timeDifference < 5000;

      if (isNewUser) {
        console.log(`AuthCallback_NEW_USER_DETECTED: Timestamps indicate new user. Created: ${user.created_at}, Last Sign In: ${user.last_sign_in_at}`);
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'there';
        const userEmail = user.email;

        // Check if a profile exists to avoid insertion errors if a trigger is active.
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();

        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              name: userName, 
              email: userEmail,
              is_subscribed_to_marketing: false // Default to false for OAuth users
            });

          if (insertError) {
            console.error(`AuthCallback_PROFILE_CREATION_ERROR: Failed to create profile for new user ${user.id}: ${insertError.message}`);
          }
        }

        // Send welcome email for the new user.
        if (userEmail) {
          try {
            await sendWelcomeEmail(userEmail, userName);
            console.log(`AuthCallback_OAUTH_NEW_USER: Welcome email sent to new OAuth user ${userEmail}`);
          } catch (emailError) {
            console.error(`AuthCallback_OAUTH_NEW_USER_EMAIL_ERROR: Failed to send welcome email to ${userEmail}`, emailError);
          }
        }
        
        // Redirect new OAuth users to onboarding page to get marketing consent
        const welcomeOnboardingUrl = new URL('/welcome-onboarding', origin);
        welcomeOnboardingUrl.searchParams.set('name', userName);
        welcomeOnboardingUrl.searchParams.set('email', userEmail || '');
        console.log(`AuthCallback_OAUTH_NEW_USER: Redirecting to welcome onboarding page: ${welcomeOnboardingUrl.toString()}`);
        return NextResponse.redirect(welcomeOnboardingUrl.toString());
        
        // Not using this since we're redirecting directly above
        // successRedirectUrl.searchParams.set('welcome', 'new');
      } else {
        console.log(`AuthCallback_EXISTING_USER_DETECTED: Timestamps indicate existing user. Created: ${user.created_at}, Last Sign In: ${user.last_sign_in_at}`);
      }
    }
    
    console.log(`AuthCallback_SESSION_EXCHANGE_SUCCESS: type '${type || 'unknown_code_flow'}'. Redirecting to '${successRedirectUrl.toString()}'.`);
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
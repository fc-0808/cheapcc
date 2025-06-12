// app/register/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/supabase-server'
import { verifyRecaptcha } from '@/utils/recaptcha'
import { SignupSchema } from '@/lib/schemas'
import { headers } from 'next/headers'
import { checkRateLimitByIp, limiters } from '@/utils/rate-limiter'
import { ZodError } from 'zod'

function formatZodError(error: ZodError) {
  const firstError = error.errors[0];
  const pathString = Array.isArray(firstError.path) && firstError.path.length > 0 
                     ? firstError.path.join('.') 
                     : 'Form';
  return `${pathString}: ${firstError.message}`;
}

export async function signup(formData: FormData): Promise<{ error?: string } | void> {
  const actionName = "signup";
  const headersList = await headers(); // Ensure await is here
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1';
  const submittedEmail = formData.get('email') as string || 'N/A';

  const logContext = { action: actionName, ip, email: submittedEmail, source: "app/register/actions.ts" };

  try {
    const { limited, retryAfter } = await checkRateLimitByIp(ip, limiters.signup);
    if (limited) {
      const errorMessage = `Too many signup attempts. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`;
      console.warn(JSON.stringify({ ...logContext, event: "rate_limit_exceeded", retryAfter }, null, 2));
      redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
    }

    const rawFormData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      recaptchaToken: formData.get('g-recaptcha-response'),
    };

    const validationResult = SignupSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      const errorMessage = formatZodError(validationResult.error);
      console.warn(JSON.stringify({
        ...logContext, event: "validation_failed", error: errorMessage,
        formDataFields: { name: rawFormData.name, email: rawFormData.email, hasRecaptcha: !!rawFormData.recaptchaToken }
      }, null, 2));
      redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
    }

    const { name, email, password, recaptchaToken } = validationResult.data;
    logContext.email = email; 

    if (!recaptchaToken || typeof recaptchaToken !== 'string') {
      console.warn(JSON.stringify({ ...logContext, event: "recaptcha_token_missing_or_invalid_format" }, null, 2));
      redirect('/register?error=Invalid+reCAPTCHA+token+format.');
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken as string);
    if (!isRecaptchaValid) {
      console.warn(JSON.stringify({ ...logContext, event: "recaptcha_verification_failed" }, null, 2));
      redirect('/register?error=Invalid+reCAPTCHA.+Please+try+again.');
    }

    const supabase = await createClient();
    
    // Since email confirmation is disabled, we can directly sign up and sign in the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        // Remove emailRedirectTo since we don't need email confirmation anymore
      },
    });

    if (signUpError) {
      console.error(JSON.stringify({
        ...logContext, event: "supabase_signup_error",
        supabaseError: signUpError.message,
        supabaseStatus: signUpError.status,
      }, null, 2));
      redirect(`/register?error=${encodeURIComponent(signUpError.message)}`);
    }

    // Check if user was created successfully
    if (!signUpData.user) {
      console.error(JSON.stringify({
        ...logContext, event: "signup_user_creation_failed",
        reason: "User object not returned from signUp call"
      }, null, 2));
      redirect('/register?error=Failed+to+create+user+account');
    }

    console.info(JSON.stringify({
      ...logContext, 
      event: "signup_successful", 
      userId: signUpData.user.id,
      userConfirmed: true
    }, null, 2));

    // Create a profile record if needed
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: signUpData.user.id,
            name: name,
            email: email,
          }
        ]);
      
      if (profileError) {
        console.warn(JSON.stringify({
          ...logContext,
          event: "profile_creation_warning",
          userId: signUpData.user.id,
          profileError: profileError.message
        }, null, 2));
        // Continue even if profile creation fails - the user is still authenticated
      }
    } catch (profileException) {
      console.warn(JSON.stringify({
        ...logContext,
        event: "profile_creation_exception",
        userId: signUpData.user.id,
        error: profileException instanceof Error ? profileException.message : String(profileException)
      }, null, 2));
      // Continue even if profile creation throws - the user is still authenticated
    }

    revalidatePath('/', 'layout');
    console.info(JSON.stringify({ ...logContext, event: "redirecting_to_dashboard_after_signup", userId: signUpData.user.id }, null, 2));
    redirect('/dashboard?welcome=new'); // Redirect directly to dashboard with welcome parameter

  } catch (error: any) {
    // **** THIS IS THE CRITICAL CORRECTED CATCH BLOCK ****
    if (error.message === 'NEXT_REDIRECT' || (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))) {
      console.info(JSON.stringify({ ...logContext, event: "intentional_redirect_caught", redirectType: error.message, digest: error.digest }, null, 2));
      throw error; // Re-throw to let Next.js handle the redirect
    }
    
    const unexpectedErrorMessage = "An unexpected error occurred. Please try again.";
    console.error(JSON.stringify({
        ...logContext, event: "signup_action_exception",
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 1000),
    }, null, 2));
    redirect(`/register?error=${encodeURIComponent(unexpectedErrorMessage)}`);
  }
}
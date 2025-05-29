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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
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

    console.info(JSON.stringify({
        ...logContext, event: "signup_successful_email_sent", userId: signUpData.user?.id
    }, null, 2));

    revalidatePath('/', 'layout');
    console.info(JSON.stringify({ ...logContext, event: "initiating_redirect_to_login_after_signup" }, null, 2));
    redirect('/login?success=register'); // This will throw NEXT_REDIRECT

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
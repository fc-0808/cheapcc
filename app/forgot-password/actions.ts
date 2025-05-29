// app/forgot-password/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import { verifyRecaptcha } from '@/utils/recaptcha';
import { ForgotPasswordSchema } from '@/lib/schemas';
import { headers } from 'next/headers';
import { checkRateLimitByIp, limiters } from '@/utils/rate-limiter';
import { ZodError } from 'zod';

function formatZodError(error: ZodError) {
  const firstError = error.errors[0];
  const pathString = Array.isArray(firstError.path) && firstError.path.length > 0 
                     ? firstError.path.join('.') 
                     : 'FormInput';
  return `${pathString}: ${firstError.message}`;
}

export async function requestPasswordReset(formData: FormData): Promise<{ error?: string } | void> {
  const actionName = "requestPasswordReset";
  const headersList = await headers(); // Correct: headers() is not async
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1';
  const submittedEmail = formData.get('email') as string || 'N/A';

  const logContext = { action: actionName, ip, email: submittedEmail, source: "app/forgot-password/actions.ts" };

  try {
    const { limited, retryAfter } = await checkRateLimitByIp(ip, limiters.passwordResetRequest);
    if (limited) {
      const errorMessage = `Too many password reset requests. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`;
      console.warn(JSON.stringify({ ...logContext, event: "rate_limit_exceeded", retryAfter }, null, 2));
      redirect(`/forgot-password?error=${encodeURIComponent(errorMessage)}`);
    }
    
    const rawFormData = {
      email: formData.get('email'),
      recaptchaToken: formData.get('g-recaptcha-response'),
    };

    const validationResult = ForgotPasswordSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      const errorMessage = formatZodError(validationResult.error);
      console.warn(JSON.stringify({
        ...logContext, event: "validation_failed", error: errorMessage,
        formDataFields: { email: rawFormData.email, hasRecaptcha: !!rawFormData.recaptchaToken }
      }, null, 2));
      redirect(`/forgot-password?error=${encodeURIComponent(errorMessage)}`);
    }

    const { email, recaptchaToken } = validationResult.data;
    logContext.email = email; 

    if (!recaptchaToken || typeof recaptchaToken !== 'string') {
      console.warn(JSON.stringify({ ...logContext, event: "recaptcha_token_missing_or_invalid_format" }, null, 2));
      redirect('/forgot-password?error=Invalid+reCAPTCHA+token+format.');
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken as string);
    if (!isRecaptchaValid) {
      console.warn(JSON.stringify({ ...logContext, event: "recaptcha_verification_failed" }, null, 2));
      redirect('/forgot-password?error=Invalid+reCAPTCHA.+Please+try+again.');
    }

    const supabase = await createClient();
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`; 

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (resetError) {
      console.error(JSON.stringify({
        ...logContext, event: "supabase_reset_password_error",
        supabaseError: resetError.message,
        supabaseStatus: resetError.status,
      }, null, 2));
    } else {
      console.info(JSON.stringify({
        ...logContext, event: "password_reset_email_sent_or_simulated"
      }, null, 2));
    }
    redirect('/login?info=reset_link_sent');

  } catch (error: any) {
    // **** THIS IS THE CRITICAL CORRECTED CATCH BLOCK ****
    if (error.message === 'NEXT_REDIRECT' || (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))) {
      console.info(JSON.stringify({ ...logContext, event: "intentional_redirect_caught", redirectType: error.message, digest: error.digest }, null, 2));
      throw error;
    }
    
    const unexpectedErrorMessage = "An unexpected error occurred. Please try again.";
    console.error(JSON.stringify({
        ...logContext, event: "request_password_reset_action_exception",
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 1000),
    }, null, 2));
    redirect(`/login?info=reset_link_sent&error_occurred=${encodeURIComponent(unexpectedErrorMessage)}`); 
  }
}
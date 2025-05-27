'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server'; // Use server client
import { verifyRecaptcha } from '@/utils/recaptcha'; // Import the verifier
import { ForgotPasswordSchema } from '@/lib/schemas'; // Your Zod schema
import { headers } from 'next/headers';
import { checkRateLimitByIp, limiters } from '@/utils/rate-limiter';
import { ZodError } from 'zod'; // Import ZodError

function formatZodError(error: ZodError) { // Use imported ZodError
  const firstError = error.errors[0];
  return `${firstError.path.join('.') || 'Form'}: ${firstError.message}`;
}

// Modified to return error object for client-side display
export async function requestPasswordReset(formData: FormData): Promise<{ error?: string } | void> {
  const headersList = await headers(); // Await the headers
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1';

  const { limited, retryAfter } = await checkRateLimitByIp(ip, limiters.passwordResetRequest);
  if (limited) {
    const errorMessage = `Too many password reset requests. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`;
    // For this action, redirecting with a generic message is fine to prevent email enumeration
    // but for internal tracking, you might want to log the rate limit event.
    // Or, you could return an error if the form handles it:
    // return { error: errorMessage };
    redirect(`/forgot-password?error=${encodeURIComponent(errorMessage)}`);
  }

  const rawFormData = {
    email: formData.get('email'),
    recaptchaToken: formData.get('g-recaptcha-response'), // Ensure this is how you named it in the form
  };

  const validationResult = ForgotPasswordSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    const errorMessage = formatZodError(validationResult.error);
    redirect(`/forgot-password?error=${encodeURIComponent(errorMessage)}`);
  }

  const { email, recaptchaToken } = validationResult.data;

  if (!recaptchaToken || typeof recaptchaToken !== 'string') {
     redirect('/forgot-password?error=Invalid+reCAPTCHA+token+format.');
  }

  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    redirect('/forgot-password?error=Invalid+reCAPTCHA.+Please+try+again.');
  }

  const supabase = await createClient();
  // Ensure this matches exactly what's configured in Supabase Auth redirect settings
  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`;

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (resetError) {
    console.error('Password reset request error from Supabase:', resetError.message);
    // IMPORTANT: Do NOT reveal if the email exists or not.
    // Always redirect to a generic success/info message.
  }

  // Redirect to login with an info message regardless of whether the email existed or an error occurred,
  // to prevent email enumeration attacks.
  redirect('/login?info=reset_link_sent');
} 
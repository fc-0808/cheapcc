'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server'; // Use server client
import { verifyRecaptcha } from '@/utils/recaptcha'; // Import the verifier
import { ForgotPasswordSchema } from '@/lib/schemas'; // Your Zod schema
import { z } from 'zod';

function formatZodError(error: z.ZodError) {
  const firstError = error.errors[0];
  return `${firstError.path.join('.')}: ${firstError.message}`;
}

// Modified to return error object for client-side display
export async function requestPasswordReset(formData: FormData): Promise<{ error?: string } | void> {
  const rawFormData = {
    email: formData.get('email'),
    recaptchaToken: formData.get('g-recaptcha-response'),
  };

  const validationResult = ForgotPasswordSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    const errorMessage = formatZodError(validationResult.error);
    // Instead of redirecting, return the error for the client page to handle
    return { error: errorMessage };
  }

  const { email, recaptchaToken } = validationResult.data;

  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    return { error: 'Invalid reCAPTCHA. Please try again.' };
  }

  const supabase = await createClient();
  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`;

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (resetError) {
    console.error('Password reset request error:', resetError.message);
    // To prevent email enumeration, we will redirect to a generic success page.
    // The client will not see this specific error unless you choose to return it.
    // return { error: "Could not send password reset email. Please try again or contact support." };
  }

  // Always redirect to a generic info page to prevent email enumeration.
  redirect('/login?info=reset_link_sent');
} 
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import { UpdatePasswordSchema } from '@/lib/schemas'; // Your Zod schema
import { headers } from 'next/headers';
import { checkRateLimitByIp, limiters } from '@/utils/rate-limiter';
import { ZodError } from 'zod'; // Import ZodError

function formatZodError(error: ZodError) { // Use imported ZodError
  const firstError = error.errors[0];
  return `${firstError.path.join('.') || 'Form'}: ${firstError.message}`;
}

export async function updatePassword(formData: FormData): Promise<{ error?: string } | void> {
  const headersList = await headers(); // Await the headers
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1';

  // Although user is likely using a one-time token, an IP limit provides some defense against abuse of the endpoint itself.
  const { limited, retryAfter } = await checkRateLimitByIp(ip, limiters.passwordUpdate);
  if (limited) {
    const errorMessage = `Too many password update attempts. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`;
    redirect(`/auth/update-password?error=${encodeURIComponent(errorMessage)}`);
  }

  const rawFormData = {
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
    // No reCAPTCHA here usually, as access is token-protected.
  };

  const validationResult = UpdatePasswordSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    const errorMessage = formatZodError(validationResult.error);
    redirect(`/auth/update-password?error=${encodeURIComponent(errorMessage)}`);
  }

  const { newPassword } = validationResult.data; // confirmPassword already validated by schema

  const supabase = await createClient();

  // The user must be in a password recovery session,
  // which Supabase client handles via the recovery token in the URL.
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error('Error updating password via recovery:', updateError.message);
    redirect(`/auth/update-password?error=${encodeURIComponent(updateError.message)}`);
  }

  // On successful password update, redirect to login with a success message.
  // The page component can then show a message and redirect to login.
  redirect('/login?success=password_reset');
} 
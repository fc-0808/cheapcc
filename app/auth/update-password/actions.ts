'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import { UpdatePasswordSchema } from '@/lib/schemas'; // Your Zod schema
import { z } from 'zod';

function formatZodError(error: z.ZodError) {
  const firstError = error.errors[0];
  return `${firstError.path.join('.')}: ${firstError.message}`;
}

export async function updatePassword(formData: FormData): Promise<{ error?: string } | void> {
  const rawFormData = {
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
    // recaptchaToken: formData.get('g-recaptcha-response'), // If you add reCAPTCHA here
  };

  const validationResult = UpdatePasswordSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    const errorMessage = formatZodError(validationResult.error);
    // Redirect back to the update-password page with the error
    redirect(`/auth/update-password?error=${encodeURIComponent(errorMessage)}`);
  }

  const { newPassword } = validationResult.data;

  // If adding reCAPTCHA here:
  // const { newPassword, recaptchaToken } = validationResult.data;
  // const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  // if (!isRecaptchaValid) {
  //   redirect('/auth/update-password?error=Invalid+reCAPTCHA.');
  // }

  const supabase = await createClient();

  // The user should be in a password recovery session at this point
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error('Error updating password:', updateError);
    redirect(`/auth/update-password?error=${encodeURIComponent(updateError.message)}`);
  }

  // On successful password update, redirect to login with a success message
  redirect('/login?success=password_reset');
} 
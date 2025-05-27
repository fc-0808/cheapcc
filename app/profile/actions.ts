'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/supabase-server';
import { UpdateProfileSchema, UpdatePasswordSchema } from '@/lib/schemas';
import { z } from 'zod';

function formatZodError(error: z.ZodError) {
  const firstError = error.errors[0];
  return `${firstError.path.join('.')}: ${firstError.message}`;
}

export async function updateProfile(formData: FormData): Promise<{ error?: string; success?: boolean, message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated." };
  }

  const rawFormData = {
    name: formData.get('name'),
  };

  const validationResult = UpdateProfileSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    return { error: formatZodError(validationResult.error) };
  }

  const { name } = validationResult.data;

  // If adding reCAPTCHA here:
  // const { name, recaptchaToken } = validationResult.data;
  // const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  // if (!isRecaptchaValid) {
  //   return { error: 'Invalid reCAPTCHA.' };
  // }

  // Update in 'profiles' table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name: name, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (profileError) {
    console.error("Error updating profile in 'profiles' table:", profileError);
    return { error: `Failed to update profile: ${profileError.message}` };
  }

  // Update in auth.users user_metadata
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { name: name }
  });

  if (metadataError) {
    // Log this, but might not be critical enough to fail the whole operation if profiles table updated.
    console.warn('Failed to update user metadata:', metadataError);
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard'); // If dashboard shows name
  return { success: true, message: "Profile updated successfully!" };
}

export async function changeUserPasswordOnProfile(formData: FormData): Promise<{ error?: string; success?: boolean, message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated." };
  }

  const rawFormData = {
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
    // recaptchaToken: formData.get('g-recaptcha-response'), // If you add reCAPTCHA here
  };

  const validationResult = UpdatePasswordSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    return { error: formatZodError(validationResult.error) };
  }

  const { newPassword, confirmPassword } = validationResult.data; // Get both fields for client-side check consistency

  // Although Zod schema checks match, a final check here before the DB call is good practice
  if (newPassword !== confirmPassword) {
       return { error: "New passwords do not match." };
  }

  // If adding reCAPTCHA here:
  // const { newPassword, confirmPassword, recaptchaToken } = validationResult.data;
  // const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  // if (!isRecaptchaValid) {
  //   return { error: 'Invalid reCAPTCHA.' };
  // }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error('Error changing password:', updateError);
    return { error: `Failed to change password: ${updateError.message}` };
  }

  // Invalidate relevant caches
  revalidatePath('/profile');
  // Maybe revalidate dashboard if it shows auth status, though usually not needed for password change

  // Supabase's updateUser({ password: ... }) signs the user out of all other sessions
  // except the current one. It does NOT redirect automatically.
  // It is often good UX to inform the user and maybe suggest logging in again elsewhere.
  // For this implementation, we'll just return a success message.

  return { success: true, message: "Password changed successfully!" };
} 
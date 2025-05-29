// app/profile/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation'; // Not used if returning objects
import { createClient } from '@/utils/supabase/supabase-server';
import { UpdateProfileSchema, UpdatePasswordSchema as ProfileUpdatePasswordSchema } from '@/lib/schemas';
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

export async function updateProfile(formData: FormData): Promise<{ error?: string; success?: boolean, message?: string }> {
  const actionName = "updateProfile";
  const headersList = await headers(); // Ensure await is here
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1';
  let userIdForLog = "N/A_USER_AUTH_FAILED";

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn(JSON.stringify({
        action: actionName, ip, event: "auth_failed",
        error: userError?.message || "User not authenticated.",
        source: "app/profile/actions.ts (updateProfile)"
    }, null, 2));
    return { error: "User not authenticated. Please log in again." };
  }
  userIdForLog = user.id;
  const logContext = { action: actionName, ip, userId: userIdForLog, source: "app/profile/actions.ts (updateProfile)" };

  try {
    const limiterToUse = limiters.profileUpdate || limiters.signup; 
    const { limited, retryAfter } = await checkRateLimitByIp(ip, limiterToUse);
    if (limited) {
      const errorMessage = `Too many profile update attempts. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`;
      console.warn(JSON.stringify({ ...logContext, event: "rate_limit_exceeded", retryAfter }, null, 2));
      return { error: errorMessage };
  }

  const rawFormData = {
    name: formData.get('name'),
  };

  const validationResult = UpdateProfileSchema.safeParse(rawFormData);

  if (!validationResult.success) {
      const errorMessage = formatZodError(validationResult.error);
      console.warn(JSON.stringify({
        ...logContext, event: "validation_failed", error: errorMessage,
        formDataName: rawFormData.name
      }, null, 2));
      return { error: errorMessage };
  }

  const { name } = validationResult.data;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name: name, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (profileError) {
      console.error(JSON.stringify({
        ...logContext, event: "supabase_profiles_update_error", name,
        dbError: profileError.message, dbErrorCode: profileError.code,
      }, null, 2));
      return { error: `Failed to update profile in database: ${profileError.message}` };
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { name: name }
  });

  if (metadataError) {
      console.warn(JSON.stringify({
        ...logContext, event: "supabase_auth_metadata_update_error", name,
        metadataError: metadataError.message,
      }, null, 2));
  }

    console.info(JSON.stringify({ ...logContext, event: "profile_update_successful", newName: name }, null, 2));
  revalidatePath('/profile');
    revalidatePath('/dashboard');
  return { success: true, message: "Profile updated successfully!" };

  } catch (error: any) {
     if (error.message === 'NEXT_REDIRECT' || (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))) {
      console.info(JSON.stringify({ ...logContext, event: "intentional_redirect_caught_in_profile_update", redirectType: error.message, digest: error.digest }, null, 2));
      throw error;
    }
    
    const unexpectedErrorMessage = "An unexpected error occurred while updating your profile.";
    console.error(JSON.stringify({
        ...logContext, event: "update_profile_action_exception",
        errorMessage: error.message, errorStack: error.stack?.substring(0, 1000),
        formDataName: formData.get('name')
    }, null, 2));
    return { error: unexpectedErrorMessage };
  }
}

export async function changeUserPasswordOnProfile(formData: FormData): Promise<{ error?: string; success?: boolean, message?: string }> {
  const actionName = "changeUserPasswordOnProfile";
  const headersList = await headers(); // Ensure await is here
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1';
  let userIdForLog = "N/A_USER_AUTH_FAILED";
  
  const supabase = await createClient();
  const { data: { user }, error: userAuthError } = await supabase.auth.getUser();

  if (userAuthError || !user) {
    console.warn(JSON.stringify({
        action: actionName, ip, event: "auth_failed",
        error: userAuthError?.message || "User not authenticated for password change.",
        source: "app/profile/actions.ts (changeUserPasswordOnProfile)"
    }, null, 2));
    return { error: "User not authenticated. Please log in again to change your password." };
  }
  userIdForLog = user.id;
  const logContext = { action: actionName, ip, userId: userIdForLog, source: "app/profile/actions.ts (changeUserPasswordOnProfile)" };

  try {
    const limiterToUse = limiters.passwordUpdate || limiters.signup; 
    const { limited, retryAfter } = await checkRateLimitByIp(ip, limiterToUse);
    if (limited) {
      const errorMessage = `Too many password change attempts. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`;
      console.warn(JSON.stringify({ ...logContext, event: "rate_limit_exceeded", retryAfter }, null, 2));
      return { error: errorMessage };
  }

  const rawFormData = {
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  };

    const validationResult = ProfileUpdatePasswordSchema.safeParse(rawFormData);

  if (!validationResult.success) {
      const errorMessage = formatZodError(validationResult.error);
      console.warn(JSON.stringify({
        ...logContext, event: "validation_failed", error: errorMessage,
      }, null, 2));
      return { error: errorMessage };
  }

    const { newPassword } = validationResult.data;

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
      console.error(JSON.stringify({
        ...logContext, event: "supabase_auth_password_update_error",
        supabaseError: updateError.message, supabaseStatus: updateError.status,
      }, null, 2));
    return { error: `Failed to change password: ${updateError.message}` };
  }

    console.info(JSON.stringify({ ...logContext, event: "profile_password_change_successful" }, null, 2));
  revalidatePath('/profile');
    return { success: true, message: "Password changed successfully! Other active sessions have been signed out." };

  } catch (error: any) {
     if (error.message === 'NEXT_REDIRECT' || (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))) {
      console.info(JSON.stringify({ ...logContext, event: "intentional_redirect_caught_in_profile_pw_change", redirectType: error.message, digest: error.digest }, null, 2));
      throw error;
    }

    const unexpectedErrorMessage = "An unexpected error occurred while changing your password.";
    console.error(JSON.stringify({
        ...logContext, event: "change_password_action_exception",
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 1000),
    }, null, 2));
    return { error: unexpectedErrorMessage };
  }
} 
// app/auth/update-password/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import { UpdatePasswordSchema } from '@/lib/schemas';
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

export async function updatePassword(formData: FormData): Promise<{ error?: string } | void> {
  const actionName = "updatePasswordViaRecovery";
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1';
  
  const logContext = { action: actionName, ip, source: "app/auth/update-password/actions.ts" };

  try {
    const { limited, retryAfter } = await checkRateLimitByIp(ip, limiters.passwordUpdate);
    if (limited) {
      const errorMessage = `Too many password update attempts. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`;
      console.warn(JSON.stringify({ ...logContext, event: "rate_limit_exceeded", retryAfter }, null, 2));
      redirect(`/auth/update-password?error=${encodeURIComponent(errorMessage)}`);
    }

    const rawFormData = {
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    };

    const validationResult = UpdatePasswordSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      const errorMessage = formatZodError(validationResult.error);
      console.warn(JSON.stringify({
        ...logContext, event: "validation_failed", error: errorMessage,
      }, null, 2));
      redirect(`/auth/update-password?error=${encodeURIComponent(errorMessage)}`);
    }

    const { newPassword } = validationResult.data;

    const supabase = await createClient();
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error(JSON.stringify({
        ...logContext, event: "supabase_update_user_password_error",
        supabaseError: updateError.message,
        supabaseStatus: updateError.status,
      }, null, 2));
      redirect(`/auth/update-password?error=${encodeURIComponent(updateError.message)}`);
    }

    console.info(JSON.stringify({
        ...logContext, event: "password_update_successful", userId: updateData.user?.id
    }, null, 2));
    
    redirect('/login?success=password_reset');

  } catch (error: any) {
    // **** THIS IS THE CRITICAL CORRECTED CATCH BLOCK ****
    if (error.message === 'NEXT_REDIRECT' || (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))) {
      console.info(JSON.stringify({ ...logContext, event: "intentional_redirect_caught", redirectType: error.message, digest: error.digest }, null, 2));
      throw error;
    }
    
    const unexpectedErrorMessage = "An unexpected error occurred. Please try again.";
    console.error(JSON.stringify({
        ...logContext, event: "update_password_action_exception",
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 1000),
    }, null, 2));
    redirect(`/auth/update-password?error=${encodeURIComponent(unexpectedErrorMessage)}`);
  }
}
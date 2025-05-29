// app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/supabase-server'
import { LoginSchema } from '@/lib/schemas'
import { headers } from 'next/headers'
import { checkRateLimitByIp, limiters } from '@/utils/rate-limiter'
import { ZodError } from 'zod';

function formatZodError(error: ZodError) {
  const firstError = error.errors[0];
  const pathString = Array.isArray(firstError.path) && firstError.path.length > 0 
                     ? firstError.path.join('.') 
                     : 'FormInput';
  return `${pathString}: ${firstError.message}`;
}

export async function login(formData: FormData): Promise<{ error?: string; } | void> {
  const actionName = "login";
  const headersList = await headers(); // Ensure await is here
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1';
  const submittedEmail = formData.get('email') as string || 'N/A';

  const logContext = { action: actionName, ip, email: submittedEmail, source: "app/login/actions.ts" };

  try {
    const { limited, retryAfter } = await checkRateLimitByIp(ip, limiters.login);
    if (limited) {
      const errorMessage = `Too many login attempts. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`;
      console.warn(JSON.stringify({ ...logContext, event: "rate_limit_exceeded", retryAfter }, null, 2));
      return { error: errorMessage };
    }

    const rawFormData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const validationResult = LoginSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      const errorMessage = formatZodError(validationResult.error);
      console.warn(JSON.stringify({
        ...logContext, event: "validation_failed", error: errorMessage,
        formDataFields: { email: rawFormData.email } 
      }, null, 2));
      return { error: errorMessage };
    }
    
    const { email, password } = validationResult.data;
    logContext.email = email; 

    const supabase = await createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.warn(JSON.stringify({
        ...logContext, event: "supabase_signin_error",
        supabaseError: signInError.message,
        supabaseStatus: signInError.status,
      }, null, 2));
      return { error: "Invalid login credentials. Please check your email and password." };
    }

    console.info(JSON.stringify({
        ...logContext, event: "login_successful", userId: signInData.user?.id
    }, null, 2));

    revalidatePath('/', 'layout');
    redirect('/dashboard'); // This will throw NEXT_REDIRECT

  } catch (error: any) {
    // **** THIS IS THE CRITICAL CORRECTED CATCH BLOCK ****
    if (error.message === 'NEXT_REDIRECT' || (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))) {
      console.info(JSON.stringify({ ...logContext, event: "intentional_redirect_caught", redirectType: error.message, digest: error.digest }, null, 2));
      throw error; // Re-throw to let Next.js handle the redirect
    }

    // This is a genuine, unexpected error
    const unexpectedErrorMessage = "An unexpected error occurred during login. Please try again.";
    console.error(JSON.stringify({
        ...logContext, event: "login_action_exception",
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 1000), 
    }, null, 2));
    return { error: unexpectedErrorMessage };
  }
}
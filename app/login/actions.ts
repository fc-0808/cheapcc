'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/supabase-server'
import { LoginSchema } from '@/lib/schemas'
import { headers } from 'next/headers'
import { checkRateLimitByIp, limiters } from '@/utils/rate-limiter'
import { ZodError } from 'zod'

function formatZodError(error: ZodError) {
  const firstError = error.errors[0]
  return `${firstError.path.join('.') || 'Form'}: ${firstError.message}`
}

export async function login(formData: FormData): Promise<{ error?: string; } | void> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1'

  const { limited, retryAfter } = await checkRateLimitByIp(ip, limiters.login)
  if (limited) {
    const errorMessage = `Too many login attempts. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`
    // For Server Actions that update client-side state via useFormState, return the error.
    // If you always redirect, then redirect.
    return { error: errorMessage }
    // redirect(`/login?error=${encodeURIComponent(errorMessage)}`) // Alternative
  }

  const rawFormData = {
    email: formData.get('email'),
    password: formData.get('password'),
    // recaptchaToken: formData.get('g-recaptcha-response'), // If you add reCAPTCHA to login
  }

  const validationResult = LoginSchema.safeParse(rawFormData)

  if (!validationResult.success) {
    const errorMessage = formatZodError(validationResult.error)
    return { error: errorMessage }
    // redirect(`/login?error=${encodeURIComponent(errorMessage)}`) // Alternative
  }

  // If you add reCAPTCHA to login:
  // const { email, password, recaptchaToken } = validationResult.data
  // if (recaptchaToken) {
  //   const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)
  //   if (!isRecaptchaValid) {
  //     redirect('/login?error=Invalid+reCAPTCHA.')
  //   }
  // }
  const { email, password } = validationResult.data

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.warn('Supabase SignIn Error:', signInError.message)
    // It's often better to return a generic error for failed logins
    // to avoid confirming if an email exists or not, unless Supabase already does this.
    return { error: "Invalid login credentials. Please try again." }
    // redirect(`/login?error=${encodeURIComponent(signInError.message)}`) // Alternative if more detail is desired
  }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
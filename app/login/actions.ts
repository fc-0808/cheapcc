'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/supabase-server'
import { LoginSchema } from '@/lib/schemas'
import { z } from 'zod'

function formatZodError(error: z.ZodError) {
  const firstError = error.errors[0]
  return `${firstError.path.join('.')}: ${firstError.message}`
}

export async function login(formData: FormData): Promise<{ error?: string; } | void> {
  const rawFormData = {
    email: formData.get('email'),
    password: formData.get('password'),
    // recaptchaToken: formData.get('g-recaptcha-response'), // If you add reCAPTCHA to login
  }

  const validationResult = LoginSchema.safeParse(rawFormData)

  if (!validationResult.success) {
    const errorMessage = formatZodError(validationResult.error)
    // Return error object instead of redirecting for client-side handling
    return { error: errorMessage };
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
    redirect(`/login?error=${encodeURIComponent(signInError.message)}`)
  }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
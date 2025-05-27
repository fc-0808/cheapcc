'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/supabase-server'
import { verifyRecaptcha } from '@/utils/recaptcha'
import { SignupSchema } from '@/lib/schemas'
import { z } from 'zod'

// Helper to format Zod errors for URL params or client-side display
function formatZodError(error: z.ZodError) {
  // For simplicity, taking the first error. You might want to concatenate.
  const firstError = error.errors[0]
  return `${firstError.path.join('.')}: ${firstError.message}`
}

export async function signup(formData: FormData) {
  const rawFormData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    recaptchaToken: formData.get('g-recaptcha-response'),
  }

  const validationResult = SignupSchema.safeParse(rawFormData)

  if (!validationResult.success) {
    const errorMessage = formatZodError(validationResult.error)
    redirect(`/register?error=${encodeURIComponent(errorMessage)}`)
  }

  const { name, email, password, recaptchaToken } = validationResult.data

  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)
  if (!isRecaptchaValid) {
    redirect('/register?error=Invalid+reCAPTCHA.+Please+try+again.')
  }

  const supabase = await createClient()
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
    },
  })

  if (signUpError) {
    redirect(`/register?error=${encodeURIComponent(signUpError.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/login?success=register')
} 
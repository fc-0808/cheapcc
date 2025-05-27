'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/supabase-server'
import { verifyRecaptcha } from '@/utils/recaptcha'
import { SignupSchema } from '@/lib/schemas'
import { headers } from 'next/headers'
import { checkRateLimitByIp, limiters } from '@/utils/rate-limiter'
import { ZodError } from 'zod'

// Helper to format Zod errors for URL params or client-side display
function formatZodError(error: ZodError) {
  const firstError = error.errors[0]
  return `${firstError.path.join('.') || 'Form'}: ${firstError.message}`
}

export async function signup(formData: FormData): Promise<{ error?: string } | void> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '127.0.0.1'

  const { limited, retryAfter } = await checkRateLimitByIp(ip, limiters.signup)
  if (limited) {
    const errorMessage = `Too many signup attempts. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`
    redirect(`/register?error=${encodeURIComponent(errorMessage)}`)
  }

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

  if (!recaptchaToken || typeof recaptchaToken !== 'string') {
    redirect('/register?error=Invalid+reCAPTCHA+token+format.')
  }

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
    console.error('Supabase SignUp Error:', signUpError.message)
    redirect(`/register?error=${encodeURIComponent(signUpError.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/login?success=register')
} 
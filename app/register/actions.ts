'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/supabase-server'
import { verifyRecaptcha } from '@/utils/recaptcha'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const recaptchaToken = formData.get('g-recaptcha-response') as string

  // Server-side validation
  if (!name || !email || !password || !confirmPassword) {
    redirect('/register?error=All+fields+are+required')
  }
  if (password !== confirmPassword) {
    redirect('/register?error=Passwords+do+not+match')
  }

  // Verify reCAPTCHA
  if (!recaptchaToken) {
    redirect('/register?error=Missing+reCAPTCHA+token')
  }
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)
  if (!isRecaptchaValid) {
    redirect('/register?error=Invalid+reCAPTCHA.+Please+try+again.')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
    },
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/login?success=register')
} 
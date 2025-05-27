'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server'; // Use server client
import { verifyRecaptcha } from '@/utils/recaptcha'; // Import the verifier

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const recaptchaToken = formData.get('g-recaptcha-response') as string; // Get reCAPTCHA token

  if (!email) {
    // This return will be caught by the client-side handleSubmit if it's not a redirect
    return { error: 'Email address is required.' };
  }

  // Verify reCAPTCHA
  if (!recaptchaToken) {
     return { error: 'Missing reCAPTCHA token.' };
  }
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    return { error: 'Invalid reCAPTCHA. Please try again.' };
  }

  // Construct the redirect URL for after the user clicks the link in the email.
  // This URL should point to the page where they can enter their new password.
  // Ensure NEXT_PUBLIC_BASE_URL is set in your .env file (e.g., http://localhost:3000)
  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    // Don't reveal if the email exists or not for security reasons
    // Log the actual error on the server for debugging
    console.error('Password reset request error:', error.message);
    // Instead of redirecting with an error, return it so the client can display it
    // This prevents losing form state if reCAPTCHA was valid but email sending failed.
    // For a better UX, you might want a more generic success message even on Supabase errors
    // to prevent email enumeration, but for now, this gives more direct feedback.
     return { error: "Could not send password reset email. Please try again or contact support." };
  }

  // For security, always show a generic success message to prevent email enumeration.
  // The client-side will display "If an account with that email exists..."
  redirect('/login?info=reset_link_sent');
} 
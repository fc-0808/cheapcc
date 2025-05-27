'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server'; // Use server client

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email address is required.' };
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
    // Redirect with a generic message, or handle error display on the client-side more discreetly
    redirect('/forgot-password?success=true'); // Or use a more generic info message
    // return { error: "Could not send password reset email. Please try again." };
  }

  // For security, always show a generic success message to prevent email enumeration.
  // The client-side will display "If an account with that email exists..."
  redirect('/login?info=reset_link_sent');
} 
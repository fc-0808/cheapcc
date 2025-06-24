'use server';

import { createClient } from '@/utils/supabase/supabase-server';
import { addUserToMarketingAudience } from '@/utils/send-email';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';

// Schema for validating welcome onboarding form data
const WelcomeOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  marketingConsent: z.boolean().optional().default(false),
});

export async function updateMarketingPreferences(formData: FormData): Promise<{ error?: string; } | void> {
  // Get IP address from headers
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';
  
  try {
    // Extract form data
    const marketingConsent = formData.get('marketingConsent') === 'on';
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    const logContext = { 
      action: "updateMarketingPreferences", 
      ip, 
      email, 
      source: "app/welcome-onboarding/actions.ts" 
    };

    // Validate form data
    const validationResult = WelcomeOnboardingSchema.safeParse({
      name,
      email,
      marketingConsent
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      console.warn(JSON.stringify({
        ...logContext, 
        event: "validation_failed", 
        error: errorMessage
      }, null, 2));
      return { error: errorMessage };
    }

    const { name: validatedName, email: validatedEmail, marketingConsent: validatedConsent } = validationResult.data;
    
    // Get the Supabase client
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error(JSON.stringify({
        ...logContext, 
        event: "auth_get_user_error",
        error: userError?.message || "No user found"
      }, null, 2));
      return { error: "Unable to verify your account. Please try again later." };
    }
    
    // Update the user's profile with marketing preference
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: user.id,
          is_subscribed_to_marketing: validatedConsent,
          // Only update these if they're provided and the user is new
          name: validatedName || undefined,
          email: validatedEmail || undefined,
        }
      ], { onConflict: 'id' });
      
    if (updateError) {
      console.error(JSON.stringify({
        ...logContext, 
        event: "profile_update_error",
        error: updateError.message
      }, null, 2));
      return { error: "Failed to update your preferences. Please try again later." };
    }
    
    // Add user to marketing audience if they opted in
    if (validatedConsent) {
      try {
        await addUserToMarketingAudience(validatedEmail, validatedName);
        console.info(JSON.stringify({
          ...logContext, 
          event: "user_added_to_marketing", 
          userId: user.id
        }, null, 2));
      } catch (marketingError: any) {
        console.error(JSON.stringify({
          ...logContext, 
          event: "marketing_audience_addition_error",
          error: marketingError.message
        }, null, 2));
        // Continue even if marketing addition fails - we still want to redirect the user
      }
    }

    console.info(JSON.stringify({
      ...logContext, 
      event: "preferences_updated_successfully", 
      userId: user.id,
      marketingConsent: validatedConsent
    }, null, 2));
    
    // Redirect to dashboard with welcome parameter
    redirect('/dashboard?welcome=new');
    
  } catch (error: any) {
    // Handle unexpected errors, including Next.js redirects
    if (error.message === 'NEXT_REDIRECT' || (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))) {
      throw error; // Re-throw to let Next.js handle the redirect
    }
    
    console.error(JSON.stringify({
      action: "updateMarketingPreferences",
      ip,
      event: "unexpected_error",
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 1000)
    }, null, 2));
    
    return { error: "An unexpected error occurred. Please try again later." };
  }
}
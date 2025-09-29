'use server'

import { createClient } from '@/utils/supabase/supabase-server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  
  // Sign out from Supabase (this will clear the session cookies)
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    // Even if there's an error, we should still redirect to clear the UI state
  }
  
  // Redirect to home page
  redirect('/')
}

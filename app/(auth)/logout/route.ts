import { createClient } from '@/utils/supabase/supabase-server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  // Sign out from Supabase (this will clear the session cookies)
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }
  
  // Return success response
  return NextResponse.json({ success: true })
}

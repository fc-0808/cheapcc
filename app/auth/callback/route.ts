import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=confirmation', request.url));
  }

  // Create Supabase server client with cookie support
  const supabase = await createClient();
  // Exchange the code for a session (sets cookies via SSR helpers)
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/?error=confirmation', request.url));
  }

  // On success, redirect to home with success param
  return NextResponse.redirect(new URL('/?success=confirmed', request.url));
} 
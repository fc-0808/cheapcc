import { NextRequest, NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/utils/send-email';
import { createServiceClient } from '@/utils/supabase/supabase-server';
 
export async function POST(request: NextRequest) {
  // Initialize service role client
  await createServiceClient();
  
  const { to, name, orderId } = await request.json();
  const result = await sendConfirmationEmail(to, name, orderId);
  return NextResponse.json(result);
} 
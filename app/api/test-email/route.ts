import { NextRequest, NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/utils/send-email';

export async function POST(request: NextRequest) {
  const { to, name, orderId } = await request.json();
  const result = await sendConfirmationEmail(to, name, orderId);
  return NextResponse.json(result);
} 
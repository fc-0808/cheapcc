import { NextRequest, NextResponse } from 'next/server';
import { sendTemplateEmail } from '@/lib/email-templates/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, templateId, to, props, isTest = false } = body;

    // Verify admin key
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For test emails, use admin email if not provided
    const recipientEmail = isTest 
      ? (process.env.ADMIN_EMAIL || to)
      : to;

    if (!recipientEmail) {
      return NextResponse.json({ 
        error: 'Recipient email not provided and ADMIN_EMAIL not configured' 
      }, { status: 400 });
    }

    // Send email using template service
    const result = await sendTemplateEmail({
      templateId,
      to: recipientEmail,
      props: props || { name: 'Test User' }
    });

    if (result.success) {
      return NextResponse.json({
        message: `${isTest ? 'Test email' : 'Email'} sent successfully`,
        sentTo: recipientEmail,
        templateId,
        emailId: result.data?.id
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send email',
        details: result.error?.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in send-template-email endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

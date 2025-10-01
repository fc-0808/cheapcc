import { NextRequest, NextResponse } from 'next/server';
import { sendCustomerOwnedEmailAnnouncement } from '@/utils/send-email';

/**
 * Test endpoint to send announcement email to admin
 * 
 * POST /api/admin/test-email
 * 
 * Body:
 * {
 *   "adminKey": "your-admin-key"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey } = body;

    // Verify admin access
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json({ error: 'ADMIN_EMAIL not configured' }, { status: 500 });
    }

    console.log(`Sending test announcement email to admin: ${adminEmail}`);

    // Send the email
    const result = await sendCustomerOwnedEmailAnnouncement(adminEmail, "Admin Test");

    if (result.error) {
      console.error('Failed to send test email:', result.error);
      return NextResponse.json({ 
        error: 'Failed to send email', 
        details: result.error.message 
      }, { status: 500 });
    }

    console.log('✅ Test email sent successfully to admin');

    return NextResponse.json({
      message: 'Test email sent successfully',
      sentTo: adminEmail,
      emailId: result.data?.id
    });

  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

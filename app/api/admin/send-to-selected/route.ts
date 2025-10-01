import { NextRequest, NextResponse } from 'next/server';
import { sendCustomerOwnedEmailAnnouncement } from '@/utils/send-email';

/**
 * API endpoint to send emails to selected customers
 * 
 * POST /api/admin/send-to-selected
 * 
 * Body:
 * {
 *   "adminKey": "your-admin-key",
 *   "customers": [{"name": "John Doe", "email": "john@example.com"}],
 *   "campaignType": "customer-owned-email"
 * }
 */

interface SelectedCustomer {
  name: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, customers, campaignType } = body;

    // Verify admin access
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ error: 'No customers provided' }, { status: 400 });
    }

    console.log(`Sending ${campaignType} emails to ${customers.length} selected customers`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{email: string, error: string}> = [];

    for (const customer of customers as SelectedCustomer[]) {
      try {
        console.log(`Sending email to ${customer.name} (${customer.email})...`);
        
        let result;
        
        // Route to appropriate email function based on campaign type
        switch (campaignType) {
          case 'customer-owned-email':
            result = await sendCustomerOwnedEmailAnnouncement(customer.email, customer.name);
            break;
          default:
            throw new Error(`Unknown campaign type: ${campaignType}`);
        }
        
        if (result.error) {
          throw new Error(result.error.message);
        }
        
        console.log(`✅ Email sent successfully to ${customer.email}`);
        successCount++;
        
        // Add delay to respect Resend's rate limit (2 requests per second)
        await new Promise(resolve => setTimeout(resolve, 700));
        
      } catch (emailError: any) {
        console.error(`❌ Failed to send email to ${customer.email}:`, emailError.message);
        errorCount++;
        errors.push({
          email: customer.email,
          error: emailError.message
        });
      }
    }

    const response = {
      message: 'Selected customer email campaign completed',
      stats: {
        total: customers.length,
        sent: successCount,
        errors: errorCount,
        dryRun: false
      },
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('📊 Selected Campaign Summary:', response.stats);
    
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error in selected customer campaign:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

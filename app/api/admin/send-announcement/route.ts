import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCustomerOwnedEmailAnnouncement } from '@/utils/send-email';

interface Customer {
  name: string;
  email: string;
}

/**
 * Admin API endpoint to send customer-owned email activation announcement
 * 
 * POST /api/admin/send-announcement
 * 
 * Body:
 * {
 *   "adminKey": "your-admin-key", // Set ADMIN_API_KEY in environment
 *   "dryRun": false, // Set to true to see who would receive emails without sending
 *   "limit": 10 // Optional: limit number of emails to send (for testing)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, dryRun = false, limit } = body;

    // Verify admin access
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key to bypass RLS policies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch unique customers from orders table
    let query = supabase
      .from('orders')
      .select('name, email')
      .not('email', 'is', null)
      .not('name', 'is', null)
      .eq('status', 'ACTIVE')  // Only active customers
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit * 2); // Get more than needed to account for duplicates
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({ 
        message: 'No customers found',
        stats: { total: 0, sent: 0, errors: 0 }
      });
    }

    // Remove duplicates based on email
    const uniqueCustomers = customers.reduce((acc: Customer[], customer: Customer) => {
      if (!acc.find((c: Customer) => c.email === customer.email)) {
        acc.push(customer);
      }
      return acc;
    }, []);

    // Apply limit after deduplication
    const customersToEmail = limit ? uniqueCustomers.slice(0, limit) : uniqueCustomers;

    console.log(`Found ${customersToEmail.length} unique customers to email (dry run: ${dryRun})`);

    if (dryRun) {
      return NextResponse.json({
        message: 'Dry run completed',
        customers: customersToEmail.map((c: Customer) => ({ name: c.name, email: c.email })),
        stats: { 
          total: customersToEmail.length, 
          sent: 0, 
          errors: 0,
          dryRun: true
        }
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{email: string, error: string}> = [];

    for (const customer of customersToEmail) {
      try {
        console.log(`Sending announcement email to ${customer.name} (${customer.email})...`);
        
        const result = await sendCustomerOwnedEmailAnnouncement(customer.email, customer.name);
        
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
      message: 'Announcement campaign completed',
      stats: {
        total: customersToEmail.length,
        sent: successCount,
        errors: errorCount,
        dryRun: false
      },
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('📊 Campaign Summary:', response.stats);
    
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error in announcement campaign:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

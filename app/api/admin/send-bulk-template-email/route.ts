import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBatchTemplateEmails } from '@/lib/email-templates/service';

interface Customer {
  name: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, templateId, sendToAll = false, customers, dryRun = false } = body;

    // Verify admin key
    const expectedAdminKey = process.env.ADMIN_API_KEY;
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let recipientList: Customer[] = [];

    if (sendToAll) {
      // Fetch all customers from database
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get customers from orders table (active customers)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('name, email')
        .not('email', 'is', null)
        .not('name', 'is', null)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
      }

      // Deduplicate by email
      const uniqueCustomers = new Map<string, Customer>();
      ordersData?.forEach(customer => {
        if (!uniqueCustomers.has(customer.email)) {
          uniqueCustomers.set(customer.email, {
            name: customer.name,
            email: customer.email
          });
        }
      });

      recipientList = Array.from(uniqueCustomers.values());
    } else if (customers && Array.isArray(customers)) {
      // Use provided customer list
      recipientList = customers;
    } else {
      return NextResponse.json({ 
        error: 'Either sendToAll must be true or customers array must be provided' 
      }, { status: 400 });
    }

    if (recipientList.length === 0) {
      return NextResponse.json({
        message: 'No customers found',
        stats: { total: 0, sent: 0, errors: 0 }
      });
    }

    // If dry run, just return the count
    if (dryRun) {
      return NextResponse.json({
        message: `Dry run: Would send to ${recipientList.length} customers`,
        stats: { 
          total: recipientList.length, 
          sent: 0, 
          errors: 0, 
          dryRun: true 
        },
        recipients: recipientList.slice(0, 10) // Show first 10 for preview
      });
    }

    // Send emails using batch service
    const emailRecipients = recipientList.map(customer => ({
      email: customer.email,
      props: { name: customer.name }
    }));

    const result = await sendBatchTemplateEmails(
      templateId,
      emailRecipients,
      { delayMs: 700 } // 700ms delay to respect Resend's 2 requests per second limit
    );

    return NextResponse.json({
      message: `Bulk email campaign completed`,
      stats: {
        total: result.total,
        sent: result.sent,
        errors: result.errors
      },
      results: result.results,
      templateId
    });

  } catch (error: any) {
    console.error('Error in send-bulk-template-email endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

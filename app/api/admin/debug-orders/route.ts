import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Debug endpoint to check what's in the orders table
 * 
 * POST /api/admin/debug-orders
 * 
 * Body:
 * {
 *   "adminKey": "your-admin-key",
 *   "action": "check" | "add-test-data"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, action = "check" } = body;

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

    if (action === "check") {
      // Check what's in the orders table
      const { data: allOrders, error: allError } = await supabase
        .from('orders')
        .select('*')
        .limit(10);

      if (allError) {
        return NextResponse.json({ 
          error: 'Database error', 
          details: allError.message 
        }, { status: 500 });
      }

      // Also check just name and email
      const { data: nameEmailOnly, error: nameEmailError } = await supabase
        .from('orders')
        .select('name, email')
        .not('email', 'is', null)
        .not('name', 'is', null)
        .limit(5);

      return NextResponse.json({
        message: 'Orders table debug info',
        totalOrders: allOrders?.length || 0,
        allOrders: allOrders || [],
        nameEmailFiltered: nameEmailOnly || [],
        nameEmailError: nameEmailError?.message || null
      });
    }

    if (action === "add-test-data") {
      // Add some test orders for testing the email system
      const testOrders = [
        {
          name: "Test Customer 1",
          email: "w088studio@gmail.com", // Your email for testing
          status: "ACTIVE",
          amount: 12.99,
          currency: "USD",
          description: "Adobe Creative Cloud - 1 Month",
          savings: 42.00,
          activation_type: "pre-activated",
          payment_processor: "test",
          original_status: "completed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          name: "Test Customer 2", 
          email: "test2@example.com",
          status: "ACTIVE",
          amount: 29.99,
          currency: "USD", 
          description: "Adobe Creative Cloud - 3 Months",
          savings: 134.98,
          activation_type: "pre-activated",
          payment_processor: "test",
          original_status: "completed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          name: "Test Customer 3",
          email: "test3@example.com", 
          status: "ACTIVE",
          amount: 99.99,
          currency: "USD",
          description: "Adobe Creative Cloud - 12 Months",
          savings: 499.89,
          activation_type: "self-activation",
          adobe_email: "test3@adobe.com",
          payment_processor: "test",
          original_status: "completed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      const { data: insertedOrders, error: insertError } = await supabase
        .from('orders')
        .insert(testOrders)
        .select();

      if (insertError) {
        return NextResponse.json({ 
          error: 'Failed to insert test data', 
          details: insertError.message 
        }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Test data added successfully',
        insertedOrders: insertedOrders || []
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

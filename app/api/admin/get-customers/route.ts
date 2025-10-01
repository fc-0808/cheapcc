import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to get customers from both profiles and orders tables
 * 
 * POST /api/admin/get-customers
 * 
 * Body:
 * {
 *   "adminKey": "your-admin-key"
 * }
 */

interface Customer {
  id: string;
  name: string;
  email: string;
  source: 'profiles' | 'orders';
  status?: string;
  amount?: number;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey } = body;

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

    // Fetch customers from profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, created_at')
      .not('email', 'is', null)
      .not('name', 'is', null)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Fetch customers from orders table
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, name, email, status, amount, currency, created_at')
      .not('email', 'is', null)
      .not('name', 'is', null)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Transform and combine data
    const customers: Customer[] = [];

    // Add profiles
    if (profilesData) {
      profilesData.forEach(profile => {
        customers.push({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          source: 'profiles',
          created_at: profile.created_at
        });
      });
    }

    // Add ALL orders (no deduplication - let frontend handle filtering)
    if (ordersData) {
      ordersData.forEach(order => {
        customers.push({
          id: order.id,
          name: order.name,
          email: order.email,
          source: 'orders',
          status: order.status,
          amount: order.amount,
          created_at: order.created_at
        });
      });
    }

    // Sort by created_at (newest first)
    customers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Calculate unique emails for stats
    const uniqueEmails = new Set(customers.map(c => c.email));

    return NextResponse.json({
      message: 'Customers fetched successfully',
      customers,
      stats: {
        total: customers.length,
        fromProfiles: profilesData?.length || 0,
        fromOrders: ordersData?.length || 0,
        uniqueEmails: uniqueEmails.size
      }
    });

  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import React from 'react';
import Link from 'next/link';
import { getPlanDuration } from '@/utils/products';

// Adobe's regular pricing (for savings calculation)
const ADOBE_REGULAR_PRICING = {
  '14 days': 23.99, // About $1.71/day for trial
  '14-Day': 23.99, // Alternative name format
  '1 month': 54.99,
  '3 months': 164.97, // $54.99 x 3
  '6 months': 329.94, // $54.99 x 6
  '12 months': 599.88, // $54.99 x 12 (annual price for monthly subscription)
};

// Helper to format currency
function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// Helper to calculate savings for an order
function calculateOrderSavings(order: any): number {
  if (!order.amount) return 0;
  
  const orderAmount = parseFloat(order.amount);
  if (isNaN(orderAmount)) return 0;
  
  // Try to determine the regular price based on description or plan name
  const description = order.description || '';
  
  // Check if the order has savings already calculated
  if (order.savings && !isNaN(parseFloat(order.savings))) {
    return parseFloat(order.savings);
  }
  
  // Calculate based on duration
  let regularPrice = 0;
  
  if (description.includes('14 days') || description.includes('14-Day')) {
    regularPrice = ADOBE_REGULAR_PRICING['14 days'];
  } else if (description.includes('1 month') || description.includes('30 days')) {
    regularPrice = ADOBE_REGULAR_PRICING['1 month'];
  } else if (description.includes('3 month') || description.includes('90 days')) {
    regularPrice = ADOBE_REGULAR_PRICING['3 months'];
  } else if (description.includes('6 month') || description.includes('180 days')) {
    regularPrice = ADOBE_REGULAR_PRICING['6 months'];
  } else if (description.includes('12 month') || description.includes('1 year') || description.includes('365 days')) {
    regularPrice = ADOBE_REGULAR_PRICING['12 months'];
  } else {
    // Default to 14-day price if we can't determine (instead of monthly)
    regularPrice = ADOBE_REGULAR_PRICING['14 days'];
  }
  
  const savings = regularPrice - orderAmount;
  return savings > 0 ? savings : 0;
}

// Helper to check if a subscription is active
function isActiveSubscription(order: any) {
  // Consider both ACTIVE and COMPLETED statuses as active for backwards compatibility
  if (order.status === 'ACTIVE' || order.status === 'COMPLETED') {
    // If we have an expiry date, check if it's in the future
    if (order.expiry_date) {
      const now = new Date();
      const expiry = new Date(order.expiry_date);
      return expiry > now;
    }
    // Without expiry date, assume it's active (will be fixed by webhook handler in the future)
    return true;
  }
  return false;
}

// Helper to calculate expiry date if missing
function calculateExpiryDateIfNeeded(order: any) {
  if (order.expiry_date) {
    return order.expiry_date;
  }
  
  // Calculate approximate expiry based on creation date
  const createdAt = new Date(order.created_at);
  const expiryDate = new Date(createdAt);
  
  // Default to 30 days from creation
  let days = 30;
  
  // Try to determine duration from description
  const description = order.description || '';
  if (description.includes('14 days')) {
    days = 14;
  } else if (description.includes('30 days') || description.includes('1 month')) {
    days = 30;
  } else if (description.includes('90 days') || description.includes('3 month')) {
    days = 90;
  } else if (description.includes('180 days') || description.includes('6 month')) {
    days = 180;
  } else if (description.includes('365 days') || description.includes('1 year')) {
    days = 365;
  }
  
  expiryDate.setDate(createdAt.getDate() + days);
  return expiryDate.toISOString();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user info (name, email)
  const userEmail = user.email || '';
  const userId = user.id;
  
  // Fetch profile from profiles table to get the updated name
  const { data: profileData } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle();
    
  // Use name from profile if available, otherwise fallback to user metadata
  const userName = profileData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Customer';

  // Fetch order stats
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('email', userEmail)
    .order('created_at', { ascending: false });
  const orders = data ?? [];

  // Calculate active orders using our helper function
  const activeOrders = orders.filter(isActiveSubscription);

  // Stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.amount) || 0), 0);
  
  // Calculate total savings properly by summing up the calculated savings for each order
  const totalSavings = orders.reduce((sum: number, order) => sum + calculateOrderSavings(order), 0);
  
  const recentOrders = orders.slice(0, 5);

  // Before rendering, update expired orders to INACTIVE if needed
  const now = new Date();
  const expiredOrderIds = orders
    .filter((order: any) => {
      if (!order.expiry_date) return false;
      const expiry = new Date(order.expiry_date);
      return expiry < now && order.status !== 'INACTIVE';
    })
    .map((order: any) => order.id);

  if (expiredOrderIds.length > 0) {
    // Update all expired orders to INACTIVE
    await supabase
      .from('orders')
      .update({ status: 'INACTIVE', updated_at: new Date().toISOString() })
      .in('id', expiredOrderIds);
  }

  return (
    <>
      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="dashboard-welcome">
            <h1>Welcome back, <b className="text-[#ff3366]">{userName}</b></h1>
            <p>Here's an overview of your account and services.</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Active Subscriptions</h3>
              <div className="stat-value">{activeOrders.length}</div>
              <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
            </div>
            <div className="stat-card">
              <h3>Total Orders</h3>
              <div className="stat-value">{totalOrders}</div>
              <div className="stat-icon"><i className="fas fa-shopping-cart"></i></div>
            </div>
            <div className="stat-card">
              <h3>Total Spent</h3>
              <div className="stat-value">{formatCurrency(totalSpent)}</div>
              <div className="stat-icon"><i className="fas fa-credit-card"></i></div>
            </div>
            <div className="stat-card">
              <h3>Total Saved</h3>
              <div className="stat-value">{formatCurrency(totalSavings)}</div>
              <div className="stat-icon"><i className="fas fa-piggy-bank"></i></div>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="content-card">
            <h2>
              Active Subscriptions
              <span className="badge">{activeOrders.length}</span>
            </h2>
            {activeOrders.length > 0 ? (
              activeOrders.map((order: any) => {
                // Calculate expiry date if not present
                const expiryDate = calculateExpiryDateIfNeeded(order);
                
                return (
                <div className="credential-card" key={order.id}>
                  <h3>{order.description || 'Adobe CC Plan'}</h3>
                  <ul className="credential-details">
                    <li>
                      <span className="detail-label">Order Number</span>
                      <span className="detail-value">{order.paypal_order_id || order.id}</span>
                    </li>
                    <li>
                      <span className="detail-label">Status</span>
                      <span className="detail-value">
                        <span className="status-badge active">Active</span>
                      </span>
                    </li>
                    <li>
                      <span className="detail-label">Purchase Date</span>
                      <span className="detail-value">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</span>
                    </li>
                    <li>
                      <span className="detail-label">Expires</span>
                        <span className="detail-value">{expiryDate ? new Date(expiryDate).toLocaleDateString() : '-'}</span>
                    </li>
                    <li>
                      <span className="detail-label">Adobe Account</span>
                      <span className="detail-value">{order.adobe_email || order.email}</span>
                    </li>
                  </ul>
                </div>
                );
              })
            ) : (
              <div className="empty-state">
                <i className="fas fa-box-open"></i>
                <p>You don't have any active subscriptions.</p>
                {recentOrders.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      Have you recently made a purchase? You may need to refresh your dashboard data.
                    </p>
                  </div>
                )}
                <Link href="/#pricing" className="btn btn-accent mt-3">View Available Plans</Link>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="content-card">
            <h2>
              Recent Orders
              <Link href="/dashboard/orders" className="btn btn-sm btn-outline">View All</Link>
            </h2>
            {recentOrders.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => {
                    // Determine if order is active
                    const isActive = isActiveSubscription(order);
                    return (
                    <tr key={order.id}>
                      <td>{order.paypal_order_id || order.id}</td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                      <td>{getPlanDuration(order)}</td>
                      <td>{formatCurrency(parseFloat(order.amount) || 0)}</td>
                      <td>
                          <span className={`status-badge ${isActive ? 'active' : order.status?.toLowerCase()}`}>
                            {isActive ? 'Active' : order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : '-'}
                          </span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <i className="fas fa-shopping-cart"></i>
                <p>You haven't placed any orders yet.</p>
                <Link href="/#pricing" className="btn btn-accent">Browse Plans</Link>
              </div>
            )}
          </div>

          {/* Account Help */}
          <div className="content-card">
            <h2>Need Help?</h2>
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i>
              <div>
                <strong>Having trouble with your account?</strong>
                <p>Our support team is here to help. You can reach out via our support page or contact us directly at <a href="mailto:support@cheapcc.online">support@cheapcc.online</a></p>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link href="/support" className="btn btn-outline">Contact Support</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 
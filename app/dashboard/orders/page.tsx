import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import Link from 'next/link';
import React from 'react';

// Helper to format currency
function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// Helper to check if a subscription is active
function isActiveSubscription(order: any) {
  if (order.status === 'ACTIVE' || order.status === 'COMPLETED') {
    if (order.expiry_date) {
      const now = new Date();
      const expiry = new Date(order.expiry_date);
      return expiry > now;
    }
    return true;
  }
  return false;
}

// Add a helper to infer plan duration
function getPlanDuration(order: any): string {
  const description = order.description || order.plan_name || '';
  const amount = parseFloat(order.amount);
  if (/14\s*-?\s*days?/i.test(description)) return '14 days';
  if (/1\s*-?\s*month|30\s*-?\s*days?/i.test(description)) return '1 month';
  if (/3\s*-?\s*months?|90\s*-?\s*days?/i.test(description)) return '3 months';
  if (/6\s*-?\s*months?|180\s*-?\s*days?/i.test(description)) return '6 months';
  if (/12\s*-?\s*months?|1\s*-?\s*year|365\s*-?\s*days?/i.test(description)) return '12 months';
  if (amount === 4.99) return '14 days';
  if (amount === 14.99) return '1 month';
  if (amount === 39.99) return '3 months';
  if (amount === 64.99) return '6 months';
  if (amount === 124.99) return '12 months';
  return 'Unknown';
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userEmail = user.email || '';
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('email', userEmail)
    .order('created_at', { ascending: false });
  const orders = data ?? [];

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <h1>All Orders</h1>
          <p>Below is a list of all your orders.</p>
          <Link href="/dashboard" className="btn btn-outline mt-4">&larr; Back to Dashboard</Link>
        </div>
        <div className="content-card mt-6">
          {orders.length > 0 ? (
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
                {orders.map((order: any) => {
                  const isActive = isActiveSubscription(order);
                  return (
                    <tr key={order.id}>
                      <td>{order.paypal_order_id || order.id}</td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                      <td>{getPlanDuration(order)}</td>
                      <td>{formatCurrency(parseFloat(order.amount) || 0)}</td>
                      <td>
                        <span className={`status-badge ${isActive ? 'active' : order.status?.toLowerCase()}`}>{
                          isActive
                            ? 'Active'
                            : order.status
                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()
                            : '-'
                        }</span>
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
      </main>
    </div>
  );
} 
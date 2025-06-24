import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import Link from 'next/link';
import React from 'react';
import { getPlanDuration, formatCurrency, isActiveSubscription } from '@/utils/products';

export default async function OrdersContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('email', user.email || '')
    .order('created_at', { ascending: false });
  const orders = data ?? [];

  return (
    <div className="content-card">
      <div className="content-card-header">
        <h2>Full Order History</h2>
        <Link 
          href="/dashboard" 
          prefetch={false}
          className="btn btn-sm btn-outline"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </Link>
      </div>
      {orders.length > 0 ? (
        <div className="data-table-wrapper mt-4">
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
                const statusText = isActive ? 'Active' : (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Expired');
                const statusClass = isActive ? 'active' : order.status?.toLowerCase() === 'completed' ? 'completed' : order.status?.toLowerCase() === 'pending' ? 'pending' : 'cancelled';
                return (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.paypal_order_id || order.id}</td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                    <td className="font-medium">{getPlanDuration(order)}</td>
                    <td className="font-medium">{formatCurrency(parseFloat(order.amount) || 0)}</td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-shopping-cart"></i>
          <h3>You haven't placed any orders yet.</h3>
          <p>Start by browsing our affordable plans.</p>
          <Link href="/#pricing" prefetch={false} className="btn btn-accent btn-sm">Browse Plans</Link>
        </div>
      )}
    </div>
  );
}
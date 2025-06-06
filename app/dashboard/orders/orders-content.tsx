import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import Link from 'next/link';
import React from 'react';
import { getPlanDuration, formatCurrency, isActiveSubscription, OrderLike } from '@/utils/products';

export default async function OrdersContent() {
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
    <div className="content-card -mt-6">
      <div className="flex justify-between items-center">
        <h2>Order History</h2>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center px-4 py-2 bg-[#2c2d5a] hover:bg-[#3e3f7d] text-white font-medium rounded-md transition-colors duration-200 shadow-sm cursor-pointer"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </Link>
      </div>
      {orders.length > 0 ? (
        <div className="table-responsive mt-4">
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
                      <span className={`status-badge ${isActive ? 'active' : order.status?.toLowerCase() || 'pending'}`}>
                        {isActive
                          ? 'Active'
                          : order.status
                          ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()
                          : 'Pending'}
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
          <p>You haven't placed any orders yet.</p>
          <Link href="/#pricing" className="btn btn-accent">Browse Plans</Link>
        </div>
      )}
    </div>
  );
} 
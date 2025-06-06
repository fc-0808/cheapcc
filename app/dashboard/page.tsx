// app/dashboard/page.tsx

import { createClient } from '@/utils/supabase/supabase-server';
import Link from 'next/link';
import React from 'react';
import { 
  getPlanDuration, 
  calculateSavings, 
  isActiveSubscription, 
  formatCurrency, 
  calculateExpiryDate, 
} from '@/utils/products';

// This is the content for the app/dashboard route
export default async function DashboardPageContent() {
  const supabase = await createClient();
  // We don't need to get the user again, layout does that. We just need the data.
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email || '';

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('email', userEmail)
    .order('created_at', { ascending: false });
  const orders = data ?? [];

  const activeOrders = orders.filter(isActiveSubscription);
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.amount) || 0), 0);
  const totalSavings = orders.reduce((sum: number, order) => sum + calculateSavings(order), 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <>
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
          activeOrders.map((order: any, index: number) => {
            // Calculate expiry date if not present
            const expiryDate = calculateExpiryDate(order);
            
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
          <div className="table-responsive">
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
          </div>
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
            <p className="hidden md:block">Our support team is here to help. You can reach out via our support page or contact us directly at <a href="mailto:cheapcconline@gmail.com">cheapcconline@gmail.com</a></p>
            <p className="block md:hidden">Contact us directly at <a href="mailto:cheapcconline@gmail.com">cheapcconline@gmail.com</a></p>
          </div>
        </div>
        <div className="text-center mt-4">
          <Link href="mailto:cheapcconline@gmail.com" className="btn btn-outline">Contact Support</Link>
        </div>
      </div>
    </>
  );
} 
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import React from 'react';
import Link from 'next/link';

// Helper to format currency
function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
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

  // Stats
  const activeOrders = orders.filter((o: any) => o.status === 'ACTIVE');
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.amount) || 0), 0);
  const totalSavings = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.savings) || 0), 0); // If you store savings
  const recentOrders = orders.slice(0, 5);

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
              activeOrders.map((order: any) => (
                <div className="credential-card" key={order.id}>
                  <h3>{order.plan_name || order.description || 'Adobe CC Plan'}</h3>
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
                      <span className="detail-value">{order.expiry_date ? new Date(order.expiry_date).toLocaleDateString() : '-'}</span>
                    </li>
                    <li>
                      <span className="detail-label">Adobe Account</span>
                      <span className="detail-value">{order.adobe_email || order.email}</span>
                    </li>
                    <li>
                      <span className="detail-label">Password</span>
                      <span className="detail-value">
                        <span className="credential-password">••••••••</span>
                        <button className="btn-show-password" title="Show Password" type="button" tabIndex={-1} disabled>
                          <i className="fas fa-eye"></i>
                        </button>
                      </span>
                    </li>
                  </ul>
                  <div className="credential-actions">
                    <Link href={`/credentials/${order.id}`} className="btn btn-sm btn-outline">View Details</Link>
                    <Link href={`/support?order=${order.paypal_order_id || order.id}`} className="btn btn-sm btn-ghost">Report Issue</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-box-open"></i>
                <p>You don't have any active subscriptions.</p>
                <Link href="/#pricing" className="btn btn-accent">View Available Plans</Link>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="content-card">
            <h2>
              Recent Orders
              <Link href="/orders" className="btn btn-sm btn-outline">View All</Link>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td>{order.paypal_order_id || order.id}</td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                      <td>{order.plan_name || order.description || 'Adobe CC Plan'}</td>
                      <td>{formatCurrency(parseFloat(order.amount) || 0)}</td>
                      <td>
                        <span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : '-'}</span>
                      </td>
                      <td>
                        <Link href={`/orders/${order.id}`} className="table-action">
                          <i className="fas fa-eye"></i> View
                        </Link>
                      </td>
                    </tr>
                  ))}
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
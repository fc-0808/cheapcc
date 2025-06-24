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

export default async function DashboardPageContent() {
  const supabase = await createClient();
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

  // Helper function to get expiry date (prioritize stored expiry_date over calculated)
  const getExpiryDate = (order: any): Date | null => {
    if (order.expiry_date) {
      return new Date(order.expiry_date);
    }
    return calculateExpiryDate(order);
  };

  // Helper function to calculate days left
  const calculateDaysLeft = (expiryDate: Date | null): number => {
    if (!expiryDate) return 0;
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper function to get days left indicator class and icon
  const getDaysLeftIndicator = (daysLeft: number) => {
    if (daysLeft <= 0) return { class: 'critical', icon: 'fa-exclamation-circle' };
    if (daysLeft <= 7) return { class: 'critical', icon: 'fa-exclamation-circle' };
    if (daysLeft <= 14) return { class: 'warning', icon: 'fa-exclamation-triangle' };
    return { class: 'good', icon: 'fa-check-circle' };
  };

  const stats = [
    { title: 'Active Subscriptions', value: activeOrders.length, icon: 'fa-check-circle' },
    { title: 'Total Orders', value: totalOrders, icon: 'fa-shopping-cart' },
    { title: 'Total Spent', value: formatCurrency(totalSpent), icon: 'fa-credit-card' },
    { title: 'Total Saved', value: formatCurrency(totalSavings), icon: 'fa-piggy-bank' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards - Hidden on mobile */}
      <div className="stats-grid">
        {stats.map(stat => (
          <div className="stat-card" key={stat.title}>
            <h3>{stat.title}</h3>
            <div className="stat-icon">
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div className="stat-value">
              {stat.value}
              </div>
          </div>
        ))}
      </div>

      {/* Mobile Summary - Only visible on small screens */}
      <div className="sm:hidden mobile-stats-summary">
        <div className="mobile-stats-item">
          <span className="mobile-stats-label">
            <i className="fas fa-check-circle"></i>
            Active Plans
          </span>
          <span className="mobile-stats-value">{activeOrders.length}</span>
        </div>
        <div className="mobile-stats-item">
          <span className="mobile-stats-label">
            <i className="fas fa-shopping-cart"></i>
            Total Orders
          </span>
          <span className="mobile-stats-value">{totalOrders}</span>
        </div>
        <div className="mobile-stats-item">
          <span className="mobile-stats-label">
            <i className="fas fa-credit-card"></i>
            Total Spent
          </span>
          <span className="mobile-stats-value">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="mobile-stats-item">
          <span className="mobile-stats-label">
            <i className="fas fa-piggy-bank"></i>
            Total Saved
          </span>
          <span className="mobile-stats-value accent">{formatCurrency(totalSavings)}</span>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="content-card">
        <div className="content-card-header">
          <h2>Active Subscriptions</h2>
          <span className="badge">{activeOrders.length}</span>
        </div>
        {activeOrders.length > 0 ? (
          <div className="space-y-4">
            {activeOrders.map((order: any) => {
              const expiryDate = getExpiryDate(order);
              const daysLeft = calculateDaysLeft(expiryDate);
              const indicator = getDaysLeftIndicator(daysLeft);
              return (
                <div className="credential-card" key={order.id}>
                  <div className="flex justify-between items-center mb-3">
                    <h3>{order.description || 'Adobe CC Plan'}</h3>
                    <span className="status-badge active">Active</span>
                  </div>
                  <ul className="credential-details">
                    <li><span className="detail-label">Order ID:</span> <span className="detail-value">{order.paypal_order_id || order.id}</span></li>
                    <li><span className="detail-label">Purchased:</span> <span className="detail-value">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span></li>
                    <li><span className="detail-label">Expires:</span> <span className="detail-value">{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</span></li>
                    <li>
                      <span className="detail-label">Days Left:</span> 
                      <span className="detail-value">
                        {daysLeft > 0 ? (
                          <span className={`days-left-indicator ${indicator.class}`}>
                            <i className={`fas ${indicator.icon}`}></i>
                            {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                          </span>
                        ) : (
                          <span className="days-left-indicator critical">
                            <i className="fas fa-exclamation-circle"></i>
                            Expired
                          </span>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-box-open"></i>
            <h3>No active subscriptions</h3>
            <p>Your active plans will appear here.</p>
            <Link href="/#pricing" prefetch={false} className="btn btn-accent btn-sm">View Plans</Link>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="content-card">
        <div className="content-card-header">
          <h2>Recent Order History</h2>
          <Link href="/dashboard/orders" prefetch={false} className="btn btn-sm btn-outline">View All</Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Order #</th><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => {
                  const isActive = isActiveSubscription(order);
                  const statusText = isActive ? 'Active' : (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Expired');
                  const statusClass = isActive ? 'active' : order.status?.toLowerCase() === 'completed' ? 'completed' : order.status?.toLowerCase() === 'pending' ? 'pending' : 'cancelled';
                  return (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.paypal_order_id || order.id}</td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="font-medium">{getPlanDuration(order)}</td>
                    <td className="font-medium">{formatCurrency(parseFloat(order.amount) || 0)}</td>
                    <td><span className={`status-badge ${statusClass}`}>{statusText}</span></td>
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
    </div>
  );
}
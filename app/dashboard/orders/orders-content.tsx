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
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Order History
        </h1>
        <Link 
          href="/dashboard" 
          prefetch={false}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white hover:bg-white/15 transition flex items-center gap-2 text-sm font-medium"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Complete Order History</h2>
          <p className="text-gray-400 text-sm mt-1">View all your subscription orders and their current status</p>
        </div>
        
        {orders.length > 0 ? (
          <div className="overflow-x-auto responsive-table-container">
            <table className="w-full text-left data-table-responsive">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order: any) => {
                  const isActive = isActiveSubscription(order);
                  const statusText = isActive ? 'Active' : (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Expired');
                  let statusClass;
                  
                  if (isActive) {
                    statusClass = 'bg-green-500/20 text-green-400 border-green-500/30';
                  } else if (order.status?.toLowerCase() === 'completed') {
                    statusClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                  } else if (order.status?.toLowerCase() === 'pending') {
                    statusClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
                  } else {
                    statusClass = 'bg-red-500/20 text-red-400 border-red-500/30';
                  }
                  
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-300" data-label="Order ID">
                        {order.paypal_order_id || order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300" data-label="Date">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white" data-label="Plan">
                        {getPlanDuration(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white" data-label="Amount">
                        {formatCurrency(parseFloat(order.amount) || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-label="Status">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-400' : order.status?.toLowerCase() === 'completed' ? 'bg-blue-400' : order.status?.toLowerCase() === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
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
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4">
              <i className="fas fa-shopping-cart text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No orders yet</h3>
            <p className="text-gray-400 max-w-md mb-6">You haven't placed any orders yet. Browse our affordable plans to get started with Adobe Creative Cloud.</p>
            <Link 
              href="/#pricing" 
              prefetch={false} 
              className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
            >
              Browse Plans
            </Link>
          </div>
        )}
        
        {orders.length > 0 && (
          <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-sm text-gray-400">
              Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
            <div className="text-sm text-gray-400">
              Need help? <a href="/faq" className="text-fuchsia-400 hover:underline">Visit our FAQ</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
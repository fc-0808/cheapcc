"use client";
import { useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import useSWR from 'swr';
import { fetcher, getApiUrl, extractSWRError } from '@/utils/fetcher';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import Link from 'next/link';
import { getPlanDuration, formatCurrency, isActiveSubscription } from '@/utils/products';

interface Order {
  id: string;
  paypal_order_id?: string;
  stripe_payment_intent_id?: string;
  name: string;
  email: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  savings: number;
  expiry_date: string | null;
  original_status: string;
  payment_processor: string;
  activation_type: string;
  adobe_email?: string;
  created_at: string;
  updated_at: string;
}

interface OrdersContentProps {
  user: User | null;
}

export default function OrdersContent({ user }: OrdersContentProps) {
  const { data: orders, error, isLoading, mutate } = useSWR<Order[]>(
    user ? getApiUrl('/orders') : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 10000, // 10 seconds
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const errorDetails = useMemo(() => {
    if (!error) return null;
    return extractSWRError(error);
  }, [error]);

  // Derived data calculations
  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [orders]);

  const hasActiveSubscriptions = useMemo(() => {
    if (!orders) return false;
    return orders.some(order => order.status === 'active');
  }, [orders]);

  const calculateDaysLeft = (endDate: string | null) => {
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getOrderId = (order: Order) => {
    return order.paypal_order_id || order.stripe_payment_intent_id || order.id.slice(0, 8);
  };

  const getPaymentMethodIcon = (processor: string) => {
    switch (processor.toLowerCase()) {
      case 'paypal':
        return 'fab fa-paypal';
      case 'stripe':
        return 'fab fa-stripe';
      default:
        return 'fas fa-credit-card';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const refreshOrders = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3366]"></div>
      </div>
    );
  }

  if (errorDetails) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
        <p className="text-red-300 mb-4">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {errorDetails.message || 'Error loading orders'}
        </p>
        <button 
          onClick={refreshOrders}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-md transition-colors"
        >
          <i className="fas fa-sync-alt mr-2"></i> Try Again
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-shopping-cart text-4xl mb-4"></i>
        <h3>No Orders Yet</h3>
        <p>You haven&apos;t placed any orders yet. Browse our pricing options to get started.</p>
        <a href="/#pricing" className="btn btn-accent mt-4">View Pricing</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasActiveSubscriptions && (
        <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3 text-emerald-300">
            <i className="fas fa-check-circle text-2xl"></i>
            <p className="font-medium">You have active Adobe Creative Cloud subscription(s)!</p>
          </div>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="text-left">Order ID</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Product</th>
              <th className="text-center">Amount</th>
              <th className="text-center">Status</th>
              <th className="text-center hidden lg:table-cell">Payment</th>
              <th className="text-center hidden md:table-cell">Created</th>
              <th className="text-center hidden md:table-cell">Expires</th>
              <th className="text-center hidden lg:table-cell">Time Left</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => {
              const daysLeft = calculateDaysLeft(order.expiry_date);
              let daysLeftClass = "good";
              
              if (daysLeft !== null) {
                if (daysLeft <= 3) {
                  daysLeftClass = "critical";
                } else if (daysLeft <= 7) {
                  daysLeftClass = "warning";
                }
              }

              return (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="font-mono text-sm">
                    <span className="text-blue-400">#{getOrderId(order)}</span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{order.name}</span>
                      <span className="text-xs text-gray-400">{order.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.description}</span>
                      <span className="text-xs text-green-400">
                        <i className="fas fa-tag mr-1"></i>
                        Save ${order.savings}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="font-semibold text-green-400">
                      {formatCurrency(order.amount, order.currency)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center">
                      <i className={`${getPaymentMethodIcon(order.payment_processor)} text-lg mr-2`}></i>
                      <span className="text-sm capitalize">{order.payment_processor}</span>
                    </div>
                  </td>
                  <td className="text-center hidden md:table-cell">
                    <span className="text-gray-300 text-sm">{formatDate(order.created_at)}</span>
                  </td>
                  <td className="text-center hidden md:table-cell">
                    <span className="text-gray-300 text-sm">{formatDate(order.expiry_date)}</span>
                  </td>
                  <td className="text-center hidden lg:table-cell">
                    {daysLeft !== null ? (
                      <span className={`days-left-indicator ${daysLeftClass} text-sm`}>
                        <i className={`fas ${daysLeftClass === "critical" ? "fa-exclamation-circle" : daysLeftClass === "warning" ? "fa-clock" : "fa-calendar-check"} mr-1`}></i>
                        {daysLeft}d
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
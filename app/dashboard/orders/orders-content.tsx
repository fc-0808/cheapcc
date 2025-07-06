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
  user_id: string;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  email_sent: boolean;
  adobe_id: string;
  adobe_password: string;
  adobe_password_hint: string;
  subscription_type: string;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_intent_id?: string;
  payment_id?: string;
  amount: number;
  invoice_id?: string;
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
              <th>Type</th>
              <th>Status</th>
              <th className="hidden sm:table-cell">Created</th>
              <th className="hidden sm:table-cell">Expires</th>
              <th className="hidden md:table-cell">Time Left</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => {
              const daysLeft = calculateDaysLeft(order.subscription_end);
              let daysLeftClass = "good";
              
              if (daysLeft !== null) {
                if (daysLeft <= 3) {
                  daysLeftClass = "critical";
                } else if (daysLeft <= 7) {
                  daysLeftClass = "warning";
                }
              }

              return (
                <tr key={order.id}>
                  <td>
                    <span className="font-medium">{order.subscription_type || 'Adobe CC'}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="text-gray-300">{formatDate(order.created_at)}</span>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="text-gray-300">{formatDate(order.subscription_end)}</span>
                  </td>
                  <td className="hidden md:table-cell">
                    {daysLeft !== null ? (
                      <span className={`days-left-indicator ${daysLeftClass}`}>
                        <i className={`fas ${daysLeftClass === "critical" ? "fa-exclamation-circle" : daysLeftClass === "warning" ? "fa-clock" : "fa-calendar-check"} mr-2`}></i>
                        {daysLeft} days
                      </span>
                    ) : (
                      <span>-</span>
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
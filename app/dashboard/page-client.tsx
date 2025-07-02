'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, Variants } from 'framer-motion';

interface ProcessedOrder {
  id: string;
  description?: string;
  paypal_order_id?: string;
  created_at?: string;
  status?: string;
  amount?: string;
  expiryDate?: string | null;
  daysLeft?: number;
  planDuration?: string;
  formattedAmount?: string;
  formattedDate?: string;
  isActive?: boolean;
}

interface Stat {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

interface ClientDashboardProps {
  stats: Stat[];
  activeOrders: ProcessedOrder[];
  recentOrders: ProcessedOrder[];
}

export default function ClientDashboard({ 
  stats, 
  activeOrders, 
  recentOrders
}: ClientDashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(dashboardRef, { once: true, amount: 0.2 });
  const [particles, setParticles] = useState<Array<{top: number, left: number, size: number, delay: number}>>([]);
  
  // Generate particles for background effect
  useEffect(() => {
    setParticles(
      Array.from({ length: 10 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  // Helper function to get days left indicator class and icon
  const getDaysLeftIndicator = (daysLeft: number) => {
    if (daysLeft <= 0) return { class: 'critical', icon: 'fa-exclamation-circle' };
    if (daysLeft <= 7) return { class: 'critical', icon: 'fa-exclamation-circle' };
    if (daysLeft <= 14) return { class: 'warning', icon: 'fa-exclamation-triangle' };
    return { class: 'good', icon: 'fa-check-circle' };
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: i * 0.1
      }
    })
  };

  return (
    <div ref={dashboardRef} className="relative space-y-8 pb-12">
      {/* Background particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white opacity-30 pointer-events-none"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.5)`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.2, 0.8],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {stats.map((stat: Stat, index: number) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 overflow-hidden shadow-lg"
            whileHover={{ 
              y: -5, 
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
              scale: 1.02
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              mass: 0.8 
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">{stat.title}</h3>
                <div 
                  className="w-10 h-10 flex items-center justify-center rounded-full text-lg"
                  style={{ 
                    background: `${stat.color}20`,
                    color: stat.color,
                    boxShadow: `0 0 15px ${stat.color}30`
                  }}
                >
                  <i className={`fas ${stat.icon}`}></i>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
            
            {/* Gradient background */}
            <motion.div 
              className="absolute inset-0 opacity-10"
              style={{ 
                background: `radial-gradient(circle at 30% 107%, ${stat.color}30 0%, ${stat.color}05 70%)`,
              }}
              animate={{ 
                opacity: [0.05, 0.15, 0.05],
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Active Subscriptions */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between p-5 border-b border-white/10"
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Active Subscriptions
            </span>
          </h2>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-fuchsia-500/20 text-fuchsia-300">
            {activeOrders.length}
          </span>
        </motion.div>
        
        <div className="p-5">
          <AnimatePresence>
            {activeOrders.length > 0 ? (
              <motion.div className="space-y-4">
                {activeOrders.map((order: ProcessedOrder, index: number) => {
                  const daysLeft = order.daysLeft || 0;
                  const indicator = getDaysLeftIndicator(daysLeft);
                  return (
                    <motion.div
                      key={order.id}
                      custom={index}
                      variants={cardVariants}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)' 
                      }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-white">{order.description || 'Adobe CC Plan'}</h3>
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300">
                          Active
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Order ID</div>
                          <div className="font-mono text-gray-200 truncate">{order.paypal_order_id || order.id}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Purchased</div>
                          <div className="text-gray-200">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Expires</div>
                          <div className="text-gray-200">
                            {order.expiryDate ? new Date(order.expiryDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Days Left</div>
                          <div>
                            {daysLeft > 0 ? (
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                indicator.class === 'critical' ? 'bg-red-500/20 text-red-300' :
                                indicator.class === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                                'bg-green-500/20 text-green-300'
                              }`}>
                                <i className={`fas ${indicator.icon}`}></i>
                                {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium">
                                <i className="fas fa-exclamation-circle"></i>
                                Expired
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                variants={itemVariants}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 text-gray-400 mb-4">
                  <i className="fas fa-box-open text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No active subscriptions</h3>
                <p className="text-gray-400 mb-6">Your active plans will appear here.</p>
                <Link 
                  href="/#pricing" 
                  prefetch={false} 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:-translate-y-1"
                >
                  <i className="fas fa-tag"></i>
                  View Plans
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between p-5 border-b border-white/10"
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Recent Order History
            </span>
          </h2>
          <Link 
            href="/dashboard/orders" 
            prefetch={false} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all duration-300"
          >
            View All
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </motion.div>
        
        <div className="p-5">
          <AnimatePresence>
            {recentOrders.length > 0 ? (
              <motion.div 
                variants={itemVariants}
                className="overflow-x-auto"
              >
                <table className="w-full text-left">
                  <thead className="text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-3 py-3 font-medium">Order #</th>
                      <th className="px-3 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium">Plan</th>
                      <th className="px-3 py-3 font-medium">Amount</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentOrders.map((order: ProcessedOrder, index: number) => {
                      const isActive = order.isActive;
                      const statusText = isActive ? 'Active' : (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Expired');
                      
                      let statusClass = '';
                      if (isActive) statusClass = 'bg-green-500/20 text-green-300';
                      else if (order.status?.toLowerCase() === 'completed') statusClass = 'bg-blue-500/20 text-blue-300';
                      else if (order.status?.toLowerCase() === 'pending') statusClass = 'bg-amber-500/20 text-amber-300';
                      else statusClass = 'bg-gray-500/20 text-gray-300';
                      
                      return (
                        <motion.tr 
                          key={order.id}
                          custom={index}
                          variants={cardVariants}
                          className="hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="px-3 py-3 font-mono text-xs text-gray-300">{order.paypal_order_id || order.id}</td>
                          <td className="px-3 py-3 text-gray-300">{order.formattedDate || 'N/A'}</td>
                          <td className="px-3 py-3 text-gray-200 font-medium">{order.planDuration || 'Unknown'}</td>
                          <td className="px-3 py-3 text-gray-200 font-medium">{order.formattedAmount || '$0'}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                              {statusText}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div 
                variants={itemVariants}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 text-gray-400 mb-4">
                  <i className="fas fa-shopping-cart text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">You haven't placed any orders yet</h3>
                <p className="text-gray-400 mb-6">Start by browsing our affordable plans.</p>
                <Link 
                  href="/#pricing" 
                  prefetch={false} 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:-translate-y-1"
                >
                  <i className="fas fa-tag"></i>
                  Browse Plans
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
} 
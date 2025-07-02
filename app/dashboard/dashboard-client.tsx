'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Client component to handle client-side logic
export default function DashboardClient({ 
  children, 
  userName 
}: { 
  children: React.ReactNode; 
  userName: string;
}) {
  const router = useRouter();
  
  // Force a router refresh when the dashboard loads to ensure header is updated
  useEffect(() => {
    router.refresh();
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
} 
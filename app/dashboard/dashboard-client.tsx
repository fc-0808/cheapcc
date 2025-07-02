'use client';

import React, { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);
  
  // Force a router refresh when the dashboard loads to ensure header is updated
  useEffect(() => {
    // Mark the component as mounted to avoid hydration issues
    setMounted(true);
    
    // Ensure Font Awesome is loaded for dashboard
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('fa-loaded');
    }
    
    // Force a page refresh to ensure all state is correctly loaded
    router.refresh();
    
    // Add a class to body to indicate dashboard mode
    if (typeof document !== 'undefined') {
      document.body.classList.add('dashboard-mode');
      document.documentElement.classList.add('dark-theme');
      
      // Clean up function
      return () => {
        document.body.classList.remove('dashboard-mode');
        document.documentElement.classList.remove('dark-theme');
      };
    }
  }, [router]);
  
  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

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
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  return <>{children}</>;
} 
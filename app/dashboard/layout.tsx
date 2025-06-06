import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import Link from 'next/link';
import React from 'react';
import DashboardClient from './dashboard-client';

// This is the shared layout for all dashboard pages (server component)
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userId = user.id;
  const { data: profileData } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle();
    
  const userName = profileData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Customer';

  return (
    <DashboardClient userName={userName}>
      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="dashboard-welcome">
            {/* This welcome message will now appear on ALL dashboard pages */}
            <h1>Welcome back, <span className="text-[#ff3366] font-extrabold">{userName}</span></h1>
            <p>Here's an overview of your account and services.</p>
          </div>

          {/* The unique page content (like stats or the orders table) will be rendered here */}
          {children}

        </main>
      </div>
    </DashboardClient>
  );
} 
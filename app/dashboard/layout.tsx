import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import React from 'react';
import DashboardClient from './dashboard-client';

export default async function DashboardLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const isNewUser = searchParams?.welcome === 'new';

  const { data: profileData } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();
    
  const userName = profileData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Customer';

  return (
    <DashboardClient userName={userName}>
      <div className="dashboard-container">
        <main className="dashboard-content max-w-7xl mx-auto w-full">
          <div className="dashboard-welcome">
            {isNewUser ? (
              <>
                <h1>Welcome to CheapCC, <span>{userName}</span>!</h1>
                <p>Your account is ready. Manage your subscriptions and profile below.</p>
              </>
            ) : (
              <>
                <h1>Welcome back, <span>{userName}</span></h1>
                <p>Here's an overview of your account and services.</p>
              </>
            )}
          </div>

          {children}
        </main>
      </div>
    </DashboardClient>
  );
}
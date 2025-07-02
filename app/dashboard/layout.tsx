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
      <div className="min-h-screen bg-[#0f111a] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-[#1e1e3f]/50 to-transparent pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#1e1e3f]/30 to-transparent pointer-events-none z-0"></div>
        
        {/* Content container - Added pt-24 to fix header overlap */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pb-12 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 sm:mb-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 shadow-lg">
              {isNewUser ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Welcome to CheapCC, <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">{userName}</span>!
                  </h1>
                  <p className="text-white/70 text-base sm:text-lg">Your account is ready. Manage your subscriptions and profile below.</p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Welcome back, <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">{userName}</span>
                  </h1>
                  <p className="text-white/70 text-base sm:text-lg">Here's an overview of your account and services.</p>
                </>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>
    </DashboardClient>
  );
}
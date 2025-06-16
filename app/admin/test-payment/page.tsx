import { createClient } from '@/utils/supabase/supabase-server';
import { redirect } from 'next/navigation';
import TestPaymentClient from './test-payment-client';

export const metadata = {
  title: 'Admin - Test Payment ($0.01)',
  description: 'Test the payment flow with a minimal amount payment',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TestPaymentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Admin-only check
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  return <TestPaymentClient userEmail={user.email || ''} userId={user.id} />;
}

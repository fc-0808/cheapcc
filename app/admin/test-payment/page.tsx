import { createClient } from '@/utils/supabase/supabase-server';
import { redirect } from 'next/navigation';
import AlternateTestPaymentClientPage from './alternate-client-page';
import { User } from '@supabase/supabase-js';

export default async function TestPaymentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protect the route by checking for the admin email
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/');
  }

  // If the user is the admin, render the alternate client component with user details
  return <AlternateTestPaymentClientPage user={user} />;
} 
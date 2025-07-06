import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-server';
import Link from 'next/link';
import OrdersContent from './orders-content';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Order History
        </h1>
        <Link
          href="/dashboard"
          prefetch={false}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white hover:bg-white/15 transition flex items-center gap-2 text-sm font-medium"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Complete Order History</h2>
          <p className="text-gray-400 text-sm mt-1">View all your subscription orders and their current status</p>
        </div>

        <OrdersContent user={user} />

        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-gray-400">
            Need help? <a href="/faq" className="text-fuchsia-400 hover:underline">Visit our FAQ</a>
          </div>
        </div>
      </div>
    </div>
  );
} 
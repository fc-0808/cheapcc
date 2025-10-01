import { createClient } from '@supabase/supabase-js';
import { 
  UsersIcon, 
  EnvelopeIcon, 
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

async function getAdminStats() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get total customers
  const { count: totalCustomers } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Get active customers
  const { count: activeCustomers } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ACTIVE');

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('orders')
    .select('amount')
    .eq('status', 'ACTIVE');

  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

  // Get unique customers
  const { data: uniqueCustomersData } = await supabase
    .from('orders')
    .select('email')
    .not('email', 'is', null);

  const uniqueEmails = new Set(uniqueCustomersData?.map(order => order.email) || []);

  return {
    totalOrders: totalCustomers || 0,
    activeOrders: activeCustomers || 0,
    totalRevenue,
    uniqueCustomers: uniqueEmails.size
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Orders',
      value: stats.activeOrders,
      icon: UsersIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Unique Customers',
      value: stats.uniqueCustomers,
      icon: EnvelopeIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/emails"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-8 h-8 text-fuchsia-500" />
              <div>
                <h3 className="font-medium text-gray-900">Send Email Campaign</h3>
                <p className="text-sm text-gray-600">Send announcements to customers</p>
              </div>
            </div>
          </a>
          
          <a
            href="/admin/customers"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <UsersIcon className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900">Manage Customers</h3>
                <p className="text-sm text-gray-600">View and manage customer orders</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/analytics"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Track performance metrics</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

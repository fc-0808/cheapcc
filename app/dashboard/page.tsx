// This is a server component that fetches data
import { createClient } from '@/utils/supabase/supabase-server';
import { 
  getPlanDuration, 
  calculateSavings, 
  isActiveSubscription, 
  formatCurrency, 
  calculateExpiryDate, 
} from '@/utils/products';
import ClientDashboard from './page-client';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email || '';
  
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('email', userEmail)
    .order('created_at', { ascending: false });
  const orders = data ?? [];

  const activeOrders = orders.filter(isActiveSubscription);
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.amount) || 0), 0);
  const totalSavings = orders.reduce((sum: number, order) => sum + calculateSavings(order), 0);
  const recentOrders = orders.slice(0, 5);

  // Helper function to calculate days left
  const calculateDaysLeftHelper = (expiryDate: Date | null): number => {
    if (!expiryDate) return 0;
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Process the orders to include all required data for the client component
  const processedActiveOrders = activeOrders.map(order => {
    const expiryDate = order.expiry_date 
      ? new Date(order.expiry_date).toISOString()
      : calculateExpiryDate(order) || null;
    
    const daysLeft = expiryDate 
      ? calculateDaysLeftHelper(new Date(expiryDate)) 
      : 0;
    
    return {
      ...order,
      expiryDate,
      daysLeft,
      planDuration: getPlanDuration(order),
      formattedAmount: formatCurrency(parseFloat(order.amount) || 0, order.currency || 'USD')
    };
  });

  const processedRecentOrders = recentOrders.map(order => {
    return {
      ...order,
      isActive: isActiveSubscription(order),
      planDuration: getPlanDuration(order),
      formattedAmount: formatCurrency(parseFloat(order.amount) || 0, order.currency || 'USD'),
      formattedDate: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'
    };
  });

  const stats = [
    { title: 'Active Subscriptions', value: activeOrders.length, icon: 'fa-check-circle', color: '#10b981' },
    { title: 'Total Orders', value: totalOrders, icon: 'fa-shopping-cart', color: '#3b82f6' },
    { title: 'Total Spent', value: formatCurrency(totalSpent, 'USD'), icon: 'fa-credit-card', color: '#7e22ce' },
    { title: 'Total Saved', value: formatCurrency(totalSavings, 'USD'), icon: 'fa-piggy-bank', color: '#ff3366' },
  ];

  return <ClientDashboard 
    stats={stats} 
    activeOrders={processedActiveOrders} 
    recentOrders={processedRecentOrders}
  />;
}
import { createClient } from '@/utils/supabase/supabase-server';
import { redirect } from 'next/navigation';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import VisitorAnalyticsClient from './visitor-analytics-client';

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function VisitorLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protect the route: only the admin can see it
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/');
  }

  // Get visitor logs for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: logs, error } = await supabase
    .from('visitor_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return <div className="p-8 text-red-500">Error fetching logs: {error.message}</div>;
  }

  // Calculate analytics data
  const totalVisits = logs?.length || 0;
  const uniqueIPs = new Set(logs?.map(log => log.ip_address)).size;
  const botVisits = logs?.filter(log => log.is_bot_heuristic).length || 0;
  const authenticatedVisits = logs?.filter(log => log.user_id).length || 0;
  
  // Calculate visits per day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  const visitsPerDay = last7Days.map(day => {
    const count = logs?.filter(log => {
      const logDate = format(new Date(log.created_at), 'yyyy-MM-dd');
      return logDate === day;
    }).length || 0;
    
    return {
      date: day,
      count,
      label: format(new Date(day), 'MMM dd')
    };
  });

  // Get most visited pages
  const pageVisits = logs?.reduce((acc: Record<string, number>, log) => {
    const path = log.path || '/';
    acc[path] = (acc[path] || 0) + 1;
    return acc;
  }, {});

  const topPages = Object.entries(pageVisits || {})
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <VisitorAnalyticsClient 
      logs={logs || []} 
      totalVisits={totalVisits}
      uniqueIPs={uniqueIPs}
      botVisits={botVisits}
      authenticatedVisits={authenticatedVisits}
      visitsPerDay={visitsPerDay}
      topPages={topPages}
    />
  );
} 
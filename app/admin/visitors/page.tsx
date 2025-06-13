import { createClient } from '@/utils/supabase/supabase-server';
import { redirect } from 'next/navigation';
import { formatDistanceToNow, format, subDays, subHours } from 'date-fns';
import VisitorAnalyticsClient from './visitor-analytics-client';
// Import geolocation logic directly instead of using fetch
import { SPECIFIC_IPS, IP_REGIONS, CLOUD_PROVIDERS, COUNTRY_CODES } from '@/app/api/geolocation/geo-data';

export const revalidate = 60; // Revalidate data every 60 seconds

// Helper function to get geolocation for an IP address - direct implementation without fetch
async function getGeolocation(ip: string) {
  try {
    console.log(`Getting geolocation for IP: ${ip}`);
    
    if (!ip) {
      console.warn('Geolocation called without IP address');
      return { country: 'Unknown', city: 'Unknown' };
    }

    // Check for exact IP matches first
    if (SPECIFIC_IPS[ip]) {
      console.log(`IP ${ip} matched exactly in SPECIFIC_IPS → ${SPECIFIC_IPS[ip].country}`);
      return { 
        country: SPECIFIC_IPS[ip].country, 
        city: SPECIFIC_IPS[ip].city || 'Unknown' 
      };
    }

    // Check if the IP is in our known IP ranges
    for (const prefix in IP_REGIONS) {
      if (ip.startsWith(prefix) || ip === prefix) {
        console.log(`IP ${ip} matched internal range: ${prefix} → ${IP_REGIONS[prefix].country}`);
        return {
          country: IP_REGIONS[prefix].country,
          city: IP_REGIONS[prefix].city || 'Unknown'
        };
      }
    }

    // Check if the IP is from a cloud provider
    for (const prefix in CLOUD_PROVIDERS) {
      if (ip.startsWith(prefix)) {
        const { provider, region } = CLOUD_PROVIDERS[prefix];
        console.log(`IP ${ip} matched cloud provider: ${prefix} → ${provider}`);
        return {
          country: provider,
          city: region || 'Unknown'
        };
      }
    }

    // Check if we have a country code match
    for (const prefix in COUNTRY_CODES) {
      if (ip.startsWith(prefix)) {
        const { country, region } = COUNTRY_CODES[prefix];
        console.log(`IP ${ip} matched country code: ${prefix} → ${country}`);
        return {
          country: country,
          city: region || 'Unknown'
        };
      }
    }

    console.log(`IP ${ip} had no matches, returning Unknown`);
    // If we couldn't determine the location, return a default
    return {
      country: 'Unknown',
      city: 'Unknown'
    };
  } catch (error) {
    console.error(`Error getting geolocation for IP ${ip}:`, error);
    return { country: 'Unknown', city: 'Unknown' };
  }
}

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

  // Filter out internal API endpoints
  const filteredLogs = logs?.filter(log => !log.path.startsWith('/api/geolocation')) || [];

  // Create a unique set of IP addresses
  const uniqueIPs = [...new Set(filteredLogs.map(log => log.ip_address) || [])];
  
  // Get geolocation data for all unique IPs
  const geolocations = new Map();
  for (const ip of uniqueIPs) {
    const location = await getGeolocation(ip);
    geolocations.set(ip, location);
  }
  
  // Add geo location data to logs
  const logsWithLocation = filteredLogs.map(log => {
    const location = geolocations.get(log.ip_address) || { country: 'Unknown', city: 'Unknown' };
    return {
      ...log,
      geo_location: location
    };
  });

  // Calculate analytics data
  const totalVisits = filteredLogs.length || 0;
  const uniqueIPCount = uniqueIPs.length;
  const botVisits = filteredLogs?.filter(log => log.is_bot_heuristic).length || 0;
  const authenticatedVisits = filteredLogs?.filter(log => log.user_id).length || 0;
  
  // Calculate visits per day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  const visitsPerDay = last7Days.map(day => {
    const count = filteredLogs?.filter(log => {
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
  const pageVisits = filteredLogs?.reduce((acc: Record<string, number>, log) => {
    const path = log.path || '/';
    acc[path] = (acc[path] || 0) + 1;
    return acc;
  }, {});

  const topPages = Object.entries(pageVisits || {})
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Create time-filtered data for different time periods
  const oneHourAgo = subHours(new Date(), 1);
  const twentyFourHoursAgo = subHours(new Date(), 24);
  const threeDaysAgo = subDays(new Date(), 3);
  
  const lastHourVisits = filteredLogs?.filter(log => new Date(log.created_at) >= oneHourAgo).length || 0;
  const last24HoursVisits = filteredLogs?.filter(log => new Date(log.created_at) >= twentyFourHoursAgo).length || 0;
  const last3DaysVisits = filteredLogs?.filter(log => new Date(log.created_at) >= threeDaysAgo).length || 0;

  // Create IP address list with visit counts and locations
  const ipAddressCounts = filteredLogs?.reduce((acc: Record<string, number>, log) => {
    const ip = log.ip_address;
    acc[ip] = (acc[ip] || 0) + 1;
    return acc;
  }, {});

  // Create IP addresses with location info
  const topIpAddresses = Object.entries(ipAddressCounts || {})
    .map(([ip, count]) => {
      const location = geolocations.get(ip) || { country: 'Unknown', city: 'Unknown' };
      console.log(`IP ${ip} location data:`, location);
      
      const locationString = location.city !== 'Unknown' && location.country !== 'Unknown' 
        ? `${location.city}, ${location.country}` 
        : location.country !== 'Unknown' 
          ? location.country 
          : 'Unknown';
      
      return { 
        ip, 
        count, 
        location: locationString 
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Get top 20 IPs

  return (
    <VisitorAnalyticsClient 
      logs={logsWithLocation || []} 
      totalVisits={totalVisits}
      uniqueIPs={uniqueIPCount}
      botVisits={botVisits}
      authenticatedVisits={authenticatedVisits}
      visitsPerDay={visitsPerDay}
      topPages={topPages}
      lastHourVisits={lastHourVisits}
      last24HoursVisits={last24HoursVisits}
      last3DaysVisits={last3DaysVisits}
      last7DaysVisits={totalVisits}
      topIpAddresses={topIpAddresses}
    />
  );
} 
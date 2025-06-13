'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface VisitorLog {
  id: string;
  created_at: string;
  ip_address: string;
  path: string;
  user_agent: string;
  user_id: string | null;
  is_bot_heuristic: boolean;
  method: string;
  geo_location?: {
    country: string;
    city: string;
  };
}

interface TopPage {
  path: string;
  count: number;
}

interface DailyVisit {
  date: string;
  count: number;
  label: string;
}

interface IpAddress {
  ip: string;
  count: number;
  location?: string;
}

interface VisitorAnalyticsProps {
  logs: VisitorLog[];
  totalVisits: number;
  uniqueIPs: number;
  botVisits: number;
  authenticatedVisits: number;
  visitsPerDay: DailyVisit[];
  topPages: TopPage[];
  lastHourVisits: number;
  last24HoursVisits: number;
  last3DaysVisits: number;
  last7DaysVisits: number;
  topIpAddresses: IpAddress[];
}

interface FilterState {
  showBots: boolean;
  showHumans: boolean;
  showAuthenticated: boolean;
  showAnonymous: boolean;
  pathFilter: string;
  ipFilter: string;
}

type TimePeriod = 'hour' | '24hours' | '3days' | '7days';

export default function VisitorAnalyticsClient({
  logs,
  totalVisits,
  uniqueIPs,
  botVisits,
  authenticatedVisits,
  visitsPerDay,
  topPages,
  lastHourVisits,
  last24HoursVisits,
  last3DaysVisits,
  last7DaysVisits,
  topIpAddresses
}: VisitorAnalyticsProps) {
  const [filters, setFilters] = useState<FilterState>({
    showBots: true,
    showHumans: true,
    showAuthenticated: true,
    showAnonymous: true,
    pathFilter: '',
    ipFilter: ''
  });
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('7days');

  const [filteredLogs, setFilteredLogs] = useState<VisitorLog[]>(logs);
  const [timeFilteredLogs, setTimeFilteredLogs] = useState<VisitorLog[]>(logs);
  const [maxBarHeight, setMaxBarHeight] = useState<number>(100);

  // Apply time period filter
  useEffect(() => {
    const now = new Date();
    let threshold: Date;
    
    switch (selectedTimePeriod) {
      case 'hour':
        threshold = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        break;
      case '24hours':
        threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        break;
      case '3days':
        threshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
        break;
      case '7days':
      default:
        threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
    }
    
    const filtered = logs.filter(log => new Date(log.created_at) >= threshold);
    setTimeFilteredLogs(filtered);
  }, [logs, selectedTimePeriod]);

  // Apply other filters when they change
  useEffect(() => {
    const filtered = timeFilteredLogs.filter(log => {
      // Filter out internal API endpoints
      if (log.path.startsWith('/api/geolocation')) return false;
      
      // Bot/Human filter
      if (log.is_bot_heuristic && !filters.showBots) return false;
      if (!log.is_bot_heuristic && !filters.showHumans) return false;
      
      // Auth filter
      if (log.user_id && !filters.showAuthenticated) return false;
      if (!log.user_id && !filters.showAnonymous) return false;
      
      // Path filter
      if (filters.pathFilter && !log.path.toLowerCase().includes(filters.pathFilter.toLowerCase())) return false;
      
      // IP filter
      if (filters.ipFilter && !log.ip_address.includes(filters.ipFilter)) return false;
      
      return true;
    });
    
    setFilteredLogs(filtered);
  }, [timeFilteredLogs, filters]);

  // Calculate max bar height for chart
  useEffect(() => {
    const maxCount = Math.max(...visitsPerDay.map(d => d.count));
    setMaxBarHeight(maxCount > 0 ? maxCount : 1);
  }, [visitsPerDay]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Format location for display
  const formatLocation = (log: VisitorLog): string => {
    if (!log.geo_location) return 'Unknown';
    const { city, country } = log.geo_location;
    if (country && country !== 'Unknown') {
      if (city && city !== 'Unknown') {
        return `${city}, ${country}`;
      }
      return country;
    }
    return 'Unknown';
  };

  // Get current time period stats
  const getCurrentTimeStats = () => {
    switch (selectedTimePeriod) {
      case 'hour':
        return lastHourVisits;
      case '24hours':
        return last24HoursVisits;
      case '3days':
        return last3DaysVisits;
      case '7days':
      default:
        return last7DaysVisits;
    }
  };

  // Calculate stats based on time-filtered logs
  const currentPeriodStats = useMemo(() => {
    const botCount = timeFilteredLogs.filter(log => log.is_bot_heuristic).length;
    const authCount = timeFilteredLogs.filter(log => log.user_id).length;
    const uniqueIPCount = [...new Set(timeFilteredLogs.map(log => log.ip_address))].length;
    const totalCount = timeFilteredLogs.length;
    
    return {
      total: totalCount,
      uniqueIPs: uniqueIPCount,
      bots: botCount,
      botPercentage: totalCount > 0 ? Math.round((botCount / totalCount) * 100) : 0,
      authenticated: authCount,
      authPercentage: totalCount > 0 ? Math.round((authCount / totalCount) * 100) : 0,
    };
  }, [timeFilteredLogs]);

  const periodLabels = {
    'hour': 'Last Hour',
    '24hours': 'Last 24 Hours',
    '3days': 'Last 3 Days',
    '7days': 'Last 7 Days'
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Visitor Analytics</h1>
              <p className="text-gray-500 mt-1">Showing the last 500 requests to the site.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-sync-alt mr-2"></i> Refresh Data
              </button>
            </div>
          </div>
        </header>

        {/* Time Period Selector */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {(['hour', '24hours', '3days', '7days'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimePeriod(period)}
                className={`flex-1 px-4 py-4 text-center font-medium text-sm ${
                  selectedTimePeriod === period
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {periodLabels[period]}
                <div className={`text-lg font-bold mt-1 ${
                  selectedTimePeriod === period ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {period === 'hour' ? lastHourVisits :
                   period === '24hours' ? last24HoursVisits :
                   period === '3days' ? last3DaysVisits : 
                   last7DaysVisits}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-users text-xl"></i>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Visits ({periodLabels[selectedTimePeriod]})</h2>
                <p className="text-2xl font-bold text-gray-800">{currentPeriodStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-network-wired text-xl"></i>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Unique IPs</h2>
                <p className="text-2xl font-bold text-gray-800">{currentPeriodStats.uniqueIPs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <i className="fas fa-robot text-xl"></i>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Bot Visits</h2>
                <p className="text-2xl font-bold text-gray-800">{currentPeriodStats.bots} <span className="text-sm text-gray-500">({currentPeriodStats.botPercentage}%)</span></p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <i className="fas fa-user-check text-xl"></i>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Authenticated</h2>
                <p className="text-2xl font-bold text-gray-800">{currentPeriodStats.authenticated} <span className="text-sm text-gray-500">({currentPeriodStats.authPercentage}%)</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Traffic Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Daily Traffic</h2>
            <div className="h-64 flex items-end justify-between">
              {visitsPerDay.map((day, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="relative w-full flex justify-center">
                    <div 
                      className="w-10 bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all" 
                      style={{ 
                        height: `${(day.count / maxBarHeight) * 180}px`,
                        minHeight: day.count > 0 ? '20px' : '4px'
                      }}
                      title={`${day.count} visits`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-medium">{day.label}</div>
                  <div className="text-xs font-bold mt-1">{day.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Pages</h2>
            <div className="space-y-4">
              {topPages.map((page, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                    {i + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate" title={page.path}>
                      {page.path === '/' ? 'Homepage' : page.path}
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(page.count / topPages[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-2 text-sm font-semibold text-gray-700">{page.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top IP Addresses */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Top IP Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topIpAddresses.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => handleFilterChange('ipFilter', item.ip)}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold mr-3">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-medium text-gray-800 truncate">{item.ip}</div>
                  {item.location && (
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.count} {item.count === 1 ? 'visit' : 'visits'} ({Math.round((item.count / totalVisits) * 100)}%)
                  </div>
                </div>
                <div className="ml-auto">
                  <button 
                    className="text-blue-500 hover:text-blue-700"
                    title="Filter by this IP"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterChange('ipFilter', item.ip);
                    }}
                  >
                    <i className="fas fa-filter"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Type</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600" 
                    checked={filters.showHumans}
                    onChange={(e) => handleFilterChange('showHumans', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Humans</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600" 
                    checked={filters.showBots}
                    onChange={(e) => handleFilterChange('showBots', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Bots</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authentication</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600" 
                    checked={filters.showAuthenticated}
                    onChange={(e) => handleFilterChange('showAuthenticated', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Authenticated</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600" 
                    checked={filters.showAnonymous}
                    onChange={(e) => handleFilterChange('showAnonymous', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Anonymous</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="path-filter" className="block text-sm font-medium text-gray-700 mb-1">Path Filter</label>
                <input
                  id="path-filter"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="/path"
                  value={filters.pathFilter}
                  onChange={(e) => handleFilterChange('pathFilter', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ip-filter" className="block text-sm font-medium text-gray-700 mb-1">IP Filter</label>
                <input
                  id="ip-filter"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="192.168."
                  value={filters.ipFilter}
                  onChange={(e) => handleFilterChange('ipFilter', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Visitor Logs</h2>
            <span className="text-sm text-gray-500">Showing {filteredLogs.length} of {logs.length} entries</span>
          </div>
          
          {/* Table with optimized layout to prevent horizontal scrolling */}
          <div className="w-full">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[14%]">Time</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]">IP / Location</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">Method</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">Path</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">User Agent</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">Auth</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">Bot?</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td 
                      className="px-3 py-4 text-sm text-gray-500 truncate"
                      title={new Date(log.created_at).toLocaleString('en-US')}
                      suppressHydrationWarning={true}
                    >
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <div className="font-mono text-gray-700 truncate">{log.ip_address}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {formatLocation(log)}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.method === 'GET' ? 'bg-blue-100 text-blue-800' : 
                        log.method === 'POST' ? 'bg-green-100 text-green-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {log.method || 'GET'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-800 font-semibold truncate" title={log.path}>
                      {log.path}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 truncate" title={log.user_agent ?? ''}>
                      {log.user_agent}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {log.user_id ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {log.is_bot_heuristic ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <i className="fas fa-search text-4xl mb-3"></i>
              <p>No results match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
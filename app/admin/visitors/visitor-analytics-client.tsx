'use client';

import React, { useState, useEffect } from 'react';
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
    country?: string;
    city?: string;
    region?: string;
  } | null;
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

  const [filteredLogs, setFilteredLogs] = useState<VisitorLog[]>(logs);
  const [maxBarHeight, setMaxBarHeight] = useState<number>(100);

  // Apply filters when they change
  useEffect(() => {
    const filtered = logs.filter(log => {
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
  }, [logs, filters]);

  // Calculate max bar height for chart
  useEffect(() => {
    const maxCount = Math.max(...visitsPerDay.map(d => d.count));
    setMaxBarHeight(maxCount > 0 ? maxCount : 1);
  }, [visitsPerDay]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Calculate percentages for stats
  const botPercentage = totalVisits > 0 ? Math.round((botVisits / totalVisits) * 100) : 0;
  const humanPercentage = 100 - botPercentage;
  const authPercentage = totalVisits > 0 ? Math.round((authenticatedVisits / totalVisits) * 100) : 0;

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

        {/* Time-based Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Traffic by Time Period</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-1">Last Hour</div>
              <div className="text-2xl font-bold text-blue-700">{lastHourVisits}</div>
              <div className="text-xs text-blue-500 mt-1">
                {lastHourVisits > 0 ? `${Math.round((lastHourVisits / totalVisits) * 100)}% of total` : 'No visits'}
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <div className="text-xs font-medium text-indigo-500 uppercase tracking-wide mb-1">Last 24 Hours</div>
              <div className="text-2xl font-bold text-indigo-700">{last24HoursVisits}</div>
              <div className="text-xs text-indigo-500 mt-1">
                {last24HoursVisits > 0 ? `${Math.round((last24HoursVisits / totalVisits) * 100)}% of total` : 'No visits'}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Last 3 Days</div>
              <div className="text-2xl font-bold text-purple-700">{last3DaysVisits}</div>
              <div className="text-xs text-purple-500 mt-1">
                {last3DaysVisits > 0 ? `${Math.round((last3DaysVisits / totalVisits) * 100)}% of total` : 'No visits'}
              </div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
              <div className="text-xs font-medium text-pink-500 uppercase tracking-wide mb-1">Last 7 Days</div>
              <div className="text-2xl font-bold text-pink-700">{last7DaysVisits}</div>
              <div className="text-xs text-pink-500 mt-1">100% of data</div>
            </div>
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
                <h2 className="text-sm font-medium text-gray-500">Total Visits</h2>
                <p className="text-2xl font-bold text-gray-800">{totalVisits}</p>
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
                <p className="text-2xl font-bold text-gray-800">{uniqueIPs}</p>
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
                <p className="text-2xl font-bold text-gray-800">{botVisits} <span className="text-sm text-gray-500">({botPercentage}%)</span></p>
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
                <p className="text-2xl font-bold text-gray-800">{authenticatedVisits} <span className="text-sm text-gray-500">({authPercentage}%)</span></p>
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
                    >
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <div className="font-mono text-gray-700 truncate">{log.ip_address}</div>
                      {log.geo_location && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                          {log.geo_location.city ? `${log.geo_location.city}, ` : ''}
                          {log.geo_location.country || 'Unknown'}
                        </div>
                      )}
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
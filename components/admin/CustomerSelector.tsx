'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckIcon,
  UsersIcon,
  EnvelopeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string;
  source: 'profiles' | 'orders';
  status?: string;
  amount?: number;
  created_at: string;
}

interface CustomerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedCustomers: Customer[]) => void;
  selectedCustomers: Customer[];
}

export default function CustomerSelector({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedCustomers: initialSelected 
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'profiles' | 'orders'>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>(initialSelected);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedCustomers(initialSelected);
  }, [initialSelected]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/get-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminKey: "cheapcc_admin_2025_secure_key_xyz789"
        })
      });
      
      const result = await response.json();
      setCustomers(result.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSource = sourceFilter === 'all' || customer.source === sourceFilter;
      return matchesSearch && matchesSource;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'amount':
          const amountA = a.amount || 0;
          const amountB = b.amount || 0;
          comparison = amountA - amountB;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleCustomer = (customer: Customer) => {
    const isSelected = selectedCustomers.some(c => c.id === customer.id && c.source === customer.source);
    
    if (isSelected) {
      setSelectedCustomers(prev => prev.filter(c => !(c.id === customer.id && c.source === customer.source)));
    } else {
      setSelectedCustomers(prev => [...prev, customer]);
    }
  };

  const selectAll = () => {
    setSelectedCustomers(filteredAndSortedCustomers);
  };

  const deselectAll = () => {
    setSelectedCustomers([]);
  };

  const handleConfirm = () => {
    onConfirm(selectedCustomers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Customers</h2>
              <p className="text-gray-600 mt-1">Choose specific customers to send emails to</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            {/* First Row: Search and Source Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                />
              </div>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="profiles">Profiles Only</option>
                <option value="orders">Orders Only</option>
              </select>
            </div>

            {/* Second Row: Sorting and Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Sorting Controls */}
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                >
                  <option value="date">Date Created</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="amount">Amount</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={selectAll}
                  className="px-4 py-2 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 transition-colors text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Deselect All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
              <span className="ml-3">Loading customers...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedCustomers.map((customer) => {
                const isSelected = selectedCustomers.some(c => c.id === customer.id && c.source === customer.source);
                
                return (
                  <div
                    key={`${customer.source}-${customer.id}`}
                    onClick={() => toggleCustomer(customer)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-fuchsia-500 bg-fuchsia-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-fuchsia-500 bg-fuchsia-500' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                      </div>

                      {/* Customer Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{customer.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            customer.source === 'profiles' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {customer.source === 'profiles' ? 'Profile' : 'Order'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <span>{customer.email}</span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span>
                            Created: {new Date(customer.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {customer.status && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              customer.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.status}
                            </span>
                          )}
                          {customer.amount && (
                            <span className="font-medium text-gray-700">${customer.amount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAndSortedCustomers.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No customers found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedCustomers.length === 0}
                className="px-4 py-2 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send to Selected ({selectedCustomers.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

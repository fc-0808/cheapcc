'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon, 
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import CustomerSelector from './CustomerSelector';
import EmailTemplateSelector from './EmailTemplateSelector';
import { EmailTemplate } from '@/lib/email-templates/registry';

// Removed old EmailCampaign interface - now using EmailTemplate from registry

interface EmailStats {
  total: number;
  sent: number;
  errors: number;
  dryRun?: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  source: 'profiles' | 'orders';
  status?: string;
  amount?: number;
  created_at: string;
}

export default function EmailManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);

  const adminKey = "cheapcc_admin_2025_secure_key_xyz789"; // From env

  const sendTestEmail = async () => {
    if (!selectedTemplate) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/send-template-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminKey,
          templateId: selectedTemplate.id,
          to: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com',
          props: { name: 'Admin Test' },
          isTest: true
        })
      });
      
      const result = await response.json();
      setLastResult(result);
    } catch (error) {
      setLastResult({ error: 'Failed to send test email' });
    } finally {
      setIsLoading(false);
    }
  };


  const sendToAllCustomers = async () => {
    if (!selectedTemplate) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to send this email to ALL customers? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/send-bulk-template-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminKey,
          templateId: selectedTemplate.id,
          sendToAll: true
        })
      });
      
      const result = await response.json();
      setLastResult(result);
      setEmailStats(result.stats);
    } catch (error) {
      setLastResult({ error: 'Failed to send emails' });
    } finally {
      setIsLoading(false);
    }
  };

  const sendToSelectedCustomers = async (customers: Customer[]) => {
    if (!selectedTemplate || customers.length === 0) return;
    
    // Deduplicate by email for sending (keep the first occurrence)
    const uniqueCustomers = customers.reduce((acc: Customer[], customer) => {
      if (!acc.find(c => c.email === customer.email)) {
        acc.push(customer);
      }
      return acc;
    }, []);

    const confirmed = window.confirm(
      `Are you sure you want to send this email to ${uniqueCustomers.length} selected customer${uniqueCustomers.length !== 1 ? 's' : ''}?${
        uniqueCustomers.length !== customers.length ? ` (${customers.length - uniqueCustomers.length} duplicate emails removed)` : ''
      }`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/send-bulk-template-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          templateId: selectedTemplate.id,
          customers: uniqueCustomers.map(c => ({ name: c.name, email: c.email }))
        })
      });

      const result = await response.json();
      setLastResult(result);
      setEmailStats(result.stats);
      setSelectedCustomers(customers);
    } catch (error) {
      setLastResult({ error: 'Failed to send emails to selected customers' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Email Template</h2>
        <EmailTemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
          className="w-full"
        />
        
        {selectedTemplate && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Template Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Subject:</span>
                <div className="font-medium">{selectedTemplate.subject}</div>
              </div>
              <div>
                <span className="text-gray-600">Required Props:</span>
                <div className="font-medium">{selectedTemplate.requiredProps.join(', ')}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Actions */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Email Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Test Email */}
            <button
              onClick={sendTestEmail}
              disabled={isLoading}
              className="flex items-center gap-2 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <EnvelopeIcon className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Send Test</div>
                <div className="text-sm text-gray-600">To admin email</div>
              </div>
            </button>

            {/* Select Customers */}
            <button
              onClick={() => setShowCustomerSelector(true)}
              disabled={isLoading}
              className="flex items-center gap-2 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              <UserGroupIcon className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Select Customers</div>
                <div className="text-sm text-gray-600">Choose specific</div>
              </div>
            </button>

            {/* Send to All */}
            <button
              onClick={sendToAllCustomers}
              disabled={isLoading}
              className="flex items-center gap-2 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <PlayIcon className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Send All</div>
                <div className="text-sm text-gray-600">Full campaign</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {lastResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Results</h2>
          
          {/* Stats */}
          {emailStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{emailStats.total}</div>
                <div className="text-sm text-blue-600">Total Recipients</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{emailStats.sent}</div>
                <div className="text-sm text-green-600">Emails Sent</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{emailStats.errors}</div>
                <div className="text-sm text-red-600">Errors</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {emailStats.dryRun ? 'Preview' : 'Live'}
                </div>
                <div className="text-sm text-purple-600">Campaign Type</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {lastResult.message && !lastResult.error && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{lastResult.message}</span>
            </div>
          )}

          {/* Error Message */}
          {lastResult.error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{lastResult.error}</span>
            </div>
          )}

          {/* Customer List (for previews) */}
          {lastResult.customers && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Recipients ({lastResult.customers.length})</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {lastResult.customers.map((customer: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-gray-600">{customer.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Errors List */}
          {lastResult.errors && lastResult.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-3">Errors ({lastResult.errors.length})</h3>
              <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {lastResult.errors.map((error: any, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-red-700">{error.email}:</span>
                      <span className="text-red-600 ml-2">{error.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
            <span>Processing email campaign...</span>
          </div>
        </div>
      )}

      {/* Customer Selector Modal */}
      <CustomerSelector
        isOpen={showCustomerSelector}
        onClose={() => setShowCustomerSelector(false)}
        onConfirm={sendToSelectedCustomers}
        selectedCustomers={selectedCustomers}
      />
    </div>
  );
}

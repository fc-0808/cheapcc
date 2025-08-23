import TawkColorPalette from '@/components/TawkColorPalette';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tawk.to Color Schemes Demo - CheapCC',
  description: 'Preview and copy color schemes for Tawk.to chat widget that match CheapCC branding',
  robots: 'noindex, nofollow', // Demo page, don't index
};

export default function TawkDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <TawkColorPalette />
      
      {/* Implementation Examples */}
      <div className="max-w-4xl mx-auto mt-12 px-6">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Implementation Examples
          </h2>
          
          <div className="space-y-6">
            {/* Primary Scheme */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Primary Brand Scheme (Recommended)
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm text-gray-800">
                  {`<TawkToChat colorScheme="primary" />`}
                </code>
              </div>
            </div>

            {/* Gradient Scheme */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Gradient Harmony Scheme
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm text-gray-800">
                  {`<TawkToChat colorScheme="gradient" />`}
                </code>
              </div>
            </div>

            {/* Custom Scheme */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Custom Color Scheme
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm text-gray-800">
                  {`<TawkToChat 
  colorScheme="custom"
  customColors={{
    header: '#your-color',
    headerText: '#ffffff',
    agentMessage: '#your-color',
    agentText: '#ffffff',
    userMessage: '#your-color',
    userText: '#ffffff',
  }}
/>`}
                </code>
              </div>
            </div>
          </div>

          {/* Color Values Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Primary Brand Colors (Copy-Paste Ready)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                      Element
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                      Hex Color
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                      Preview
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Header Background', color: '#2c2d5a' },
                    { name: 'Header Text', color: '#ffffff' },
                    { name: 'Agent Message', color: '#ff3366' },
                    { name: 'Agent Text', color: '#ffffff' },
                    { name: 'User Message', color: '#33347b' },
                    { name: 'User Text', color: '#ffffff' },
                  ].map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {item.color}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div 
                          className="w-8 h-8 rounded border border-gray-200"
                          style={{ backgroundColor: item.color }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

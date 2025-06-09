import { createClient } from '@/utils/supabase/supabase-server';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function VisitorLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Protect the route: only the admin can see it
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/');
  }

  const { data: logs, error } = await supabase
    .from('visitor_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return <div className="p-8 text-red-500">Error fetching logs: {error.message}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Visitor Traffic</h1>
          <p className="text-gray-500 mt-1">Showing the last 100 requests to the site.</p>
        </header>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot?</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs && logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={new Date(log.created_at).toLocaleString()}>
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{log.ip_address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{log.path}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={log.user_agent ?? ''}>
                      {log.user_agent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.user_id ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Authenticated
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Anonymous
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
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
        </div>
      </div>
    </div>
  );
} 
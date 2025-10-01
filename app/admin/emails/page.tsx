import EmailManagement from '@/components/admin/EmailManagement';

export default function EmailsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
        <p className="text-gray-600 mt-2">Send announcements and manage customer communications.</p>
      </div>

      <EmailManagement />
    </div>
  );
}

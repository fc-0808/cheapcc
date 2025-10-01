import CustomerList from '@/components/admin/CustomerList';

export default function CustomersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-2">View and manage customer orders and subscriptions.</p>
      </div>

      <CustomerList />
    </div>
  );
}

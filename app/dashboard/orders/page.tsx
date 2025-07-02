import { Suspense } from 'react';
import OrdersContent from './orders-content';
import OrdersLoading from './loading';

export default function OrdersPage() {
  return (
    <div className="min-h-screen py-10 px-4">
      <Suspense fallback={<OrdersLoading />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
} 
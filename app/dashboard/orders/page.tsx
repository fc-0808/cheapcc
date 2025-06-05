import { Suspense } from 'react';
import OrdersContent from './orders-content';
import DashboardLoading from '../loading';

export default function OrdersPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <OrdersContent />
    </Suspense>
  );
} 
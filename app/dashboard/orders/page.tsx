import { Suspense } from 'react';
import OrdersContent from './orders-content';

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
} 
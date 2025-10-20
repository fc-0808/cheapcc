import type { Metadata } from "next";
import { Suspense } from 'react';
import Loading from '../loading';

export const metadata: Metadata = {
  title: {
    template: '%s | CheapCC - Affordable Adobe CC Subscriptions',
    default: 'CheapCC - #1 Source for Affordable Adobe Creative Cloud',
  },
  description: "CheapCC offers genuine Adobe Creative Cloud subscriptions for up to 75% off. Fast delivery for all Adobe apps.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <div className="auth-layout min-h-screen">
        {children}
      </div>
    </Suspense>
  );
}

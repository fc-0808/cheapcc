'use client';

import React, { useEffect, useState } from 'react';

export default function PayPalDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkPayPalStatus = () => {
      const info = {
        timestamp: new Date().toISOString(),
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientIdLength: process.env.PAYPAL_CLIENT_ID?.length || 0,
        windowPayPal: typeof window !== 'undefined' ? !!window.paypal : false,
        payPalButtons: typeof window !== 'undefined' ? !!window.paypal?.Buttons : false,
        scriptElements: typeof document !== 'undefined' ? 
          Array.from(document.querySelectorAll('script[src*="paypal.com"]')).map(s => (s as HTMLScriptElement).src) : [],
        payPalContainers: typeof document !== 'undefined' ? 
          Array.from(document.querySelectorAll('[id*="paypal"]')).map(el => ({
            id: el.id,
            classes: el.className,
            hasContent: el.innerHTML.length > 0
          })) : []
      };
      setDebugInfo(info);
    };

    // Check immediately
    checkPayPalStatus();

    // Check every 2 seconds
    const interval = setInterval(checkPayPalStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50 border border-gray-600">
      <h3 className="font-bold mb-2 text-yellow-400">PayPal Debug Info</h3>
      <div className="space-y-1">
        <div>Client ID: {debugInfo.clientId ? '✅ Set' : '❌ Missing'} ({debugInfo.clientIdLength} chars)</div>
        <div>Window PayPal: {debugInfo.windowPayPal ? '✅ Available' : '❌ Missing'}</div>
        <div>PayPal Buttons: {debugInfo.payPalButtons ? '✅ Available' : '❌ Missing'}</div>
        <div>Scripts: {debugInfo.scriptElements?.length || 0} PayPal scripts loaded</div>
        <div>Containers: {debugInfo.payPalContainers?.length || 0} PayPal containers found</div>
        {debugInfo.payPalContainers?.map((container: any, i: number) => (
          <div key={i} className="ml-2 text-gray-300">
            - {container.id}: {container.hasContent ? 'Has content' : 'Empty'}
          </div>
        ))}
      </div>
      <div className="mt-2 text-gray-400">
        Last updated: {debugInfo.timestamp?.split('T')[1]?.split('.')[0]}
      </div>
    </div>
  );
}

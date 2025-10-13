'use client';

export default function DebugEnvPage() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID_LENGTH: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.length || 0,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_ID_LENGTH: process.env.PAYPAL_CLIENT_ID?.length || 0,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const allPaypalVars = Object.keys(process.env).filter(key => key.includes('PAYPAL'));

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Key Environment Variables:</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto">
          {JSON.stringify(envVars, null, 2)}
        </pre>
        
        <h2 className="text-xl font-semibold">All PayPal-related Variables:</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto">
          {JSON.stringify(allPaypalVars, null, 2)}
        </pre>
        
        <h2 className="text-xl font-semibold">All Environment Variables (first 20):</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto">
          {JSON.stringify(Object.keys(process.env).slice(0, 20), null, 2)}
        </pre>
      </div>
    </div>
  );
}

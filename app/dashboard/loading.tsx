"use client";

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0f111a] relative">
      {/* Background glow effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"
        style={{
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      {/* Particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-30 pointer-events-none"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: `0 0 ${Math.random() * 5 + 2}px rgba(255, 255, 255, 0.5)`,
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-4xl space-y-6 px-4">
        {/* Dashboard skeleton loader */}
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 overflow-hidden shadow-lg animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-white/10 rounded-md"></div>
                <div className="w-10 h-10 rounded-full bg-white/5"></div>
              </div>
              <div className="h-6 w-16 bg-white/10 rounded-md"></div>
            </div>
          ))}
        </div>
        
        {/* Active subscriptions card skeleton */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="h-6 w-48 bg-white/10 rounded-md"></div>
            <div className="h-6 w-8 rounded-full bg-fuchsia-500/20"></div>
          </div>
          
          <div className="p-5">
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div 
                  key={i}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-5 w-36 bg-white/10 rounded-md"></div>
                    <div className="h-5 w-16 rounded-full bg-green-500/20"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j}>
                        <div className="h-4 w-20 bg-white/10 rounded-md mb-2"></div>
                        <div className="h-5 w-28 bg-white/10 rounded-md"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent order history card skeleton */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="h-6 w-48 bg-white/10 rounded-md"></div>
            <div className="h-6 w-20 bg-white/10 rounded-md"></div>
          </div>
          
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {['Order #', 'Date', 'Plan', 'Amount', 'Status'].map((_, i) => (
                    <th key={i} className="px-3 py-3">
                      <div className="h-4 w-16 bg-white/10 rounded-md"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Custom keyframes and scrollbar styling */}
      <style jsx global>{`
        /* Animation keyframes */
        @keyframes pulse {
          0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.95); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.95); }
        }
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-10px) translateX(5px); opacity: 0.6; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
        }
        
        /* Dark scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 17, 26, 0.95);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 51, 102, 0.4);
        }
        
        ::-webkit-scrollbar-corner {
          background: rgba(15, 17, 26, 0.95);
        }
      `}</style>
    </div>
  );
} 
"use client";

import React from 'react';

export default function OrdersLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-[#0f111a] relative pt-20">
      {/* Background glow effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"
        style={{
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      {/* Particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
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

      <div className="w-full max-w-4xl relative z-10">
        {/* Orders page skeleton loader */}
        
        {/* Page header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-40 bg-white/10 rounded-md animate-pulse"></div>
          <div className="h-8 w-32 bg-white/10 rounded-md animate-pulse"></div>
        </div>
        
        {/* Orders list skeleton */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10">
                <tr>
                  {['Order ID', 'Date', 'Plan', 'Amount', 'Status', 'Actions'].map((_, i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.05}s` }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div 
                          className="h-4 bg-white/10 rounded-md"
                          style={{ width: j === 0 ? '120px' : j === 5 ? '80px' : '100px' }}
                        ></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination skeleton */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-white/10 rounded-md animate-pulse"></div>
            <div className="h-8 w-8 bg-white/10 rounded-md animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-8 bg-white/10 rounded-md animate-pulse"></div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-white/10 rounded-md animate-pulse"></div>
            <div className="h-8 w-8 bg-white/10 rounded-md animate-pulse"></div>
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
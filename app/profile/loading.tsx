"use client";

import React from 'react';

export default function ProfileLoading() {
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

      <div className="w-full max-w-md rounded-xl p-6 relative z-10 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
        {/* Profile skeleton loader */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-fuchsia-500/30 via-pink-500/30 to-red-500/30 mb-4 animate-pulse"></div>
          <div className="h-6 w-40 bg-white/10 rounded-md mb-8 animate-pulse"></div>
          
          <div className="w-full space-y-6">
            <div className="space-y-2 w-full">
              <div className="h-4 w-20 bg-white/10 rounded-md"></div>
              <div className="h-10 w-full bg-white/10 rounded-md animate-pulse"></div>
            </div>
            
            <div className="space-y-2 w-full">
              <div className="h-4 w-24 bg-white/10 rounded-md"></div>
              <div className="h-10 w-full bg-white/10 rounded-md animate-pulse"></div>
            </div>
            
            <div className="h-10 w-full bg-gradient-to-r from-fuchsia-500/50 via-pink-500/50 to-red-500/50 rounded-md animate-pulse"></div>
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
"use client";

import { useEffect, useState } from 'react';

export default function Loading() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Simulate loading progress
  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Simulated loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0f111a] relative">
      {/* Background glow effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"
        style={{
          animation: isMobile ? 'pulse 2s ease-in-out infinite' : 'pulse 3s ease-in-out infinite',
        }}
      />
      
      {/* Particles for added sophistication - fewer on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(isMobile ? 5 : 8)].map((_, i) => (
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
      
      <div className="text-center relative z-10 px-4 sm:px-0">
        {/* Logo Animation */}
        <div className="mb-6 flex items-center justify-center">
          <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Cheap
            <span 
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent relative inline-flex"
              style={{
                backgroundSize: "200% 100%",
                animation: "moveGradient 2s linear infinite"
              }}
            >
              CC
            </span>
          </div>
        </div>
        
        {/* Savings Tag - mobile optimized */}
        <div className="absolute -top-2 right-0 md:-right-16 transform rotate-12 bg-[#ff3366] text-white text-xs px-3 py-1 rounded-full font-bold shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
          75% OFF
        </div>

        {/* Loading Progress Animation - responsive */}
        <div className="relative h-2 w-64 max-w-full mx-auto bg-white/10 backdrop-blur-sm rounded-full overflow-hidden mb-4 border border-white/20">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 rounded-full"
            style={{ 
              width: `${Math.min(loadingProgress, 100)}%`,
              transition: 'width 0.3s ease-out'
            }}
          ></div>
        </div>
        
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-medium text-gray-300 mb-1">
            {loadingProgress < 100 ? 'Loading your experience...' : 'Ready!'}
          </h2>
          
          {/* Mobile-optimized loading indicators */}
          <div className="mt-2 flex gap-1.5 justify-center">
            {[0, 1, 2].map((dot) => (
              <div 
                key={dot} 
                className="w-2 h-2 rounded-full bg-white/50"
                style={{
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                  animationDelay: `${dot * 0.2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Touch instruction for mobile */}
        {isMobile && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center opacity-70">
            <div className="animate-bounce text-white/60 text-xs flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-70">
                <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74"></path>
                <path d="M9.55 15.08l6.9-6.9"></path>
                <path d="M21 8L16.25 11.5"></path>
                <path d="M16.25 11.5 21 15"></path>
                <path d="M9.55 15.08 5 11.5"></path>
                <path d="M5 11.5 9.55 7.92"></path>
              </svg>
              <span>Tap to interact</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom keyframes for animations and scrollbar styling */}
      <style jsx global>{`
        /* Animation keyframes */
        @keyframes moveGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
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
        @keyframes pulse-dot {
          0%, 100% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        /* Optimized mobile scrollbar styling */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(15, 17, 26, 0.95);
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
          }
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
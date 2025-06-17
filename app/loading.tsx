"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white to-[#f8f9fa]">
      <div className="text-center relative">
        {/* Logo Animation */}
        <div className="mb-6 flex items-center justify-center">
          <div className="text-4xl font-extrabold text-[#2c2d5a] tracking-tight">
            Cheap
            <span className="text-[#ff3366] relative inline-flex">
              CC
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff3366] rounded-full animate-ping opacity-75"></span>
              <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#2c2d5a] rounded-full animate-ping opacity-75 animation-delay-500"></span>
            </span>
          </div>
        </div>
        
        {/* Savings Tag */}
        <div className="absolute -top-2 -right-16 transform rotate-12 bg-[#ff3366] text-white text-xs px-3 py-1 rounded-full font-bold shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
          75% OFF
        </div>

        {/* Loading Progress Animation */}
        <div className="relative h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#2c2d5a] to-[#ff3366] rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        
        <h2 className="text-xs font-semibold text-[#2c2d5a] mb-1">Loading creative goodness...</h2>
      </div>
      
      {/* Custom keyframes for the loading animation */}
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  );
} 
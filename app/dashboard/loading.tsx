import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8fafc] py-20">
      <div className="w-16 h-16 relative">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-4 border-t-[#ff3366] border-[#e5e7eb] rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 mt-4 font-medium">Loading your dashboard...</p>
    </div>
  );
} 
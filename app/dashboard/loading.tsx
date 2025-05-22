import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f8f9fa]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3366]"></div>
    </div>
  );
} 
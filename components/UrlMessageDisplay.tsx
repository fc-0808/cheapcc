"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function UrlMessageDisplay() {
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (searchParams.get('success') === 'confirmed') {
      setSuccessMessage('Successfully confirmed!');
      // Clean the URL: It's generally better to do this with router.replace if possible,
      // but window.history.replaceState is also common for this specific purpose.
      // Ensure this component is only rendered client-side where window is available.
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, '/');
      }

      // Auto-hide the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!successMessage) {
    return null; // Render nothing if there's no message
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 text-green-700 px-6 py-3 rounded-md shadow-lg">
      <div className="flex items-center">
        <i className="fas fa-check-circle mr-2" />
        {successMessage}
      </div>
    </div>
  );
} 
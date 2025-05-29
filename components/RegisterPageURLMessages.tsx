"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function RegisterPageURLMessages() {
  const searchParams = useSearchParams();
  const [urlErrorMessage, setUrlErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setUrlErrorMessage(decodeURIComponent(error));
      // Clean the URL
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, '/register');
      }
    }
  }, [searchParams]);

  if (!urlErrorMessage) {
    return null; // Render nothing if there's no URL-based error message
  }

  return (
    <div className="mb-4 p-3 rounded-md text-sm font-medium bg-red-100 text-red-700">
      {urlErrorMessage}
    </div>
  );
} 
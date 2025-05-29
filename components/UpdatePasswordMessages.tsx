"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function UpdatePasswordMessages() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | '' | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    
    if (error) {
      setMessage(decodeURIComponent(error));
      setMessageType('error');
      // Clean the URL
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, '/auth/update-password');
      }
    } else if (success) {
       // This page might receive a 'success=password_reset' param from /login after a successful reset.
       // If you had specific success messages *from this page's actions*, you'd handle them here.
       // For now, just handling generic success if needed.
       // setMessage('Operation successful!'); // Example
       // setMessageType('success'); // Example
       // if (typeof window !== "undefined") {
       //   window.history.replaceState({}, document.title, '/auth/update-password');
       // }
    }
  }, [searchParams]);

  if (!message || !messageType) {
    return null;
  }

  return (
    <div className={`mb-4 p-3 rounded-md text-sm font-medium ${
      messageType === 'success' ? 'bg-green-100 text-green-700' :
      messageType === 'error' ? 'bg-red-100 text-red-700' : ''
    }`}>
      {message}
    </div>
  );
} 
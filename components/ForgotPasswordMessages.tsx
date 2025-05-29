"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function ForgotPasswordMessages() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | '' | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success'); // Assuming 'success' is a valid param indicating a message should be shown

    if (error) {
      setMessage(decodeURIComponent(error));
      setMessageType('error');
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, '/forgot-password');
      }
    } else if (success) { // Changed this from 'if (success)' to 'else if (success)'
      // You might want a more specific success message or pass it via query param
      setMessage('If an account with that email exists, a password reset link has been sent.');
      setMessageType('success');
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, '/forgot-password');
      }
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
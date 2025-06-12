"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function LoginPageURLMessages() {
  const searchParams = useSearchParams();
  const [urlMessage, setUrlMessage] = useState('');
  const [urlMessageType, setUrlMessageType] = useState<'success' | 'error' | 'info' | ''>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const infoParam = searchParams.get('info');
    let messageToShow = '';
    let typeToShow: 'success' | 'error' | 'info' | '' = '';

    if (errorParam) {
      messageToShow = decodeURIComponent(errorParam);
      typeToShow = 'error';
    } else if (successParam) {
      if (successParam === 'register') {
        messageToShow = 'Registration successful! You can now log in.';
      } else if (successParam === 'password_reset') {
        messageToShow = 'Your password has been reset successfully. Please log in.';
      } else {
         messageToShow = 'Operation successful.';
      }
      typeToShow = 'success';
    } else if (infoParam) {
      if (infoParam === 'reset_link_sent') {
         messageToShow = 'If an account exists for this email, a password reset link has been sent.';
      }
      typeToShow = 'info';
    }

    if (messageToShow) {
      setUrlMessage(messageToShow);
      setUrlMessageType(typeToShow);
      // Clean the URL
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, '/login');
      }
    }
  }, [searchParams]);

  if (!urlMessage || !urlMessageType) {
    return null;
  }

  return (
    <div className={`mb-4 p-3 rounded-md text-sm font-medium ${
      urlMessageType === 'success' ? 'bg-green-100 text-green-700' :
      urlMessageType === 'error' ? 'bg-red-100 text-red-700' :
      urlMessageType === 'info' ? 'bg-blue-100 text-blue-700' : ''
    }`}>
      {urlMessage}
    </div>
  );
} 
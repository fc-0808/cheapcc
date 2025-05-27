'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client'; // Use client-side Supabase
import { updatePassword } from './actions'; // We'll create this action next
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams(); // To read messages from redirect

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    // This effect handles messages passed via query parameters from the server action
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    if (error) {
      setMessage(decodeURIComponent(error));
      setMessageType('error');
      // Clean the URL
      window.history.replaceState({}, document.title, '/auth/update-password');
    }
    if (success) {
        setMessage('Password updated successfully! You can now log in.');
        setMessageType('success');
        // Clean the URL
        window.history.replaceState({}, document.title, '/auth/update-password');
        // Optionally redirect to login after a delay
        setTimeout(() => {
            router.push('/login?success=password_reset');
        }, 3000);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // This event means Supabase has processed the recovery token from the URL fragment
        // and the user is in a temporary authenticated state, ready to update their password.
        setIsSessionReady(true);
        setMessage('You can now set your new password.');
        setMessageType('success'); // Or 'info'
      } else if (event === 'SIGNED_IN' && session?.user && !isSessionReady) {
        // If already signed in normally, and not in password recovery mode, redirect away
        // or handle as appropriate. For now, we assume they are here for password recovery.
        // If a normal session exists, PASSWORD_RECOVERY event might not fire as expected unless
        // the user explicitly came from the recovery link.
      } else if (!session && event !== 'INITIAL_SESSION') {
        // If no session and not the initial check, it might mean the token is invalid or expired.
        // Though, Supabase often handles invalid tokens by not firing PASSWORD_RECOVERY.
      }
    });

    // Check initial session state, particularly if the user lands here directly with a token in URL
    supabase.auth.getSession().then(({ data: { session } }) => {
        // If there's a session and no specific PASSWORD_RECOVERY event fired yet,
        // it might be that the user is just loading the page with a valid recovery token in the hash.
        // The onAuthStateChange listener above should eventually catch the PASSWORD_RECOVERY event.
        // If, after a short delay, isSessionReady is still false, it could indicate an issue.
        setTimeout(() => {
            if (!isSessionReady && !message) {
                 // Heuristic: If no session ready and no messages after a bit, token might be invalid/used
                 // setMessage("Invalid or expired password reset link. Please request a new one.");
                 // setMessageType('error');
                 // router.push('/forgot-password');
            }
        }, 1500); // Give onAuthStateChange some time
    });


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, isSessionReady, message]); // Added message to dependencies


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType(null);

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) { // Basic validation, match with Supabase rules
        setMessage('Password must be at least 6 characters long.');
        setMessageType('error');
        setIsLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('newPassword', newPassword);

    // Call the server action to update the password
    await updatePassword(formData);
    // The server action will handle redirecting or setting query params for messages

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Set Your New Password</h1>
        
        {message && (
          <div className={`my-4 p-3 rounded-md text-sm font-medium ${
            messageType === 'success' ? 'bg-green-100 text-green-700' : 
            messageType === 'error' ? 'bg-red-100 text-red-700' : ''
          }`}>
            {message}
          </div>
        )}

        {isSessionReady || searchParams.get('success') ? ( // Allow form if session is ready OR if coming from a successful action redirect
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#2c2d5a] mb-1">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2c2d5a] mb-1">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          !message && <p className="text-center text-gray-500">Verifying reset link...</p> 
        )}
         <div className="text-center mt-6 text-sm text-gray-500">
            Back to{' '}
            <Link href="/login" legacyBehavior={false} className="text-[#ff3366] hover:underline font-medium">
                Log In
            </Link>
        </div>
      </div>
    </main>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import { updatePassword } from './actions'; // Server action
import Link from 'next/link';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | '' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false); // Controls form display

  // State for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength state (optional, for client-side UX)
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const isNewPasswordClientValid = Object.values(passwordRequirements).every(req => req);

  // Effect for handling messages from URL parameters (e.g., after server action redirects)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');

    if (errorParam) {
      setMessage(decodeURIComponent(errorParam));
      setMessageType('error');
      // Clean the URL to prevent re-processing these params
      window.history.replaceState({}, document.title, '/auth/update-password'); // Use fixed path
    } else if (successParam === 'password_reset_successful_redirect_from_action') {
      setMessage('Password updated successfully! You can now log in.');
      setMessageType('success');
      window.history.replaceState({}, document.title, '/auth/update-password'); // Use fixed path
      const timer = setTimeout(() => {
        router.push('/login?success=password_reset');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]); // router.pathname is not needed if just clearing params for current page

  // Effect for Supabase auth state changes, including PASSWORD_RECOVERY event
  useEffect(() => {
    const handleAuthStateChange = (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth event (update-password page):', event, 'Session ID:', session?.user?.id?.substring(0,5));
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event received. Setting isSessionReady to true.');
        setIsSessionReady(true);
        // Set a helpful message if no error/other success message is already displayed
        if (!messageType && !searchParams.get('error')) { // Check messageType and avoid overriding URL error
          setMessage('You can now set your new password.');
          setMessageType('success');
        }
      } else if (event === 'INITIAL_SESSION' && !session && !searchParams.get('error')) {
          console.log('UpdatePasswordPage: Initial session is null, no error in URL. Awaiting PASSWORD_RECOVERY or link might be invalid.');
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // This call is important for the Supabase client to process any URL fragment
    // containing auth tokens when the page loads.
    console.log('UpdatePasswordPage: Calling supabase.auth.getSession() on mount to process URL fragment.');
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => { // Explicitly type data
      console.log('UpdatePasswordPage: getSession() result on mount - User ID:', data.session?.user?.id?.substring(0,5));
      // The onAuthStateChange listener should handle the PASSWORD_RECOVERY event if tokens are in URL.
    }).catch((error: any) => { // Explicitly type error
        console.error("UpdatePasswordPage: Error calling getSession:", error);
    });

    return () => {
      console.log('UpdatePasswordPage: Unsubscribing from auth state changes.');
      authListener.subscription.unsubscribe();
    };
    // Dependencies:
    // - supabase: Stable client instance.
    // - messageType, searchParams: To make informed decisions about setting messages.
  }, [supabase, messageType, searchParams]);

  // Client-side password validation for UX
  useEffect(() => {
    setPasswordRequirements({
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(newPassword),
    });
  }, [newPassword]);

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
    if (!isNewPasswordClientValid) {
        setMessage('New password does not meet all requirements.');
        setMessageType('error');
        setIsLoading(false);
        return;
    }

    const formData = new FormData(event.currentTarget);
    await updatePassword(formData); // Server action handles redirects

    // This might not be reached if server action always redirects.
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <a href="/" className="w-fit mx-auto mb-6 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
            Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Set Your New Password</h1>

        {message && messageType && (
          <div className={`my-4 p-3 rounded-md text-sm font-medium ${
            messageType === 'success' ? 'bg-green-100 text-green-700' :
            messageType === 'error' ? 'bg-red-100 text-red-700' : ''
          }`}>
            {message}
          </div>
        )}

        {isSessionReady || searchParams.get('error') ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="newPasswordAuthUpdate" className="block text-sm font-medium text-[#2c2d5a] mb-1">New Password</label>
              <div className="relative">
              <input
                  id="newPasswordAuthUpdate"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10"
                required
                placeholder="Enter new password"
              />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
             {newPassword.length > 0 && (
                <div className="mt-2 text-xs space-y-0.5 text-gray-600">
                    <p className={passwordRequirements.minLength ? 'text-green-600' : 'text-red-500'}>• At least 8 characters</p>
                    <p className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-red-500'}>• At least one uppercase letter</p>
                    <p className={passwordRequirements.hasLowercase ? 'text-green-600' : 'text-red-500'}>• At least one lowercase letter</p>
                    <p className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-500'}>• At least one number</p>
                    <p className={passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-red-500'}>• At least one special character</p>
                </div>
            )}
            <div>
              <label htmlFor="confirmPasswordAuthUpdate" className="block text-sm font-medium text-[#2c2d5a] mb-1">Confirm New Password</label>
              <div className="relative">
              <input
                  id="confirmPasswordAuthUpdate"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10"
                required
                placeholder="Confirm new password"
              />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
             {confirmPassword.length > 0 && newPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading || !isNewPasswordClientValid || (newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword) }
                className="w-full py-2 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
           !messageType && <p className="text-center text-gray-500 py-4">Verifying reset link or session...</p>
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